import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, CheckCircle, Star, Timer, Users, ArrowLeft } from "lucide-react";
import { useSessionDetails } from "@/hooks/useSessionDetails";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export default function SessionCheckIn() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  const { session, loading, error } = useSessionDetails();
  const { address } = useAccount();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading session details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The requested session could not be found or is no longer active."}
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getElapsedTime = () => {
    const now = new Date();
    const startTime = new Date(session.created_at);
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 60000);
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getProgressPercentage = () => {
    const now = new Date();
    const startTime = new Date(session.created_at);
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 60000);
    return Math.min((elapsed / session.duration) * 100, 100);
  };

  const formatWalletAddress = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const getPartnerWallet = () => {
    return session.partner_1_id === address ? session.partner_2_id : session.partner_1_id;
  };

  const handleCompleteSession = async () => {
    if (rating === 0) {
      toast.error("Please rate your study partner before completing the session");
      return;
    }
    
    setIsCompleting(true);
    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessionCompleted(true);
      toast.success("Session completed successfully!");
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error("Failed to complete session. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (sessionCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="h-20 w-20 rounded-full bg-success flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Session Completed!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Great job! You've earned <span className="font-semibold text-success">+200 XP</span> for completing this study session.
            </p>
            <div className="space-y-4">
              <div className="flex justify-center space-x-8 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-foreground">Duration</p>
                  <p className="text-muted-foreground">{getElapsedTime()}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Partner Rating</p>
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Active Study Session</h1>
        <p className="text-muted-foreground">Track your progress and complete the session when done</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Session Timer */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span>Session Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Time Elapsed: {getElapsedTime()}</span>
                <span className="text-sm text-muted-foreground">
                  {session.duration / 60}h planned
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="h-3 rounded-full gradient-primary transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{session.subject}</p>
                    <p className="text-sm text-muted-foreground">{session.goal}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{session.duration} minutes</p>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {formatWalletAddress(getPartnerWallet())}
                    </p>
                    <p className="text-sm text-muted-foreground">Study Partner</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full gradient-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
                    {session.id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Session ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {session.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Status */}
            <div className="flex justify-center">
              <Badge variant="secondary" className="px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                {session.status === 'active' ? 'In Progress' : session.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Completion Form */}
        <Card>
          <CardHeader>
            <CardTitle>Session Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rate Partner */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Rate Study Partner
              </Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors duration-200"
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
              <p className="text-xs text-muted-foreground mt-1">
                Click to rate (1-5 stars)
              </p>
            </div>

            {/* Feedback */}
            <div>
              <Label htmlFor="feedback" className="text-sm font-medium text-foreground">
                Session Feedback (Optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="How was your study session? Any highlights or areas for improvement?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            {/* Complete Button */}
            <Button
              variant="success"
              className="w-full"
              onClick={handleCompleteSession}
              disabled={isCompleting || rating === 0}
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Session
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Completing the session will record it on-chain and award XP to both participants
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}