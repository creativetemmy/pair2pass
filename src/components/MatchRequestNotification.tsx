import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

interface MatchRequestNotificationProps {
  notification: Notification;
  onRead: () => void;
}

export function MatchRequestNotification({
  notification,
  onRead,
}: MatchRequestNotificationProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const { matchRequestId, requesterName, subject, goal, duration, expiresAt } =
    notification.data;

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!expiresAt) return;
      
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;
      
      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
        handleExpiration();
        return;
      }
      
      setTimeRemaining(Math.floor(diff / 1000)); // in seconds
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExpiration = async () => {
    if (isExpired) return; // Prevent duplicate calls
    
    try {
      // Update match request status to expired
      await supabase
        .from("match_requests")
        .update({ status: "expired" })
        .eq("id", matchRequestId);

      // Get match request details
      const { data: matchRequest } = await supabase
        .from("match_requests")
        .select("requester_wallet, target_wallet")
        .eq("id", matchRequestId)
        .single();

      if (matchRequest) {
        // Notify requester
        await supabase.from("notifications").insert({
          user_wallet: matchRequest.requester_wallet?.toLowerCase(),
          type: "match_expired",
          title: "⏱️ Request Expired",
          message: `Your study partner request for ${subject} has expired. Try sending another request!`,
          data: { subject, goal },
        });

        // Notify target
        await supabase.from("notifications").insert({
          user_wallet: matchRequest.target_wallet?.toLowerCase(),
          type: "match_expired",
          title: "⏱️ Request Expired",
          message: `A study partner request for ${subject} has expired.`,
          data: { subject, goal },
        });
      }

      // Mark current notification as read
      onRead();
    } catch (error) {
      console.error("Error handling expiration:", error);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      // Update match request status to accepted
      const { error: updateError } = await supabase
        .from("match_requests")
        .update({ status: "accepted" })
        .eq("id", matchRequestId);

      if (updateError) throw updateError;

      // Get the match request details to create session
      const { data: matchRequest, error: fetchError } = await supabase
        .from("match_requests")
        .select("*")
        .eq("id", matchRequestId)
        .single();

      if (fetchError) throw fetchError;

      // Create study session
      const { data: session, error: sessionError } = await supabase
        .from("study_sessions")
        .insert([
          {
            partner_1_id: matchRequest.requester_wallet,
            partner_2_id: matchRequest.target_wallet,
            subject: matchRequest.subject,
            goal: matchRequest.goal,
            duration: matchRequest.duration,
            status: "waiting",
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Mark notification as read
      onRead();

      // Create match found notifications for both users

      const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("wallet_address", matchRequest.requester_wallet?.toLowerCase())
        .single();

      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("wallet_address", matchRequest.target_wallet?.toLowerCase())
        .single();

      // Notify requester that match was accepted
      await supabase.from("notifications").insert({
        user_wallet: matchRequest.requester_wallet?.toLowerCase(),
        type: "match_found",
        title: "🎉 Match Accepted!",
        message: `Your study partner request for ${subject} was accepted! Session starting soon.`,
        data: { sessionId: session.id, subject, goal },
      });

      // Send email to requester
      if (requesterProfile?.email) {
        await supabase.functions
          .invoke("send-notification-email", {
            body: {
              type: "match_found",
              email: requesterProfile.email,
              data: {
                userName: requesterProfile.name || "Student",
                partnerName: targetProfile?.name || "Student",
                subject,
                sessionId: session.id,
              },
            },
          })
          .catch((err) => console.log("Email send failed:", err));
      }

      // Send email to target
      if (targetProfile?.email) {
        await supabase.functions
          .invoke("send-notification-email", {
            body: {
              type: "match_found",
              email: targetProfile.email,
              data: {
                userName: targetProfile.name || "Student",
                partnerName: requesterName,
                subject,
                sessionId: session.id,
              },
            },
          })
          .catch((err) => console.log("Email send failed:", err));
      }

      toast({
        title: "Match Accepted! 🎉",
        description: "Redirecting to session lobby...",
      });

      // Redirect to session lobby
      navigate(`/session/${session.id}`);
    } catch (error) {
      console.error("Error accepting match:", error);
      toast({
        title: "Error",
        description: "Failed to accept match request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      // Update match request status to rejected
      const { error } = await supabase
        .from("match_requests")
        .update({ status: "rejected" })
        .eq("id", matchRequestId);

      if (error) throw error;

      // Create notification for requester about rejection
      const { data: matchRequest } = await supabase
        .from("match_requests")
        .select("requester_wallet")
        .eq("id", matchRequestId)
        .single();

      if (matchRequest) {
        await supabase.from("notifications").insert([
          {
            user_wallet: matchRequest.requester_wallet?.toLowerCase(),
            type: "match_rejected",
            title: "Match Request Declined",
            message:
              "Your study partner request was declined. Try another match!",
            data: { subject, goal },
          },
        ]);
      }

      // Mark notification as read
      onRead();

      toast({
        title: "Match Declined",
        description: "The request has been declined politely.",
      });
    } catch (error) {
      console.error("Error rejecting match:", error);
      toast({
        title: "Error",
        description: "Failed to reject match request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isExpired) {
    return (
      <Card className="m-2 border-destructive/20 bg-destructive/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-destructive" />
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This study partner request has expired.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-2 border-primary/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{requesterName}</span>
            <Badge variant="secondary" className="text-xs">
              Study Request
            </Badge>
          </div>
          {!notification.read && (
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm">
            📩 <strong>{requesterName}</strong> wants to study{" "}
            <strong>{subject}</strong> with you!
          </p>
          <p className="text-xs text-muted-foreground">Goal: {goal}</p>
          <p className="text-xs text-muted-foreground">
            Duration: {duration} minutes
          </p>
          {timeRemaining !== null && (
            <div className="flex items-center space-x-1 text-xs text-primary font-medium">
              <Clock className="h-3 w-3" />
              <span>Expires in: {formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleAccept}
            disabled={processing || isExpired}
          >
            <Check className="h-3 w-3 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleReject}
            disabled={processing || isExpired}
          >
            <X className="h-3 w-3 mr-1" />
            Decline
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
