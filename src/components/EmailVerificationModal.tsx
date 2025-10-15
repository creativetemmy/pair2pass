import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { awardPassPoints } from "@/lib/passPointsSystem";
import { useAccount } from "wagmi";
import { createClient } from "@supabase/supabase-js";

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
  onVerificationSuccess,
}: EmailVerificationModalProps) {
  const [step, setStep] = useState<"sending" | "verify" | "success">("sending");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { address } = useAccount();

  useEffect(() => {
    console.log("📬 EmailVerificationModal effect:", { isOpen, step });
    if (isOpen && step === "sending") {
      console.log("🚀 Calling sendOTP");
      sendOTP();
    }
  }, [isOpen, step]);

  const sendOTP = async () => {
    console.log("📨 sendOTP called", { email, address });
    if (!email || !address) {
      console.error("❌ Missing email or address:", { email, address });
      return;
    }
    setSending(true);

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("🔢 Generated OTP");

      // Store OTP
      const { error: insertError } = await supabase
        .from("email_verifications")
        .insert({
          email,
          wallet_address: address,
          otp,
          verified: false,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });

      if (insertError) throw insertError;

      const { error: funcError } = await supabase.functions.invoke(
        "send-email",
        {
          body: { email, walletAddress: address, otp },
        }
      );

      if (funcError) throw funcError;

      toast({
        title: "Code Sent",
        description: "Verification code has been sent to your email.",
      });
      setStep("verify");
    } catch (error: any) {
      console.error("❌ sendOTP error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code.",
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
      const { data: verification } = await supabase
        .from("email_verifications")
        .select("*")
        .eq("email", email)
        .eq("wallet_address", address)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!verification || verification.otp !== otp) {
        toast({
          title: "Invalid Code",
          description: "The verification code is invalid or expired.",
          variant: "destructive",
        });
        setOtp("");
        return;
      }

      await supabase
        .from("email_verifications")
        .update({ verified: true })
        .eq("id", verification.id);

      await supabase
        .from("profiles")
        .update({ is_email_verified: true })
        .eq("wallet_address", address);

      // Optionally cleanup
      await supabase
        .from("email_verifications")
        .delete()
        .eq("email", email)
        .neq("id", verification.id);

      awardPassPoints(address, "EMAIL_VERIFIED");

      // Create notification and send welcome email
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("wallet_address", address)
        .single();

      await supabase.from("notifications").insert({
        user_wallet: address,
        type: "welcome",
        title: "🎓 Welcome to Pair2Pass!",
        message:
          "Your email has been verified. Start finding study partners now!",
        data: { action: "email_verified" },
      });

      await supabase.functions.invoke("send-notification-email", {
        body: {
          type: "welcome",
          email,
          data: {
            userName: profile?.name || "Student",
            walletAddress: address,
          },
        },
      });

      setStep("success");

      setTimeout(() => {
        onVerificationSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (open: boolean) => {
    if (!open) {
      setStep("sending");
      setOtp("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === "sending" && "Sending Verification Code"}
            {step === "verify" && "Verify Your Email"}
            {step === "success" && "Email Verified!"}
          </DialogTitle>
          <DialogDescription>
            {step === "verify" && "Enter the 6-digit code sent to your email."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {" "}
          {step === "sending" && (
            <div className="text-center py-8">
              {" "}
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />{" "}
              <p className="text-muted-foreground">
                {" "}
                Sending verification code to{" "}
              </p>{" "}
              <p className="font-medium">{email}</p>{" "}
              {sending && (
                <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4" />
              )}{" "}
            </div>
          )}{" "}
          {step === "verify" && (
            <div className="space-y-4">
              {" "}
              <div className="text-center">
                {" "}
                <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />{" "}
                <p className="text-sm text-muted-foreground mb-4">
                  {" "}
                  Enter the 6-digit code sent to your email address.{" "}
                </p>{" "}
                <p className="font-medium text-sm mb-6">{email}</p>{" "}
              </div>{" "}
              <div className="flex justify-center">
                {" "}
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  {" "}
                  <InputOTPGroup>
                    {" "}
                    <InputOTPSlot index={0} /> <InputOTPSlot index={1} />{" "}
                    <InputOTPSlot index={2} /> <InputOTPSlot index={3} />{" "}
                    <InputOTPSlot index={4} /> <InputOTPSlot index={5} />{" "}
                  </InputOTPGroup>{" "}
                </InputOTP>{" "}
              </div>{" "}
              <Button
                onClick={verifyOTP}
                className="w-full"
                disabled={loading || otp.length !== 6}
              >
                {" "}
                {loading ? (
                  <>
                    {" "}
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                    Verifying...{" "}
                  </>
                ) : (
                  "Submit Code"
                )}{" "}
              </Button>{" "}
              <div className="text-center">
                {" "}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sendOTP}
                  disabled={sending}
                >
                  {" "}
                  {sending ? "Sending..." : "Resend Code"}{" "}
                </Button>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              {" "}
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />{" "}
              <div className="space-y-2">
                {" "}
                <h3 className="text-lg font-semibold text-green-600">
                  {" "}
                  ✅ Email Verified!{" "}
                </h3>{" "}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
                  {" "}
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    {" "}
                    🎉 Congratulations! You've earned:{" "}
                  </p>{" "}
                  <div className="flex justify-center items-center gap-2">
                    {" "}
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    >
                      {" "}
                      +50 Pass Points{" "}
                    </Badge>{" "}
                  </div>{" "}
                  <div className="flex justify-center items-center gap-2">
                    {" "}
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                    >
                      {" "}
                      📬 Verified Scholar{" "}
                    </Badge>{" "}
                  </div>{" "}
                </div>{" "}
                <p className="text-sm text-muted-foreground">
                  {" "}
                  You can now receive session invites and notifications!{" "}
                </p>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>
      </DialogContent>
    </Dialog>
  );
}
