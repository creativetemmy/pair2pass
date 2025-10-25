import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('hours_studied, partners_helped, average_rating, interests')
          .eq('user_id', user.id)
          .single();

        // Fetch unique partners count
        const { data: sessionsAsPartner1 } = await supabase
          .from('study_sessions')
          .select('partner_2_user_id')
          .eq('partner_1_user_id', user.id);

        const { data: sessionsAsPartner2 } = await supabase
          .from('study_sessions')
          .select('partner_1_user_id')
          .eq('partner_2_user_id', user.id);

        const uniquePartners = new Set([
          ...(sessionsAsPartner1?.map(s => s.partner_2_user_id) || []),
          ...(sessionsAsPartner2?.map(s => s.partner_1_user_id) || [])
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
  }, [user?.id]);

  return { stats, loading };
};