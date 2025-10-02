import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { awardXP } from "@/lib/xpSystem";
import { useAccount } from "wagmi";

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
  const { address } = useAccount();

  // No need for auth state listener since we're using custom verification

  const sendOTP = async () => {
    if (!email || !address) {
      console.log('❌ No email or wallet address provided');
      return;
    }
    
    console.log('📧 Attempting to send OTP to:', email);
    setSending(true);
    
    try {
      // Use custom edge function for sending verification email\

      // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database
    const { error: insertError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        wallet_address: address,
        otp,
        verified: false,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
      });

    if (insertError) {
      console.error('❌ Database error:', insertError);
     
    }

  

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          email: email,
          walletAddress: address,
          otp
        }
      });

      if (error) {
        console.error('❌ Email Error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send verification code",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ OTP sent successfully via custom function');
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
    if (!otp || otp.length !== 6 || !address) return;

    setLoading(true);
    try {
      // Use custom edge function for verification
      
      const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('wallet_address', address)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();


    if (!verification) {
      console.log('❌ No valid verification found');

        toast({
          title: "No valid verification found",
          description: "No valid verification found",
          variant: "destructive",
        });
        setOtp("");
        return;
      
    }

    if (verification.otp !== otp) {
      console.log('❌ OTP mismatch');
        toast({
          title: "OTP mismatch",
          description: "OTP mismatch",
          variant: "destructive",
        });
        setOtp("");
        return;
      
    }

    // Mark verification as complete
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    if (updateError) {
      console.error('❌ Failed to mark verification as complete:', updateError);
        toast({
          title: "Failed to mark verification as complete",
          description: "Failed to mark verification as complete",
          variant: "destructive",
        });
        setOtp("");
        return;
    }

    // Update profile to mark email as verified
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_email_verified: true })
      .eq('wallet_address', address);

    if (profileError) {
      console.error('❌ Failed to update profile:', profileError);
       toast({
          title: "Failed to update profile",
          description: "Failed to update profile",
          variant: "destructive",
        });
        setOtp("");
        return;
      // Don't return error here as verification was successful, just log it
    }

    // Clean up old verification records for this email (optional)
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email)
      .neq('id', verification.id);

    console.log('✅ Email verification successful');

      console.log('✅ OTP verified successfully');
      
      // Award XP for email verification
      setTimeout(() => {
        awardXP(address, 'EMAIL_VERIFIED');
      }, 0);

      setStep('success');
      setTimeout(() => {
        onVerificationSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('❌ Verification error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setOtp("");
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