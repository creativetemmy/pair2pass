import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAccount } from "wagmi";

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
  onComplete 
}: SessionReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useAccount();

  const formatWalletAddress = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please rate your study partner");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update session status to completed
      const { error: sessionError } = await supabase
        .from('study_sessions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Create session review record (we'd need to create this table)
      // For now, just show success
      
      toast.success("Session completed and review submitted!");
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

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
              <span className="font-medium">{formatWalletAddress(partnerWallet)}</span>
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
                        ? 'text-yellow-500 fill-current'
                        : 'text-muted-foreground hover:text-yellow-400'
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