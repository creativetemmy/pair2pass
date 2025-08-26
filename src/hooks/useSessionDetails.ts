import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';
import { useParams } from 'react-router-dom';

interface SessionDetails {
  id: string;
  subject: string;
  goal: string;
  partner_1_id: string;
  partner_2_id: string;
  duration: number;
  created_at: string;
  status: string;
  video_link?: string;
  partner_1_ready: boolean;
  partner_2_ready: boolean;
}

export const useSessionDetails = (sessionId?: string) => {
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const params = useParams();
  
  // Use sessionId prop or try to get from URL params or find active session
  const targetSessionId = sessionId || params.sessionId;

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('study_sessions').select('*');

        if (targetSessionId) {
          // Fetch specific session by ID
          query = query.eq('id', targetSessionId);
        } else if (address) {
          // Fetch active session for current user
          query = query
            .or(`partner_1_id.eq.${address},partner_2_id.eq.${address}`)
            .eq('status', 'active');
        } else {
          setError('No session ID provided and no wallet connected');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await query.maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError('Session not found');
        } else {
          setSession(data);
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch session');
      } finally {
        setLoading(false);
      }
    };

    if (targetSessionId || address) {
      fetchSessionDetails();
    }

    // Set up real-time subscription for the session
    if (targetSessionId || address) {
      const channel = supabase
        .channel('session-details-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_sessions',
            filter: targetSessionId ? `id=eq.${targetSessionId}` : `partner_1_id=eq.${address}`,
          },
          fetchSessionDetails
        );

      if (!targetSessionId && address) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_sessions',
            filter: `partner_2_id=eq.${address}`,
          },
          fetchSessionDetails
        );
      }

      channel.subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [targetSessionId, address]);

  const getPartnerWallet = () => {
    if (!session || !address) return null;
    return session.partner_1_id === address ? session.partner_2_id : session.partner_1_id;
  };

  const isUserReady = () => {
    if (!session || !address) return false;
    return session.partner_1_id === address ? session.partner_1_ready : session.partner_2_ready;
  };

  const isPartnerReady = () => {
    if (!session || !address) return false;
    return session.partner_1_id === address ? session.partner_2_ready : session.partner_1_ready;
  };

  return {
    session,
    loading,
    error,
    getPartnerWallet,
    isUserReady,
    isPartnerReady,
    refetch: () => {
      if (targetSessionId || address) {
        setLoading(true);
        // This will trigger the useEffect to refetch
      }
    }
  };
};