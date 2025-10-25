import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchActiveSession = async () => {
      try {
        console.log('Fetching active session for user:', user.id);
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .or(`partner_1_user_id.eq.${user.id},partner_2_user_id.eq.${user.id}`)
          .in('status', ['waiting', 'active'])
          .maybeSingle();

        console.log('Active session query result:', { data, error });

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching active session:', error);
        } else {
          // Filter out expired sessions (created_at + duration has passed)
          if (data) {
            const sessionStart = new Date(data.created_at).getTime();
            const sessionDuration = data.duration * 60 * 1000; // Convert minutes to milliseconds
            const sessionEnd = sessionStart + sessionDuration;
            const now = Date.now();
            
            // Only set as active if session hasn't expired
            if (now < sessionEnd) {
              setActiveSession(data);
              console.log('Active session set:', data);
            } else {
              console.log('Session expired, not setting as active');
              setActiveSession(null);
            }
          } else {
            setActiveSession(null);
          }
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
          filter: `partner_1_user_id=eq.${user.id}`,
        },
        fetchActiveSession
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `partner_2_user_id=eq.${user.id}`,
        },
        fetchActiveSession
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { activeSession, loading };
};