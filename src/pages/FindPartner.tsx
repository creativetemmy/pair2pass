import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, BookOpen, Users, Search, Filter } from "lucide-react";

const courses = [
  "Computer Science 101",
  "Calculus II",
  "Physics Lab",
  "Chemistry",
  "English Literature",
  "Statistics",
  "Biology",
  "Economics",
];

const timeSlots = [
  "Morning (8:00 AM - 12:00 PM)",
  "Afternoon (12:00 PM - 5:00 PM)", 
  "Evening (5:00 PM - 9:00 PM)",
  "Night (9:00 PM - 12:00 AM)",
];

const matchedStudents = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "SC",
    level: 15,
    xp: 3200,
    rating: 4.9,
    course: "Computer Science 101",
    availability: ["Morning", "Afternoon"],
    skills: ["Programming", "Algorithms", "Data Structures"],
    location: "On-campus",
    lastOnline: "2 hours ago",
  },
  {
    id: 2,
    name: "Michael Johnson", 
    avatar: "MJ",
    level: 12,
    xp: 2800,
    rating: 4.7,
    course: "Computer Science 101",
    availability: ["Afternoon", "Evening"],
    skills: ["Web Development", "React", "JavaScript"],
    location: "Remote",
    lastOnline: "30 mins ago",
  },
  {
    id: 3,
    name: "Emma Davis",
    avatar: "ED",
    level: 18,
    xp: 4100,
    rating: 5.0,
    course: "Computer Science 101",
    availability: ["Evening", "Night"],
    skills: ["Machine Learning", "Python", "Data Science"],
    location: "On-campus",
    lastOnline: "1 hour ago",
  },
];

export default function FindPartner() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [location, setLocation] = useState("");

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 transition-colors duration-300">Find Study Partner</h1>
        <p className="text-muted-foreground transition-colors duration-300">Connect with verified students for your courses</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Filters */}
        <Card className="lg:col-span-1 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 transition-colors duration-300">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Selection */}
            <div>
              <Label htmlFor="course">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skill Level */}
            <div>
              <Label htmlFor="skill-level">Skill Level</Label>
              <Select value={skillLevel} onValueChange={setSkillLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div>
              <Label>Availability</Label>
              <div className="space-y-2 mt-2">
                {timeSlots.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox 
                      id={time}
                      checked={selectedTimes.includes(time)}
                      onCheckedChange={() => handleTimeToggle(time)}
                    />
                    <Label htmlFor={time} className="text-sm">
                      {time}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-campus">On-campus</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="gradient" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Find Partners
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground transition-colors duration-300">
              Available Study Partners ({matchedStudents.length})
            </h2>
            <Select defaultValue="rating">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="level">Highest Level</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {matchedStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-card transition-all duration-300 border-border/20 dark:border-border/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {student.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{student.name}</h3>
                        <Badge variant="secondary">Level {student.level}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>{student.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🔥</span>
                          <span>{student.xp} XP</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{student.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {student.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Available: {student.availability.join(", ")}</span>
                        </div>
                        <span>Last online: {student.lastOnline}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 min-w-[120px]">
                    <Button variant="default" size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {matchedStudents.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or check back later for new study partners
                </p>
                <Button variant="default">
                  Expand Search Criteria
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}