import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewStudySessionModal } from "./NewStudySessionModal";
import { Profile } from "@/hooks/useAuthProfile";

interface ProfileCheckItem {
  label: string;
  completed: boolean;
  key: string;
}

interface ProfileCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileItems: ProfileCheckItem[];
  completionPercentage: number;
  profile?: Profile | null;
}

export function ProfileCheckModal({ 
  open, 
  onOpenChange, 
  profileItems, 
  completionPercentage,
  profile 
}: ProfileCheckModalProps) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  const handleGoToProfile = async () => {
    setIsNavigating(true);
    onOpenChange(false);
    navigate("/profile");
  };

  const handleRemindLater = () => {
    onOpenChange(false);
  };

  const handleJoinSession = () => {
    if (completionPercentage === 100) {
      onOpenChange(false);
      setShowNewSessionModal(true);
    }
  };

  const handleStartSession = (sessionData: any) => {
    console.log("Starting session with data:", sessionData);
    // Here you would typically navigate to the session or matching flow
    navigate("/session");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-glow">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-foreground">
            Complete Your Profile First
          </DialogTitle>
          
          <p className="text-muted-foreground text-sm">
            We need your study subjects, level, and goals to match you with the right partner.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Profile Progress</span>
              <span className="text-sm font-bold text-primary">{completionPercentage}% Complete</span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-3 bg-secondary/50"
            />
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Required Information:</h4>
            <div className="space-y-2">
              {profileItems.map((item, index) => (
                <div 
                  key={item.key}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-all duration-300",
                    item.completed 
                      ? "bg-success/10 border border-success/20" 
                      : "bg-muted/50 border border-border"
                  )}
                >
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300",
                    item.completed 
                      ? "bg-success text-success-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {item.completed ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    item.completed ? "text-success" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pass Points Bonus Preview */}
          <div className="p-4 rounded-lg gradient-secondary/10 border border-secondary/20">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Bonus Reward</p>
                <p className="text-xs text-muted-foreground">
                  Complete your profile to earn <span className="text-yellow-500 font-bold">+200 PASS</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {completionPercentage === 100 ? (
              <Button 
                onClick={handleJoinSession}
                className="w-full gradient-primary hover:opacity-90 shadow-primary transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                Join Session
              </Button>
            ) : (
              <Button 
                onClick={handleGoToProfile}
                disabled={isNavigating}
                className="w-full gradient-primary hover:opacity-90 shadow-primary transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                {isNavigating ? "Loading..." : "Go to Profile"}
              </Button>
            )}
            
            <Button 
              onClick={handleRemindLater}
              variant="ghost"
              className="w-full hover:bg-muted/50 transition-all duration-300"
            >
              Remind Me Later
            </Button>
          </div>
        </div>
      </DialogContent>

      <NewStudySessionModal 
        open={showNewSessionModal}
        onOpenChange={setShowNewSessionModal}
        profile={profile}
        onStartSession={handleStartSession}
      />
    </Dialog>
  );
}