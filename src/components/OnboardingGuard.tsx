import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { useProfile } from "@/hooks/useProfile";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Mail, User, Lock } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  path: string;
  icon: React.ReactNode;
}

export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { address } = useAccount();
  const { profile, loading } = useProfile(address);
  const profileCompletion = useProfileCompletion(profile);
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Allowed paths during onboarding
  const allowedPaths = ['/profile', '/homepage', '/leaderboard', '/session'];

  useEffect(() => {
    if (loading || !address) return;

    const isProfileComplete = profileCompletion.isComplete;
    const isEmailVerified = profile?.is_email_verified ?? false;
    const isOnAllowedPath = allowedPaths.includes(location.pathname);

    // If user is trying to access restricted features without completing onboarding
    if (!isOnAllowedPath && (!isProfileComplete || !isEmailVerified)) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [profile, profileCompletion, loading, location.pathname, address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!showOnboarding) {
    return <>{children}</>;
  }

  const steps: OnboardingStep[] = [
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your name, academic level, interests, and study goals",
      completed: profileCompletion.isComplete,
      path: "/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "verify",
      title: "Verify Your Email",
      description: "Verify your email to unlock session invites and notifications",
      completed: profile?.is_email_verified ?? false,
      path: "/profile",
      icon: <Mail className="h-5 w-5" />,
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Setup</CardTitle>
          <p className="text-muted-foreground mt-2">
            Finish these steps to unlock all features and start finding study partners
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedSteps} of {steps.length} completed</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  step.completed
                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                    : "bg-muted/30 border-border"
                }`}
              >
                <div className="mt-1">
                  {step.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <h3 className="font-semibold text-foreground">
                      {index + 1}. {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {!step.completed && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate(step.path)}
                    >
                      {step.id === "profile" ? "Complete Profile" : "Verify Email"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Why verify?</strong> Email verification ensures you receive session notifications,
              match requests, and unlock the full study partner experience. It also builds trust in the community.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/homepage")}
            >
              Go to Dashboard
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate("/profile")}
            >
              Continue Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
