import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { CancelSessionModal } from './CancelSessionModal';

interface ActiveSessionCardProps {
  session: {
    id: string;
    subject: string;
    goal: string;
    partner_1_id: string;
    partner_2_id: string;
    duration: number;
    created_at: string;
    status: string;
  };
}

export const ActiveSessionCard = ({ session }: ActiveSessionCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();
  const { address } = useAccount();

  useEffect(() => {
    const updateTimer = () => {
      const startTime = new Date(session.created_at).getTime();
      const durationMs = session.duration * 60 * 1000; // Convert minutes to milliseconds
      const endTime = startTime + durationMs;
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Session Ended');
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setTimeRemaining(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session.created_at, session.duration]);

  const getPartnerWallet = () => {
    return session.partner_1_id === address ? session.partner_2_id : session.partner_1_id;
  };

  const formatWalletAddress = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const handleJoinSession = () => {
    navigate(`/session-checkin/${session.id}`);
  };

  const handleCancelSession = () => {
    setShowCancelModal(true);
  };

  const handleSessionCancelled = () => {
    // The session will be updated via real-time subscription
    setShowCancelModal(false);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-primary">
          <Play className="h-5 w-5" />
          <span>Active Study Session</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-lg">{session.subject}</h3>
            <p className="text-sm text-muted-foreground">{session.goal}</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>with {formatWalletAddress(getPartnerWallet())}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-primary font-mono text-lg font-bold">
              <Clock className="h-5 w-5" />
              <span>{timeRemaining}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Time remaining</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancelSession} 
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancel Session</span>
          </Button>
          <Button onClick={handleJoinSession} className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Continue Session</span>
          </Button>
        </div>
        
        <CancelSessionModal
          open={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          sessionId={session.id}
          onCancel={handleSessionCancelled}
        />
      </CardContent>
    </Card>
  );
};