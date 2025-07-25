import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, CheckCircle, Star, MessageSquare, Timer } from "lucide-react";

const sessionData = {
  id: "session_123",
  course: "Computer Science 101",
  topic: "Binary Trees & Graph Algorithms",
  partner: {
    name: "Sarah Chen",
    avatar: "SC",
  },
  date: "December 25, 2024",
  time: "2:00 PM - 4:00 PM",
  location: "Library Study Room B",
  status: "in-progress",
  startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  plannedDuration: 120, // 2 hours in minutes
};

export default function SessionCheckIn() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const getElapsedTime = () => {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - sessionData.startTime.getTime()) / 60000);
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getProgressPercentage = () => {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - sessionData.startTime.getTime()) / 60000);
    return Math.min((elapsed / sessionData.plannedDuration) * 100, 100);
  };

  const handleCompleteSession = async () => {
    if (rating === 0) {
      alert("Please rate your study partner before completing the session");
      return;
    }
    
    setIsCompleting(true);
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCompleting(false);
    setSessionCompleted(true);
  };

  if (sessionCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="h-20 w-20 rounded-full bg-success flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Session Completed!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Great job! You've earned <span className="font-semibold text-success">+200 XP</span> for completing this study session.
            </p>
            <div className="space-y-4">
              <div className="flex justify-center space-x-8 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-foreground">Duration</p>
                  <p className="text-muted-foreground">{getElapsedTime()}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Partner Rating</p>
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="default" className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Active Study Session</h1>
        <p className="text-muted-foreground">Track your progress and complete the session when done</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Session Timer */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span>Session Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Time Elapsed: {getElapsedTime()}</span>
                <span className="text-sm text-muted-foreground">
                  {sessionData.plannedDuration / 60}h planned
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="h-3 rounded-full gradient-primary transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{sessionData.course}</p>
                    <p className="text-sm text-muted-foreground">{sessionData.topic}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{sessionData.time}</p>
                    <p className="text-sm text-muted-foreground">{sessionData.date}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{sessionData.location}</p>
                    <p className="text-sm text-muted-foreground">Meeting Location</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full gradient-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
                    {sessionData.partner.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sessionData.partner.name}</p>
                    <p className="text-sm text-muted-foreground">Study Partner</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                In Progress
              </Badge>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat with Partner
              </Button>
              <Button variant="outline" size="sm">
                Take Notes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Completion Form */}
        <Card>
          <CardHeader>
            <CardTitle>Session Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rate Partner */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Rate Study Partner
              </Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors duration-200"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-muted-foreground hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Click to rate (1-5 stars)
              </p>
            </div>

            {/* Feedback */}
            <div>
              <Label htmlFor="feedback" className="text-sm font-medium text-foreground">
                Session Feedback (Optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="How was your study session? Any highlights or areas for improvement?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            {/* Complete Button */}
            <Button
              variant="success"
              className="w-full"
              onClick={handleCompleteSession}
              disabled={isCompleting || rating === 0}
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Session
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Completing the session will record it on-chain and award XP to both participants
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}