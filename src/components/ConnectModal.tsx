import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookOpen, Clock, Target, Users, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  wallet_address: string;
  name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  average_rating: number;
  institution: string | null;
  academic_level: string | null;
}

interface ConnectModalProps {
  partner: Profile;
  isOpen: boolean;
  onClose: () => void;
}

const durationOptions = [
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
  { label: "2 hours", value: 120 },
];

export function ConnectModal({ partner, isOpen, onClose }: ConnectModalProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    goal: "",
    duration: 60,
  });

  // Get current user's name
  const [currentUserName, setCurrentUserName] = useState<string>("Someone");

  // Fetch current user's profile on modal open
  useEffect(() => {
    if (isOpen && address) {
      supabase
        .from("profiles")
        .select("name")
        .eq("wallet_address", address)
        .single()
        .then(({ data }) => {
          if (data?.name) {
            setCurrentUserName(data.name);
          }
        });
    }
  }, [isOpen, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to send match requests",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject.trim() || !formData.goal.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create match request
      const { data: matchRequest, error: matchError } = await supabase
        .from("match_requests")
        .insert([
          {
            requester_wallet: address,
            target_wallet: partner.wallet_address,
            subject: formData.subject,
            goal: formData.goal,
            duration: formData.duration,
          },
        ])
        .select()
        .single();

      if (matchError || !matchRequest)
        throw matchError || new Error("Failed to create match request");

      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("wallet_address", partner.wallet_address)
        .single();

      // Create notification for the target user
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_wallet: partner.wallet_address,
            type: "match_request",
            title: "New Study Partner Request",
            message: `${currentUserName} wants to study ${formData.subject} with you for ${formData.goal}. Accept?`,
            data: {
              matchRequestId: matchRequest.id,
              requesterName: currentUserName,
              subject: formData.subject,
              goal: formData.goal,
              duration: formData.duration,
            },
          },
        ]);

      if (notificationError) throw notificationError;

      await supbase.functions
        .invoke("send-notification-email", {
          body: {
            type: "send_request",
            email: targetProfile.email,
            data: {
              userName: currentUserName || "Student",
              partnerName: targetProfile?.name || "Student",
            },
          },
        })
        .catch((err) => console.log("Email send failed:", err));

      toast({
        title: "Request Sent! 📩",
        description: `Your study request has been sent to ${
          partner.name || "the partner"
        }`,
      });

      // Reset form and close modal
      setFormData({ subject: "", goal: "", duration: 60 });
      onClose();
    } catch (error) {
      console.error("Error sending match request:", error);
      toast({
        title: "Error",
        description: "Failed to send match request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Connect with Study Partner</span>
          </DialogTitle>
          <DialogDescription>
            Send a study request to connect and start learning together
          </DialogDescription>
        </DialogHeader>

        {/* Partner Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {partner.avatar_url ? (
                <img
                  src={partner.avatar_url}
                  alt="Partner avatar"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {getInitials(partner.name)}
                </div>
              )}
              <div>
                <h3 className="font-semibold">{partner.name || "Anonymous"}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>⭐ {partner.average_rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>Level {partner.level}</span>
                  <span>•</span>
                  <span>{partner.institution || "Unknown"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div>
            <Label
              htmlFor="subject"
              className="flex items-center space-x-1 mb-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Subject *</span>
            </Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics, Physics, Computer Science"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              required
            />
          </div>

          {/* Study Goal */}
          <div>
            <Label htmlFor="goal" className="flex items-center space-x-1 mb-2">
              <Target className="h-4 w-4" />
              <span>Study Goal *</span>
            </Label>
            <Textarea
              id="goal"
              placeholder="e.g., Prepare for midterm exam, Learn calculus basics, Complete assignment"
              value={formData.goal}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, goal: e.target.value }))
              }
              rows={3}
              required
            />
          </div>

          {/* Duration */}
          <div>
            <Label
              htmlFor="duration"
              className="flex items-center space-x-1 mb-2"
            >
              <Clock className="h-4 w-4" />
              <span>Study Duration</span>
            </Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, duration: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
