-- Add missing email verification columns to users table
-- Run these commands in the Supabase SQL Editor

-- Add email_verified column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add email_verification_token column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;

-- Add email_verification_sent_at column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE;

-- Add email_verified_at column (for when verification is completed)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

-- Update existing users to have email_verified = true (since they're already registered)
UPDATE public.users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = FALSE;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public' 
AND column_name LIKE '%email%'
ORDER BY column_name; 