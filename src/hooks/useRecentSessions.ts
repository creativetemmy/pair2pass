import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

interface RecentSession {
  id: string;
  subject: string;
  partner_wallet: string;
  created_at: string;
  rating?: number;
  xp_earned?: number;
}

export const useRecentSessions = () => {
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    const fetchRecentSessions = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        // Fetch completed sessions
        const { data: sessions, error } = await supabase
          .from('study_sessions')
          .select('*')
          .or(`partner_1_id.eq.${address},partner_2_id.eq.${address}`)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        // Get reviews for these sessions
        const sessionsWithDetails = await Promise.all(
          (sessions || []).map(async (session) => {
            const partnerWallet = session.partner_1_id === address ? session.partner_2_id : session.partner_1_id;
            
            // Fetch review for this session where current user was reviewed
            const { data: review } = await supabase
              .from('session_reviews')
              .select('rating')
              .eq('session_id', session.id)
              .eq('reviewed_wallet', address)
              .single();

            return {
              id: session.id,
              subject: session.subject,
              partner_wallet: partnerWallet,
              created_at: session.created_at,
              rating: review?.rating,
              xp_earned: review?.rating ? review.rating * 30 : 0 // Calculate XP based on rating
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
  }, [address]);

  return { recentSessions, loading };
};