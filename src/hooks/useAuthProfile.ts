import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { awardPassPoints } from '@/lib/passPointsSystem';

export interface Profile {
  id?: string;
  user_id?: string;
  wallet_address?: string;
  name?: string;
  email?: string;
  is_email_verified?: boolean;
  has_passport?: boolean;
  ens_name?: string;
  institution?: string;
  department?: string;
  academic_level?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  study_goals: string[];
  preferred_study_times: string[];
  avatar_url?: string;
  level: number;
  xp: number;
  sessions_completed: number;
  hours_studied: number;
  partners_helped: number;
  average_rating: number;
  reliability_score: number;
  created_at?: string;
  updated_at?: string;
}

export function useAuthProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
      setProfile(null);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data ? {
        ...data,
        study_goals: data?.study_goals || [],
        preferred_study_times: data?.preferred_study_times || []
      } : null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user || !profile) return null;

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      setProfile({
        ...data,
        study_goals: data?.study_goals || [],
        preferred_study_times: data?.preferred_study_times || []
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    updateProfile,
    refetch: fetchProfile,
  };
}