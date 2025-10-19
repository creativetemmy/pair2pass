-- Prevent accepting expired match requests via RLS
DROP POLICY IF EXISTS "Allow all match_requests operations" ON match_requests;

CREATE POLICY "Users can view relevant match requests"
ON match_requests FOR SELECT
USING (
  requester_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  OR target_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

CREATE POLICY "Users can create match requests"
ON match_requests FOR INSERT
WITH CHECK (
  requester_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

CREATE POLICY "Users can update their match requests"
ON match_requests FOR UPDATE
USING (
  (requester_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  OR target_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))
  AND status = 'pending'
  AND expires_at > now()
)
WITH CHECK (
  status IN ('accepted', 'rejected', 'expired')
);

-- Add unique constraint to prevent duplicate sessions from same request
ALTER TABLE study_sessions 
ADD COLUMN IF NOT EXISTS match_request_id uuid REFERENCES match_requests(id);

CREATE UNIQUE INDEX IF NOT EXISTS unique_session_per_request 
ON study_sessions(match_request_id) 
WHERE match_request_id IS NOT NULL;

-- Create function to check if user has active session
CREATE OR REPLACE FUNCTION has_active_session(_wallet text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM study_sessions
    WHERE (partner_1_id = _wallet OR partner_2_id = _wallet)
      AND status IN ('waiting', 'active', 'ongoing')
      AND created_at > now() - interval '24 hours'
  );
$$;

-- Create function to check if user is verified and ready
CREATE OR REPLACE FUNCTION is_user_ready(_wallet text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE wallet_address = _wallet
      AND is_email_verified = true
      AND name IS NOT NULL
      AND email IS NOT NULL
  );
$$;

-- Add RLS policy to prevent session creation if user has active session
CREATE POLICY "Prevent duplicate active sessions"
ON study_sessions FOR INSERT
WITH CHECK (
  NOT has_active_session(partner_1_id)
  AND NOT has_active_session(partner_2_id)
);