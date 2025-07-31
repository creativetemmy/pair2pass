import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Star } from "lucide-react";

export default function CheckIn() {
  const [rating, setRating] = useState("");
  const [feedback, setFeedback] = useState("");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>Session Check-in</span>
            </CardTitle>
            <CardDescription>
              Please confirm your session and rate your study partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Session Summary</h3>
              <div className="grid gap-2 text-sm">
                <div>Subject: Data Structures & Algorithms</div>
                <div>Duration: 2 hours</div>
                <div>Date: Today, 2:00 PM - 4:00 PM</div>
              </div>
            </div>

            {/* Partner */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg" alt="Partner" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">Jane Smith</h4>
                <p className="text-sm text-muted-foreground">Your study partner</p>
              </div>
            </div>

            {/* Session Confirmation */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Did the study session happen as planned?</Label>
              <RadioGroup defaultValue="yes">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes, we completed the full session</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial">Partially, we had to cut it short</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No, my partner didn't show up</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Rate your study partner</Label>
              <RadioGroup value={rating} onValueChange={setRating}>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-2">
                    <RadioGroupItem value={stars.toString()} id={`rating-${stars}`} />
                    <Label htmlFor={`rating-${stars}`} className="flex items-center space-x-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < stars ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2">
                        {stars === 5 && "Excellent"}
                        {stars === 4 && "Good"}
                        {stars === 3 && "Average"}
                        {stars === 2 && "Poor"}
                        {stars === 1 && "Very Poor"}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Feedback */}
            <div className="space-y-3">
              <Label htmlFor="feedback" className="text-base font-semibold">
                Additional feedback (optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Share your experience with this study partner..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>

            {/* Rewards Preview */}
            <div className="bg-primary/10 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-2">Session Rewards</h4>
              <div className="flex items-center justify-between text-sm">
                <span>Base XP</span>
                <span className="font-medium">+50 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Completion Bonus</span>
                <span className="font-medium">+25 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold border-t border-primary/20 mt-2 pt-2">
                <span>Total</span>
                <span>+75 XP</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button className="w-full">
              Submit Check-in & Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}