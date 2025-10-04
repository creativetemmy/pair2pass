-- Recreate the view with explicit SECURITY INVOKER to fix the linter warning
-- SECURITY INVOKER means the view respects the RLS policies of the querying user

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles that excludes sensitive personal information like email addresses. Use this view when fetching profiles of other users. Uses SECURITY INVOKER to respect RLS policies.';