import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

interface ActiveSession {
  id: string;
  subject: string;
  goal: string;
  partner_1_id: string;
  partner_2_id: string;
  duration: number;
  created_at: string;
  status: string;
}

export const useActiveSession = () => {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const fetchActiveSession = async () => {
      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .or(`partner_1_id.eq.${address},partner_2_id.eq.${address}`)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching active session:', error);
        } else {
          setActiveSession(data);
        }
      } catch (error) {
        console.error('Error fetching active session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSession();

    // Set up real-time subscription
    const channel = supabase
      .channel('active-session-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `partner_1_id=eq.${address}`,
        },
        fetchActiveSession
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `partner_2_id=eq.${address}`,
        },
        fetchActiveSession
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [address]);

  return { activeSession, loading };
};