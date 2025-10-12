import { cn } from "@/lib/utils";
import { getUserTier, getPassPointsForNextTier } from "@/lib/passPointsSystem";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TierBadgeProps {
  passPoints: number;
  className?: string;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TierBadge({ passPoints, className, showProgress = false, size = "md" }: TierBadgeProps) {
  const tier = getUserTier(passPoints);
  const { nextTier, pointsNeeded } = getPassPointsForNextTier(passPoints);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex flex-col gap-2", className)}>
            <Badge 
              variant="outline" 
              className={cn(
                "font-semibold border-2",
                sizeClasses[size],
                tier.color,
                "bg-gradient-to-r from-background/80 to-background/60"
              )}
            >
              <span className={iconSizes[size]}>{tier.icon}</span>
              <span className="ml-1">{tier.name}</span>
            </Badge>
            
            {showProgress && nextTier && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress to {nextTier.name}</span>
                  <span>{pointsNeeded} PASS needed</span>
                </div>
                <Progress 
                  value={((passPoints - tier.minPoints) / (tier.maxPoints - tier.minPoints)) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <span className="text-lg">{tier.icon}</span>
              <span>{tier.name} Tier</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tier.minPoints.toLocaleString()} - {tier.maxPoints === Infinity ? '∞' : tier.maxPoints.toLocaleString()} PASS
            </p>
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold mb-1">Benefits:</p>
              <ul className="text-xs space-y-1">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            {nextTier && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs">
                  <span className="font-semibold">Next tier:</span> {nextTier.icon} {nextTier.name} ({pointsNeeded} PASS needed)
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
