-- Re-enable RLS and create proper policies for wallet authentication
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for now since the app uses wallet authentication
-- In a production app, you would implement proper wallet-based authentication
CREATE POLICY "Allow all match_requests operations" ON public.match_requests
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all notifications operations" ON public.notifications  
FOR ALL USING (true) WITH CHECK (true);