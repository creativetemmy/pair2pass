import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { XPBadge } from "@/components/gamification/XPBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Users, Trophy, Clock, MessageCircle, Video, Zap, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onReady: () => void;
  onStartSession: () => void;
}

export function StudySessionLobby({
  open,
  onClose,
  sessionData,
  partner,
  currentUser,
  onReady,
  onStartSession,
}: StudySessionLobbyProps) {
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [isStarting, setIsStarting] = useState(false);
  const [showStartAnimation, setShowStartAnimation] = useState(false);

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

  useEffect(() => {
    if (currentUser.isReady && partner.isReady && !isStarting) {
      setShowStartAnimation(true);
      // Show in-app notification
      toast({
        title: "✅ Session Started!",
        description: "Prepare to join your study call.",
        duration: 5000,
      });
      setTimeout(() => {
        setIsStarting(true);
        onStartSession();
      }, 3000);
    }
  }, [currentUser.isReady, partner.isReady, isStarting, onStartSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sharedSubjects = ["Economics", "Mathematics"]; // This would come from matching logic
  const countdownProgress = ((300 - countdown) / 300) * 100;

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
          <div className="relative mb-6">
            {/* Magical clock container */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 animate-pulse blur-xl" />
              <div className="relative glass-card p-8 rounded-full border-2 border-primary/30 shadow-glow">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="h-8 w-8 text-primary animate-glow" />
                  <div className="text-6xl font-bold gradient-text tabular-nums animate-glow">
                    {formatTime(countdown)}
                  </div>
                  <Sparkles className="h-8 w-8 text-primary animate-glow" />
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 max-w-md mx-auto">
              <Progress 
                value={countdownProgress} 
                className="h-3 bg-muted/20 shadow-inner"
              />
              <p className="text-xs text-muted-foreground mt-2">Session preparation time</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2 gradient-text">
            📚 Study Session Preparation
          </h2>
          <p className="text-muted-foreground mb-4">Waiting for both partners to be ready...</p>
          
          {/* Study tip */}
          <div className="flex items-center justify-center gap-2 text-sm text-primary/80 bg-primary/5 rounded-full px-4 py-2 border border-primary/20">
            <Target className="h-4 w-4" />
            <span className="font-medium">💡 Tip: Bring your notes and materials for a productive session!</span>
          </div>
        </div>

        {/* Quest Banner - Shared Study Goal */}
        <div className="relative mb-8">
          <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-20 animate-pulse" />
          <Card className="relative glass-card border-2 border-primary/30 shadow-glow neon-border bg-gradient-to-br from-primary/5 via-background/50 to-primary/5">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                  <Trophy className="h-8 w-8 text-primary animate-glow" />
                </div>
                <h3 className="text-2xl font-bold gradient-text">📖 Study Goal</h3>
                <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                  <Trophy className="h-8 w-8 text-primary animate-glow" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-4 mb-4 border border-primary/20">
                <p className="text-3xl font-bold gradient-text mb-2">{sessionData.goal}</p>
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    📚 {sessionData.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    ⏱️ {sessionData.duration} minutes
                  </span>
                </div>
              </div>
              
              {/* Shared Subjects */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">🤝 Shared Study Subjects:</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {sharedSubjects.map((subject) => (
                    <Badge 
                      key={subject} 
                      variant="default" 
                      className="gradient-primary text-primary-foreground shadow-primary animate-glow px-3 py-1"
                    >
                      ⚡ {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Current User - Player Card */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-2xl blur-xl transition-all duration-500",
              currentUser.isReady 
                ? "bg-success/30 animate-pulse" 
                : "bg-primary/20"
            )} />
            <Card className={cn(
              "relative glass-card border-2 transition-all duration-500 hover-scale",
              currentUser.isReady 
                ? "border-success bg-success/5 shadow-success animate-glow neon-border" 
                : "border-primary/30 hover:border-primary/50"
            )}>
              <CardContent className="p-6 text-center">
                {/* Player 1 Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="gradient-primary text-primary-foreground font-bold px-3 py-1 shadow-primary">
                    👤 You
                  </Badge>
                </div>
                
                <div className="relative mb-6 mt-4">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg animate-pulse" />
                  <Avatar className="relative h-24 w-24 mx-auto border-4 border-primary/30 shadow-glow">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-2 -right-2">
                    <div className={cn(
                      "h-8 w-8 rounded-full border-3 border-background flex items-center justify-center font-bold text-xs shadow-lg",
                      currentUser.isReady 
                        ? "bg-success text-success-foreground animate-pulse" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {currentUser.isReady ? "✅" : "⏳"}
                    </div>
                  </div>
                </div>
                
                <h4 className="font-bold text-xl mb-1 gradient-text">{currentUser.name}</h4>
                <p className="text-sm text-muted-foreground mb-4 font-medium">📚 Student</p>
                
                <div className="mb-6">
                  <XPBadge xp={currentUser.xp} level={currentUser.level} className="justify-center" />
                </div>
                
                <Button
                  onClick={onReady}
                  disabled={currentUser.isReady}
                  className={cn(
                    "w-full h-12 text-lg font-bold transition-all duration-300 shadow-lg",
                    currentUser.isReady 
                      ? "bg-success hover:bg-success/90 text-success-foreground animate-glow cursor-not-allowed" 
                      : "gradient-primary hover-scale shadow-primary hover:shadow-glow"
                  )}
                >
                  {currentUser.isReady ? "✅ READY!" : "📚 MARK READY"}
                </Button>
                
                {/* Ready status text */}
                <p className={cn(
                  "text-sm mt-3 font-medium transition-all duration-300",
                  currentUser.isReady 
                    ? "text-success animate-glow" 
                    : "text-muted-foreground"
                )}>
                  {currentUser.isReady ? "Ready to study!" : "Preparing for session..."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Study Partner - Player Card */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-2xl blur-xl transition-all duration-500",
              partner.isReady 
                ? "bg-success/30 animate-pulse" 
                : "bg-primary/20"
            )} />
            <Card className={cn(
              "relative glass-card border-2 transition-all duration-500",
              partner.isReady 
                ? "border-success bg-success/5 shadow-success animate-glow neon-border" 
                : "border-primary/30"
            )}>
              <CardContent className="p-6 text-center">
                {/* Player 2 Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="gradient-primary text-primary-foreground font-bold px-3 py-1 shadow-primary">
                    👥 Study Partner
                  </Badge>
                </div>
                
                <div className="relative mb-6 mt-4">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg animate-pulse" />
                  <Avatar className="relative h-24 w-24 mx-auto border-4 border-primary/30 shadow-glow">
                    <AvatarImage src={partner.avatar} />
                    <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                      {getInitials(partner.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Online/Ready status indicator */}
                  <div className="absolute -bottom-2 -right-2">
                    <div className={cn(
                      "h-8 w-8 rounded-full border-3 border-background flex items-center justify-center font-bold text-xs shadow-lg",
                      partner.isReady 
                        ? "bg-success text-success-foreground animate-pulse" 
                        : partner.isOnline 
                          ? "bg-primary text-primary-foreground animate-pulse" 
                          : "bg-muted text-muted-foreground"
                    )}>
                      {partner.isReady ? "✅" : partner.isOnline ? "🟢" : "⚫"}
                    </div>
                  </div>
                </div>
                
                <h4 className="font-bold text-xl mb-1 gradient-text">{partner.name}</h4>
                <p className="text-sm text-muted-foreground mb-4 font-medium">🤝 Study Partner</p>
                
                <div className="mb-6">
                  <XPBadge xp={partner.xp} level={partner.level} className="justify-center" />
                </div>
                
                <div className={cn(
                  "w-full h-12 py-3 px-4 rounded-lg border-2 transition-all duration-500 font-bold text-lg flex items-center justify-center shadow-lg",
                  partner.isReady 
                    ? "bg-success/20 border-success text-success animate-glow shadow-success" 
                    : "bg-muted/10 border-muted/30 text-muted-foreground"
                )}>
                  {partner.isReady ? "✅ READY!" : partner.isOnline ? "🔄 Preparing..." : "💤 Offline"}
                </div>
                
                {/* Status text */}
                <p className={cn(
                  "text-sm mt-3 font-medium transition-all duration-300",
                  partner.isReady 
                    ? "text-success animate-glow" 
                    : partner.isOnline 
                      ? "text-primary" 
                      : "text-muted-foreground"
                )}>
                  {partner.isReady 
                    ? "Ready to study!" 
                    : partner.isOnline 
                      ? "Getting ready for session..." 
                      : "Waiting to connect..."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}