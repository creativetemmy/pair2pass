import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XPBadge } from "@/components/gamification/XPBadge";
import { Badge } from "@/components/gamification/Badge";
import { Calendar, Clock, Users, BookOpen, TrendingUp } from "lucide-react";

const upcomingSessions = [
  {
    id: 1,
    partner: "Sarah Chen",
    course: "Computer Science 101",
    time: "Today, 3:00 PM",
    duration: "2 hours",
    type: "Exam Prep",
  },
  {
    id: 2,
    partner: "Michael Johnson",
    course: "Calculus II",
    time: "Tomorrow, 10:00 AM",
    duration: "1.5 hours",
    type: "Assignment Help",
  },
];

const recentSessions = [
  {
    id: 1,
    partner: "Emma Davis",
    course: "Physics Lab",
    date: "Dec 20, 2024",
    rating: 5,
    xpEarned: 150,
  },
  {
    id: 2,
    partner: "Alex Rodriguez",
    course: "Chemistry",
    date: "Dec 18, 2024",
    rating: 4,
    xpEarned: 120,
  },
];

const badges = [
  { type: "studious" as const, title: "Study Warrior", description: "10+ study sessions", earned: true },
  { type: "reliable" as const, title: "Reliable Partner", description: "95% attendance rate", earned: true },
  { type: "expert" as const, title: "Subject Expert", description: "Top 10% in course", earned: false },
  { type: "streak" as const, title: "Study Streak", description: "7 days in a row", earned: true },
];

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Track your study progress and achievements</p>
        </div>
        <XPBadge xp={2450} level={12} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">Study Partners</p>
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
                <p className="text-2xl font-bold text-foreground">127</p>
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
                <p className="text-2xl font-bold text-foreground">8</p>
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
                <p className="text-2xl font-bold text-foreground">4.8</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{session.course}</h3>
                      <p className="text-sm text-muted-foreground">with {session.partner}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {session.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <p>{session.time}</p>
                      <p>Duration: {session.duration}</p>
                    </div>
                    <Button size="sm" variant="outline">Join Session</Button>
                  </div>
                </div>
              ))}
              
              {upcomingSessions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming sessions</p>
                  <Button variant="default" className="mt-4">Find Study Partner</Button>
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
              {recentSessions.map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <h4 className="font-medium text-foreground">{session.course}</h4>
                    <p className="text-sm text-muted-foreground">with {session.partner}</p>
                    <p className="text-xs text-muted-foreground">{session.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${i < session.rating ? 'text-yellow-500' : 'text-muted-foreground'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-success">+{session.xpEarned} XP</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Badges & Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  type={badge.type}
                  title={badge.title}
                  description={badge.description}
                  earned={badge.earned}
                />
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">
              View All Badges
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}