import { Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserTier } from "@/lib/passPointsSystem";

interface PassPointsBadgeProps {
  passPoints: number;
  level: number;
  className?: string;
  showTier?: boolean;
}

export function PassPointsBadge({ passPoints, level, className, showTier = true }: PassPointsBadgeProps) {
  const tier = getUserTier(passPoints);
  
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center shadow-primary animate-glow">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-badge-gold border-2 border-badge-gold-foreground/30 text-badge-gold-foreground text-xs font-bold flex items-center justify-center shadow-gold">
          {level}
        </div>
      </div>
      <div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-badge-gold-foreground fill-badge-gold" />
          <span className="font-semibold text-foreground">{passPoints.toLocaleString()} PASS</span>
        </div>
        {showTier ? (
          <p className="text-sm">
            <span className={cn("font-medium", tier.color)}>{tier.icon} {tier.name}</span>
            <span className="text-muted-foreground ml-1">• Level {level}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Level {level}</p>
        )}
      </div>
    </div>
  );
}
