-- Drop existing overly permissive policies on study_sessions
DROP POLICY IF EXISTS "Partners can view their session" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can update their session" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can create sessions" ON public.study_sessions;

-- Create secure policies that restrict access to only session partners
-- Users can only view sessions where they are partner_1 or partner_2
CREATE POLICY "Partners can view their own sessions"
ON public.study_sessions
FOR SELECT
USING (
  partner_1_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  OR partner_2_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

-- Users can only update sessions where they are partner_1 or partner_2
CREATE POLICY "Partners can update their own sessions"
ON public.study_sessions
FOR UPDATE
USING (
  partner_1_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  OR partner_2_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

-- Users can create sessions where they are one of the partners
CREATE POLICY "Partners can create sessions"
ON public.study_sessions
FOR INSERT
WITH CHECK (
  partner_1_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  OR partner_2_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);