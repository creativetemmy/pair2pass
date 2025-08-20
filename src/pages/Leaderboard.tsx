import React from "react";
import { Trophy, Medal, Star, TrendingUp, Users, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Mock data for leaderboard
const mockLeaderboard = [
  {
    id: 1,
    rank: 1,
    name: "Alex Chen",
    avatar: "/placeholder.svg",
    points: 15420,
    sessionsCompleted: 87,
    studyHours: 142,
    achievements: ["Top Performer", "Study Streak"],
    trend: "+23%",
    level: 12
  },
  {
    id: 2,
    rank: 2,
    name: "Sarah Johnson",
    avatar: "/placeholder.svg",
    points: 14850,
    sessionsCompleted: 82,
    studyHours: 138,
    achievements: ["Quick Learner", "Team Player"],
    trend: "+18%",
    level: 11
  },
  {
    id: 3,
    rank: 3,
    name: "Mike Rodriguez",
    avatar: "/placeholder.svg",
    points: 14200,
    sessionsCompleted: 79,
    studyHours: 135,
    achievements: ["Consistent", "Helper"],
    trend: "+15%",
    level: 11
  },
  {
    id: 4,
    rank: 4,
    name: "Emily Davis",
    avatar: "/placeholder.svg",
    points: 13800,
    sessionsCompleted: 75,
    studyHours: 128,
    achievements: ["Fast Track"],
    trend: "+12%",
    level: 10
  },
  {
    id: 5,
    rank: 5,
    name: "David Kim",
    avatar: "/placeholder.svg",
    points: 13200,
    sessionsCompleted: 71,
    studyHours: 122,
    achievements: ["Rising Star"],
    trend: "+10%",
    level: 10
  }
];

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
                {mockLeaderboard.map((user) => (
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
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{user.name}</h3>
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
                          <span>{user.sessionsCompleted} sessions</span>
                          <span>{user.studyHours}h studied</span>
                          <span className="text-primary font-semibold">{user.points.toLocaleString()} PASS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                    <span className="text-sm font-bold">1,247</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Active Learners</span>
                    <span className="text-sm font-bold">2,847</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">PASS Distributed</span>
                    <span className="text-sm font-bold">124,850</span>
                  </div>
                  <Progress value={76} className="h-2" />
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
                <div className="flex justify-between items-center">
                  <span className="text-sm">Programming</span>
                  <Badge variant="secondary">342 sessions</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mathematics</span>
                  <Badge variant="secondary">198 sessions</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sciences</span>
                  <Badge variant="secondary">156 sessions</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Languages</span>
                  <Badge variant="secondary">89 sessions</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;