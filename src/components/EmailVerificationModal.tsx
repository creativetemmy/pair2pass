import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerificationSuccess: () => void;
}

export function EmailVerificationModal({ 
  isOpen, 
  onClose, 
  email, 
  onVerificationSuccess 
}: EmailVerificationModalProps) {
  const [step, setStep] = useState<'sending' | 'verify' | 'success'>('sending');
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendOTP = async () => {
    if (!email) {
      console.log('❌ No email provided');
      return;
    }
    
    console.log('📧 Attempting to send OTP to:', email);
    setSending(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        }
      });

      console.log('📧 Supabase OTP Response:', { data, error });

      if (error) {
        console.error('❌ OTP Error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send verification code",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ OTP sent successfully');
      toast({
        title: "Code Sent",
        description: "Verification code has been sent to your email. Check your spam folder if you don't see it.",
      });
      setStep('verify');
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      if (error) {
        toast({
          title: "Invalid Code",
          description: "Invalid or expired code. Please try again.",
          variant: "destructive",
        });
        setOtp("");
        return;
      }

      // Update profile to mark email as verified
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_email_verified: true })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }

      setStep('success');
      setTimeout(() => {
        onVerificationSuccess();
        onClose();
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (open: boolean) => {
    if (open && step === 'sending') {
      sendOTP();
    } else if (!open) {
      setStep('sending');
      setOtp("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'sending' && "Sending Verification Code"}
            {step === 'verify' && "Verify Your Email"}
            {step === 'success' && "Email Verified!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'sending' && (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-muted-foreground">
                Sending verification code to
              </p>
              <p className="font-medium">{email}</p>
              {sending && <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4" />}
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code sent to your email address.
                </p>
                <p className="font-medium text-sm mb-6">{email}</p>
              </div>

              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                onClick={verifyOTP} 
                className="w-full" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Submit Code"
                )}
              </Button>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={sendOTP}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-600">
                  ✅ Email Verified!
                </h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    🎉 Congratulations! You've earned:
                  </p>
                  <div className="flex justify-center items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      +50 Pass Points
                    </Badge>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                      📬 Verified Scholar
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can now receive session invites and notifications!
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}