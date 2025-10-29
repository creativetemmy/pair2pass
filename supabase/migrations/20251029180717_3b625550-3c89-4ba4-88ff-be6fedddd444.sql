-- Remove foreign key constraint on notifications.user_id to allow NULL values
-- The app uses both Supabase auth (user_id) and wallet auth (user_wallet)
-- and needs to support notifications for wallet-only users

ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Add back the constraint but allowing NULL values
-- This way notifications can be created for wallet-only users
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE
NOT VALID;

-- Validate the constraint for existing rows
ALTER TABLE public.notifications 
VALIDATE CONSTRAINT notifications_user_id_fkey;