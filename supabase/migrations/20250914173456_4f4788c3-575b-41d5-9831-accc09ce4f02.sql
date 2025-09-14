-- Create email_verifications table for storing OTP codes
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  otp TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies - only allow operations through edge functions
CREATE POLICY "Service role can manage email verifications"
ON public.email_verifications
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_email_verifications_email_wallet ON public.email_verifications(email, wallet_address);
CREATE INDEX idx_email_verifications_expires_at ON public.email_verifications(expires_at);

-- Create trigger for updated_at
CREATE TRIGGER update_email_verifications_updated_at
BEFORE UPDATE ON public.email_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();