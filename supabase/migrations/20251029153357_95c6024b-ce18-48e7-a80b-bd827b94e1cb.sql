-- Fix match_requests foreign key constraints
-- The app uses wallet addresses, not user_id references to auth.users
-- Remove FK constraints that are causing issues

-- Drop existing foreign key constraints on match_requests
ALTER TABLE public.match_requests 
DROP CONSTRAINT IF EXISTS match_requests_requester_id_fkey;

ALTER TABLE public.match_requests 
DROP CONSTRAINT IF EXISTS match_requests_target_id_fkey;

-- Make requester_id and target_id nullable since we primarily use wallet addresses
-- These columns are already nullable according to schema, but let's ensure it
ALTER TABLE public.match_requests 
ALTER COLUMN requester_id DROP NOT NULL,
ALTER COLUMN target_id DROP NOT NULL;

-- Add indexes on wallet addresses for better query performance
CREATE INDEX IF NOT EXISTS idx_match_requests_requester_wallet 
ON public.match_requests(requester_wallet);

CREATE INDEX IF NOT EXISTS idx_match_requests_target_wallet 
ON public.match_requests(target_wallet);

-- Similarly, fix study_sessions foreign keys if they exist
ALTER TABLE public.study_sessions 
DROP CONSTRAINT IF EXISTS study_sessions_partner_1_user_id_fkey;

ALTER TABLE public.study_sessions 
DROP CONSTRAINT IF EXISTS study_sessions_partner_2_user_id_fkey;

-- Make partner user_ids nullable since we use wallet addresses
ALTER TABLE public.study_sessions 
ALTER COLUMN partner_1_user_id DROP NOT NULL,
ALTER COLUMN partner_2_user_id DROP NOT NULL;