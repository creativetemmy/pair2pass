-- Add user_id to profiles table and make wallet_address optional
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update profiles to use user_id as primary key
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Make wallet_address optional and add unique constraint if not exists
ALTER TABLE public.profiles ALTER COLUMN wallet_address DROP NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_wallet_address_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_wallet_address_key UNIQUE (wallet_address);

-- Update email_verifications to use user_id
ALTER TABLE public.email_verifications 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.email_verifications ALTER COLUMN wallet_address DROP NOT NULL;

-- Update match_requests to use user_id
ALTER TABLE public.match_requests 
  ADD COLUMN IF NOT EXISTS requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS target_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update notifications to use user_id
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ALTER COLUMN user_wallet DROP NOT NULL;

-- Update study_sessions to use user_id
ALTER TABLE public.study_sessions 
  ADD COLUMN IF NOT EXISTS partner_1_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS partner_2_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update session_reviews to use user_id
ALTER TABLE public.session_reviews 
  ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS reviewed_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Anyone can create a profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can delete profiles" ON public.profiles;

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view basic profile info"
  ON public.profiles FOR SELECT
  USING (true);

-- Update RLS policies for match_requests
DROP POLICY IF EXISTS "Users can create match requests" ON public.match_requests;
DROP POLICY IF EXISTS "Users can update their match requests" ON public.match_requests;
DROP POLICY IF EXISTS "Users can view relevant match requests" ON public.match_requests;

CREATE POLICY "Users can create match requests"
  ON public.match_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their match requests"
  ON public.match_requests FOR UPDATE
  USING ((auth.uid() = requester_id OR auth.uid() = target_id) AND status = 'pending' AND expires_at > now())
  WITH CHECK (status IN ('accepted', 'rejected', 'expired'));

CREATE POLICY "Users can view relevant match requests"
  ON public.match_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- Update RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow all notifications operations" ON public.notifications;

CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR user_wallet IS NOT NULL);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id OR user_wallet IS NOT NULL);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Update RLS policies for study_sessions
DROP POLICY IF EXISTS "Partners can create sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can update their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can update their sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can view their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can view their sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Prevent duplicate active sessions" ON public.study_sessions;

CREATE POLICY "Partners can create sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = partner_1_user_id OR auth.uid() = partner_2_user_id OR partner_1_id IS NOT NULL);

CREATE POLICY "Partners can update their sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = partner_1_user_id OR auth.uid() = partner_2_user_id OR partner_1_id IS NOT NULL);

CREATE POLICY "Partners can view their sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = partner_1_user_id OR auth.uid() = partner_2_user_id OR partner_1_id IS NOT NULL);

-- Update RLS policies for session_reviews
DROP POLICY IF EXISTS "Users can create reviews for their sessions" ON public.session_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.session_reviews;
DROP POLICY IF EXISTS "Users can view reviews where they are involved" ON public.session_reviews;
DROP POLICY IF EXISTS "Users can view their reviews" ON public.session_reviews;

CREATE POLICY "Users can create reviews"
  ON public.session_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id OR reviewer_wallet IS NOT NULL);

CREATE POLICY "Users can view their reviews"
  ON public.session_reviews FOR SELECT
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewed_id OR reviewer_wallet IS NOT NULL);

-- Update database functions to use user_id
DROP FUNCTION IF EXISTS public.has_active_session(text);
DROP FUNCTION IF EXISTS public.has_active_session(uuid);
CREATE OR REPLACE FUNCTION public.has_active_session(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM study_sessions
    WHERE (partner_1_user_id = _user_id OR partner_2_user_id = _user_id)
      AND status IN ('waiting', 'active', 'ongoing')
      AND created_at > now() - interval '24 hours'
  );
$function$;

DROP FUNCTION IF EXISTS public.is_user_ready(text);
DROP FUNCTION IF EXISTS public.is_user_ready(uuid);
CREATE OR REPLACE FUNCTION public.is_user_ready(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE user_id = _user_id
      AND is_email_verified = true
      AND name IS NOT NULL
      AND email IS NOT NULL
  );
$function$;

-- Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();