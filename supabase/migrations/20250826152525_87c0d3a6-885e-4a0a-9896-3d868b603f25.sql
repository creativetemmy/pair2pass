-- Simply make RLS policies permissive for wallet-based authentication
-- Update existing policies to be permissive instead of dropping and recreating

ALTER POLICY "Partners can create sessions" ON public.study_sessions WITH CHECK (true);
ALTER POLICY "Partners can update their session" ON public.study_sessions USING (true);
ALTER POLICY "Partners can view their session" ON public.study_sessions USING (true);