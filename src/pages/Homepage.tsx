import { useState, useEffect } from "react";
import { Search, Bell, User, Play, Users, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { HeroStats } from "@/components/homepage/HeroStats";
import { QuickActions } from "@/components/homepage/QuickActions";
import { Categories } from "@/components/homepage/Categories";
import { FeaturedSessions } from "@/components/homepage/FeaturedSessions";
import { TodaySchedule } from "@/components/homepage/TodaySchedule";
import { WeeklyProgress } from "@/components/homepage/WeeklyProgress";
import { CommunityHighlights } from "@/components/homepage/CommunityHighlights";

export default function Homepage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/20 glass-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg gradient-mesh flex items-center justify-center shadow-glow">
                  <span className="text-primary-foreground font-bold text-lg">P2</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Pair2Pass
                </span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" className="text-primary font-medium">Home</Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Browse</Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">My Sessions</Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Leaderboard</Button>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sessions, topics, or learners..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
              </Button>
              
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-lg glass-card">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">1,247 PASS</span>
              </div>
              
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            {/* Hero Stats Section */}
            <HeroStats currentTime={currentTime} />
            
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Categories */}
            <Categories />
            
            {/* Featured Sessions */}
            <FeaturedSessions />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <TodaySchedule />
            <WeeklyProgress />
            <CommunityHighlights />
          </div>
        </div>
      </main>
    </div>
  );
}