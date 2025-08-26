-- Create session reviews table
CREATE TABLE public.session_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  reviewer_wallet TEXT NOT NULL,
  reviewed_wallet TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view reviews where they are involved" 
ON public.session_reviews 
FOR SELECT 
USING (reviewer_wallet = current_setting('request.jwt.claims', true)::json->>'sub' OR 
       reviewed_wallet = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can create reviews for their sessions" 
ON public.session_reviews 
FOR INSERT 
WITH CHECK (reviewer_wallet = current_setting('request.jwt.claims', true)::json->>'sub');

-- Add trigger for timestamp updates
CREATE TRIGGER update_session_reviews_updated_at
BEFORE UPDATE ON public.session_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_session_reviews_session_id ON public.session_reviews(session_id);
CREATE INDEX idx_session_reviews_reviewer ON public.session_reviews(reviewer_wallet);
CREATE INDEX idx_session_reviews_reviewed ON public.session_reviews(reviewed_wallet);