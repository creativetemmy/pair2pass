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
import { useAccount } from "wagmi";

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
  const { address } = useAccount();
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Validate if current user is the target (recipient) of this request
  const isTargetUser = address?.toLowerCase() === request.target_wallet?.toLowerCase();

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
    if (!isTargetUser) {
      toast({
        title: "Not Authorized",
        description: "You can only accept requests sent to you.",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to accept this request.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      console.log('Accepting request via edge function:', request.id);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Call edge function to create session with validation
      const { data, error } = await supabase.functions.invoke(
        "create-study-session",
        {
          body: { matchRequestId: request.id },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to create session");

      console.log('Session created successfully:', data.sessionId);

      toast({
        title: "Match Accepted! 🎉",
        description: "Redirecting to session lobby...",
      });

      // Navigate immediately - session is ready
      navigate(`/session/${data.sessionId}`);
      onSuccess();
    } catch (error: any) {
      console.error("Error accepting match:", error);
      
      let errorMessage = error.message || "Please try again";
      
      // Provide helpful error messages
      if (errorMessage.includes("already has an active session")) {
        errorMessage = "One of you already has an active session. Please complete it first.";
      } else if (errorMessage.includes("expired")) {
        errorMessage = "This request has expired.";
        onSuccess(); // Refresh list
      } else if (errorMessage.includes("incomplete") || errorMessage.includes("not verified")) {
        errorMessage = "Profile verification required. Please complete your profile and verify your email.";
      }

      toast({
        title: "Unable to accept match request",
        description: errorMessage,
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
            disabled={processing || isExpired || !isTargetUser}
          >
            <Check className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={handleReject}
            disabled={processing || isExpired || !isTargetUser}
          >
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </div>

        {!isTargetUser && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            This request was not sent to your wallet
          </p>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Requested {new Date(request.created_at).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
