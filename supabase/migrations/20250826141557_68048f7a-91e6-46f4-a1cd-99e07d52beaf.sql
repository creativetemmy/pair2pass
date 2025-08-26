-- Create study sessions table to store session data including video links
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_1_id TEXT NOT NULL,
  partner_2_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  goal TEXT NOT NULL,
  duration INTEGER NOT NULL,
  video_link TEXT,
  partner_1_ready BOOLEAN DEFAULT FALSE,
  partner_2_ready BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for session access
CREATE POLICY "Partners can view their session" 
ON public.study_sessions 
FOR SELECT 
USING (partner_1_id = auth.uid()::text OR partner_2_id = auth.uid()::text);

CREATE POLICY "Partners can update their session" 
ON public.study_sessions 
FOR UPDATE 
USING (partner_1_id = auth.uid()::text OR partner_2_id = auth.uid()::text);

CREATE POLICY "Partners can create sessions" 
ON public.study_sessions 
FOR INSERT 
WITH CHECK (partner_1_id = auth.uid()::text OR partner_2_id = auth.uid()::text);

-- Add trigger for timestamps
CREATE TRIGGER update_study_sessions_updated_at
BEFORE UPDATE ON public.study_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();