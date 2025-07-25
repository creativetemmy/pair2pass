import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, BookOpen, Shield, Zap, CheckCircle, X } from "lucide-react";

const matchDetails = {
  partner: {
    name: "Sarah Chen",
    avatar: "SC",
    level: 15,
    xp: 3200,
    rating: 4.9,
    completedSessions: 67,
    reliability: 98,
    skills: ["Programming", "Algorithms", "Data Structures"],
  },
  session: {
    course: "Computer Science 101",
    topic: "Binary Trees & Graph Algorithms",
    date: "December 25, 2024",
    time: "2:00 PM - 4:00 PM",
    duration: "2 hours",
    location: "Library Study Room B",
    type: "Exam Preparation",
    xpReward: 200,
  },
};

export default function MatchConfirmation() {
  const [isLocking, setIsLocking] = useState(false);

  const handleLockSession = async () => {
    setIsLocking(true);
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLocking(false);
    // Navigate to dashboard or session page
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Perfect Match Found!</h1>
        <p className="text-muted-foreground">Review the session details and lock in your study partnership</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Partner Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Study Partner</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-2xl">
                {matchDetails.partner.avatar}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {matchDetails.partner.name}
              </h3>
              <div className="flex justify-center items-center space-x-4 text-sm text-muted-foreground">
                <Badge variant="secondary">Level {matchDetails.partner.level}</Badge>
                <div className="flex items-center space-x-1">
                  <span>⭐</span>
                  <span>{matchDetails.partner.rating}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{matchDetails.partner.xp.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sessions Completed</span>
                <span className="font-medium">{matchDetails.partner.completedSessions}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reliability Score</span>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{matchDetails.partner.reliability}%</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-foreground mb-2">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {matchDetails.partner.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Session Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {matchDetails.session.course}
              </h3>
              <p className="text-muted-foreground">{matchDetails.session.topic}</p>
              <Badge variant="outline" className="mt-2">
                {matchDetails.session.type}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{matchDetails.session.date}</p>
                  <p className="text-sm text-muted-foreground">Date</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{matchDetails.session.time}</p>
                  <p className="text-sm text-muted-foreground">Duration: {matchDetails.session.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{matchDetails.session.location}</p>
                  <p className="text-sm text-muted-foreground">Meeting Location</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-foreground">+{matchDetails.session.xpReward} XP</p>
                  <p className="text-sm text-muted-foreground">Completion Reward</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commitment Section */}
      <Card className="mt-8">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Blockchain Commitment
            </h3>
            <p className="text-muted-foreground">
              Lock in this study session on-chain to ensure mutual commitment and unlock XP rewards
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              variant="hero" 
              size="lg" 
              className="flex-1"
              onClick={handleLockSession}
              disabled={isLocking}
            >
              {isLocking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Locking Session...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Lock Session
                </>
              )}
            </Button>
            
            <Button variant="outline" size="lg" className="flex-1">
              <X className="h-5 w-5 mr-2" />
              Decline
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By locking this session, you commit to attending and can earn XP upon completion.
              Cancellation within 24 hours may affect your reliability score.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}