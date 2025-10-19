-- Clean up stuck sessions and add auto-expiration
-- This fixes sessions that were abandoned and never properly completed

-- First add 'ongoing' to valid status values
ALTER TABLE study_sessions 
DROP CONSTRAINT IF EXISTS study_sessions_status_check;

ALTER TABLE study_sessions 
ADD CONSTRAINT study_sessions_status_check 
CHECK (status = ANY (ARRAY['waiting'::text, 'active'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text]));

-- Update all stuck sessions older than 2 hours to 'cancelled'
UPDATE study_sessions
SET 
  status = 'cancelled',
  updated_at = now()
WHERE 
  status IN ('waiting', 'active', 'ongoing')
  AND created_at < now() - interval '2 hours';

-- Create function to auto-expire abandoned sessions
CREATE OR REPLACE FUNCTION auto_expire_abandoned_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cancel sessions stuck in 'waiting' for more than 2 hours
  UPDATE study_sessions
  SET status = 'cancelled', updated_at = now()
  WHERE status = 'waiting' 
    AND created_at < now() - interval '2 hours';
  
  -- Cancel sessions stuck in 'active' for more than 6 hours
  UPDATE study_sessions
  SET status = 'cancelled', updated_at = now()
  WHERE status = 'active'
    AND created_at < now() - interval '6 hours';
    
  -- Cancel sessions stuck in 'ongoing' for more than 12 hours  
  UPDATE study_sessions
  SET status = 'cancelled', updated_at = now()
  WHERE status = 'ongoing'
    AND created_at < now() - interval '12 hours';
END;
$$;