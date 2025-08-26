import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CancelSessionModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  onCancel?: () => void;
}

const cancelReasons = [
  "Schedule conflict",
  "Technical issues", 
  "Partner not responsive",
  "Personal emergency",
  "Study material not ready",
  "Other"
];

export const CancelSessionModal = ({ open, onClose, sessionId, onCancel }: CancelSessionModalProps) => {
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason) {
      toast.error('Please select a reason for canceling');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Session cancelled successfully');
      onCancel?.();
      onClose();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Study Session</DialogTitle>
          <DialogDescription>
            Let us know why you're canceling this session. This helps us improve the platform.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Reason for canceling *
            </Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {cancelReasons.map((cancelReason) => (
                <div key={cancelReason} className="flex items-center space-x-2">
                  <RadioGroupItem value={cancelReason} id={cancelReason} />
                  <Label htmlFor={cancelReason} className="text-sm">
                    {cancelReason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="cancelFeedback" className="text-sm font-medium">
              Additional feedback (Optional)
            </Label>
            <Textarea
              id="cancelFeedback"
              placeholder="Any additional details you'd like to share..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Keep Session
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel} 
              disabled={isLoading || !reason}
              className="flex-1"
            >
              {isLoading ? 'Canceling...' : 'Cancel Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};