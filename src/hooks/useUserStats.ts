import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

interface UserStats {
  studyPartners: number;
  hoursStudied: number;
  activeCourses: number;
  averageRating: number;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    studyPartners: 0,
    hoursStudied: 0,
    activeCourses: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    const fetchStats = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('hours_studied, partners_helped, average_rating, interests')
          .eq('wallet_address', address)
          .single();

        // Fetch unique partners count
        const { data: sessionsAsPartner1 } = await supabase
          .from('study_sessions')
          .select('partner_2_id')
          .eq('partner_1_id', address);

        const { data: sessionsAsPartner2 } = await supabase
          .from('study_sessions')
          .select('partner_1_id')
          .eq('partner_2_id', address);

        const uniquePartners = new Set([
          ...(sessionsAsPartner1?.map(s => s.partner_2_id) || []),
          ...(sessionsAsPartner2?.map(s => s.partner_1_id) || [])
        ]);

        setStats({
          studyPartners: uniquePartners.size,
          hoursStudied: profile?.hours_studied || 0,
          activeCourses: profile?.interests?.length || 0,
          averageRating: Number(profile?.average_rating || 0)
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [address]);

  return { stats, loading };
};