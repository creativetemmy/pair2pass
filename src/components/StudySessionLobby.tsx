import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { XPBadge } from "@/components/gamification/XPBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Trophy, Clock, MessageCircle, Video, Zap, Link, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudySessionLobbyProps {
  open: boolean;
  onClose: () => void;
  sessionData: {
    subject: string;
    goal: string;
    duration: number;
  };
  partner: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    isReady: boolean;
    isOnline: boolean;
  };
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    isReady: boolean;
  };
  sessionId?: string;
  onReady: () => void;
  onStartSession: () => void;
}

export function StudySessionLobby({
  open,
  onClose,
  sessionData,
  partner,
  currentUser,
  sessionId,
  onReady,
  onStartSession,
}: StudySessionLobbyProps) {
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [isStarting, setIsStarting] = useState(false);
  const [showStartAnimation, setShowStartAnimation] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Fetch session data including video link
  useEffect(() => {
    if (sessionId && open) {
      fetchSessionData();
    }
  }, [sessionId, open]);

  useEffect(() => {
    if (currentUser.isReady && partner.isReady && !isStarting) {
      setShowStartAnimation(true);
      setTimeout(() => {
        setIsStarting(true);
        onStartSession();
      }, 3000);
    }
  }, [currentUser.isReady, partner.isReady, isStarting, onStartSession]);

  const fetchSessionData = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('video_link')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      if (data?.video_link) {
        setVideoLink(data.video_link);
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const handleSubmitLink = async () => {
    if (!linkInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid session link.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionId) {
      toast({
        title: "Session Error",
        description: "No active session found. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting link:', linkInput.trim());
      const { error } = await supabase
        .from('study_sessions')
        .update({ video_link: linkInput.trim() })
        .eq('id', sessionId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setVideoLink(linkInput.trim());
      setLinkInput("");
      setShowLinkForm(false);
      
      toast({
        title: "Session Link Added",
        description: "Both partners can now join the study session!",
      });
      
      console.log('Link submitted successfully');
    } catch (error) {
      console.error('Error updating session link:', error);
      toast({
        title: "Error",
        description: "Failed to add session link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkReady = () => {
    if (!videoLink) {
      toast({
        title: "Meeting Link Required",
        description: "Please add a meeting link before marking ready.",
        variant: "destructive",
      });
      return;
    }
    onReady();
  };

  const handleJoinSession = () => {
    if (videoLink) {
      window.open(videoLink, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sharedSubjects = ["Economics", "Mathematics"]; // This would come from matching logic

  if (showStartAnimation) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl border-primary/20 bg-gradient-subtle">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-8">
              <div className="h-24 w-24 rounded-full gradient-primary animate-pulse flex items-center justify-center">
                <Zap className="h-12 w-12 text-primary-foreground animate-bounce" />
              </div>
              <div className="absolute -inset-4 rounded-full border-2 border-primary/30 animate-ping" />
            </div>
            <h2 className="text-4xl font-bold gradient-text mb-4 animate-fade-in">
              Session Starting...
            </h2>
            <p className="text-lg text-muted-foreground animate-fade-in">
              Get ready to learn together!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-primary/20 bg-gradient-subtle">
        {/* Header with countdown */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-6 w-6 text-primary" />
            <div className="text-5xl font-bold gradient-text tabular-nums animate-glow">
              {formatTime(countdown)}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Study Session Lobby</h2>
          <p className="text-muted-foreground">Waiting for both partners to be ready...</p>
        </div>

        {/* Shared Study Goal */}
        <Card className="mb-8 border-primary/20 shadow-glow">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Session Goal</h3>
            </div>
            <p className="text-2xl font-bold gradient-text mb-2">{sessionData.goal}</p>
            <p className="text-muted-foreground">{sessionData.subject} • {sessionData.duration} minutes</p>
            
            {/* Shared Subjects */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Common Subjects:</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {sharedSubjects.map((subject) => (
                  <Badge key={subject} variant="default" className="animate-glow">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current User */}
          <Card className={cn(
            "border-2 transition-all duration-300",
            currentUser.isReady 
              ? "border-success bg-success/5 shadow-success animate-glow" 
              : "border-muted-foreground/20"
          )}>
            <CardContent className="p-6 text-center">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20 mx-auto border-4 border-primary/20">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  <div className="h-6 w-6 rounded-full bg-success border-2 border-background flex items-center justify-center animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-success-foreground" />
                  </div>
                </div>
              </div>
              
              <h4 className="font-semibold text-lg mb-2">{currentUser.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">You</p>
              
              <XPBadge xp={currentUser.xp} level={currentUser.level} className="justify-center mb-4" />
              
              <Button
                onClick={handleMarkReady}
                disabled={currentUser.isReady}
                className={cn(
                  "w-full transition-all duration-300",
                  currentUser.isReady 
                    ? "bg-success hover:bg-success/90 animate-glow" 
                    : "gradient-primary hover-scale"
                )}
              >
                {currentUser.isReady ? "Ready!" : "Mark Ready"}
              </Button>
            </CardContent>
          </Card>

          {/* Study Partner */}
          <Card className={cn(
            "border-2 transition-all duration-300",
            partner.isReady 
              ? "border-success bg-success/5 shadow-success animate-glow" 
              : "border-muted-foreground/20"
          )}>
            <CardContent className="p-6 text-center">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20 mx-auto border-4 border-primary/20">
                  <AvatarImage src={partner.avatar} />
                  <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                    {getInitials(partner.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  <div className={cn(
                    "h-6 w-6 rounded-full border-2 border-background flex items-center justify-center",
                    partner.isOnline 
                      ? "bg-success animate-pulse" 
                      : "bg-muted-foreground/50"
                  )}>
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      partner.isOnline 
                        ? "bg-success-foreground" 
                        : "bg-background"
                    )} />
                  </div>
                </div>
              </div>
              
              <h4 className="font-semibold text-lg mb-2">{partner.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">Study Partner</p>
              
              <XPBadge xp={partner.xp} level={partner.level} className="justify-center mb-4" />
              
              <div className={cn(
                "w-full py-2 px-4 rounded-md border-2 transition-all duration-300 font-medium",
                partner.isReady 
                  ? "bg-success/20 border-success text-success animate-glow" 
                  : "bg-muted/20 border-muted text-muted-foreground"
              )}>
                {partner.isReady ? "Ready!" : "Waiting..."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Link Section */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Link className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Session Link</h3>
              </div>
              
              {videoLink ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Ready to join your study session!</p>
                  <Button
                    onClick={handleJoinSession}
                    className="gradient-primary hover-scale flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Join Study Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!showLinkForm ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">No session link added yet</p>
                      <Button
                        onClick={() => setShowLinkForm(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Link className="h-4 w-4" />
                        Add Session Link
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        placeholder="Paste Google Meet link here..."
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={handleSubmitLink}
                          disabled={!linkInput.trim()}
                          className="gradient-primary"
                        >
                          Submit Link
                        </Button>
                        <Button
                          onClick={() => {
                            setShowLinkForm(false);
                            setLinkInput("");
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Communication Panel */}
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4 text-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Chat Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Video Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">+50 XP on completion</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}