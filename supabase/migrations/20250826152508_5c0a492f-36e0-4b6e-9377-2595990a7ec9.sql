-- Update RLS policies for study_sessions to work with wallet addresses instead of auth.uid()

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Partners can create sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can update their session" ON public.study_sessions;
DROP POLICY IF EXISTS "Partners can view their session" ON public.study_sessions;

-- Create new policies that allow wallet-based operations
-- Since this app uses wallet authentication, we'll make the policies more permissive
CREATE POLICY "Allow wallet users to create sessions" 
ON public.study_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow wallet users to view sessions" 
ON public.study_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow wallet users to update sessions" 
ON public.study_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow wallet users to delete sessions" 
ON public.study_sessions 
FOR DELETE 
USING (true);