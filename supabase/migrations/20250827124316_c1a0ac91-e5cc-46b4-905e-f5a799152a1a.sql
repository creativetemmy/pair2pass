-- Create match_requests table for handling connection requests
CREATE TABLE public.match_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_wallet TEXT NOT NULL,
  target_wallet TEXT NOT NULL,
  subject TEXT NOT NULL,
  goal TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- in minutes
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes'), -- 10 minute expiry
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for match_requests
CREATE POLICY "Users can create match requests" 
ON public.match_requests 
FOR INSERT 
WITH CHECK (requester_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can view their match requests" 
ON public.match_requests 
FOR SELECT 
USING (requester_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) 
       OR target_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Target users can update match requests" 
ON public.match_requests 
FOR UPDATE 
USING (target_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_wallet TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their notifications" 
ON public.notifications 
FOR SELECT 
USING (user_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can update their notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_wallet = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Create trigger for automatic timestamp updates on match_requests
CREATE TRIGGER update_match_requests_updated_at
BEFORE UPDATE ON public.match_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for match_requests and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Set replica identity for realtime updates
ALTER TABLE public.match_requests REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;