import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, BookOpen, Users, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ConnectModal } from "@/components/ConnectModal";

const timeSlots = [
  { label: "Morning (8:00 AM - 12:00 PM)", value: "Morning" },
  { label: "Afternoon (12:00 PM - 5:00 PM)", value: "Afternoon" }, 
  { label: "Evening (5:00 PM - 9:00 PM)", value: "Evening" },
  { label: "Night (9:00 PM - 12:00 AM)", value: "Night" },
];

const academicLevels = [
  "Any Level",
  "100 Level",
  "200 Level", 
  "300 Level",
  "400 Level",
  "500 Level"
];

interface Profile {
  id: string;
  wallet_address: string;
  name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  average_rating: number;
  skills: string[];
  interests: string[];
  institution: string | null;
  academic_level: string | null;
  bio: string | null;
  preferred_study_times: string[];
}

export default function FindPartner() {
  const { address } = useAccount();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  
  // Real data from database
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);
  const [availableAcademicLevels, setAvailableAcademicLevels] = useState<string[]>([]);
  const [availableInstitutions, setAvailableInstitutions] = useState<string[]>([]);
  
  // Connect modal state
  const [selectedPartner, setSelectedPartner] = useState<Profile | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      // Use public_profiles view to exclude sensitive data like email
      let query = supabase
        .from('public_profiles')
        .select('*')
        .neq('wallet_address', address || '') // Exclude current user
        .not('name', 'is', null) // Only show profiles with names
        .not('wallet_address', 'is', null); // Ensure wallet_address is not null

      // Apply filters
      if (skillLevel && skillLevel !== "Any Level") {
        query = query.eq('academic_level', skillLevel);
      }

      if (selectedCourse) {
        query = query.contains('interests', [selectedCourse]);
      }

      if (location && location !== "any") {
        query = query.eq('institution', location);
      }

      // Filter by preferred study times if selected
      if (selectedTimes.length > 0) {
        // Convert selected time labels to values (e.g., "Morning (8:00 AM - 12:00 PM)" -> "Morning")
        const timeValues = selectedTimes.map(time => {
          const timeSlot = timeSlots.find(slot => slot.label === time);
          return timeSlot ? timeSlot.value : time;
        });
        
        // Filter profiles that have at least one matching preferred study time
        query = query.overlaps('preferred_study_times', timeValues);
      }

      // Apply sorting
      if (sortBy === 'rating') {
        query = query.order('average_rating', { ascending: false });
      } else if (sortBy === 'level') {
        query = query.order('level', { ascending: false });
      } else if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load study partners",
          variant: "destructive",
        });
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load study partners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Use public_profiles view for fetching filter options
      const { data, error } = await supabase
        .from('public_profiles')
        .select('interests, academic_level, institution')
        .not('name', 'is', null); // Only get data from profiles with names

      if (error) {
        console.error('Error fetching filter options:', error);
        return;
      }

      // Extract unique interests
      const uniqueInterests = new Set<string>();
      const uniqueAcademicLevels = new Set<string>();
      const uniqueInstitutions = new Set<string>();

      data?.forEach(profile => {
        if (profile.interests) {
          profile.interests.forEach((interest: string) => {
            if (interest) uniqueInterests.add(interest);
          });
        }
        if (profile.academic_level) {
          uniqueAcademicLevels.add(profile.academic_level);
        }
        if (profile.institution) {
          uniqueInstitutions.add(profile.institution);
        }
      });

      setAvailableInterests(Array.from(uniqueInterests).sort());
      setAvailableAcademicLevels(Array.from(uniqueAcademicLevels).sort());
      setAvailableInstitutions(Array.from(uniqueInstitutions).sort());
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchProfiles();
  }, [address, sortBy]);

  const handleSearch = () => {
    fetchProfiles();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleConnect = (partner: Profile) => {
    setSelectedPartner(partner);
    setConnectModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 transition-colors duration-300">Find Study Partner</h1>
        <p className="text-muted-foreground transition-colors duration-300">Connect with verified students for your courses</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Filters */}
        <Card className="lg:col-span-1 transition-colors duration-300 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 transition-colors duration-300">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course/Interest Selection */}
            <div>
              <Label htmlFor="course">Course/Interest</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select course or interest" />
                </SelectTrigger>
                <SelectContent>
                  {availableInterests.map((interest) => (
                    <SelectItem key={interest} value={interest}>
                      {interest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Level */}
            <div>
              <Label htmlFor="skill-level">Academic Level</Label>
              <Select value={skillLevel} onValueChange={setSkillLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select academic level" />
                </SelectTrigger>
                <SelectContent>
                  {academicLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Institution */}
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Institution</SelectItem>
                  {availableInstitutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div>
              <Label>Availability</Label>
              <div className="space-y-2 mt-2">
                {timeSlots.map((timeSlot) => (
                  <div key={timeSlot.label} className="flex items-center space-x-2">
                    <Checkbox 
                      id={timeSlot.label}
                      checked={selectedTimes.includes(timeSlot.label)}
                      onCheckedChange={() => handleTimeToggle(timeSlot.label)}
                    />
                    <Label htmlFor={timeSlot.label} className="text-sm">
                      {timeSlot.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="gradient" className="w-full" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Find Partners
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground transition-colors duration-300">
              Available Study Partners ({loading ? "..." : profiles.length})
            </h2>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="level">Highest Level</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-16 bg-muted rounded"></div>
                          <div className="h-6 w-16 bg-muted rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {profiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-card transition-all duration-300 border-border/20 dark:border-border/10">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start space-x-4">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Profile avatar"
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                            {getInitials(profile.name)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-foreground">{profile.name || "Anonymous"}</h3>
                            <Badge variant="secondary">Level {profile.level}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center space-x-1">
                              <span>⭐</span>
                              <span>{profile.average_rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>🔥</span>
                              <span>{profile.xp} XP</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{profile.institution || "Not specified"}</span>
                            </div>
                          </div>
                          {profile.skills && profile.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {profile.skills.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {profile.skills.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{profile.skills.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Academic Level: {profile.academic_level || "Not specified"}</span>
                            {profile.bio && (
                              <span className="truncate max-w-xs">{profile.bio}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 min-w-[120px]">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleConnect(profile)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${profile.id}`)}>
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!loading && profiles.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No matches found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or check back later for new study partners
                    </p>
                    <Button variant="default" onClick={() => {
                      setSelectedCourse("");
                      setSkillLevel("");
                      setLocation("");
                      setSelectedTimes([]);
                      fetchProfiles();
                    }}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      {selectedPartner && (
        <ConnectModal
          partner={selectedPartner}
          isOpen={connectModalOpen}
          onClose={() => {
            setConnectModalOpen(false);
            setSelectedPartner(null);
          }}
        />
      )}
    </div>
  );
}