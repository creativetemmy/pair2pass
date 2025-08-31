-- Drop the custom email_verifications table since we're switching to Supabase built-in auth
DROP TABLE IF EXISTS public.email_verifications;