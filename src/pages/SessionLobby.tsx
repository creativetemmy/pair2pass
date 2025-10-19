import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Users, 
  BookOpen, 
  Target, 
  CheckCircle, 
  UserCheck,
  Video,
  ArrowLeft,
  Link,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

interface StudySession {
  id: string;
  partner_1_id: string;
  partner_2_id: string;
  subject: string;
  goal: string;
  duration: number;
  status: string;
  partner_1_ready: boolean;
  partner_2_ready: boolean;
  video_link: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  wallet_address: string;
  name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  average_rating: number;
}

export default function SessionLobby() {
  const { sessionId } = useParams();
  const { address } = useAccount();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<StudySession | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [countdownActive, setCountdownActive] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);

  useEffect(() => {
    if (!sessionId || !address) return;
    
    fetchSessionData();

    // Polling fallback function
    const pollSession = async () => {
      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) throw error;
        if (data) {
          console.log('📊 POLLING UPDATE:', data);
          setSession(data);
          
          if (data.video_link) {
            setVideoLink(data.video_link);
          }
          
          const isPartner1 = data.partner_1_id.toLowerCase() === address?.toLowerCase();
          const currentUserReady = isPartner1 ? data.partner_1_ready : data.partner_2_ready;
          setIsReady(currentUserReady);
          
          const bothReady = data.partner_1_ready && data.partner_2_ready;
          if (bothReady && !countdownActive) {
            setCountdownActive(true);
            toast({
              title: "Both partners ready! 🎉",
              description: "Session starting in 5 minutes. Get prepared!",
            });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };
    
    // Set up realtime subscription with fallback polling
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'study_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('=== REALTIME UPDATE RECEIVED ===');
          console.log('Payload:', payload);
          const updatedSession = payload.new as StudySession;
          console.log('Updated session:', updatedSession);
          console.log('Current address:', address);
          console.log('Partner 1 ID:', updatedSession.partner_1_id);
          console.log('Partner 2 ID:', updatedSession.partner_2_id);
          console.log('Partner 1 ready:', updatedSession.partner_1_ready);
          console.log('Partner 2 ready:', updatedSession.partner_2_ready);
          
          setSession(updatedSession);
          
          // Update video link if changed
          if (updatedSession.video_link) {
            console.log('Video link updated:', updatedSession.video_link);
            setVideoLink(updatedSession.video_link);
          }
          
          // Determine which partner is the current user (case-insensitive)
          const isPartner1 = updatedSession.partner_1_id.toLowerCase() === address?.toLowerCase();
          const currentUserReady = isPartner1
            ? updatedSession.partner_1_ready 
            : updatedSession.partner_2_ready;
          
          console.log('Is current user partner 1?:', isPartner1);
          console.log('Current user ready status:', currentUserReady);
          
          setIsReady(currentUserReady);
          
          // Check if both partners are ready
          const bothReady = updatedSession.partner_1_ready && updatedSession.partner_2_ready;
          console.log('Both partners ready?:', bothReady);
          console.log('Countdown active?:', countdownActive);
          
          if (bothReady && !countdownActive) {
            console.log('Starting countdown!');
            setCountdownActive(true);
            toast({
              title: "Both partners ready! 🎉",
              description: "Session starting in 5 minutes. Get prepared!",
            });
          }
          console.log('=== END REALTIME UPDATE ===');
        }
      )
      .subscribe();

    // Start polling as fallback (every 3 seconds)
    const pollInterval = setInterval(pollSession, 3000);
    
    // Initial poll
    pollSession();

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [sessionId, address, countdownActive]);

  // Countdown timer effect
  useEffect(() => {
    if (!countdownActive || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCountdownActive(false);
          startSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownActive, countdown]);

  const fetchSessionData = async () => {
    try {
      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      setSession(sessionData);
      
      // Set video link if exists
      if (sessionData.video_link) {
        setVideoLink(sessionData.video_link);
      }

      // Determine partner wallet address (case-insensitive)
      const partnerWallet = sessionData.partner_1_id.toLowerCase() === address?.toLowerCase()
        ? sessionData.partner_2_id 
        : sessionData.partner_1_id;

      // Fetch partner profile
      // Use public_profiles view to fetch partner data (excludes sensitive info)
      const { data: partnerData, error: partnerError } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('wallet_address', partnerWallet)
        .single();

      if (partnerError) throw partnerError;

      setPartner(partnerData);

      // Set current user's ready status (case-insensitive)
      const currentUserReady = sessionData.partner_1_id.toLowerCase() === address?.toLowerCase()
        ? sessionData.partner_1_ready 
        : sessionData.partner_2_ready;
      setIsReady(currentUserReady);

    } catch (error) {
      console.error('Error fetching session data:', error);
      toast({
        title: "Error",
        description: "Failed to load session details",
        variant: "destructive",
      });
      navigate('/find-partner');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLink = async () => {
    if (!linkInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid session link.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting video link:', linkInput.trim());
      const { error } = await supabase
        .from('study_sessions')
        .update({ video_link: linkInput.trim() })
        .eq('id', sessionId);

      if (error) throw error;

      setVideoLink(linkInput.trim());
      setLinkInput("");
      setShowLinkForm(false);
      
      toast({
        title: "Session Link Added",
        description: "Both partners can now join the study session!",
      });
    } catch (error) {
      console.error('Error updating session link:', error);
      toast({
        title: "Error",
        description: "Failed to add session link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkReady = async () => {
    if (!session || !address) {
      console.log('Cannot mark ready - missing session or address');
      return;
    }

    if (!videoLink) {
      toast({
        title: "Meeting Link Required",
        description: "Please add a meeting link before marking ready.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isPartner1 = session.partner_1_id.toLowerCase() === address.toLowerCase();
      const readyField = isPartner1 ? 'partner_1_ready' : 'partner_2_ready';
      
      console.log('=== MARKING READY ===');
      console.log('Session ID:', sessionId);
      console.log('Current address:', address);
      console.log('Partner 1 ID:', session.partner_1_id);
      console.log('Partner 2 ID:', session.partner_2_id);
      console.log('Is Partner 1?:', isPartner1);
      console.log('Ready field to update:', readyField);
      
      const { data, error } = await supabase
        .from('study_sessions')
        .update({ [readyField]: true })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Update successful! Data:', data);
      setIsReady(true);
      
      toast({
        title: "Ready! ✅",
        description: "Waiting for your partner to be ready...",
      });
      console.log('=== END MARKING READY ===');
    } catch (error) {
      console.error('Error marking ready:', error);
      toast({
        title: "Error",
        description: "Failed to mark as ready",
        variant: "destructive",
      });
    }
  };

  const handleJoinSession = () => {
    if (videoLink) {
      window.open(videoLink, '_blank');
    }
  };

  const startSession = async () => {
    if (!session) return;

    try {
      console.log('Starting session...');
      // Update session status to active
      const { error } = await supabase
        .from('study_sessions')
        .update({ status: 'active' })
        .eq('id', sessionId);

      if (error) throw error;

      console.log('Session status updated to active');

      toast({
        title: "Session Started! 🚀",
        description: "Your study session is now active. Good luck!",
      });

      // Navigate to session check-in page for the active session
      navigate(`/session-checkin/${sessionId}`);
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="animate-pulse">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!session || !partner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Session not found</h1>
          <Button onClick={() => navigate('/find-partner')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Find Partner
          </Button>
        </div>
      </div>
    );
  }

  const bothReady = session.partner_1_ready && session.partner_2_ready;
  const partnerReady = session.partner_1_id.toLowerCase() === address?.toLowerCase()
    ? session.partner_2_ready 
    : session.partner_1_ready;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Study Session Lobby</h1>
          <p className="text-muted-foreground">Get ready to start learning together!</p>
        </div>

        {/* Countdown Timer */}
        {countdownActive && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {formatTime(countdown)}
                </div>
                <p className="text-sm">Session starting soon...</p>
                <Progress value={((300 - countdown) / 300) * 100} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Session Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Subject:</span>
                  <Badge variant="secondary">{session.subject}</Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{session.duration} minutes</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Goal:</span>
                </div>
                <p className="text-sm pl-6">{session.goal}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Your Study Partner</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {partner.avatar_url ? (
                <img
                  src={partner.avatar_url}
                  alt="Partner avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {getInitials(partner.name)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold">{partner.name || "Anonymous"}</h3>
                  <Badge variant="secondary">Level {partner.level}</Badge>
                  {partnerReady && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>⭐ {partner.average_rating.toFixed(1)}</span>
                  <span>🔥 {partner.xp} XP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Link Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Link className="h-5 w-5" />
              <span>Session Link</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              {videoLink ? (
                <>
                  <p className="text-sm text-muted-foreground">Ready to join your study session!</p>
                  <Button
                    onClick={handleJoinSession}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Study Session
                  </Button>
                </>
              ) : (
                <>
                  {!showLinkForm ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">No session link added yet</p>
                      <Button
                        onClick={() => setShowLinkForm(true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Add Session Link
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        placeholder="Paste Google Meet, Zoom, or any video link..."
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitLink}
                          disabled={!linkInput.trim()}
                          className="flex-1"
                        >
                          Submit Link
                        </Button>
                        <Button
                          onClick={() => {
                            setShowLinkForm(false);
                            setLinkInput("");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ready Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Ready Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>You are ready:</span>
              {isReady ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="outline">Not Ready</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>{partner.name || "Partner"} is ready:</span>
              {partnerReady ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="outline">Waiting...</Badge>
              )}
            </div>
            
            <Separator />
            
            {!bothReady && (
              <div className="text-center space-y-4">
                {!isReady ? (
                  <Button onClick={handleMarkReady} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Ready
                  </Button>
                ) : (
                  <p className="text-muted-foreground">
                    Waiting for {partner.name || "your partner"} to be ready...
                  </p>
                )}
              </div>
            )}

            {bothReady && !countdownActive && (
              <div className="text-center">
                <p className="text-green-600 font-medium">
                  🎉 Both partners are ready! Session will start automatically.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/find-partner')}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Lobby
          </Button>
          {bothReady && countdownActive && (
            <Button 
              onClick={startSession}
              className="flex-1"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}