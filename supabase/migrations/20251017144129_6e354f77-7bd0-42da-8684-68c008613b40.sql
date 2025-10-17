-- Fix study_sessions RLS policies to work with wallet addresses instead of auth.uid()
-- Drop existing policies
DROP POLICY IF EXISTS "Partners can create sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can update their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can view their own sessions" ON public.study_sessions;

-- Create new policies that check wallet addresses against profiles
CREATE POLICY "Partners can create sessions" ON public.study_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE wallet_address = partner_1_id
        AND wallet_address = LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE wallet_address = partner_2_id
        AND wallet_address = LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

CREATE POLICY "Partners can view their own sessions" ON public.study_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE wallet_address = partner_1_id
        AND wallet_address = LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE wallet_address = partner_2_id
        AND wallet_address = LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

CREATE POLICY "Partners can update their own sessions" ON public.study_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE wallet_address = partner_1_id
        AND wallet_address = LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE wallet_address = partner_2_id
        AND wallet_address = LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );