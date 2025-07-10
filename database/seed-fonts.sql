-- =============================================
-- FONT DATABASE SEEDING SCRIPT
-- =============================================

-- Insert font families
INSERT INTO font_families (id, name, slug, designer, foundry, release_date, description, is_active, featured) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Jant', 'jant', 'Scott Joseph', 'Scott Joseph Studio', '2024-01-01', 'A modern sans-serif typeface designed for digital and print applications.', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'Soh-Cah-Toa', 'soh-cah-toa', 'Scott Joseph', 'Scott Joseph Studio', '2024-01-01', 'A display typeface inspired by mathematical concepts.', true, true);

-- Insert font styles
INSERT INTO font_styles (id, font_family_id, name, slug, weight, style, is_active, font_files) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Regular', 'regular', 400, 'normal', true, '{"otf": "/fonts/JANTReg.otf", "woff": "/fonts/JANTReg.woff", "ttf": "/fonts/JANTReg.ttf"}'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Bold', 'bold', 700, 'normal', true, '{"otf": "/fonts/JANTBold.otf", "woff": "/fonts/JANTBold.woff", "ttf": "/fonts/JANTBold.ttf"}'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Italic', 'italic', 400, 'italic', true, '{"otf": "/fonts/JANTItalic.otf", "woff": "/fonts/JANTItalic.woff", "ttf": "/fonts/JANTItalic.ttf"}'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Display', 'display', 400, 'normal', true, '{"otf": "/fonts/SohCahToa.otf", "woff": "/fonts/SohCahToa.woff", "ttf": "/fonts/SohCahToa.ttf"}');

-- Insert license types
INSERT INTO license_types (id, name, slug, description, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Print', 'print', 'License for print publications', true),
('770e8400-e29b-41d4-a716-446655440002', 'Web', 'web', 'License for web usage', true),
('770e8400-e29b-41d4-a716-446655440003', 'App', 'app', 'License for mobile and desktop applications', true),
('770e8400-e29b-41d4-a716-446655440004', 'Social', 'social', 'License for social media usage', true);

-- Insert license tiers
INSERT INTO license_tiers (id, license_type_id, name, slug, description, price_cents, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Print Basic', 'print-basic', 'Basic print license for small publications', 1500, true),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Web Basic', 'web-basic', 'Basic web license for websites', 2000, true),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'App Basic', 'app-basic', 'Basic app license for applications', 2500, true),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Social Basic', 'social-basic', 'Basic social media license', 1000, true);

-- Insert license packages
INSERT INTO license_packages (id, name, slug, description, price_cents, is_active) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Small', 'small', 'Small package with basic licensing', 3000, true),
('990e8400-e29b-41d4-a716-446655440002', 'Medium', 'medium', 'Medium package with extended licensing', 5000, true),
('990e8400-e29b-41d4-a716-446655440003', 'Large', 'large', 'Large package with full licensing', 8000, true);

-- Insert package license tier mappings
INSERT INTO package_license_tiers (package_id, license_tier_id) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001'), -- Small: Print
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002'), -- Small: Web
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001'), -- Medium: Print
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002'), -- Medium: Web
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003'), -- Medium: App
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001'), -- Large: Print
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002'), -- Large: Web
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003'), -- Large: App
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440004'); -- Large: Social

-- Insert system configuration
INSERT INTO system_config (key, value, description) VALUES
('email_verification_enabled', 'true', 'Whether email verification is required for new accounts'),
('download_token_expiry_hours', '24', 'Number of hours before download tokens expire'),
('max_downloads_per_hour', '50', 'Maximum downloads per user per hour'); 