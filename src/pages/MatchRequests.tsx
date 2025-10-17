import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, BookOpen, Star, TrendingUp, X, Check } from "lucide-react";
import { useMatchRequests } from "@/hooks/useMatchRequests";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function MatchRequests() {
  const { requests, loading, refetch } = useMatchRequests();
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Match Requests</h1>
        <p className="text-muted-foreground">
          Review and respond to study partner requests
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any match requests at the moment
            </p>
            <Button onClick={() => navigate("/find-partner")}>
              Find Study Partner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <MatchRequestCard
              key={request.id}
              request={request}
              onSuccess={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MatchRequestCardProps {
  request: any;
  onSuccess: () => void;
}

function MatchRequestCard({ request, onSuccess }: MatchRequestCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!request.expires_at) return;

      const now = new Date().getTime();
      const expiry = new Date(request.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
        handleExpiration();
        return;
      }

      setTimeRemaining(Math.floor(diff / 1000));
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [request.expires_at]);

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExpiration = async () => {
    if (isExpired) return;

    try {
      await supabase
        .from("match_requests")
        .update({ status: "expired" })
        .eq("id", request.id);

      await supabase.from("notifications").insert([
        {
          user_wallet: request.requester_wallet?.toLowerCase(),
          type: "match_expired",
          title: "⏱️ Request Expired",
          message: `Your study partner request for ${request.subject} has expired.`,
          data: { subject: request.subject, goal: request.goal },
        },
        {
          user_wallet: request.target_wallet?.toLowerCase(),
          type: "match_expired",
          title: "⏱️ Request Expired",
          message: `A study partner request for ${request.subject} has expired.`,
          data: { subject: request.subject, goal: request.goal },
        },
      ]);

      onSuccess();
    } catch (error) {
      console.error("Error handling expiration:", error);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      console.log('Accepting match request:', request.id);
      
      const { error: updateError } = await supabase
        .from("match_requests")
        .update({ status: "accepted" })
        .eq("id", request.id);

      if (updateError) {
        console.error('Error updating match request:', updateError);
        throw updateError;
      }

      const { data: session, error: sessionError } = await supabase
        .from("study_sessions")
        .insert([
          {
            partner_1_id: request.requester_wallet,
            partner_2_id: request.target_wallet,
            subject: request.subject,
            goal: request.goal,
            duration: request.duration,
            status: "waiting",
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("wallet_address", request.requester_wallet?.toLowerCase())
        .single();

      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("wallet_address", request.target_wallet?.toLowerCase())
        .single();

      await supabase.from("notifications").insert({
        user_wallet: request.requester_wallet?.toLowerCase(),
        type: "match_found",
        title: "🎉 Match Accepted!",
        message: `Your study partner request for ${request.subject} was accepted!`,
        data: { sessionId: session.id, subject: request.subject, goal: request.goal },
      });

      if (requesterProfile?.email) {
        await supabase.functions
          .invoke("send-notification-email", {
            body: {
              type: "match_found",
              email: requesterProfile.email,
              data: {
                userName: requesterProfile.name || "Student",
                partnerName: targetProfile?.name || "Student",
                subject: request.subject,
                sessionId: session.id,
              },
            },
          })
          .catch((err) => console.log("Email send failed:", err));
      }

      if (targetProfile?.email) {
        await supabase.functions
          .invoke("send-notification-email", {
            body: {
              type: "match_found",
              email: targetProfile.email,
              data: {
                userName: targetProfile.name || "Student",
                partnerName: requesterProfile?.name || "Student",
                subject: request.subject,
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
      const { error } = await supabase
        .from("match_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_wallet: request.requester_wallet?.toLowerCase(),
        type: "match_rejected",
        title: "Match Request Declined",
        message: "Your study partner request was declined. Try another match!",
        data: { subject: request.subject, goal: request.goal },
      });

      toast({
        title: "Match Declined",
        description: "The request has been declined.",
      });

      onSuccess();
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
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-destructive" />
              <p className="text-sm text-muted-foreground">
                This request has expired
              </p>
            </div>
            <Badge variant="destructive">Expired</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.requester_profile?.avatar_url} />
              <AvatarFallback>
                {request.requester_profile?.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {request.requester_profile?.name || "Student"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {request.requester_profile?.institution || "Unknown Institution"}
              </p>
            </div>
          </div>
          {timeRemaining !== null && (
            <Badge variant="outline" className="text-primary border-primary">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeRemaining(timeRemaining)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Subject</span>
            </div>
            <p className="font-medium">{request.subject}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Duration</span>
            </div>
            <p className="font-medium">{request.duration} minutes</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Study Goal</p>
          <p className="font-medium">{request.goal}</p>
        </div>

        <div className="flex items-center space-x-4 pt-2">
          <div className="flex items-center space-x-1 text-sm">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{request.requester_profile?.average_rating?.toFixed(1) || "0.0"}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>{request.requester_profile?.sessions_completed || 0} sessions</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            className="flex-1"
            size="lg"
            onClick={handleAccept}
            disabled={processing || isExpired}
          >
            <Check className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={handleReject}
            disabled={processing || isExpired}
          >
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Requested {new Date(request.created_at).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
