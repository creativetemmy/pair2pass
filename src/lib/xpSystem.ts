import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface XPReward {
  action: string;
  amount: number;
  description: string;
}

export const XP_REWARDS: Record<string, XPReward> = {
  SESSION_COMPLETED: {
    action: 'SESSION_COMPLETED',
    amount: 100,
    description: 'Completed a study session'
  },
  EMAIL_VERIFIED: {
    action: 'EMAIL_VERIFIED',
    amount: 50,
    description: 'Email verified'
  },
  PROFILE_COMPLETED: {
    action: 'PROFILE_COMPLETED',
    amount: 30,
    description: 'Profile completed'
  },
  FIRST_SESSION: {
    action: 'FIRST_SESSION',
    amount: 150,
    description: 'First study session completed'
  },
  HIGH_RATING: {
    action: 'HIGH_RATING',
    amount: 25,
    description: 'Received 5-star rating'
  },
  STREAK_5: {
    action: 'STREAK_5',
    amount: 200,
    description: '5 sessions in a row'
  },
  STREAK_10: {
    action: 'STREAK_10',
    amount: 500,
    description: '10 sessions in a row'
  },
  PARTNER_HELPED: {
    action: 'PARTNER_HELPED',
    amount: 75,
    description: 'Helped a study partner'
  }
};

// Calculate level based on XP
export const calculateLevel = (xp: number): number => {
  // Level formula: Level = floor(XP / 1000) + 1
  // Level 1: 0-999 XP, Level 2: 1000-1999 XP, etc.
  return Math.floor(xp / 1000) + 1;
};

// Calculate XP needed for next level
export const getXPForNextLevel = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  return currentLevel * 1000;
};

// Award XP to a user
export const awardXP = async (
  walletAddress: string, 
  rewardType: keyof typeof XP_REWARDS,
  showNotification: boolean = true
): Promise<boolean> => {
  try {
    const reward = XP_REWARDS[rewardType];
    if (!reward) {
      console.error('Invalid reward type:', rewardType);
      return false;
    }

    // First get current user data
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('xp, level, sessions_completed')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError) {
      console.error('Error fetching current profile:', fetchError);
      return false;
    }

    const currentXP = currentProfile?.xp || 0;
    const newXP = currentXP + reward.amount;
    const oldLevel = currentProfile?.level || 1;
    const newLevel = calculateLevel(newXP);

    // Update profile with new XP and level
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Error updating XP:', updateError);
      return false;
    }

    // Show notifications
    if (showNotification) {
      toast({
        title: "PASS Points Earned! 🎉",
        description: `+${reward.amount} PASS Points for ${reward.description}`,
      });

      // Show level up notification
      if (newLevel > oldLevel) {
        // Create milestone notification
        await supabase.from('notifications').insert({
          user_wallet: walletAddress,
          type: 'milestone_reached',
          title: '🏆 Level Up!',
          message: `Congratulations! You've reached Level ${newLevel}. Keep building your study streaks!`,
          data: { level: newLevel, oldLevel }
        });

        // Get user profile for email
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('wallet_address', walletAddress)
          .single();

        if (profile?.email) {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              type: 'milestone_reached',
              to: profile.email,
              userName: profile.name || 'Student',
              level: newLevel,
              xp: newXP
            }
          }).catch(err => console.log('Email send failed:', err));
        }

        setTimeout(() => {
          toast({
            title: "Level Up! 🚀",
            description: `Congratulations! You've reached Level ${newLevel}`,
          });
        }, 1000);
      }
    }

    console.log(`✅ Awarded ${reward.amount} XP to ${walletAddress} for ${reward.action}`);
    return true;

  } catch (error) {
    console.error('Unexpected error awarding XP:', error);
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
      .from('profiles')
      .select('sessions_completed, hours_studied, partners_helped, average_rating')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError) {
      console.error('Error fetching profile for stats update:', fetchError);
      return;
    }

    const sessionsCompleted = (currentProfile?.sessions_completed || 0) + 1;
    const hoursStudied = (currentProfile?.hours_studied || 0) + Math.round(sessionDurationMinutes / 60 * 10) / 10;
    const partnersHelped = (currentProfile?.partners_helped || 0) + 1;
    
    // Calculate new average rating if rating provided
    let newAverageRating = currentProfile?.average_rating || 0;
    if (partnerRating) {
      const totalRatingPoints = (currentProfile?.average_rating || 0) * (sessionsCompleted - 1) + partnerRating;
      newAverageRating = totalRatingPoints / sessionsCompleted;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        sessions_completed: sessionsCompleted,
        hours_studied: hoursStudied,
        partners_helped: partnersHelped,
        average_rating: newAverageRating,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Error updating session stats:', updateError);
    }

    // Award bonus XP for milestones
    if (sessionsCompleted === 1) {
      await awardXP(walletAddress, 'FIRST_SESSION');
    }
    
    if (partnerRating === 5) {
      await awardXP(walletAddress, 'HIGH_RATING');
    }

    // Check for streak bonuses (simplified - just check if user has consistent activity)
    if (sessionsCompleted % 5 === 0 && sessionsCompleted <= 10) {
      await awardXP(walletAddress, sessionsCompleted === 5 ? 'STREAK_5' : 'STREAK_10');
    }

  } catch (error) {
    console.error('Error updating session stats:', error);
  }
};

// Get XP progress for UI display
export const getXPProgress = (currentXP: number) => {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelMinXP = (currentLevel - 1) * 1000;
  const nextLevelMinXP = currentLevel * 1000;
  const progressInLevel = currentXP - currentLevelMinXP;
  const xpNeededForLevel = nextLevelMinXP - currentLevelMinXP;
  const progressPercentage = (progressInLevel / xpNeededForLevel) * 100;

  return {
    currentLevel,
    currentXP,
    progressInLevel,
    xpNeededForLevel,
    xpNeeded: nextLevelMinXP - currentXP,
    progressPercentage: Math.min(progressPercentage, 100)
  };
};