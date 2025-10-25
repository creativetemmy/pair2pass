import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Clock, 
  Users, 
  BookOpen, 
  Zap, 
  Star, 
  Trophy, 
  Timer,
  Scroll,
  X,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Profile } from "@/hooks/useAuthProfile";

interface StudyGoal {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const studyGoals: StudyGoal[] = [
  { id: "exam-prep", label: "Exam Prep", icon: Target, color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { id: "assignment-help", label: "Assignment Help", icon: BookOpen, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "concept-mastery", label: "Concept Mastery", icon: Zap, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { id: "group-project", label: "Group Project", icon: Users, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" }
];

const durations = [
  { value: "30", label: "30 minutes", xp: "25 PASS" },
  { value: "45", label: "45 minutes", xp: "40 PASS" },
  { value: "60", label: "60 minutes", xp: "60 PASS" },
  { value: "120", label: "2 hours", xp: "150 PASS" }
];

interface NewStudySessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onStartSession?: (sessionData: any) => void;
  onFindPartner?: (sessionData: any) => void;
}

export function NewStudySessionModal({ 
  open, 
  onOpenChange, 
  profile,
  onStartSession,
  onFindPartner
}: NewStudySessionModalProps) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [preferredPartner, setPreferredPartner] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleStartSession = async () => {
    if (!selectedSubject || selectedGoals.length === 0 || !selectedDuration) return;
    
    setIsLoading(true);
    const sessionData = {
      subject: selectedSubject,
      goals: selectedGoals,
      duration: parseInt(selectedDuration),
      preferredPartner: preferredPartner || null,
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onFindPartner?.(sessionData);
    onOpenChange(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setSelectedSubject("");
    setSelectedGoals([]);
    setSelectedDuration("");
    setPreferredPartner("");
  };

  const isFormValid = selectedSubject && selectedGoals.length > 0 && selectedDuration;
  const selectedDurationData = durations.find(d => d.value === selectedDuration);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden glass-card border-primary/20 shadow-2xl" onInteractOutside={(e) => e.preventDefault()}>
        {/* Header with Quest Parchment Style */}
        <div className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-6 border-b border-primary/10">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <button 
            onClick={handleCancel}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/80 border border-border hover:bg-muted/50 flex items-center justify-center transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-glow">
                <Scroll className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  New Study Quest
                  <Zap className="h-5 w-5 text-yellow-500" />
                </h2>
                <p className="text-sm text-muted-foreground">Step 1 of 3 • Session Setup</p>
              </div>
            </div>
            
            <Progress value={33} className="h-2 bg-secondary/30" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* XP Reward Preview */}
          <div className="p-4 rounded-lg gradient-secondary/10 border border-secondary/20 bg-gradient-to-r from-background/50 to-secondary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Quest Rewards</p>
                  <p className="text-xs text-muted-foreground">
                    Earn Pass Points + reputation points for completing this session
                  </p>
                </div>
              </div>
              {selectedDurationData && (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  +{selectedDurationData.xp}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Subject Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Study Subject
                </Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-12 border-primary/20 focus:border-primary/40 focus:ring-primary/20">
                    <SelectValue placeholder="Choose your subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profile?.interests?.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    )) || []}
                    <SelectItem value="other">Other Subject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Study Goals */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Study Goals
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {studyGoals.map(goal => {
                    const IconComponent = goal.icon;
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalToggle(goal.id)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all duration-200 text-left space-y-2",
                          isSelected 
                            ? "border-primary bg-primary/10 shadow-md scale-105" 
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "inline-flex items-center justify-center h-8 w-8 rounded-full",
                          isSelected ? "bg-primary text-primary-foreground" : goal.color
                        )}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <p className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {goal.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Duration Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  Session Duration
                </Label>
                <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration} className="space-y-2">
                  {durations.map(duration => (
                    <div key={duration.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/30 transition-all duration-200">
                      <RadioGroupItem value={duration.value} id={duration.value} />
                      <Label 
                        htmlFor={duration.value} 
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{duration.label}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {duration.xp}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Preferred Partner (Optional) */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Preferred Partner <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or wallet address..."
                    value={preferredPartner}
                    onChange={(e) => setPreferredPartner(e.target.value)}
                    className="pl-10 h-12 border-primary/20 focus:border-primary/40 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to be matched with any available partner
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-primary/10 p-6 bg-gradient-to-r from-background/80 to-secondary/5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="sm:w-auto w-full border-border hover:bg-muted/50"
            >
              Cancel Quest
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={!isFormValid || isLoading}
              className={cn(
                "sm:flex-1 w-full gradient-primary hover:opacity-90 shadow-primary transition-all duration-300",
                isFormValid && "hover:scale-105 hover:shadow-glow animate-glow"
              )}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Finding Partner...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Find Study Partner</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}