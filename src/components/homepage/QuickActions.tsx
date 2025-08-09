import { Card, CardContent } from "@/components/ui/card";
import { Play, Users, BookOpen, Trophy } from "lucide-react";

const actions = [
  {
    icon: Play,
    title: "Join Session",
    description: "Jump into live study sessions",
    gradient: "from-blue-500 to-blue-600",
    hoverGradient: "hover:from-blue-600 hover:to-blue-700",
  },
  {
    icon: Users,
    title: "Create Group", 
    description: "Start your own study group",
    gradient: "from-green-500 to-green-600",
    hoverGradient: "hover:from-green-600 hover:to-green-700",
  },
  {
    icon: BookOpen,
    title: "Study Plans",
    description: "Personalized learning paths",
    gradient: "from-purple-500 to-purple-600", 
    hoverGradient: "hover:from-purple-600 hover:to-purple-700",
  },
  {
    icon: Trophy,
    title: "Challenges",
    description: "Compete and earn rewards",
    gradient: "from-orange-500 to-orange-600",
    hoverGradient: "hover:from-orange-600 hover:to-orange-700",
  },
];

export function QuickActions() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6 transition-colors duration-300">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <Card 
            key={index} 
            className="group cursor-pointer hover-lift border-border/20 hover:border-border/40 transition-all duration-300"
          >
            <CardContent className="p-6 text-center">
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${action.gradient} ${action.hoverGradient} mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                <action.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors duration-300">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground transition-colors duration-300">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}