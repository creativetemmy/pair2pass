import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Users, Clock, Calendar } from "lucide-react";

const sessions = [
  {
    id: 1,
    emoji: "⚛️",
    title: "React Hooks Deep Dive",
    instructor: "Sarah Chen",
    isLive: true,
    rating: 4.9,
    participants: 24,
    duration: "2h 30m",
    startTime: "10:00 AM",
    tags: ["React", "Hooks", "JavaScript"],
    price: 150,
    status: "active"
  },
  {
    id: 2,
    emoji: "🧮",
    title: "Linear Algebra Fundamentals",
    instructor: "Dr. Michael Kumar",
    isLive: false,
    rating: 4.8,
    participants: 18,
    duration: "1h 45m",
    startTime: "2:00 PM",
    tags: ["Mathematics", "Algebra", "Theory"],
    price: 120,
    status: "upcoming"
  },
  {
    id: 3,
    emoji: "🧬",
    title: "Organic Chemistry Lab",
    instructor: "Prof. Lisa Wang",
    isLive: true,
    rating: 4.7,
    participants: 12,
    duration: "3h 00m",
    startTime: "3:30 PM",
    tags: ["Chemistry", "Lab", "Experiments"],
    price: 200,
    status: "active"
  },
];

export function FeaturedSessions() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6 transition-colors duration-300">
        Featured Sessions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="hover-lift border-border/20 hover:border-border/40 transition-all duration-300">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{session.emoji}</div>
                {session.isLive && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 rounded-full">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-red-500">LIVE</span>
                  </div>
                )}
              </div>

              {/* Title and Instructor */}
              <h3 className="text-lg font-semibold text-foreground mb-1 transition-colors duration-300">
                {session.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 transition-colors duration-300">
                by {session.instructor}
              </p>

              {/* Rating and Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">{session.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{session.participants}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{session.duration}</span>
                  </div>
                </div>
              </div>

              {/* Start Time */}
              <div className="flex items-center space-x-1 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Starts at {session.startTime}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {session.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-foreground transition-colors duration-300">
                    {session.price} PASS
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant={session.isLive ? "default" : "secondary"}
                  className="transition-all duration-300"
                >
                  {session.isLive ? "Join Now" : "Register"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}