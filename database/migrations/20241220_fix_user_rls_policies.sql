-- Fix missing RLS policies for user insertion
-- This migration adds the necessary RLS policies to allow user creation

-- Add policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Add policy for service role to insert users (for API endpoints)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role'); 