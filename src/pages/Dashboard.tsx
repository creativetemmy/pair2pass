import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PassPointsBadge } from "@/components/gamification/PassPointsBadge";
import { Badge } from "@/components/gamification/Badge";
import { ActiveSessionCard } from "@/components/ActiveSessionCard";
import { CancelSessionModal } from "@/components/CancelSessionModal";
import { useReadContract } from "wagmi";
import { useActiveSession } from "@/hooks/useActiveSession";
import { useUserStats } from "@/hooks/useUserStats";
import { useUpcomingSessions } from "@/hooks/useUpcomingSessions";
import { useRecentSessions } from "@/hooks/useRecentSessions";
import { Calendar, Clock, Users, BookOpen, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { pair2PassContractConfig } from "@/contracts/pair2passsbt";
import { NftBadge } from "@/components/gamification/NftBadge";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const { activeSession, loading: sessionLoading } = useActiveSession();
  const { stats, loading: statsLoading } = useUserStats();
  const { upcomingSessions, loading: upcomingLoading, refreshUpcomingSessions } = useUpcomingSessions();
  const { recentSessions, loading: recentLoading } = useRecentSessions();
  
  // NFT badges are optional for email-first users
  const badges = [];

  const handleCancelClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCancelModalOpen(true);
  };

  const handleCancelComplete = () => {
    // Manually refresh the upcoming sessions to ensure immediate update
    refreshUpcomingSessions();
    setCancelModalOpen(false);
    setSelectedSessionId('');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground transition-colors duration-300">Dashboard</h1>
          <p className="text-muted-foreground transition-colors duration-300">Track your study progress and achievements</p>
        </div>
        <PassPointsBadge passPoints={Math.floor(stats.hoursStudied * 20)} level={Math.floor(stats.hoursStudied / 10) + 1} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transition-colors duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center transition-colors duration-300">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground transition-colors duration-300">
                  {statsLoading ? '-' : stats.studyPartners}
                </p>
                <p className="text-sm text-muted-foreground transition-colors duration-300">Study Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? '-' : stats.hoursStudied}
                </p>
                <p className="text-sm text-muted-foreground">Hours Studied</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? '-' : stats.activeCourses}
                </p>
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? '-' : stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active and Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Session */}
          {!sessionLoading && activeSession && (
            <ActiveSessionCard session={activeSession} />
          )}

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading sessions...</p>
                </div>
              ) : upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{session.subject}</h3>
                        <p className="text-sm text-muted-foreground">with {session.partner_name}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {session.goal}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <p>{format(new Date(session.created_at), "MMM dd, yyyy 'at' h:mm a")}</p>
                        <p>Duration: {Math.floor(session.duration / 60)} hours</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCancelClick(session.id)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/session-checkin/${session.id}`)}
                        >
                          Join Session
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming sessions</p>
                  <Button variant="default" className="mt-4" onClick={() => navigate('/find-partner')}>
                    Find Study Partner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Study Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading sessions...</p>
                </div>
              ) : recentSessions.length > 0 ? (
                recentSessions.map((session) => (
                  <div key={session.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>
                      <h4 className="font-medium text-foreground">{session.subject}</h4>
                      <p className="text-sm text-muted-foreground">with {session.partner_name}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(session.created_at), "MMM dd, yyyy")}</p>
                    </div>
                    <div className="text-right">
                      {session.rating && (
                        <>
                          <div className="flex items-center space-x-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${i < session.rating! ? 'text-yellow-500' : 'text-muted-foreground'}`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <p className="text-sm font-medium text-success">+{session.xp_earned} PASS</p>
                        </>
                      )}
                      {!session.rating && (
                        <p className="text-xs text-muted-foreground">No rating yet</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent sessions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Badges & Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {badges && badges.length > 0 ? (
                            <div  className="grid grid-cols-2 gap-4">
                              {badges.map((badge, index) => (
                                <NftBadge key={index} tokenId={Number(badge)} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No achievements found.</p>
                          )}
            <Button 
              variant="outline" 
              className="w-full mt-6"
              onClick={() => {
                // Navigate to profile page where all badges are displayed
                window.location.href = '/profile';
              }}
            >
              View All Badges
            </Button>
          </CardContent>
        </Card>
      </div>

      <CancelSessionModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        sessionId={selectedSessionId}
        onCancel={handleCancelComplete}
      />
    </div>
  );
}