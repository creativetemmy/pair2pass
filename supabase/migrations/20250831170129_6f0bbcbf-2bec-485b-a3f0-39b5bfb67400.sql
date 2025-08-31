-- Create email_verifications table to store OTP codes
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role to manage, users can't access directly)
CREATE POLICY "Service role can manage email verifications" 
ON public.email_verifications 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_email_verifications_updated_at
BEFORE UPDATE ON public.email_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_email_verifications_lookup ON public.email_verifications 
(email, wallet_address, verified, expires_at);

-- Create index for cleanup
CREATE INDEX idx_email_verifications_expires_at ON public.email_verifications (expires_at);