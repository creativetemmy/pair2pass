-- Add preferred_study_times column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_study_times text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.preferred_study_times IS 'Array of preferred study time slots: Morning, Afternoon, Evening, Night';