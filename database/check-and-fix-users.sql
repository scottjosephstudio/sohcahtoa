-- =============================================
-- USER DATA VERIFICATION AND FIX
-- =============================================

-- 1. Check existing users in the users table
SELECT 
    id,
    email,
    auth_user_id,
    first_name,
    last_name,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. If you see your user above, great! If not, you need to create a user record.
-- Replace 'YOUR_EMAIL_HERE' with your actual email (studioscottjoseph@gmail.com)
-- Replace 'YOUR_AUTH_ID_HERE' with your Supabase auth user ID

-- To find your auth user ID, go to Supabase Auth dashboard and copy the user ID

-- 3. Insert your user record (ONLY run this if your user doesn't exist above)
-- UNCOMMENT and MODIFY the line below:

-- INSERT INTO users (auth_user_id, email, first_name, last_name, email_verified, is_active)
-- VALUES ('YOUR_AUTH_ID_HERE', 'studioscottjoseph@gmail.com', 'Scott', 'Joseph', true, true);

-- 4. Verify the user was created
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
WHERE email = 'studioscottjoseph@gmail.com';

-- 5. Check if you have any purchase data
SELECT 
    po.id,
    po.order_number,
    po.total_cents,
    po.status,
    po.created_at,
    u.email
FROM purchase_orders po
JOIN users u ON po.user_id = u.id
WHERE u.email = 'studioscottjoseph@gmail.com'
ORDER BY po.created_at DESC;

-- 6. Check if you have any licenses
SELECT 
    ul.id,
    ul.created_at,
    fs.name as font_style_name,
    ff.name as font_family_name,
    u.email
FROM user_licenses ul
JOIN users u ON ul.user_id = u.id
JOIN font_styles fs ON ul.font_style_id = fs.id
JOIN font_families ff ON fs.font_family_id = ff.id
WHERE u.email = 'studioscottjoseph@gmail.com'
ORDER BY ul.created_at DESC; 