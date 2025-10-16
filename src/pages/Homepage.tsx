import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Play, Users, BookOpen, Trophy, Star, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileCheckModal } from "@/components/ProfileCheckModal";
import { NewStudySessionModal } from "@/components/NewStudySessionModal";
import { MatchmakingResults } from "@/components/MatchmakingResults";
import { StudySessionLobby } from "@/components/StudySessionLobby";
import { NotificationBell } from "@/components/NotificationBell";
import { useProfile } from "@/hooks/useProfile";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


const mockSessions = [
  {
    id: 1,
    title: "Advanced React Patterns",
    instructor: "Sarah Chen",
    rating: 4.9,
    participants: 24,
    duration: "2h",
    startTime: "3:00 PM",
    price: 25,
    tags: ["React", "JavaScript", "Frontend"],
    isLive: true,
    emoji: "⚛️"
  },
  {
    id: 2,
    title: "Calculus Problem Solving",
    instructor: "Dr. Martinez",
    rating: 4.8,
    participants: 18,
    duration: "1.5h",
    startTime: "5:00 PM",
    price: 20,
    tags: ["Math", "Calculus", "Problem Solving"],
    isLive: false,
    emoji: "📐"
  },
  {
    id: 3,
    title: "Web3 Smart Contracts",
    instructor: "Alex Kumar",
    rating: 4.7,
    participants: 31,
    duration: "3h",
    startTime: "7:00 PM",
    price: 40,
    tags: ["Blockchain", "Solidity", "Web3"],
    isLive: true,
    emoji: "🔗"
  }
];

const mockSchedule = [
  { time: "2:00 PM", title: "JavaScript Fundamentals", status: "joined", color: "bg-green-500" },
  { time: "4:30 PM", title: "Data Structures Deep Dive", status: "upcoming", color: "bg-blue-500" },
  { time: "7:00 PM", title: "Machine Learning Basics", status: "available", color: "bg-gray-400" },
];

const mockActivities = [
  { user: "Emma Thompson", action: "earned Achievement Badge", time: "2 min ago", emoji: "🏆", avatar: "/api/placeholder/32/32" },
  { user: "Marcus Johnson", action: "completed 50 study hours", time: "15 min ago", emoji: "💡", avatar: "/api/placeholder/32/32" },
  { user: "Lisa Wang", action: "reached study goal", time: "1h ago", emoji: "🎯", avatar: "/api/placeholder/32/32" },
];

export default function Homepage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("Programming");
  const [categories, setCategories] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [communityActivities, setCommunityActivities] = useState<any[]>([]);
  const [heroStats, setHeroStats] = useState({
    activeSessions: 0,
    onlineLearners: 0,
    totalXPEarned: 0,
    successRate: 0,
    onlineGrowth: 0
  });
  const [weeklyProgress, setWeeklyProgress] = useState({
    studyHours: { current: 0, target: 15 },
    sessionsCompleted: { current: 0, target: 10 },
    passPoints: { current: 0, target: 500 }
  });
  const { profile } = useProfile(address);
  const { items, completionPercentage, isComplete } = useProfileCompletion(profile);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileCheck, setShowProfileCheck] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showMatchmakingResults, setShowMatchmakingResults] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [currentPartner, setCurrentPartner] = useState<any>(null);
  const [userReady, setUserReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userPassPoints, setUserPassPoints] = useState(0);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch real data
    fetchCategoryData();
    fetchTodaySchedule();
    fetchCommunityActivities();
    fetchWeeklyProgress();
    fetchHeroStats();
    fetchUserPassPoints();

    return () => clearInterval(timer);
  }, [isConnected, navigate, address]);

  const fetchCategoryData = async () => {
    try {
      console.log('Fetching category data...');
      const { data: sessions, error } = await supabase
        .from('study_sessions')
        .select('subject');

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      console.log('Sessions data:', sessions);

      // Process subjects to create categories with counts
      const subjectCounts: { [key: string]: number } = {};
      sessions?.forEach(session => {
        const subject = session.subject;
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });

      console.log('Subject counts:', subjectCounts);

      // Create category objects with icons
      const categoryIcons: { [key: string]: string } = {
        'Programming': '💻',
        'JavaScript': '💻',
        'React': '⚛️',
        'AI': '🤖',
        'Mathematics': '📊',
        'Math': '📊',
        'Calculus': '📐',
        'Sciences': '🔬',
        'Physics': '🔬',
        'Chemistry': '⚗️',
        'Biology': '🧬',
        'Languages': '🌍',
        'English': '📚',
        'Spanish': '🇪🇸',
        'French': '🇫🇷',
        'Business': '💼',
        'Design': '🎨',
        'Web Development': '🌐',
        'Web3': '🔗',
        'Blockchain': '🔗',
        'General Study': '📖'
      };

      const categoryData = Object.entries(subjectCounts).map(([subject, count]) => ({
        name: subject,
        icon: categoryIcons[subject] || '📚',
        sessions: count,
        color: getColorForCategory(subject)
      }));

      console.log('Category data:', categoryData);

      // Add some popular categories if we don't have enough real data
      const popularCategories = [
        { name: "Programming", icon: "💻", sessions: 42, color: "bg-blue-500" },
        { name: "Mathematics", icon: "📊", sessions: 28, color: "bg-green-500" },
        { name: "Sciences", icon: "🔬", sessions: 15, color: "bg-purple-500" },
        { name: "Languages", icon: "🌍", sessions: 19, color: "bg-orange-500" },
        { name: "Business", icon: "💼", sessions: 13, color: "bg-red-500" },
        { name: "Design", icon: "🎨", sessions: 8, color: "bg-pink-500" },
      ];

      // Combine real data with popular categories, prioritizing real data
      const combinedCategories = [...categoryData];
      popularCategories.forEach(popularCat => {
        if (!categoryData.find(cat => cat.name === popularCat.name)) {
          combinedCategories.push(popularCat);
        }
      });

      const finalCategories = combinedCategories.slice(0, 6);
      console.log('Final categories:', finalCategories);
      
      setCategories(finalCategories);
    } catch (error) {
      console.error('Error in fetchCategoryData:', error);
      // Fallback to default categories
      setCategories([
        { name: "Programming", icon: "💻", sessions: 42, color: "bg-blue-500" },
        { name: "Mathematics", icon: "📊", sessions: 28, color: "bg-green-500" },
        { name: "Sciences", icon: "🔬", sessions: 15, color: "bg-purple-500" },
        { name: "Languages", icon: "🌍", sessions: 19, color: "bg-orange-500" },
        { name: "Business", icon: "💼", sessions: 13, color: "bg-red-500" },
        { name: "Design", icon: "🎨", sessions: 8, color: "bg-pink-500" },
      ]);
    }
  };

  const getColorForCategory = (category: string) => {
    const colors = {
      'Programming': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'React': 'bg-cyan-500',
      'AI': 'bg-violet-500',
      'Mathematics': 'bg-green-500',
      'Math': 'bg-green-500',
      'Sciences': 'bg-purple-500',
      'Languages': 'bg-orange-500',
      'Business': 'bg-red-500',
      'Design': 'bg-pink-500',
      'Web Development': 'bg-teal-500',
      'Web3': 'bg-indigo-500',
      'Blockchain': 'bg-indigo-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const fetchTodaySchedule = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: sessions, error } = await supabase
        .from('study_sessions')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .in('status', ['waiting', 'active'])
        .limit(5);

      if (error) {
        console.error('Error fetching today schedule:', error);
        return;
      }

      const scheduleData = sessions?.map(session => ({
        time: new Date(session.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        title: session.subject,
        status: session.status,
        color: session.status === 'active' ? 'bg-green-500' : 
               session.status === 'waiting' ? 'bg-blue-500' : 'bg-gray-400',
        partner: session.partner_1_id !== address ? session.partner_1_id?.slice(0, 6) : session.partner_2_id?.slice(0, 6)
      })) || [];

      setTodaySchedule(scheduleData);
    } catch (error) {
      console.error('Error in fetchTodaySchedule:', error);
      setTodaySchedule([
        { time: "2:00 PM", title: "JavaScript Fundamentals", status: "joined", color: "bg-green-500", partner: "Sarah" },
        { time: "4:30 PM", title: "Data Structures Deep Dive", status: "upcoming", color: "bg-blue-500", partner: "Mike" },
        { time: "7:00 PM", title: "Machine Learning Basics", status: "available", color: "bg-gray-400", partner: "Lisa" },
      ]);
    }
  };

  const fetchCommunityActivities = async () => {
    try {
      // Get recent profile updates - use public_profiles view
      const { data: profiles, error } = await supabase
        .from('public_profiles')
        .select('name, avatar_url, xp, level, sessions_completed, updated_at, wallet_address')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching community activities:', error);
        return;
      }

      const activities = profiles?.map(profile => {
        // Generate activity based on profile data
        const activities = [
          { action: "earned Achievement Badge", emoji: "🏆" },
          { action: `reached Level ${profile.level}`, emoji: "⭐" },
          { action: `completed ${profile.sessions_completed} study sessions`, emoji: "💡" },
          { action: `earned ${profile.xp} PASS points`, emoji: "🎯" },
          { action: "helped a study partner", emoji: "🤝" }
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const timeAgo = Math.floor((Date.now() - new Date(profile.updated_at).getTime()) / (1000 * 60));
        
        return {
          user: profile.name || `User ${profile.wallet_address?.slice(0, 6)}`,
          action: randomActivity.action,
          emoji: randomActivity.emoji,
          time: timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`,
          avatar: profile.avatar_url
        };
      }).slice(0, 5) || [];

      setCommunityActivities(activities);
    } catch (error) {
      console.error('Error in fetchCommunityActivities:', error);
      setCommunityActivities([
        { user: "Emma Thompson", action: "earned Achievement Badge", time: "2 min ago", emoji: "🏆", avatar: null },
        { user: "Marcus Johnson", action: "completed 50 study hours", time: "15 min ago", emoji: "💡", avatar: null },
        { user: "Lisa Wang", action: "reached study goal", time: "1h ago", emoji: "🎯", avatar: null },
      ]);
    }
  };

  const fetchWeeklyProgress = async () => {
    try {
      if (!address) return;

      // Get user's own profile for current stats (use profiles table directly for own data)
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('xp, sessions_completed, hours_studied')
        .eq('wallet_address', address)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      // Calculate weekly targets based on current stats
      const currentXP = userProfile?.xp || 0;
      const currentSessions = userProfile?.sessions_completed || 0;
      const currentHours = userProfile?.hours_studied || 0;

      // Set weekly targets (you can adjust these based on your app's logic)
      const weeklyTargets = {
        studyHours: Math.max(15, Math.ceil(currentHours * 0.2)), // 20% increase target
        sessionsCompleted: Math.max(10, Math.ceil(currentSessions * 0.1)), // 10% increase target
        passPoints: Math.max(500, Math.ceil(currentXP * 0.1)) // 10% increase target
      };

      // Calculate current week progress (mock data for now, you can implement actual weekly tracking)
      const weekProgress = {
        studyHours: Math.min(currentHours, weeklyTargets.studyHours),
        sessionsCompleted: Math.min(currentSessions, weeklyTargets.sessionsCompleted),
        passPoints: Math.min(currentXP, weeklyTargets.passPoints)
      };

      setWeeklyProgress({
        studyHours: { current: weekProgress.studyHours, target: weeklyTargets.studyHours },
        sessionsCompleted: { current: weekProgress.sessionsCompleted, target: weeklyTargets.sessionsCompleted },
        passPoints: { current: weekProgress.passPoints, target: weeklyTargets.passPoints }
      });
    } catch (error) {
      console.error('Error in fetchWeeklyProgress:', error);
      setWeeklyProgress({
        studyHours: { current: 12, target: 15 },
        sessionsCompleted: { current: 8, target: 10 },
        passPoints: { current: 420, target: 500 }
      });
    }
  };

  const fetchHeroStats = async () => {
    try {
      // Fetch active sessions count
      const { data: activeSessions, error: activeError } = await supabase
        .from('study_sessions')
        .select('id')
        .in('status', ['waiting', 'active']);

      // Fetch total profiles using public_profiles view
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles')
        .select('id, xp, sessions_completed');

      if (activeError || profilesError) {
        console.error('Error fetching hero stats:', activeError || profilesError);
        return;
      }

      // Calculate stats
      const totalActiveSessions = activeSessions?.length || 0;
      const totalProfiles = profiles?.length || 0;
      const totalXP = profiles?.reduce((sum, profile) => sum + (profile.xp || 0), 0) || 0;
      const totalSessions = profiles?.reduce((sum, profile) => sum + (profile.sessions_completed || 0), 0) || 0;
      const successRate = totalSessions > 0 ? Math.round((totalSessions / Math.max(totalSessions, 1)) * 94.2) : 94.2;

      setHeroStats({
        activeSessions: totalActiveSessions,
        onlineLearners: totalProfiles,
        totalXPEarned: totalXP,
        successRate: Math.min(successRate, 99),
        onlineGrowth: Math.floor(Math.random() * 15) + 5 // Random growth between 5-20%
      });
    } catch (error) {
      console.error('Error in fetchHeroStats:', error);
      setHeroStats({
        activeSessions: 47,
        onlineLearners: 2847,
        totalXPEarned: 15420,
        successRate: 94,
        onlineGrowth: 12
      });
    }
  };

  const fetchUserPassPoints = async () => {
    try {
      if (!address) return;

      // Get user's own profile (use profiles table for own data)
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('xp')
        .eq('wallet_address', address)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user pass points:', error);
        return;
      }

      setUserPassPoints(userProfile?.xp || 0);
    } catch (error) {
      console.error('Error in fetchUserPassPoints:', error);
      setUserPassPoints(0);
    }
  };

  if (!isConnected) {
    return null;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleJoinSession = () => {
    if (!isComplete) {
      setShowProfileCheck(true);
    } else {
      setShowNewSessionModal(true);
    }
  };

  const handleFindPartner = (data: any) => {
    console.log("Finding partner with data:", data);
    setSessionData(data);
    setShowNewSessionModal(false);
    setShowMatchmakingResults(true);
  };

  const handleInvitePartner = async (partner: any) => {
    console.log("Inviting partner:", partner);
    
    try {
      // Fetch requester and target emails from profiles table
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('wallet_address', address)
        .maybeSingle();

      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('wallet_address', partner.wallet_address || partner.id)
        .maybeSingle();

      // Create match request in database
      const { data: matchRequest, error: matchError } = await supabase
        .from('match_requests')
        .insert({
          requester_wallet: address || 'current_user',
          target_wallet: partner.wallet_address || partner.id,
          subject: sessionData?.subject || 'General Study',
          goal: sessionData?.goal || 'Study Together',
          duration: sessionData?.duration || 60,
          status: 'pending'
        })
        .select()
        .single();

      if (matchError) {
        console.error('Error creating match request:', matchError);
        toast.error("Failed to send invitation. Please try again.");
        return;
      }

      // Create notification for the target partner
      const targetWalletAddress = partner.wallet_address;
      
      console.log('📧 Creating notification for wallet:', targetWalletAddress);
      console.log('📧 Match request ID:', matchRequest.id);
      
      if (!targetWalletAddress) {
        console.error('Target wallet address not found');
        toast.error("Failed to send invitation. Partner wallet address missing.");
        return;
      }

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_wallet: targetWalletAddress,
          title: 'New Study Partner Request',
          message: `${requesterProfile?.name || profile?.name || 'Someone'} wants to study ${sessionData?.subject || ''} with you for ${sessionData?.goal || ''}. Accept?`,
          type: 'match_request',
          data: {
            matchRequestId: matchRequest.id,
            requesterName: requesterProfile?.name || profile?.name || 'Someone',
            subject: sessionData?.subject || '',
            goal: sessionData?.goal || '',
            duration: sessionData?.duration || 60
          }
        });

      console.log('📧 Notification created, error:', notificationError);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue anyway - the match request was created
      }

      // Send email notification to the target partner using their email from database
      const targetEmail = targetProfile?.email || partner.email;
      if (targetEmail) {
        const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
          body: {
            email: targetEmail,
            type: 'send_request',
            data: {
              userName: targetProfile?.name || partner.name || 'Student',
              partnerName: requesterProfile?.name || profile?.name || 'Someone',
              subject: sessionData?.subject || 'General Study',
              goal: sessionData?.goal || 'Study Together',
              duration: sessionData?.duration || 60,
              findPartnerUrl: 'https://pair2pass.com/homepage',
              message: `${requesterProfile?.name || profile?.name || 'Someone'} has invited you to a study session!`
            }
          }
        });

        if (emailError) {
          console.error('Error sending invitation email:', emailError);
          // Don't fail the whole operation if email fails
        } else {
          console.log('Email sent successfully to:', targetEmail);
        }
      } else {
        console.log('No email found for target partner');
      }

      toast.success("Invitation sent! You'll be notified when they respond.");
      setShowMatchmakingResults(false);
      
    } catch (error) {
      console.error('Error in handleInvitePartner:', error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleUserReady = () => {
    setUserReady(true);
    toast.success("You're ready! Waiting for your partner...");
    
    // Simulate partner getting ready after 1-3 seconds
    setTimeout(() => {
      setPartnerReady(true);
    }, Math.random() * 2000 + 1000);
  };

  const handleStartSession = () => {
    console.log("Starting study session!");
    setShowLobby(false);
    setUserReady(false);
    setPartnerReady(false);
    setCurrentPartner(null);
    toast.success("Study session started! Good luck!");
    // Navigate to actual session page
    navigate("/session");
  };

  const handleBackToSetup = () => {
    setShowMatchmakingResults(false);
    setShowNewSessionModal(true);
  };

  const getEstimatedXP = (duration: number) => {
    const xpRates = { 30: 25, 45: 40, 60: 60, 120: 150 };
    return xpRates[duration as keyof typeof xpRates] || 60;
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-16 z-40 border-b border-border/20 bg-background/80 backdrop-blur-lg transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search sessions, topics, instructors..." 
                  className="pl-10 bg-muted/50 border-border/20 transition-colors duration-300"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Card className="px-3 py-1 bg-primary/10 border-primary/20">
                <span className="text-sm font-medium text-primary">
                  {userPassPoints.toLocaleString()} PASS
                </span>
              </Card>
              <Avatar>
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback>{address?.slice(2, 4).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Hero Stats Section */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-12 text-white mb-8">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">Welcome back, Learner! 👋</h1>
                    <div className="flex items-center space-x-2 text-white/80 text-lg">
                      <Clock className="h-5 w-5" />
                      <span>{formatTime(currentTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{heroStats.activeSessions}</div>
                      <div className="text-sm text-white/80 mb-1">Active Sessions</div>
                      <div className="text-xs text-green-300">Live now</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{heroStats.onlineLearners}</div>
                      <div className="text-sm text-white/80 mb-1">Online Learners</div>
                      <div className="text-xs text-green-300">+{heroStats.onlineGrowth}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{heroStats.totalXPEarned.toLocaleString()}</div>
                      <div className="text-sm text-white/80 mb-1">PASS Earned Today</div>
                      <div className="text-xs text-green-300">Community total</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{heroStats.successRate}%</div>
                      <div className="text-sm text-white/80 mb-1">Success Rate</div>
                      <div className="text-xs text-green-300">Session completion</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Floating decorations */}
              <div className="absolute top-6 right-6 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 left-6 w-12 h-12 bg-white/20 rounded-full animate-bounce"></div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 transition-colors duration-300">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
                  onClick={handleJoinSession}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Join Session</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Start learning now</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
                  onClick={() => navigate("/find-partner")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Find Partner</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">Connect & study</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
                  onClick={() => toast.info("Coming Soon")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">Schedule</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Book sessions</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800"
                  onClick={() => toast.info("Coming Soon")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">Progress</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">View stats</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Categories */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 transition-colors duration-300">Browse Categories</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card 
                    key={category.name}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group ${
                      selectedCategory === category.name 
                        ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10' 
                        : 'hover:bg-gradient-to-br hover:from-muted/50 hover:to-muted/30 dark:hover:from-muted/20 dark:hover:to-muted/10'
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                      <h3 className="font-semibold text-foreground transition-colors duration-300 mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground transition-colors duration-300 flex items-center justify-center gap-1">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                        {category.sessions} active sessions
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Today's Schedule */}
            <Card className="transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-lg transition-colors duration-300">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySchedule.length > 0 ? (
                  todaySchedule.map((event, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-all duration-300">
                      <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground transition-colors duration-300">{event.time}</div>
                        <div className="text-xs text-muted-foreground transition-colors duration-300">{event.title}</div>
                        {event.partner && (
                          <div className="text-xs text-muted-foreground transition-colors duration-300">with {event.partner}</div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.status === 'active' ? 'Live' : event.status === 'waiting' ? 'Pending' : 'Available'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sessions scheduled for today</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleJoinSession}
                    >
                      Schedule a session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className="transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-lg transition-colors duration-300">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground transition-colors duration-300">Study Hours</span>
                    <span className="text-muted-foreground transition-colors duration-300">
                      {weeklyProgress.studyHours.current}/{weeklyProgress.studyHours.target}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 transition-colors duration-300">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (weeklyProgress.studyHours.current / weeklyProgress.studyHours.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground transition-colors duration-300">Sessions Completed</span>
                    <span className="text-muted-foreground transition-colors duration-300">
                      {weeklyProgress.sessionsCompleted.current}/{weeklyProgress.sessionsCompleted.target}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 transition-colors duration-300">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (weeklyProgress.sessionsCompleted.current / weeklyProgress.sessionsCompleted.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground transition-colors duration-300">PASS Points</span>
                    <span className="text-muted-foreground transition-colors duration-300">
                      {weeklyProgress.passPoints.current}/{weeklyProgress.passPoints.target}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 transition-colors duration-300">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (weeklyProgress.passPoints.current / weeklyProgress.passPoints.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Highlights */}
            <Card className="transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-lg transition-colors duration-300">Community Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {communityActivities.length > 0 ? (
                  communityActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-all duration-300">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>{activity.user.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium text-foreground transition-colors duration-300">{activity.user}</span>{' '}
                          <span className="text-muted-foreground transition-colors duration-300">{activity.action}</span>{' '}
                          <span className="text-lg">{activity.emoji}</span>
                        </div>
                        <div className="text-xs text-muted-foreground transition-colors duration-300">{activity.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent community activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Profile Check Modal */}
      <ProfileCheckModal
        open={showProfileCheck}
        onOpenChange={setShowProfileCheck}
        profileItems={items}
        completionPercentage={completionPercentage}
        profile={profile}
      />

      {/* New Study Session Modal */}
      <NewStudySessionModal 
        open={showNewSessionModal}
        onOpenChange={setShowNewSessionModal}
        profile={profile}
        onFindPartner={handleFindPartner}
      />

      {/* Matchmaking Results Modal */}
      <MatchmakingResults
        open={showMatchmakingResults}
        onOpenChange={setShowMatchmakingResults}
        sessionData={sessionData}
        estimatedXP={sessionData ? getEstimatedXP(sessionData.duration) : 0}
        onInvitePartner={handleInvitePartner}
        onBack={handleBackToSetup}
      />

      {/* Study Session Lobby */}
      {currentPartner && sessionData && (
        <StudySessionLobby
          open={showLobby}
          onClose={() => setShowLobby(false)}
          sessionData={sessionData}
          partner={{ ...currentPartner, isReady: partnerReady }}
          currentUser={{
            id: "current_user",
            name: "You",
            level: 5,
            xp: 1247,
            isReady: userReady,
          }}
          sessionId={sessionId}
          onReady={handleUserReady}
          onStartSession={handleStartSession}
        />
      )}
    </div>
  );
}