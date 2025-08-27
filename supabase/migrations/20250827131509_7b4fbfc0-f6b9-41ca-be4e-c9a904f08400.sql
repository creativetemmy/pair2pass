-- Add email verification field to profiles table
ALTER TABLE public.profiles ADD COLUMN is_email_verified boolean DEFAULT false;