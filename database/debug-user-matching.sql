-- =============================================
-- DEBUG USER MATCHING ISSUE
-- =============================================

-- 1. Check your existing user record
SELECT 
    id,
    email,
    auth_user_id,
    first_name,
    last_name,
    created_at
FROM users 
WHERE email = 'studioscottjoseph@gmail.com';

-- 2. The auth_user_id field might be NULL or incorrect
-- You need to get your actual Supabase Auth User ID from the Auth dashboard

-- 3. To fix this, you need to:
-- a) Go to Supabase Dashboard → Authentication → Users
-- b) Find studioscottjoseph@gmail.com and copy the User ID (UUID)
-- c) Update the query below with your actual auth user ID

-- 4. Update your user record with the correct auth_user_id
-- REPLACE 'YOUR_ACTUAL_AUTH_USER_ID' with the UUID from step 3

-- UPDATE users 
-- SET auth_user_id = 'YOUR_ACTUAL_AUTH_USER_ID'
-- WHERE email = 'studioscottjoseph@gmail.com';

-- 5. Verify the update worked
SELECT 
    id,
    email,
    auth_user_id,
    first_name,
    last_name,
    created_at
FROM users 
WHERE email = 'studioscottjoseph@gmail.com';

-- 6. Alternative: If you want to test with a fresh setup
-- You can delete your current user and re-register:

-- DELETE FROM users WHERE email = 'studioscottjoseph@gmail.com';

-- Then go to your app and register again - the new registration process
-- will automatically create the correct user record with the right auth_user_id 