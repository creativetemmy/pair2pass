import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  department: string | null;
  sessions_completed: number;
  hours_studied: number;
  partners_helped: number;
}

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          });
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, toast]);

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="animate-pulse">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 w-20 bg-muted rounded"></div>
                    <div className="h-6 w-20 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Profile not found</h2>
          <p className="text-muted-foreground">This profile does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile avatar"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                  {getInitials(profile.name)}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {profile.name || "Anonymous User"}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  {profile.institution && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.institution}</span>
                    </div>
                  )}
                  {profile.academic_level && (
                    <Badge variant="secondary">{profile.academic_level}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>{profile.average_rating.toFixed(1)} Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔥</span>
                    <span>{profile.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📊</span>
                    <span>Level {profile.level}</span>
                  </div>
                </div>
              </div>
            </div>
            {profile.bio && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-foreground mb-2">About</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions Completed</span>
                  <span className="font-semibold">{profile.sessions_completed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hours Studied</span>
                  <span className="font-semibold">{profile.hours_studied || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Partners Helped</span>
                  <span className="font-semibold">{profile.partners_helped || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No skills listed</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interests</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.interests && profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No interests listed</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Academic Info */}
        {(profile.department || profile.academic_level) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {profile.department && (
                  <div>
                    <span className="text-muted-foreground text-sm">Department</span>
                    <p className="font-semibold">{profile.department}</p>
                  </div>
                )}
                {profile.academic_level && (
                  <div>
                    <span className="text-muted-foreground text-sm">Academic Level</span>
                    <p className="font-semibold">{profile.academic_level}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
