import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";

const activities = [
  {
    id: 1,
    user: "Alex Kim",
    activity: "earned Master Coder badge",
    emoji: "🏆",
    time: "2 hours ago",
    avatar: "AK",
  },
  {
    id: 2,
    user: "Emma Davis", 
    activity: "shared a breakthrough insight",
    emoji: "💡",
    time: "4 hours ago", 
    avatar: "ED",
  },
  {
    id: 3,
    user: "Marcus Chen",
    activity: "completed weekly challenge",
    emoji: "🎯", 
    time: "6 hours ago",
    avatar: "MC",
  },
];

export function CommunityHighlights() {
  return (
    <Card className="border-border/20 hover:border-border/40 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg text-foreground transition-colors duration-300">
          <Users className="h-5 w-5 text-primary" />
          <span>Community Highlights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {activity.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground transition-colors duration-300">
                  {activity.user}
                </span>
                <span className="text-lg">{activity.emoji}</span>
              </div>
              <div className="text-sm text-muted-foreground transition-colors duration-300">
                {activity.activity}
              </div>
              <div className="text-xs text-muted-foreground transition-colors duration-300">
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}