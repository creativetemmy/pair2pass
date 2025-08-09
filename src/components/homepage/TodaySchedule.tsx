import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const schedule = [
  {
    time: "10:00 AM",
    title: "React Advanced Patterns",
    status: "upcoming", // upcoming, joined, available
  },
  {
    time: "2:00 PM", 
    title: "Calculus Study Group",
    status: "joined",
  },
  {
    time: "4:30 PM",
    title: "Chemistry Lab Session",
    status: "available",
  },
];

const statusConfig = {
  upcoming: { color: "bg-blue-500", label: "Upcoming" },
  joined: { color: "bg-green-500", label: "Joined" },
  available: { color: "bg-gray-400 dark:bg-gray-600", label: "Available" },
};

export function TodaySchedule() {
  return (
    <Card className="border-border/20 hover:border-border/40 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg text-foreground transition-colors duration-300">
          <Calendar className="h-5 w-5 text-primary" />
          <span>Today's Schedule</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.map((event, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${statusConfig[event.status as keyof typeof statusConfig].color} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground transition-colors duration-300">
                {event.time}
              </div>
              <div className="text-sm text-muted-foreground truncate transition-colors duration-300">
                {event.title}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}