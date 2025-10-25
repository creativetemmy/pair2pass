import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecentSession {
  id: string;
  subject: string;
  partner_name?: string;
  created_at: string;
  rating?: number;
  xp_earned?: number;
}

export const useRecentSessions = () => {
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentSessions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        // Fetch completed sessions
        const { data: sessions, error } = await supabase
          .from('study_sessions')
          .select('*')
          .or(`partner_1_user_id.eq.${user.id},partner_2_user_id.eq.${user.id}`)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        // Get reviews and partner info for these sessions
        const sessionsWithDetails = await Promise.all(
          (sessions || []).map(async (session) => {
            const partnerUserId = session.partner_1_user_id === user.id ? session.partner_2_user_id : session.partner_1_user_id;
            
            // Fetch partner profile
            const { data: partnerProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', partnerUserId)
              .single();
            
            // Fetch review for this session where current user was reviewed
            const { data: review } = await supabase
              .from('session_reviews')
              .select('rating')
              .eq('session_id', session.id)
              .eq('reviewed_id', user.id)
              .single();

            return {
              id: session.id,
              subject: session.subject,
              partner_name: partnerProfile?.name || 'Study Partner',
              created_at: session.created_at,
              rating: review?.rating,
              xp_earned: review?.rating ? review.rating * 30 : 0
            };
          })
        );

        setRecentSessions(sessionsWithDetails);
      } catch (error) {
        console.error('Error fetching recent sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSessions();
  }, [user?.id]);

  return { recentSessions, loading };
};