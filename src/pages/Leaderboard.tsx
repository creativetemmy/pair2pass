import React from "react";
import { Trophy, Medal, Star, TrendingUp, Users, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const achievements = [
  { name: "Top Performer", icon: Trophy, color: "text-yellow-500" },
  { name: "Study Streak", icon: Zap, color: "text-blue-500" },
  { name: "Quick Learner", icon: TrendingUp, color: "text-green-500" },
  { name: "Team Player", icon: Users, color: "text-purple-500" },
  { name: "Consistent", icon: Medal, color: "text-orange-500" },
  { name: "Helper", icon: Star, color: "text-pink-500" },
  { name: "Fast Track", icon: TrendingUp, color: "text-indigo-500" },
  { name: "Rising Star", icon: Star, color: "text-cyan-500" }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Medal className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  }
};

const Leaderboard = () => {
  const { leaderboard, weeklyStats, popularSubjects, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Top performers in the Pair2Pass community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Learners This Month
                </CardTitle>
                <CardDescription>
                  Rankings based on PASS Points earned, sessions completed, and study hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found. Be the first to earn PASS Points!</p>
                  </div>
                ) : (
                  leaderboard.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                        user.rank <= 3 ? 'bg-muted/30' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 flex justify-center">
                        {getRankIcon(user.rank)}
                      </div>

                      {/* Avatar and Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name || "User"} />
                          <AvatarFallback>
                            {user.name 
                              ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : user.wallet_address.slice(-2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{user.name || `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`}</h3>
                            <Badge variant="secondary">Level {user.level}</Badge>
                            <span className="text-sm text-green-600 font-medium">{user.trend}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {user.achievements.map((achievement) => {
                              const achievementData = achievements.find(a => a.name === achievement);
                              if (!achievementData) return null;
                              const IconComponent = achievementData.icon;
                              return (
                                <Badge key={achievement} variant="outline" className="text-xs">
                                  <IconComponent className={`h-3 w-3 mr-1 ${achievementData.color}`} />
                                  {achievement}
                                </Badge>
                              );
                            })}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <span>{user.sessions_completed} sessions</span>
                            <span>{user.hours_studied}h studied</span>
                            <span className="text-primary font-semibold">{user.xp.toLocaleString()} PASS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Weekly Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week's Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Total Sessions</span>
                    <span className="text-sm font-bold">{weeklyStats.totalSessions.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min((weeklyStats.totalSessions / 100) * 10, 100)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Active Learners</span>
                    <span className="text-sm font-bold">{weeklyStats.activeLearners.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min((weeklyStats.activeLearners / 50) * 10, 100)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">PASS Distributed</span>
                    <span className="text-sm font-bold">{weeklyStats.passDistributed.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min((weeklyStats.passDistributed / 1000) * 10, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Achievement Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievement Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.slice(0, 6).map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={achievement.name} className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${achievement.color}`} />
                      <span className="text-sm">{achievement.name}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Study Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularSubjects.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No study sessions yet
                  </div>
                ) : (
                  popularSubjects.map((subject) => (
                    <div key={subject.subject} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{subject.subject}</span>
                      <Badge variant="secondary">{subject.sessionCount} sessions</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;