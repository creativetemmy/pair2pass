-- Drop the existing check constraint
ALTER TABLE public.study_sessions DROP CONSTRAINT study_sessions_status_check;

-- Add the updated check constraint that includes 'cancelled' status
ALTER TABLE public.study_sessions 
ADD CONSTRAINT study_sessions_status_check 
CHECK (status = ANY (ARRAY['waiting'::text, 'active'::text, 'completed'::text, 'cancelled'::text]));