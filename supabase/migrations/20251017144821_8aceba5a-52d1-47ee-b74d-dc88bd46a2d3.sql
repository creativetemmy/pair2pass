-- Fix study_sessions RLS policies to directly compare wallet addresses
DROP POLICY IF EXISTS "Partners can create sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can update their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can view their own sessions" ON public.study_sessions;

-- Create simplified policies that directly compare wallet addresses
CREATE POLICY "Partners can create sessions" ON public.study_sessions
  FOR INSERT
  WITH CHECK (
    LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = LOWER(partner_1_id)
    OR
    LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = LOWER(partner_2_id)
  );

CREATE POLICY "Partners can view their own sessions" ON public.study_sessions
  FOR SELECT
  USING (
    LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = LOWER(partner_1_id)
    OR
    LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = LOWER(partner_2_id)
  );

CREATE POLICY "Partners can update their own sessions" ON public.study_sessions
  FOR UPDATE
  USING (
    LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = LOWER(partner_1_id)
    OR
    LOWER((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = LOWER(partner_2_id)
  );