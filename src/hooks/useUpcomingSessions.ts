import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UpcomingSession {
  id: string;
  subject: string;
  goal: string;
  partner_user_id: string;
  partner_name?: string;
  duration: number;
  created_at: string;
  status: string;
}

export const useUpcomingSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching upcoming sessions for user:', user.id);
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .or(`partner_1_user_id.eq.${user.id},partner_2_user_id.eq.${user.id}`)
          .eq('status', 'waiting')
          .order('created_at', { ascending: true });

        console.log('Upcoming sessions query result:', { data, error });

        if (error) throw error;

        // Get partner information for display
        const sessionsWithPartner = await Promise.all(
          (data || []).map(async (session) => {
            const partnerUserId = session.partner_1_user_id === user.id ? session.partner_2_user_id : session.partner_1_user_id;
            
            // Fetch partner profile for display name
            const { data: partnerProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', partnerUserId)
              .single();

            return {
              ...session,
              partner_user_id: partnerUserId,
              partner_name: partnerProfile?.name || 'Study Partner'
            };
          })
        );

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
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchUpcomingSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Manual refresh function
  const refreshUpcomingSessions = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .or(`partner_1_user_id.eq.${user.id},partner_2_user_id.eq.${user.id}`)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const sessionsWithPartner = await Promise.all(
        (data || []).map(async (session) => {
          const partnerUserId = session.partner_1_user_id === user.id ? session.partner_2_user_id : session.partner_1_user_id;
          
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', partnerUserId)
            .single();

          return {
            ...session,
            partner_user_id: partnerUserId,
            partner_name: partnerProfile?.name || 'Study Partner'
          };
        })
      );

      setUpcomingSessions(sessionsWithPartner);
    } catch (error) {
      console.error('Error refreshing upcoming sessions:', error);
    }
  };

  return { upcomingSessions, loading, refreshUpcomingSessions };
};