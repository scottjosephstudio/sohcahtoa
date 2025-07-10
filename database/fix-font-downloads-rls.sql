-- =============================================
-- FIX FONT DOWNLOADS RLS POLICIES
-- =============================================
-- This migration adds the necessary RLS policies to allow
-- the service role to create download tokens during purchase processing

-- Add INSERT policy for font_downloads to allow service role to create download tokens
CREATE POLICY "Service can create download tokens" ON font_downloads
    FOR INSERT WITH CHECK (TRUE);

-- Add INSERT policy for purchase_orders to allow service role to create orders
CREATE POLICY "Service can create purchase orders" ON purchase_orders
    FOR INSERT WITH CHECK (TRUE);

-- Add INSERT policy for purchase_items to allow service role to create items
CREATE POLICY "Service can create purchase items" ON purchase_items
    FOR INSERT WITH CHECK (TRUE);

-- Add INSERT policy for user_licenses to allow service role to create licenses
CREATE POLICY "Service can create user licenses" ON user_licenses
    FOR INSERT WITH CHECK (TRUE);

-- Add UPDATE policy for font_downloads to allow updating download info
CREATE POLICY "Service can update download info" ON font_downloads
    FOR UPDATE USING (TRUE);

-- Add UPDATE policy for purchase_orders to allow updating order status
CREATE POLICY "Service can update purchase orders" ON purchase_orders
    FOR UPDATE USING (TRUE);

-- Add UPDATE policy for user_licenses to allow updating license info
CREATE POLICY "Service can update user licenses" ON user_licenses
    FOR UPDATE USING (TRUE);

-- Also add INSERT policy for users to allow service role to create users during purchase
CREATE POLICY "Service can create users" ON users
    FOR INSERT WITH CHECK (TRUE);

-- Add UPDATE policy for users to allow service role to update user info
CREATE POLICY "Service can update users" ON users
    FOR UPDATE USING (TRUE);

-- Grant necessary permissions to the service role
-- Note: These permissions should already exist but adding them for completeness
GRANT SELECT, INSERT, UPDATE ON font_downloads TO service_role;
GRANT SELECT, INSERT, UPDATE ON purchase_orders TO service_role;
GRANT SELECT, INSERT, UPDATE ON purchase_items TO service_role;
GRANT SELECT, INSERT, UPDATE ON user_licenses TO service_role;
GRANT SELECT, INSERT, UPDATE ON users TO service_role;
GRANT SELECT ON font_families TO service_role;
GRANT SELECT ON font_styles TO service_role;
GRANT SELECT ON license_packages TO service_role;
GRANT SELECT ON license_tiers TO service_role;
GRANT SELECT ON license_types TO service_role; 