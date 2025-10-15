import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle, Award, Loader2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { awardPassPoints, updateSessionStats } from "@/lib/passPointsSystem";
import { pair2PassContractConfig } from "@/contracts/pair2passsbt";
import { baseSepolia } from "wagmi/chains";

interface SessionReviewModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  partnerWallet: string;
  onComplete: () => void;
}

export const SessionReviewModal = ({
  open,
  onClose,
  sessionId,
  partnerWallet,
  onComplete,
}: SessionReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const { address } = useAccount();

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const formatWalletAddress = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please rate your study partner");
      return;
    }

    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from("session_reviews")
        .select("id")
        .eq("session_id", sessionId)
        .eq("reviewer_wallet", address)
        .single();

      if (existingReview) {
        toast.info("Review already submitted for this session");
        onComplete();
        onClose();
        return;
      }

      // Get session data to calculate duration
      const { data: sessionData } = await supabase
        .from("study_sessions")
        .select("duration, created_at")
        .eq("id", sessionId)
        .single();

      const sessionDuration = sessionData?.duration || 60; // Default to 60 minutes

      // Create session review record
      const { error: reviewError } = await supabase
        .from("session_reviews")
        .insert({
          session_id: sessionId,
          reviewer_wallet: address,
          reviewed_wallet: partnerWallet,
          rating: rating,
          feedback: feedback || null,
        });

      if (reviewError) throw reviewError;

      // Update session status to completed
      const { error: sessionError } = await supabase
        .from("study_sessions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (sessionError) throw sessionError;

      // Award Pass Points and update stats for session completion
      await Promise.all([
        awardPassPoints(address, "SESSION_COMPLETED"),
        updateSessionStats(address, sessionDuration, rating),
        // Award Pass Points to partner for being helped
        awardPassPoints(partnerWallet, "PARTNER_HELPED", false),
      ]);

      // Send session completion notifications

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("wallet_address", address)
        .single();

      const { data: partnerProfile }  = await supabase
        .from("profiles")
        .select("name, email")
        .eq("wallet_address", partnerWallet)
        .single();

      // Notify current user
      await supabase.from("notifications").insert({
        user_wallet: address,
        type: "session_complete",
        title: "✅ Session Completed!",
        message:
          "Your study session was marked as complete. You earned Pass Points and can now mint your NFT badge!",
        data: { sessionId, rating },
      });

      if (userProfile?.email) {
        await supabase.functions
          .invoke("send-notification-email", {
            body: {
              type: "session_complete",
              email: userProfile.email,
              data: {
                userName: userProfile.name || "Student",
                sessionId,
              },
            },
          })
          .catch((err) => console.log("Email send failed:", err));


          await supabase.functions
          .invoke("send-notification-email", {
            body: {
              type: "session_complete",
              email: partnerProfile.email,
              data: {
                userName: partnerProfile.name || "Student",
                sessionId,
              },
            },
          })
          .catch((err) => console.log("Email send failed:", err));
      }

      // Show success view instead of closing
      setShowSuccessView(true);
      onComplete();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMintNFT = async () => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    setIsMintingNFT(true);

    try {
      writeContract({
        ...pair2PassContractConfig,
        functionName: "mintBadgeNft",
        args: ["Study Badge"],
        chain: baseSepolia,
        account: address,
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT. Please try again.");
      setIsMintingNFT(false);
    }
  };

  const handleSkipNFT = () => {
    toast.success("Session review completed!");
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting && !isMintingNFT) {
      // Reset state when closing
      setShowSuccessView(false);
      setRating(0);
      setFeedback("");
      onClose();
    }
  };

  // Handle NFT minting success
  useEffect(() => {
    if (isConfirmed && isMintingNFT) {
      setIsMintingNFT(false);

      // Create badge unlocked notification
      if (address) {
        supabase.from("notifications").insert({
          user_wallet: address,
          type: "badge_unlocked",
          title: "⛓️ NFT Badge Unlocked!",
          message:
            'Your "Study Session" NFT badge has been minted and added to your profile!',
          data: { badgeType: "study_session", txHash: hash },
        });

        // Send email notification
        supabase
          .from("profiles")
          .select("name, email")
          .eq("wallet_address", address)
          .single()
          .then(({ data: profile }) => {
            if (profile?.email) {
              supabase.functions
                .invoke("send-notification-email", {
                  body: {
                    type: "badge_unlocked",
                    email: profile.email,

                    data: {
                      userName: profile.name || "Student",
                      badgeName: "Study Session Badge",
                      walletAddress: address,
                    },
                  },
                })
                .catch((err) => console.log("Email send failed:", err));
            }
          });
      }

      toast.success("Proof of Study NFT minted successfully! 🎓");
      onClose();
    }
  }, [isConfirmed, isMintingNFT, onClose, address, hash]);

  // Show success view after review submission
  if (showSuccessView) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>Congratulations! 🎉</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Study Session Completed!
                </h3>
                <p className="text-muted-foreground text-sm">
                  You've successfully completed your study session and earned
                  Pass Points. Want to commemorate this achievement?
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Award className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-foreground">
                    Mint Your Proof of Study NFT
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Mint an NFT badge to permanently record this study session on
                  the blockchain!
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSkipNFT}
                    disabled={isMintingNFT || isConfirming}
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={handleMintNFT}
                    disabled={isMintingNFT || isConfirming}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Minting...
                      </>
                    ) : isMintingNFT ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Mint NFT
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span>Session Completed!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Great job! Please rate your study session with{" "}
              <span className="font-medium">
                {formatWalletAddress(partnerWallet)}
              </span>
            </p>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Rate Your Study Partner
            </Label>
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "text-yellow-500 fill-current"
                        : "text-muted-foreground hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Click to rate (1-5 stars)
            </p>
          </div>

          {/* Feedback */}
          <div>
            <Label htmlFor="session-feedback" className="text-sm font-medium">
              Session Feedback (Optional)
            </Label>
            <Textarea
              id="session-feedback"
              placeholder="How was your study session? Any highlights or areas for improvement?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-2 min-h-[80px]"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Skip Review
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
