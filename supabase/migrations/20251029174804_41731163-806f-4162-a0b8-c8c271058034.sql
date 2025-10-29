-- Fix RLS policies to remove insecure authorization bypass
-- Note: This will require proper authentication to be implemented
-- for wallet-based users going forward

-- ====================================
-- Fix study_sessions table policies
-- ====================================

DROP POLICY IF EXISTS "Partners can create sessions" ON study_sessions;
DROP POLICY IF EXISTS "Partners can update their sessions" ON study_sessions;
DROP POLICY IF EXISTS "Partners can view their sessions" ON study_sessions;

CREATE POLICY "Partners can create sessions"
  ON study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = partner_1_user_id OR 
    auth.uid() = partner_2_user_id
  );

CREATE POLICY "Partners can update their sessions"
  ON study_sessions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = partner_1_user_id OR 
    auth.uid() = partner_2_user_id
  )
  WITH CHECK (
    auth.uid() = partner_1_user_id OR 
    auth.uid() = partner_2_user_id
  );

CREATE POLICY "Partners can view their sessions"
  ON study_sessions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = partner_1_user_id OR 
    auth.uid() = partner_2_user_id
  );

-- ====================================
-- Fix session_reviews table policies
-- ====================================

DROP POLICY IF EXISTS "Users can create reviews" ON session_reviews;
DROP POLICY IF EXISTS "Users can view their reviews" ON session_reviews;

CREATE POLICY "Users can create reviews"
  ON session_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can view their reviews"
  ON session_reviews FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reviewer_id OR 
    auth.uid() = reviewed_id
  );

-- ====================================
-- Fix notifications table policies
-- ====================================

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);