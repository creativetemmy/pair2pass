import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Clock, Play, Users, BookOpen, Trophy, Star, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileCheckModal } from "@/components/ProfileCheckModal";
import { NewStudySessionModal } from "@/components/NewStudySessionModal";
import { MatchmakingResults } from "@/components/MatchmakingResults";
import { useProfile } from "@/hooks/useProfile";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

// Mock data
const mockCategories = [
  { name: "Programming", icon: "💻", sessions: 342, color: "bg-blue-500" },
  { name: "Mathematics", icon: "📊", sessions: 198, color: "bg-green-500" },
  { name: "Sciences", icon: "🔬", sessions: 156, color: "bg-purple-500" },
  { name: "Languages", icon: "🌍", sessions: 89, color: "bg-orange-500" },
  { name: "Business", icon: "💼", sessions: 134, color: "bg-red-500" },
  { name: "Design", icon: "🎨", sessions: 78, color: "bg-pink-500" },
];

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
  const { profile } = useProfile(address);
  const { items, completionPercentage, isComplete } = useProfileCompletion(profile);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileCheck, setShowProfileCheck] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showMatchmakingResults, setShowMatchmakingResults] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, navigate]);

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

  const handleInvitePartner = (partner: any) => {
    console.log("Inviting partner:", partner);
    // Here you would typically send invitation and navigate to session
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
              </Button>
              <Card className="px-3 py-1 bg-primary/10 border-primary/20">
                <span className="text-sm font-medium text-primary">1,247 PASS</span>
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
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome back, Learner! 👋</h1>
                    <div className="flex items-center space-x-2 text-white/80">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(currentTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">47</div>
                      <div className="text-sm text-white/80">Active Sessions</div>
                      <div className="text-xs text-green-300">+12%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">2,847</div>
                      <div className="text-sm text-white/80">Online Learners</div>
                      <div className="text-xs text-green-300">+8%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">15,420</div>
                      <div className="text-sm text-white/80">PASS Earned Today</div>
                      <div className="text-xs text-green-300">+23%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">94.2%</div>
                      <div className="text-sm text-white/80">Success Rate</div>
                      <div className="text-xs text-green-300">+2.1%</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Floating decorations */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/20 rounded-full animate-bounce"></div>
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
                
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Find Partner</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">Connect & study</p>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">Schedule</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Book sessions</p>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
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
                {mockCategories.map((category) => (
                  <Card 
                    key={category.name}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                      selectedCategory === category.name 
                        ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' 
                        : 'hover:bg-muted/50 dark:hover:bg-muted/20'
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold text-foreground transition-colors duration-300">{category.name}</h3>
                      <p className="text-sm text-muted-foreground transition-colors duration-300">{category.sessions} sessions</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Featured Sessions */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 transition-colors duration-300">Featured Sessions</h2>
              <div className="grid lg:grid-cols-3 gap-6">
                {mockSessions.map((session) => (
                  <Card key={session.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{session.emoji}</span>
                          {session.isLive && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-red-500 font-medium">LIVE</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">{session.price} PASS</Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                        {session.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground transition-colors duration-300">by {session.instructor}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3 transition-colors duration-300">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{session.rating}</span>
                        </div>
                        <span>{session.participants} learners</span>
                        <span>{session.duration}</span>
                        <span>{session.startTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {session.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full transition-colors duration-300">
                        {session.isLive ? "Join Now" : "Register"}
                      </Button>
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
                {mockSchedule.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-all duration-300">
                    <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground transition-colors duration-300">{event.time}</div>
                      <div className="text-xs text-muted-foreground transition-colors duration-300">{event.title}</div>
                    </div>
                  </div>
                ))}
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
                    <span className="text-muted-foreground transition-colors duration-300">12/15</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 transition-colors duration-300">
                    <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground transition-colors duration-300">Sessions Completed</span>
                    <span className="text-muted-foreground transition-colors duration-300">8/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 transition-colors duration-300">
                    <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground transition-colors duration-300">PASS Points</span>
                    <span className="text-muted-foreground transition-colors duration-300">420/500</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 transition-colors duration-300">
                    <div className="bg-purple-500 h-2 rounded-full w-4/5"></div>
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
                {mockActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-all duration-300">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium text-foreground transition-colors duration-300">{activity.user}</span>{' '}
                        <span className="text-muted-foreground transition-colors duration-300">{activity.action}</span>{' '}
                        <span className="text-xl">{activity.emoji}</span>
                      </div>
                      <div className="text-xs text-muted-foreground transition-colors duration-300">{activity.time}</div>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}