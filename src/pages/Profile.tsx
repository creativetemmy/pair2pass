import { useState, useEffect, useRef } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PassPointsBadge } from "@/components/gamification/PassPointsBadge";
import { Badge as AchievementBadge } from "@/components/gamification/Badge";
import { NftBadge } from "@/components/gamification/NftBadge";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Camera, Edit, Save, Trophy, Calendar, Users, BookOpen, Loader2, Target, Mail, AlertTriangle, CheckCircle, Award, RefreshCw } from "lucide-react";
import { useAccount, useContractRead, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Navigate } from "react-router-dom";
import { useProfile, type Profile } from "@/hooks/useProfile";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useRecentSessions } from "@/hooks/useRecentSessions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEnsName } from "wagmi";
import { pair2PassContractConfig } from "@/contracts/pair2passsbt";

import { baseSepolia } from 'wagmi/chains'

// const achievements = [
//   { type: "studious" as const, title: "Study Warrior", description: "100+ study sessions", earned: true },
//   { type: "reliable" as const, title: "Reliable Partner", description: "95% attendance rate", earned: true },
//   { type: "expert" as const, title: "Subject Expert", description: "Top 5% in CS courses", earned: true },
//   { type: "streak" as const, title: "Study Streak", description: "30 days in a row", earned: true },
// ];

const initialProfileData: Partial<Profile> = {
  name: "",
  email: "",
  ens_name: "",
  institution: "",
  department: "",
  academic_level: "100 Level",
  bio: "",
  skills: [],
  interests: [],
  study_goals: [],
  preferred_study_times: [],
  level: 1,
  xp: 0,
  sessions_completed: 0,
  hours_studied: 0,
  partners_helped: 0,
  average_rating: 0,
  reliability_score: 0,
  is_email_verified: false,
  has_passport: false,
};

export default function Profile() {
  const { address, chainId, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { profile, loading, saving, saveProfile } = useProfile(address);
  const profileCompletion = useProfileCompletion(profile);
  const { recentSessions, loading: sessionsLoading } = useRecentSessions();
  const [achievementsRefreshKey, setAchievementsRefreshKey] = useState(0);

  const { data: hash, error, isPending, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
      useWaitForTransactionReceipt({
        hash,
      })

   const { data: profileBadge, refetch: refetchProfileBadge } = useReadContract({
    ...pair2PassContractConfig,
    functionName: 'getUserProfileBadge',
    args: [address],
    query: {
      enabled: !!address,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  })

    const { data: achievements, refetch: refetchAchievements } = useReadContract({
    ...pair2PassContractConfig,
    functionName: 'getBadgeTokens',
    args: [address],
    query: {
      enabled: !!address,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  })

  // Debug logging
  useEffect(() => {
    console.log('Profile Badge Data:', profileBadge);
    console.log('Profile Badge Number:', Number(profileBadge));
    console.log('Achievements Data:', achievements);
    console.log('Address:', address);
  }, [profileBadge, achievements, address]);

  // Combine achievements with profile badge
  const allBadges = React.useMemo(() => {
    const badgeList = achievements ? [...achievements] : [];
    // Add profile badge if it exists and isn't already in the list
    if (profileBadge && Number(profileBadge) > 0) {
      const profileBadgeBigInt = BigInt(Number(profileBadge));
      if (!badgeList.includes(profileBadgeBigInt)) {
        badgeList.unshift(profileBadgeBigInt); // Add at the beginning
      }
    }
    return badgeList;
  }, [achievements, profileBadge]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>(initialProfileData);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isClaimingPassport, setIsClaimingPassport] = useState(false);
  const [isMintingStudyNFT, setIsMintingStudyNFT] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Refetch contract data when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      console.log('Transaction confirmed, refetching NFT data...');
      // Wait a moment for blockchain to update, then refetch multiple times
      const refetchWithRetry = async () => {
        for (let i = 0; i < 5; i++) {
          console.log(`Refetch attempt ${i + 1}`);
          await refetchProfileBadge();
          await refetchAchievements();
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
        }
        toast({
          title: "Success!",
          description: "Your NFT has been minted successfully! Refresh the page if it doesn't show up.",
        });
      };
      
      setTimeout(refetchWithRetry, 2000); // Start after 2 seconds
    }
  }, [isConfirmed, refetchProfileBadge, refetchAchievements, toast]);

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }


  // Update editedProfile when profile loads
  useEffect(() => {
    if (profile) {
      setEditedProfile(profile);
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  // Auto-update ENS name when it changes
  useEffect(() => {
    if (ensName && profile && profile.ens_name !== ensName) {
      const updatedProfile = { ...editedProfile, ens_name: ensName };
      setEditedProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  }, [ensName, profile]);

  // Show setup form if no profile exists
  const isFirstTimeSetup = !loading && !profile;

  const handleSave = async () => {
    const success = await saveProfile(editedProfile);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditedProfile(profile);
    } else {
      setEditedProfile(initialProfileData);
    }
    setIsEditing(false);
  };

  const addSkill = () => {
    if (skillInput.trim() && !editedProfile.skills?.includes(skillInput.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  };

  const addInterest = () => {
    if (interestInput.trim() && !editedProfile.interests?.includes(interestInput.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        interests: [...(prev.interests || []), interestInput.trim()]
      }));
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setEditedProfile(prev => ({
      ...prev,
      interests: prev.interests?.filter(i => i !== interest) || []
    }));
  };

  const uploadAvatar = async (file: File) => {
    if (!address) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${address.toLowerCase()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache buster to ensure image refreshes
      const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
      
      // Update both local state and profile
      setAvatarUrl(avatarUrl);
      const updatedProfile = { ...editedProfile, avatar_url: avatarUrl };
      setEditedProfile(updatedProfile);
      
      // Save the profile with the new avatar
      await saveProfile(updatedProfile);
      
      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      uploadAvatar(file);
    }
  };

  const handleEmailVerification = () => {
    console.log("🔍 Email verification button clicked");
    console.log("📧 Email:", editedProfile.email);
    
    if (!editedProfile.email) {
      toast({
        title: "Error",
        description: "Please enter an email address first.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("✅ Opening verification modal");
    setIsVerificationModalOpen(true);
  };

  const handleVerificationSuccess = async () => {
    // Update local state to reflect verification
    setEditedProfile(prev => ({ ...prev, is_email_verified: true }));
    
    // The XP is already awarded in the EmailVerificationModal
    // Just update the profile verification status
    const updatedProfile = { 
      ...editedProfile, 
      is_email_verified: true
    };
    
    await saveProfile(updatedProfile);
  };

  const handleClaimPassport = async () => {

     writeContract({
       ...pair2PassContractConfig,
       functionName: 'mintProfileNft',
       args: ["Profile Badge"],
       chain: baseSepolia,
       account:address
     })

    if (!profile?.wallet_address) return;
    
    try {
      setIsClaimingPassport(true);
      
      // Update the has_passport field in the database
      const { error } = await supabase
        .from('profiles')
        .update({ has_passport: true })
        .eq('wallet_address', profile.wallet_address);

      if (error) {
        console.error('Error claiming passport:', error);
        toast({
          title: "Error",
          description: "Failed to claim Student Passport. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setEditedProfile(prev => ({ ...prev, has_passport: true }));
      
      // Show success modal
      setShowPassportModal(true);
      
    } catch (error) {
      console.error('Error in handleClaimPassport:', error);
      toast({
        title: "Error",
        description: "Failed to claim Student Passport. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaimingPassport(false);
    }
  };

  const handleMintStudyNFT = async () => {

     writeContract({
       ...pair2PassContractConfig,
       functionName: 'mintBadgeNft',
       args: ["Study Badge"],
       chain: baseSepolia,
       account:address
     })


    setIsMintingStudyNFT(true);

    if  (isConfirmed){
      setIsMintingStudyNFT(false);
      setAchievementsRefreshKey(prev => prev + 1);
      window.location.reload();

    }
    // try {
    //   // Here you would integrate with your NFT minting contract
    //   // For now, we'll just simulate the minting process
    //   await new Promise(resolve => setTimeout(resolve, 2000));
      
    //   toast({
    //     title: "Proof of Study NFT Minted! 🎓",
    //     description: "Your proof of study NFT has been minted to your wallet.",
    //   });
    // } catch (error) {
    //   console.error('Error minting study NFT:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to mint study NFT. Please try again.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsMintingStudyNFT(false);
    // }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // First time setup form
  if (isFirstTimeSetup || (isEditing && !profile)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isFirstTimeSetup ? "Welcome! Let's set up your profile" : "Edit Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={editedProfile.name || ""}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email || ""}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@university.edu"
                      className="flex-1"
                    />
                    {editedProfile.email && !editedProfile.is_email_verified && (
                      <Button 
                        type="button"
                        onClick={handleEmailVerification}
                        size="sm"
                        className="shrink-0"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Verify Email
                      </Button>
                    )}
                  </div>
                  {editedProfile.email && (
                    <>
                      {editedProfile.is_email_verified ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Verified
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            ⚠️ Please verify your email to unlock session invites, notifications, and rewards.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={editedProfile.institution || ""}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="University name"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={editedProfile.department || ""}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="level">Academic Level</Label>
                <Select
                  value={editedProfile.academic_level || "100 Level"}
                  onValueChange={(value) => setEditedProfile(prev => ({ ...prev, academic_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100 Level">100 Level</SelectItem>
                    <SelectItem value="200 Level">200 Level</SelectItem>
                    <SelectItem value="300 Level">300 Level</SelectItem>
                    <SelectItem value="400 Level">400 Level</SelectItem>
                    <SelectItem value="500 Level">500 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editedProfile.bio || ""}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself, your interests, and what you're studying..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., Python, JavaScript)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedProfile.skills?.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Select Your Study Goals
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                These goals help us match you with the right study partners. You can update anytime.
              </p>
              <ToggleGroup 
                type="multiple" 
                value={editedProfile.study_goals || []}
                onValueChange={(value) => setEditedProfile(prev => ({ ...prev, study_goals: value }))}
                className="justify-start flex-wrap gap-2"
              >
                <ToggleGroupItem value="Exam Prep" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Exam Prep
                </ToggleGroupItem>
                <ToggleGroupItem value="Assignment Help" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Assignment Help
                </ToggleGroupItem>
                <ToggleGroupItem value="Concept Mastery" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Concept Mastery
                </ToggleGroupItem>
                <ToggleGroupItem value="Group Project" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Group Project
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Preferred Study Times
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select when you prefer to study. You can choose multiple time slots.
              </p>
              <ToggleGroup 
                type="multiple" 
                value={editedProfile.preferred_study_times || []}
                onValueChange={(value) => setEditedProfile(prev => ({ ...prev, preferred_study_times: value }))}
                className="justify-start flex-wrap gap-2"
              >
                <ToggleGroupItem value="Morning" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  🌅 Morning
                </ToggleGroupItem>
                <ToggleGroupItem value="Afternoon" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  🌞 Afternoon
                </ToggleGroupItem>
                <ToggleGroupItem value="Evening" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  🌙 Evening
                </ToggleGroupItem>
                <ToggleGroupItem value="Night" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  🌌 Night
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <Label>Subjects of Interest</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder="Add a subject of interest (e.g., AI/ML, Web Development)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <Button type="button" onClick={addInterest} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedProfile.interests?.map((interest) => (
                  <Badge
                    key={interest}
                    variant="default"
                    className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/20"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={saving || !editedProfile.name?.trim()}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isFirstTimeSetup ? "Create Profile" : "Save Changes"}
              </Button>
              {!isFirstTimeSetup && (
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative mb-4">
                {avatarUrl || profile?.avatar_url ? (
                  <img
                    src={avatarUrl || profile?.avatar_url}
                    alt="Profile avatar"
                    className="h-24 w-24 rounded-full object-cover mx-auto"
                    key={avatarUrl || profile?.avatar_url} // Force re-render on URL change
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center mx-auto text-primary-foreground font-bold text-3xl">
                    {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {profile?.name || "Anonymous User"}
              </h1>
              <p className="text-muted-foreground mb-2">{profile?.ens_name || ensName || "No ENS"}</p>
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                {address}
              </p>
              
              <PassPointsBadge passPoints={profile?.xp || 0} level={profile?.level || 1} className="justify-center" />
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
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
                <span className="font-semibold">{profile?.sessions_completed || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm">Hours Studied</span>
                </div>
                <span className="font-semibold">{profile?.hours_studied || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">Partners Helped</span>
                </div>
                <span className="font-semibold">{profile?.partners_helped || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm">Avg Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">{profile?.average_rating || 0}</span>
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
                        value={editedProfile.name || ""}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            id="email"
                            type="email"
                            value={editedProfile.email || ""}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="your.email@university.edu"
                            className="flex-1"
                          />
                          {editedProfile.email && !editedProfile.is_email_verified && (
                            <Button 
                              type="button"
                              onClick={handleEmailVerification}
                              size="sm"
                              className="shrink-0"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Verify Email
                            </Button>
                          )}
                        </div>
                        {editedProfile.email && (
                          <>
                            {editedProfile.is_email_verified ? (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  Verified
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                  ⚠️ Please verify your email to unlock session invites, notifications, and rewards.
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        value={editedProfile.institution || ""}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, institution: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={editedProfile.department || ""}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="level">Academic Level</Label>
                      <Select
                        value={editedProfile.academic_level || "100 Level"}
                        onValueChange={(value) => setEditedProfile(prev => ({ ...prev, academic_level: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100 Level">100 Level</SelectItem>
                          <SelectItem value="200 Level">200 Level</SelectItem>
                          <SelectItem value="300 Level">300 Level</SelectItem>
                          <SelectItem value="400 Level">400 Level</SelectItem>
                          <SelectItem value="500 Level">500 Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                   
                   <div>
                     <Label htmlFor="bio">Bio</Label>
                     <Textarea
                       id="bio"
                       value={editedProfile.bio || ""}
                       onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                       className="min-h-[100px]"
                     />
                   </div>

                   <div>
                     <Label className="flex items-center gap-2">
                       <Target className="h-4 w-4" />
                       Select Your Study Goals
                     </Label>
                     <p className="text-sm text-muted-foreground mb-3">
                       These goals help us match you with the right study partners. You can update anytime.
                     </p>
                     <ToggleGroup 
                       type="multiple" 
                       value={editedProfile.study_goals || []}
                       onValueChange={(value) => setEditedProfile(prev => ({ ...prev, study_goals: value }))}
                       className="justify-start flex-wrap gap-2"
                     >
                       <ToggleGroupItem value="Exam Prep" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                         Exam Prep
                       </ToggleGroupItem>
                       <ToggleGroupItem value="Assignment Help" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                         Assignment Help
                       </ToggleGroupItem>
                       <ToggleGroupItem value="Concept Mastery" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                         Concept Mastery
                       </ToggleGroupItem>
                       <ToggleGroupItem value="Group Project" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                         Group Project
                       </ToggleGroupItem>
                     </ToggleGroup>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Preferred Study Times
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select when you prefer to study. You can choose multiple time slots.
                      </p>
                      <ToggleGroup 
                        type="multiple" 
                        value={editedProfile.preferred_study_times || []}
                        onValueChange={(value) => setEditedProfile(prev => ({ ...prev, preferred_study_times: value }))}
                        className="justify-start flex-wrap gap-2"
                      >
                        <ToggleGroupItem value="Morning" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                          🌅 Morning
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Afternoon" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                          🌞 Afternoon
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Evening" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                          🌙 Evening
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Night" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                          🌌 Night
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

             <div>
              <Label>Subjects of Interest</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder="Add a subject of interest"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <Button type="button" onClick={addInterest} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedProfile.interests?.map((interest) => (
                  <Badge
                    key={interest}
                    variant="default"
                    className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/20"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedProfile.skills?.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>
                  
                  <Button onClick={handleSave} className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Contact</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <div className="flex items-center gap-2">
                            <span>{profile?.email || "Not provided"}</span>
                            {profile?.email && profile?.is_email_verified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        {profile?.email && !profile?.is_email_verified && (
                          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              ⚠️ Please verify your email to unlock session invites, notifications, and rewards.
                            </p>
                          </div>
                        )}
                        <p><span className="text-muted-foreground">ENS:</span> {profile?.ens_name || ensName || "Not set"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Academic Info</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Institution:</span> {profile?.institution || "Not provided"}</p>
                        <p><span className="text-muted-foreground">Department:</span> {profile?.department || "Not provided"}</p>
                        <p><span className="text-muted-foreground">Level:</span> {profile?.academic_level || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                  
                   <div>
                     <h3 className="font-semibold text-foreground mb-2">About</h3>
                     <p className="text-muted-foreground text-sm">{profile?.bio || "No bio provided yet."}</p>
                   </div>

                   <div>
                     <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                       <Target className="h-4 w-4" />
                       Study Goals
                     </h3>
                     <div className="flex flex-wrap gap-2">
                       {profile?.study_goals?.length ? (
                         profile.study_goals.map((goal) => (
                           <Badge key={goal} variant="outline" className="border-primary text-primary">
                             {goal}
                           </Badge>
                         ))
                       ) : (
                         <p className="text-muted-foreground text-sm">No study goals selected yet</p>
                       )}
                     </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Preferred Study Times
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile?.preferred_study_times?.length ? (
                          profile.preferred_study_times.map((time) => (
                            <Badge key={time} variant="outline" className="border-primary text-primary">
                              {time === 'Morning' && '🌅 '}{time === 'Afternoon' && '🌞 '}{time === 'Evening' && '🌙 '}{time === 'Night' && '🌌 '}{time}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm">No preferred study times selected yet</p>
                        )}
                      </div>
                    </div>
                    
             <div>
              <h3 className="font-semibold text-foreground mb-3">Subjects of Interest</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.interests?.length ? (
                  profile.interests.map((interest) => (
                    <Badge key={interest} variant="default" className="bg-primary/10 text-primary">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No subjects of interest added yet</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.length ? (
                  profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet</p>
                )}
              </div>
            </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Completion Progress */}
          {profile && profileCompletion.completionPercentage > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Profile Completion</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-bold text-primary">
                    {profileCompletion.completionPercentage}% {profileCompletion.isComplete && "✅"}
                  </span>
                </div>
                <Progress value={profileCompletion.completionPercentage} className="w-full" />
                
                {/* Profile Incomplete State */}
                {!profileCompletion.isComplete && (
                  <div className="text-center p-6 bg-gradient-to-r from-muted/50 to-muted/30 border border-border rounded-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-3">
                        <Award className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        Complete your profile to unlock your Student Passport NFT.
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Fill out all required information to mint your exclusive student passport.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Profile Complete State */}
                {profileCompletion.isComplete && (
                  <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/30 shadow-glow animate-fade-in">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        {!Number(profileBadge) ? (
                          <>
                            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-4 animate-glow">
                              <Trophy className="h-10 w-10 text-primary-foreground" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                🎉 Congratulations!
                              </h3>
                              <p className="text-base font-medium text-foreground">
                                Your profile is complete! Ready to mint your passport?
                              </p>
                            </div>
                            <Button 
                              onClick={handleClaimPassport}
                              disabled={isConfirming}
                              className="w-full max-w-xs mx-auto gradient-primary hover:opacity-90 shadow-primary transition-all duration-300 hover:scale-105 hover:shadow-glow rounded-xl text-primary-foreground font-semibold"
                            >
                              {isConfirming ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Minting your NFT…
                               
                                </>
                              ) : (
                                <>
                                  <Award className="h-5 w-5 mr-2" />
                                  Mint Passport NFT
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Success State with NFT Card Preview */}
                            <div className="space-y-4">
                              <div className="text-center space-y-3">
                                <div className="text-6xl animate-bounce">🎉</div>
                                <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                                  ✅ Passport Minted!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Your Student Passport NFT has been successfully minted!
                                </p>
                              </div>
                              
                              {/* NFT Card Preview */}
                              <div className="max-w-sm mx-auto">
                                <Card className="bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-2 border-primary/30 shadow-glow">
                                  <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-3">
                                      <Trophy className="h-8 w-8 text-primary-foreground" />
                                    </div>
                                    <h4 className="font-bold text-foreground mb-1">Student Passport NFT</h4>
                                    <p className="text-xs text-muted-foreground mb-2">#{Number(profileBadge)}</p>
            
                                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">
                                      Verified Student
                                    </Badge>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Achievements & Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent key={achievementsRefreshKey} data-badges-section>
            {allBadges && allBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allBadges.map((badge, index) => (
                    <NftBadge key={index} tokenId={Number(badge)} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No achievements found.</p>
              )}
                            
              
              {/* Proof of Study NFT Section */}
              {recentSessions.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        Proof of Study NFT
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        You've completed {recentSessions.length} study session{recentSessions.length !== 1 ? 's' : ''}! Mint your proof of study NFT.
                      </p>
                    </div>
                    <Button 
                      onClick={handleMintStudyNFT}
                      disabled={isMintingStudyNFT}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          Mint NFT
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {(allBadges?.length || 0) > 0 && (
                <div className="mt-6 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={async () => {
                      console.log('Manual refresh clicked');
                      await refetchProfileBadge();
                      await refetchAchievements();
                      toast({
                        title: "Refreshed",
                        description: "NFT data has been refreshed",
                      });
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh NFTs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EmailVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        email={editedProfile.email || ""}
        onVerificationSuccess={handleVerificationSuccess}
      />

      {/* Success Modal for Passport Claim */}
      <AlertDialog open={showPassportModal} onOpenChange={setShowPassportModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Success!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center py-4">
              <div className="space-y-3">
                <div className="text-6xl">🎉</div>
                <p className="text-lg font-medium">
                  ✅ Your Student Passport has been reserved.
                </p>
                <p className="text-sm text-muted-foreground">
                  NFT minting will be available soon. You'll be notified when it's ready!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPassportModal(false)}>
              Awesome!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}