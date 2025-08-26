import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

interface UpcomingSession {
  id: string;
  subject: string;
  goal: string;
  partner_wallet: string;
  duration: number;
  created_at: string;
  status: string;
}

export const useUpcomingSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching upcoming sessions for address:', address);
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .or(`partner_1_id.eq.${address},partner_2_id.eq.${address}`)
          .eq('status', 'waiting')
          .order('created_at', { ascending: true });

        console.log('Upcoming sessions query result:', { data, error });

        if (error) throw error;

        const sessionsWithPartner = data?.map(session => ({
          ...session,
          partner_wallet: session.partner_1_id === address ? session.partner_2_id : session.partner_1_id
        })) || [];

        console.log('Upcoming sessions with partner info:', sessionsWithPartner);
        setUpcomingSessions(sessionsWithPartner);
      } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingSessions();

    // Set up real-time subscription
    const channel = supabase
      .channel('upcoming-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `partner_1_id=eq.${address}`,
        },
        fetchUpcomingSessions
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `partner_2_id=eq.${address}`,
        },
        fetchUpcomingSessions
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [address]);

  return { upcomingSessions, loading };
};