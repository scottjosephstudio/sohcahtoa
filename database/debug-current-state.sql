-- =============================================
-- DEBUG CURRENT STATE
-- =============================================

-- 1. Check ALL users in the database
SELECT 
    id,
    email,
    auth_user_id,
    first_name,
    last_name,
    email_verified,
    is_active,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 2. Check specifically for your email
SELECT 
    id,
    email,
    auth_user_id,
    first_name,
    last_name,
    email_verified,
    is_active,
    created_at
FROM users 
WHERE email ILIKE '%studioscottjoseph%'
   OR email ILIKE '%scott%'
   OR first_name ILIKE '%scott%';

-- 3. Check for any users with NULL auth_user_id
SELECT 
    id,
    email,
    auth_user_id,
    first_name,
    last_name,
    created_at
FROM users 
WHERE auth_user_id IS NULL;

-- 4. Check the users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 