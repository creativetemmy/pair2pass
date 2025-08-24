import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Users, 
  Star, 
  Trophy, 
  Zap, 
  Clock,
  BookOpen,
  Target,
  Wifi,
  WifiOff,
  Clock3,
  X,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { XPBadge } from "@/components/gamification/XPBadge";

interface MatchingPartner {
  id: string;
  name: string;
  avatar_url?: string;
  academic_level: string;
  skills: string[];
  interests: string[];
  xp: number;
  level: number;
  average_rating: number;
  availability_status: 'online' | 'idle' | 'offline';
  institution?: string;
  bio?: string;
  matching_subjects: string[];
  study_goal_compatibility: string;
}

interface SessionData {
  subject: string;
  goals: string[];
  duration: number;
  preferredPartner?: string;
}

interface MatchmakingResultsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: SessionData | null;
  estimatedXP: number;
  onInvitePartner: (partner: MatchingPartner) => void;
  onBack: () => void;
}

// Mock data for demonstration - in real app, this would come from API
const mockPartners: MatchingPartner[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    academic_level: "Graduate",
    skills: ["JavaScript", "React", "Node.js", "Python"],
    interests: ["Web Development", "Machine Learning", "Data Science"],
    xp: 2840,
    level: 12,
    average_rating: 4.8,
    availability_status: 'online',
    institution: "MIT",
    bio: "CS graduate student passionate about AI and web technologies. Always excited to collaborate!",
    matching_subjects: ["JavaScript", "React"],
    study_goal_compatibility: "Exam Prep Expert"
  },
  {
    id: "2", 
    name: "Alex Rodriguez",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    academic_level: "Undergraduate",
    skills: ["Python", "Data Analysis", "Statistics", "Machine Learning"],
    interests: ["Data Science", "AI", "Statistics"],
    xp: 1920,
    level: 8,
    average_rating: 4.6,
    availability_status: 'idle',
    institution: "Stanford University",
    bio: "Data science enthusiast with a knack for breaking down complex concepts.",
    matching_subjects: ["Python", "Machine Learning"],
    study_goal_compatibility: "Concept Mastery Pro"
  },
  {
    id: "3",
    name: "Emma Watson",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    academic_level: "Graduate", 
    skills: ["React", "TypeScript", "GraphQL", "UI/UX"],
    interests: ["Frontend Development", "Design Systems", "User Experience"],
    xp: 3150,
    level: 15,
    average_rating: 4.9,
    availability_status: 'online',
    institution: "UC Berkeley",
    bio: "Frontend architect with a passion for creating beautiful, accessible user interfaces.",
    matching_subjects: ["React", "TypeScript"],
    study_goal_compatibility: "Group Project Leader"
  }
];

export function MatchmakingResults({ 
  open, 
  onOpenChange, 
  sessionData, 
  estimatedXP,
  onInvitePartner,
  onBack 
}: MatchmakingResultsProps) {
  const [isSearching, setIsSearching] = useState(true);
  const [partners, setPartners] = useState<MatchingPartner[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);

  useEffect(() => {
    if (open && sessionData) {
      // Reset state
      setIsSearching(true);
      setPartners([]);
      setSearchProgress(0);

      // Simulate searching animation
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsSearching(false);
            // Filter partners based on session data
            const filteredPartners = mockPartners.filter(partner =>
              partner.matching_subjects.some(subject => 
                sessionData.subject === subject || partner.skills.includes(sessionData.subject)
              )
            ).slice(0, 3);
            setPartners(filteredPartners);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    }
  }, [open, sessionData]);

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />;
      case 'idle':
        return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
      case 'offline':
        return <div className="h-2 w-2 rounded-full bg-gray-400" />;
      default:
        return null;
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Idle';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!sessionData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden glass-card border-primary/20 shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-6 border-b border-primary/10">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/80 border border-border hover:bg-muted/50 flex items-center justify-center transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-glow">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Choose Your Study Partner
                </h2>
                <p className="text-sm text-muted-foreground">
                  We found some great matches for your {sessionData.subject} session
                </p>
              </div>
            </div>

            {/* XP Preview */}
            <div className="inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-500">
                +{estimatedXP} XP upon completion
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSearching ? (
            /* Searching Animation */
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <div className="relative">
                <div className="h-24 w-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 h-24 w-24 border-4 border-transparent border-b-secondary rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }} />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary animate-pulse" />
                  Scanning for optimal partners...
                </h3>
                <p className="text-muted-foreground">
                  Matching your {sessionData.subject} session with compatible study buddies
                </p>
                
                <div className="w-64 h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary transition-all duration-300 ease-out"
                    style={{ width: `${searchProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                  {partners.length} Perfect Matches Found!
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {partners.map((partner, index) => (
                  <Card 
                    key={partner.id} 
                    className={cn(
                      "group relative overflow-hidden glass-card border-primary/20 transition-all duration-500 hover:shadow-glow hover:scale-105",
                      "animate-fade-in",
                      index === 0 && "ring-2 ring-primary/30 shadow-primary/20"
                    )}
                    style={{ 
                      animationDelay: `${index * 200}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {index === 0 && (
                      <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground border-0 shadow-lg">
                        Best Match
                      </Badge>
                    )}

                    <CardHeader className="pb-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={partner.avatar_url} alt={partner.name} />
                            <AvatarFallback className="gradient-primary text-primary-foreground">
                              {getInitials(partner.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">{partner.name}</h3>
                            <div className="flex items-center space-x-2">
                              {getAvailabilityIcon(partner.availability_status)}
                              <span className={cn(
                                "text-xs font-medium",
                                partner.availability_status === 'online' && "text-green-500",
                                partner.availability_status === 'idle' && "text-yellow-500",
                                partner.availability_status === 'offline' && "text-gray-400"
                              )}>
                                {getAvailabilityText(partner.availability_status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold text-foreground">
                            {partner.average_rating}
                          </span>
                        </div>
                      </div>

                      <XPBadge xp={partner.xp} level={partner.level} className="scale-90" />
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {partner.academic_level} at {partner.institution}
                        </p>
                        
                        <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                          {partner.study_goal_compatibility}
                        </Badge>
                      </div>

                      {/* Matching Subjects with Glow */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Matching Subjects</p>
                        <div className="flex flex-wrap gap-1">
                          {partner.matching_subjects.map(subject => (
                            <Badge 
                              key={subject}
                              className="text-xs bg-primary/20 text-primary border-primary/40 shadow-primary/20 animate-glow"
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {partner.bio}
                      </p>

                      {/* Action Button */}
                      <Button
                        onClick={() => onInvitePartner(partner)}
                        className={cn(
                          "w-full gradient-primary hover:opacity-90 shadow-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow",
                          partner.availability_status === 'online' && "animate-glow"
                        )}
                        disabled={partner.availability_status === 'offline'}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {partner.availability_status === 'offline' ? 'Unavailable' : 'Invite to Study'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-primary/10 p-6 bg-gradient-to-r from-background/80 to-secondary/5">
          <div className="flex justify-between items-center">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-border hover:bg-muted/50"
            >
              Back to Setup
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Can't find the right partner? We'll keep searching and notify you of new matches.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}