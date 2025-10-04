-- Create a secure view that excludes sensitive personal information
-- This view can be safely queried by anyone to see public profile information

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  wallet_address,
  name,
  ens_name,
  institution,
  academic_level,
  bio,
  skills,
  interests,
  study_goals,
  preferred_study_times,
  avatar_url,
  level,
  xp,
  sessions_completed,
  hours_studied,
  partners_helped,
  average_rating,
  reliability_score,
  is_email_verified,
  has_passport,
  created_at,
  updated_at
  -- Explicitly excluded: email, department (which could be used to identify individuals)
FROM public.profiles;

-- Grant read access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Add comment explaining the purpose
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles that excludes sensitive personal information like email addresses. Use this view when fetching profiles of other users.';

-- Update the RLS policy comment
COMMENT ON POLICY "Public can view profile information" ON public.profiles IS 'WARNING: This policy allows reading all columns. Client code must use public_profiles view for other users, and profiles table only for own profile.';