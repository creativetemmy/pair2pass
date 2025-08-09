import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HeroStatsProps {
  currentTime: Date;
}

const stats = [
  { label: "Active Sessions", value: "47", change: "+12%", trend: "up" },
  { label: "Online Learners", value: "2,847", change: "+8%", trend: "up" },
  { label: "PASS Earned Today", value: "15,420", change: "+23%", trend: "up" },
  { label: "Success Rate", value: "94.2%", change: "+2.1%", trend: "up" },
];

export function HeroStats({ currentTime }: HeroStatsProps) {
  const timeString = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <section className="relative gradient-hero rounded-2xl p-8 text-white overflow-hidden">
      {/* Floating Background Decorations */}
      <div className="absolute top-4 right-4 h-32 w-32 bg-white/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-4 left-8 h-24 w-24 bg-white/5 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 h-16 w-16 bg-white/5 rounded-full blur-md animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, Learner! 👋
          </h1>
          <p className="text-white/80 text-lg">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {timeString}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-white/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm font-medium">{stat.label}</span>
                  <div className="flex items-center space-x-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}