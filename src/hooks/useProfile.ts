import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id?: string;
  wallet_address: string;
  name?: string;
  email?: string;
  ens_name?: string;
  institution?: string;
  department?: string;
  academic_level?: string;
  bio?: string;
  skills: string[];
  interests: string[];
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

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<Profile>) => {
    if (!walletAddress) return null;

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          ...profileData,
          skills: profileData.skills || [],
          interests: profileData.interests || [],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      setProfile(data);
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
    if (!walletAddress || !profile) return null;

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('wallet_address', walletAddress.toLowerCase())
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

      setProfile(data);
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