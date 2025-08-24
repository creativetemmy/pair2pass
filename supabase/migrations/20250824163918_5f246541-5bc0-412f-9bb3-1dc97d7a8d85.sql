-- Add study_goals column to profiles table
ALTER TABLE public.profiles ADD COLUMN study_goals TEXT[] DEFAULT '{}' NOT NULL;