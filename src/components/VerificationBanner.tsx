import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export const VerificationBanner = () => {
  const { user } = useAuth();
  const { profile, loading } = useAuthProfile();
  const profileCompletion = useProfileCompletion(profile);
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (loading || dismissed) return null;

  const isProfileComplete = profileCompletion.isComplete;
  const isEmailVerified = profile?.is_email_verified ?? false;

  // Don't show banner if everything is complete
  if (isProfileComplete && isEmailVerified) return null;

  const getMessage = () => {
    if (!isProfileComplete && !isEmailVerified) {
      return "Complete your profile and verify your email to unlock all features";
    }
    if (!isProfileComplete) {
      return "Complete your profile to unlock study partner matching";
    }
    return "Verify your email to receive notifications and unlock full features";
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-900 dark:text-amber-100">
              {getMessage()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => navigate("/profile")}
              className="shrink-0"
            >
              Complete Setup
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
