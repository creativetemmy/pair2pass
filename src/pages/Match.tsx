import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, BookOpen, Star } from "lucide-react";

export default function Match() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Study Partner Match</CardTitle>
            <CardDescription>
              You've been matched with a study partner for your session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Partner Profile */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" alt="Partner" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Jane Smith</h3>
                <p className="text-muted-foreground">Computer Science Major</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-muted-foreground">(24 sessions)</span>
                </div>
              </div>
              <Badge variant="secondary">Level 12</Badge>
            </div>

            {/* Session Details */}
            <div className="space-y-4">
              <h4 className="font-semibold">Session Details</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Data Structures & Algorithms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">2 hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Online (Discord)</span>
                </div>
              </div>
            </div>

            {/* Partner Stats */}
            <div className="space-y-2">
              <h4 className="font-semibold">Partner Stats</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">156</div>
                  <div className="text-xs text-muted-foreground">Total XP</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">24</div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">98%</div>
                  <div className="text-xs text-muted-foreground">Show Rate</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1">
                Lock Session & Start
              </Button>
              <Button variant="outline" className="flex-1">
                Request Different Partner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}