import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id?: string;
  wallet_address: string;
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

export function useProfile(walletAddress?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (walletAddress) {
      fetchProfile(walletAddress);
    } else {
      setLoading(false);
    }
  }, [walletAddress]);

  const fetchProfile = async (address: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data ? {
        ...data,
        study_goals: (data as any)?.study_goals || [],
        preferred_study_times: (data as any)?.preferred_study_times || []
      } : null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<Profile>) => {
    console.log('createProfile called:', { walletAddress, profileData });
    if (!walletAddress) {
      console.log('No wallet address provided');
      return null;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          ...profileData,
          skills: profileData.skills || [],
          interests: profileData.interests || [],
          study_goals: profileData.study_goals || [],
          preferred_study_times: profileData.preferred_study_times || [],
        })
        .select()
        .single();
      
      console.log('createProfile result:', { data, error });

      if (error) {
        console.error('Error creating profile:', error);
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      setProfile({
        ...data,
        study_goals: (data as any)?.study_goals || [],
        preferred_study_times: (data as any)?.preferred_study_times || []
      });
      toast({
        title: "Success",
        description: "Profile created successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    console.log('updateProfile called:', { walletAddress, profile, profileData });
    if (!walletAddress || !profile) {
      console.log('Missing wallet address or profile:', { walletAddress, profile });
      return null;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('wallet_address', walletAddress.toLowerCase())
        .select()
        .single();
      
      console.log('updateProfile result:', { data, error });

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
        study_goals: (data as any)?.study_goals || [],
        preferred_study_times: (data as any)?.preferred_study_times || []
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

  const saveProfile = async (profileData: Partial<Profile>) => {
    console.log('saveProfile called with:', { profileData, walletAddress, profile });
    if (profile) {
      return await updateProfile(profileData);
    } else {
      return await createProfile(profileData);
    }
  };

  return {
    profile,
    loading,
    saving,
    saveProfile,
    refetch: () => walletAddress && fetchProfile(walletAddress),
  };
}