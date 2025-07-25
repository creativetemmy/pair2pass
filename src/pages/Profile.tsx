import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { XPBadge } from "@/components/gamification/XPBadge";
import { Badge as AchievementBadge } from "@/components/gamification/Badge";
import { Camera, Edit, Save, Trophy, Calendar, Users, BookOpen } from "lucide-react";

const userProfile = {
  name: "Alex Thompson",
  avatar: "AT",
  email: "alex.thompson@university.edu",
  ensName: "alex.eth",
  walletAddress: "0x1234...5678",
  level: 18,
  xp: 4250,
  joinDate: "September 2024",
  department: "Computer Science",
  institution: "Stanford University",
  academicLevel: "Junior",
  bio: "Passionate about algorithms and machine learning. Love collaborative learning and helping others succeed in tech.",
  skills: ["Python", "JavaScript", "React", "Machine Learning", "Algorithms", "Data Structures"],
  interests: ["AI/ML", "Web Development", "Competitive Programming", "Open Source"],
  stats: {
    sessionsCompleted: 127,
    hoursStudied: 284,
    partnersHelped: 45,
    averageRating: 4.8,
    reliabilityScore: 96,
  },
};

const achievements = [
  { type: "studious" as const, title: "Study Warrior", description: "100+ study sessions", earned: true },
  { type: "reliable" as const, title: "Reliable Partner", description: "95% attendance rate", earned: true },
  { type: "expert" as const, title: "Subject Expert", description: "Top 5% in CS courses", earned: true },
  { type: "streak" as const, title: "Study Streak", description: "30 days in a row", earned: true },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
    // In real app, would update via API
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center mx-auto text-primary-foreground font-bold text-3xl">
                  {userProfile.avatar}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {userProfile.name}
              </h1>
              <p className="text-muted-foreground mb-2">{userProfile.ensName}</p>
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                {userProfile.walletAddress}
              </p>
              
              <XPBadge xp={userProfile.xp} level={userProfile.level} className="justify-center" />
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Member since {userProfile.joinDate}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">Sessions</span>
                </div>
                <span className="font-semibold">{userProfile.stats.sessionsCompleted}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm">Hours Studied</span>
                </div>
                <span className="font-semibold">{userProfile.stats.hoursStudied}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">Partners Helped</span>
                </div>
                <span className="font-semibold">{userProfile.stats.partnersHelped}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm">Avg Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">{userProfile.stats.averageRating}</span>
                  <span className="text-yellow-500">⭐</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Details & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <Button
                variant={isEditing ? "outline" : "default"}
                size="sm"
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              >
                {isEditing ? "Cancel" : <><Edit className="h-4 w-4 mr-1" />Edit</>}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        value={editedProfile.institution}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, institution: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={editedProfile.department}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="level">Academic Level</Label>
                      <Select
                        value={editedProfile.academicLevel}
                        onValueChange={(value) => setEditedProfile(prev => ({ ...prev, academicLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Freshman">Freshman</SelectItem>
                          <SelectItem value="Sophomore">Sophomore</SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <Button onClick={handleSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Contact</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Email:</span> {userProfile.email}</p>
                        <p><span className="text-muted-foreground">ENS:</span> {userProfile.ensName}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Academic Info</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Institution:</span> {userProfile.institution}</p>
                        <p><span className="text-muted-foreground">Department:</span> {userProfile.department}</p>
                        <p><span className="text-muted-foreground">Level:</span> {userProfile.academicLevel}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">About</h3>
                    <p className="text-muted-foreground text-sm">{userProfile.bio}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.interests.map((interest) => (
                        <Badge key={interest} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Achievements & Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((badge, index) => (
                  <AchievementBadge
                    key={index}
                    type={badge.type}
                    title={badge.title}
                    description={badge.description}
                    earned={badge.earned}
                  />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline">
                  View All Badges ({achievements.filter(b => b.earned).length}/{achievements.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}