-- Add hasPassport field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_passport boolean DEFAULT false;