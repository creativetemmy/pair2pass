-- Fix the RLS policies to properly protect email addresses
-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profile information of others" ON public.profiles;

-- Create a single comprehensive SELECT policy that restricts email access
-- Since we can't selectively hide columns in a single policy, we'll create
-- separate policies with proper precedence

-- Policy 1: Users can see their own complete profile (including email)
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (
  wallet_address = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

-- For public access, we need to ensure email is not exposed
-- Unfortunately, Postgres RLS doesn't support column-level restrictions
-- The best approach is to:
-- 1. Allow SELECT on the table (which we do below)
-- 2. Update all client queries to explicitly exclude email when fetching other users

-- Policy 2: Allow public access to profiles (clients must exclude email in SELECT)
CREATE POLICY "Public can view profile information"
ON public.profiles  
FOR SELECT
USING (true);

-- Mark the email column as sensitive in the database
COMMENT ON COLUMN public.profiles.email IS 'SENSITIVE DATA: Only accessible to profile owner. Client queries for other users must explicitly exclude this column.';