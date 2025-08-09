import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";

const progressData = [
  {
    label: "Study Hours",
    current: 12,
    target: 15,
    color: "bg-blue-500",
    percentage: 80,
  },
  {
    label: "Sessions Completed", 
    current: 8,
    target: 10,
    color: "bg-green-500",
    percentage: 80,
  },
  {
    label: "PASS Tokens",
    current: 420,
    target: 500,
    color: "bg-purple-500", 
    percentage: 84,
  },
];

export function WeeklyProgress() {
  return (
    <Card className="border-border/20 hover:border-border/40 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg text-foreground transition-colors duration-300">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>Weekly Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progressData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground transition-colors duration-300">
                {item.label}
              </span>
              <span className="text-sm text-muted-foreground transition-colors duration-300">
                {item.current}/{item.target}
              </span>
            </div>
            <Progress 
              value={item.percentage} 
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}