import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface PassPointsReward {
  action: string;
  amount: number;
  description: string;
}

// User tier system based on Pass Points
export interface UserTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
  benefits: string[];
}

export const USER_TIERS: UserTier[] = [
  {
    name: "Beginner",
    minPoints: 0,
    maxPoints: 999,
    color: "text-gray-500",
    icon: "🌱",
    benefits: ["Basic matching", "Profile creation"],
  },
  {
    name: "Explorer",
    minPoints: 1000,
    maxPoints: 2999,
    color: "text-blue-500",
    icon: "🔍",
    benefits: ["Priority matching", "Custom study goals", "Basic badges"],
  },
  {
    name: "Scholar",
    minPoints: 3000,
    maxPoints: 5999,
    color: "text-purple-500",
    icon: "📚",
    benefits: ["Advanced matching", "Exclusive study groups", "Special badges"],
  },
  {
    name: "Expert",
    minPoints: 6000,
    maxPoints: 9999,
    color: "text-orange-500",
    icon: "⭐",
    benefits: [
      "VIP matching",
      "Mentor status",
      "Premium features",
      "Exclusive NFTs",
    ],
  },
  {
    name: "Master",
    minPoints: 10000,
    maxPoints: Infinity,
    color: "text-yellow-500",
    icon: "👑",
    benefits: [
      "Ultimate priority",
      "Community leader",
      "All features unlocked",
      "Legendary NFTs",
    ],
  },
];

export const PASS_POINTS_REWARDS: Record<string, PassPointsReward> = {
  SESSION_COMPLETED: {
    action: "SESSION_COMPLETED",
    amount: 100,
    description: "Completed a study session",
  },
  EMAIL_VERIFIED: {
    action: "EMAIL_VERIFIED",
    amount: 50,
    description: "Email verified",
  },
  PROFILE_COMPLETED: {
    action: "PROFILE_COMPLETED",
    amount: 50,
    description: "Profile completed and badge minted",
  },
  FIRST_SESSION: {
    action: "FIRST_SESSION",
    amount: 150,
    description: "First study session completed",
  },
  HIGH_RATING: {
    action: "HIGH_RATING",
    amount: 25,
    description: "Received 5-star rating",
  },
  STREAK_5: {
    action: "STREAK_5",
    amount: 200,
    description: "5 sessions in a row",
  },
  STREAK_10: {
    action: "STREAK_10",
    amount: 500,
    description: "10 sessions in a row",
  },
  PARTNER_HELPED: {
    action: "PARTNER_HELPED",
    amount: 75,
    description: "Helped a study partner",
  },
};

// Get user tier based on Pass Points
export const getUserTier = (passPoints: number): UserTier => {
  return (
    USER_TIERS.find(
      (tier) => passPoints >= tier.minPoints && passPoints <= tier.maxPoints
    ) || USER_TIERS[0]
  );
};

// Calculate level based on Pass Points (for backward compatibility)
export const calculateLevel = (passPoints: number): number => {
  // Level formula: Level = floor(PassPoints / 1000) + 1
  return Math.floor(passPoints / 1000) + 1;
};

// Calculate Pass Points needed for next level
export const getPassPointsForNextLevel = (
  currentPassPoints: number
): number => {
  const currentLevel = calculateLevel(currentPassPoints);
  return currentLevel * 1000;
};

// Calculate Pass Points needed for next tier
export const getPassPointsForNextTier = (
  currentPassPoints: number
): {
  currentTier: UserTier;
  nextTier: UserTier | null;
  pointsNeeded: number;
} => {
  const currentTier = getUserTier(currentPassPoints);
  const currentTierIndex = USER_TIERS.indexOf(currentTier);
  const nextTier =
    currentTierIndex < USER_TIERS.length - 1
      ? USER_TIERS[currentTierIndex + 1]
      : null;

  const pointsNeeded = nextTier ? nextTier.minPoints - currentPassPoints : 0;

  return { currentTier, nextTier, pointsNeeded };
};

// Award Pass Points to a user
export const awardPassPoints = async (
  walletAddress: string,
  rewardType: keyof typeof PASS_POINTS_REWARDS,
  showNotification: boolean = true
): Promise<boolean> => {
  try {
    const reward = PASS_POINTS_REWARDS[rewardType];
    if (!reward) {
      console.error("Invalid reward type:", rewardType);
      return false;
    }

    // First get current user data
    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("xp, level, sessions_completed")
      .eq("wallet_address", walletAddress)
      .single();

    if (fetchError) {
      console.error("Error fetching current profile:", fetchError);
      return false;
    }

    const currentPassPoints = currentProfile?.xp || 0;
    const newPassPoints = currentPassPoints + reward.amount;
    const oldLevel = currentProfile?.level || 1;
    const newLevel = calculateLevel(newPassPoints);
    const oldTier = getUserTier(currentPassPoints);
    const newTier = getUserTier(newPassPoints);

    // Update profile with new Pass Points and level
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        xp: newPassPoints,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress);

    if (updateError) {
      console.error("Error updating Pass Points:", updateError);
      return false;
    }

    // Show notifications
    if (showNotification) {
      toast({
        title: "Pass Points Earned! 🎉",
        description: `+${reward.amount} Pass Points for ${reward.description}`,
      });

      // Show level up notification
      if (newLevel > oldLevel) {
        await supabase.from("notifications").insert({
          user_wallet: walletAddress,
          type: "milestone_reached",
          title: "🏆 Level Up!",
          message: `Congratulations! You've reached Level ${newLevel}. Keep building your study streaks!`,
          data: { level: newLevel, oldLevel },
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("wallet_address", walletAddress)
          .single();

        if (profile?.email) {
          await supabase.functions
            .invoke("send-notification-email", {
              body: {
                type: "milestone_reached",
                email: profile.email,
                data: {
                  userName: profile.name || "Student",
                  level: newLevel,
                  xp: newPassPoints,
                },
              },
            })
            .catch((err) => console.log("Email send failed:", err));
        }

        setTimeout(() => {
          toast({
            title: "Level Up! 🚀",
            description: `Congratulations! You've reached Level ${newLevel}`,
          });
        }, 1000);
      }

      // Show tier up notification
      if (newTier.name !== oldTier.name) {
        await supabase.from("notifications").insert({
          user_wallet: walletAddress,
          type: "milestone_reached",
          title: `${newTier.icon} Tier Upgraded!`,
          message: `You've achieved ${newTier.name} status! New benefits unlocked.`,
          data: { tier: newTier.name, oldTier: oldTier.name },
        });

        setTimeout(() => {
          toast({
            title: `${newTier.icon} Tier Upgraded!`,
            description: `You're now a ${newTier.name}! Check out your new benefits.`,
          });
        }, 1500);
      }
    }

    console.log(
      `✅ Awarded ${reward.amount} Pass Points to ${walletAddress} for ${reward.action}`
    );
    return true;
  } catch (error) {
    console.error("Unexpected error awarding Pass Points:", error);
    return false;
  }
};

// Update profile stats after session completion
export const updateSessionStats = async (
  walletAddress: string,
  sessionDurationMinutes: number,
  partnerRating?: number
): Promise<void> => {
  try {
    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select(
        "sessions_completed, hours_studied, partners_helped, average_rating"
      )
      .eq("wallet_address", walletAddress)
      .single();

    if (fetchError) {
      console.error("Error fetching profile for stats update:", fetchError);
      return;
    }

    const sessionsCompleted = (currentProfile?.sessions_completed || 0) + 1;
    const hoursStudied =
      (currentProfile?.hours_studied || 0) +
      Math.round((sessionDurationMinutes / 60) * 10) / 10;
    const partnersHelped = (currentProfile?.partners_helped || 0) + 1;

    // Calculate new average rating if rating provided
    let newAverageRating = currentProfile?.average_rating || 0;
    if (partnerRating) {
      const totalRatingPoints =
        (currentProfile?.average_rating || 0) * (sessionsCompleted - 1) +
        partnerRating;
      newAverageRating = totalRatingPoints / sessionsCompleted;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        sessions_completed: sessionsCompleted,
        hours_studied: hoursStudied,
        partners_helped: partnersHelped,
        average_rating: newAverageRating,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress);

    if (updateError) {
      console.error("Error updating session stats:", updateError);
    }

    // Award bonus Pass Points for milestones
    if (sessionsCompleted === 1) {
      await awardPassPoints(walletAddress, "FIRST_SESSION");
    }

    if (partnerRating === 5) {
      await awardPassPoints(walletAddress, "HIGH_RATING");
    }

    // Check for streak bonuses
    if (sessionsCompleted % 5 === 0 && sessionsCompleted <= 10) {
      await awardPassPoints(
        walletAddress,
        sessionsCompleted === 5 ? "STREAK_5" : "STREAK_10"
      );
    }
  } catch (error) {
    console.error("Error updating session stats:", error);
  }
};

// Get Pass Points progress for UI display
export const getPassPointsProgress = (currentPassPoints: number) => {
  const currentLevel = calculateLevel(currentPassPoints);
  const currentLevelMinPoints = (currentLevel - 1) * 1000;
  const nextLevelMinPoints = currentLevel * 1000;
  const progressInLevel = currentPassPoints - currentLevelMinPoints;
  const pointsNeededForLevel = nextLevelMinPoints - currentLevelMinPoints;
  const progressPercentage = (progressInLevel / pointsNeededForLevel) * 100;

  const tierInfo = getPassPointsForNextTier(currentPassPoints);

  return {
    currentLevel,
    currentPassPoints,
    progressInLevel,
    pointsNeededForLevel,
    pointsNeeded: nextLevelMinPoints - currentPassPoints,
    progressPercentage: Math.min(progressPercentage, 100),
    tier: tierInfo.currentTier,
    nextTier: tierInfo.nextTier,
    pointsToNextTier: tierInfo.pointsNeeded,
  };
};
