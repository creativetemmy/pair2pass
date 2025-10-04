import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string | null;
  wallet_address: string;
  avatar_url: string | null;
  xp: number;
  sessions_completed: number;
  hours_studied: number;
  level: number;
  average_rating: number;
  achievements: string[];
  trend: string;
}

export interface WeeklyStats {
  totalSessions: number;
  activeLearners: number;
  passDistributed: number;
}

export interface PopularSubject {
  subject: string;
  sessionCount: number;
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalSessions: 0,
    activeLearners: 0,
    passDistributed: 0
  });
  const [popularSubjects, setPopularSubjects] = useState<PopularSubject[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate achievements based on user stats
  const calculateAchievements = (user: any): string[] => {
    const achievements: string[] = [];
    
    if (user.xp > 10000) achievements.push("Top Performer");
    if (user.sessions_completed > 50) achievements.push("Study Streak");
    if (user.average_rating >= 4.5) achievements.push("Quick Learner");
    if (user.sessions_completed > 30) achievements.push("Team Player");
    if (user.hours_studied > 100) achievements.push("Consistent");
    if (user.average_rating >= 4.0 && user.sessions_completed > 20) achievements.push("Helper");
    if (user.xp > 5000 && user.level >= 8) achievements.push("Fast Track");
    if (user.xp > 3000 && user.sessions_completed > 15) achievements.push("Rising Star");
    
    return achievements;
  };

  // Calculate trend (mock calculation - in real app this would compare to previous period)
  const calculateTrend = (xp: number): string => {
    if (xp > 10000) return "+23%";
    if (xp > 8000) return "+18%";
    if (xp > 6000) return "+15%";
    if (xp > 4000) return "+12%";
    return "+10%";
  };

  const fetchLeaderboard = async () => {
    try {
      // Fetch top users by XP using secure public_profiles view
      const { data: profiles, error } = await supabase
        .from('public_profiles')
        .select(`
          id,
          wallet_address,
          name,
          avatar_url,
          xp,
          sessions_completed,
          hours_studied,
          level,
          average_rating
        `)
        .order('xp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      // Process and rank users
      const processedUsers: LeaderboardUser[] = (profiles || []).map((profile, index) => ({
        id: profile.id,
        rank: index + 1,
        name: profile.name || `User ${profile.wallet_address.slice(-4)}`,
        wallet_address: profile.wallet_address,
        avatar_url: profile.avatar_url,
        xp: profile.xp || 0,
        sessions_completed: profile.sessions_completed || 0,
        hours_studied: profile.hours_studied || 0,
        level: profile.level || 1,
        average_rating: Number(profile.average_rating) || 0,
        achievements: calculateAchievements(profile),
        trend: calculateTrend(profile.xp || 0)
      }));

      setLeaderboard(processedUsers);

    } catch (error) {
      console.error('Unexpected error fetching leaderboard:', error);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      // Get total sessions this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('id')
        .gte('created_at', weekAgo.toISOString());

      // Get active learners (users with activity this week)
      const { data: activeLearners, error: learnersError } = await supabase
        .from('public_profiles')
        .select('id')
        .gt('xp', 0);

      // Calculate total XP distributed this week (approximate)
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles')
        .select('xp');

      if (!sessionsError && !learnersError && !profilesError) {
        const totalXP = profiles?.reduce((sum, profile) => sum + (profile.xp || 0), 0) || 0;
        
        setWeeklyStats({
          totalSessions: sessions?.length || 0,
          activeLearners: activeLearners?.length || 0,
          passDistributed: Math.floor(totalXP * 0.1) // Approximate weekly distribution
        });
      }
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
    }
  };

  const fetchPopularSubjects = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('study_sessions')
        .select('subject')
        .eq('status', 'completed');

      if (!error && sessions) {
        // Count sessions by subject
        const subjectCounts: { [key: string]: number } = {};
        sessions.forEach(session => {
          if (session.subject) {
            subjectCounts[session.subject] = (subjectCounts[session.subject] || 0) + 1;
          }
        });

        // Convert to array and sort by count
        const sortedSubjects = Object.entries(subjectCounts)
          .map(([subject, count]) => ({ subject, sessionCount: count }))
          .sort((a, b) => b.sessionCount - a.sessionCount)
          .slice(0, 4);

        setPopularSubjects(sortedSubjects);
      }
    } catch (error) {
      console.error('Error fetching popular subjects:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeaderboard(),
        fetchWeeklyStats(),
        fetchPopularSubjects()
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  return {
    leaderboard,
    weeklyStats,
    popularSubjects,
    loading,
    refetch: () => {
      fetchLeaderboard();
      fetchWeeklyStats();
      fetchPopularSubjects();
    }
  };
};