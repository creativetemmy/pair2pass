import { Award, Shield, Crown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";


const badgeIcons = {
  studious: Award,
  reliable: Shield,
  expert: Crown,
  streak: Flame,
};

const badgeColors = {
  studious: "bg-blue-500",
  reliable: "bg-green-500",
  expert: "bg-purple-500",
  streak: "bg-orange-500",
};

interface BadgeProps {
  type: keyof typeof badgeIcons;
  title: string;
  description: string;
  earned?: boolean;
  className?: string;
}

export function Badge({ type, title, description, earned = false, className }: BadgeProps) {
  const Icon = badgeIcons[type];
  const colorClass = badgeColors[type];

  return (
    <div className={cn("group cursor-pointer", className)}>
      <div className={cn(
        "relative rounded-xl p-4 transition-all duration-300 group-hover:scale-105",
        earned ? "bg-badge-gold border-2 border-badge-gold-foreground/20 shadow-gold" : "bg-muted/50 opacity-60"
      )}>
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300",
          earned ? colorClass : "bg-muted",
          earned && "shadow-lg animate-float shadow-gold"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            earned ? "text-white" : "text-muted-foreground"
          )} />
        </div>
        <h3 className={cn(
          "font-semibold text-center mb-1",
          earned ? "text-badge-gold-foreground" : "text-muted-foreground"
        )}>
          {title}
        </h3>
        <p className="text-xs text-muted-foreground text-center">
          {description}
        </p>
        {earned && (
          <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-success animate-pulse shadow-gold" />
        )}
      </div>
    </div>
  );
}