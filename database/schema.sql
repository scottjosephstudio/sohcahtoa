-- Font Purchasing System Database Schema
-- Designed for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
-- Note: Custom configuration parameters are not allowed in hosted Supabase
-- We'll use a different approach for secure token generation

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Billing Information
    company_name TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    
    -- Address Information
    street_address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    country_code TEXT,
    
    -- Preferences
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    
    -- Email verification
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =============================================
-- FONTS & TYPEFACES
-- =============================================

-- Font families (e.g., "Soh Cah Toa")
CREATE TABLE public.font_families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    designer TEXT,
    foundry TEXT,
    release_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    
    -- Character sets available
    character_sets JSONB DEFAULT '{}',
    
    -- OpenType features
    opentype_features JSONB DEFAULT '[]',
    
    -- Preview settings
    preview_text TEXT DEFAULT 'The quick brown fox jumps over the lazy dog',
    
    CONSTRAINT font_families_slug_check CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Font styles/weights (e.g., "Display", "Regular", "Bold")
CREATE TABLE public.font_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    font_family_id UUID NOT NULL REFERENCES font_families(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Display", "Regular", "Bold", etc.
    slug TEXT NOT NULL,
    weight INTEGER, -- 100-900 (CSS font-weight values)
    style TEXT DEFAULT 'normal', -- 'normal', 'italic', 'oblique'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Font files
    font_files JSONB DEFAULT '{}', -- {"woff2": "path/to/file.woff2", "woff": "path/to/file.woff", "ttf": "path/to/file.ttf"}
    
    -- Metrics
    metrics JSONB DEFAULT '{}', -- Font metrics for rendering
    
    -- Glyph information
    glyph_count INTEGER DEFAULT 0,
    supported_languages JSONB DEFAULT '[]',
    
    UNIQUE(font_family_id, slug),
    CONSTRAINT font_styles_weight_check CHECK (weight >= 100 AND weight <= 900)
);

-- =============================================
-- LICENSING SYSTEM
-- =============================================

-- License types (Desktop, Web, App, Social Media)
CREATE TABLE public.license_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- "Desktop", "Web", "App", "Social Media"
    slug TEXT NOT NULL UNIQUE, -- "desktop", "web", "app", "social"
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License tiers (Small, Medium, Large)
CREATE TABLE public.license_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_type_id UUID NOT NULL REFERENCES license_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Small", "Medium", "Large"
    slug TEXT NOT NULL, -- "small", "medium", "large"
    price_cents INTEGER NOT NULL, -- Price in cents
    description TEXT,
    limitations JSONB DEFAULT '{}', -- Usage limitations
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(license_type_id, slug),
    CONSTRAINT license_tiers_price_check CHECK (price_cents >= 0)
);

-- Predefined license packages (Small, Medium, Large bundles)
CREATE TABLE public.license_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- "Small", "Medium", "Large"
    slug TEXT NOT NULL UNIQUE, -- "small", "medium", "large"
    price_cents INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT license_packages_price_check CHECK (price_cents >= 0)
);

-- Package contents (which license tiers are included in each package)
CREATE TABLE public.package_license_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES license_packages(id) ON DELETE CASCADE,
    license_tier_id UUID NOT NULL REFERENCES license_tiers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(package_id, license_tier_id)
);

-- =============================================
-- PURCHASES & ORDERS
-- =============================================

-- Purchase orders
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    
    -- Payment information
    stripe_payment_intent_id TEXT,
    payment_method TEXT, -- "card", "apple_pay", etc.
    payment_status TEXT DEFAULT 'pending', -- "pending", "completed", "failed", "refunded"
    
    -- Order totals
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    tax_cents INTEGER DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    -- Order status
    status TEXT DEFAULT 'pending', -- "pending", "processing", "completed", "cancelled", "refunded"
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Billing information (snapshot at time of purchase)
    billing_details JSONB DEFAULT '{}',
    
    -- Usage information
    usage_type TEXT, -- "personal", "commercial", etc.
    company_info JSONB DEFAULT '{}',
    
    CONSTRAINT purchase_orders_totals_check CHECK (
        subtotal_cents >= 0 AND 
        tax_cents >= 0 AND 
        total_cents >= 0 AND
        total_cents = subtotal_cents + tax_cents
    )
);

-- Individual purchase items (fonts + licenses)
CREATE TABLE public.purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    font_style_id UUID NOT NULL REFERENCES font_styles(id) ON DELETE CASCADE,
    
    -- License information
    license_type TEXT, -- "package" or "custom"
    license_package_id UUID REFERENCES license_packages(id),
    
    -- Custom license details (if license_type = "custom")
    custom_licenses JSONB DEFAULT '{}', -- Individual license tiers selected
    
    -- Pricing
    unit_price_cents INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price_cents INTEGER NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT purchase_items_pricing_check CHECK (
        unit_price_cents >= 0 AND 
        quantity > 0 AND
        total_price_cents = unit_price_cents * quantity
    )
);

-- =============================================
-- USER LICENSES & DOWNLOADS
-- =============================================

-- User's purchased licenses (what they own)
CREATE TABLE public.user_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purchase_item_id UUID NOT NULL REFERENCES purchase_items(id) ON DELETE CASCADE,
    font_style_id UUID NOT NULL REFERENCES font_styles(id) ON DELETE CASCADE,
    
    -- License details
    license_tiers JSONB NOT NULL DEFAULT '[]', -- Array of license tier IDs they own
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL for perpetual licenses
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, font_style_id, purchase_item_id)
);

-- Download history and tracking
CREATE TABLE public.font_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_license_id UUID NOT NULL REFERENCES user_licenses(id) ON DELETE CASCADE,
    font_style_id UUID NOT NULL REFERENCES font_styles(id) ON DELETE CASCADE,
    
    -- Download details
    file_format TEXT NOT NULL, -- "woff2", "woff", "ttf", "otf", "zip"
    file_size_bytes INTEGER,
    download_url TEXT, -- Temporary signed URL
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Security
    download_token TEXT UNIQUE, -- Unique token for secure downloads
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    
    CONSTRAINT font_downloads_file_format_check CHECK (
        file_format IN ('woff2', 'woff', 'ttf', 'otf', 'zip')
    )
);

-- =============================================
-- SLOT MACHINE & FONT SELECTION
-- =============================================

-- Font selection sessions (from slot machine)
CREATE TABLE public.font_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL, -- Browser session ID
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Selected font
    font_family_id UUID NOT NULL REFERENCES font_families(id) ON DELETE CASCADE,
    font_style_id UUID REFERENCES font_styles(id) ON DELETE CASCADE,
    
    -- Selection context
    selected_letter TEXT, -- The letter that was showing when selected
    selection_method TEXT DEFAULT 'slot_machine', -- "slot_machine", "direct_select", etc.
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Cart integration
    added_to_cart BOOLEAN DEFAULT FALSE,
    cart_added_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- SYSTEM TABLES
-- =============================================

-- System configuration
CREATE TABLE public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for important actions
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Font indexes
CREATE INDEX idx_font_families_slug ON font_families(slug);
CREATE INDEX idx_font_families_featured ON font_families(featured) WHERE featured = TRUE;
CREATE INDEX idx_font_styles_family_id ON font_styles(font_family_id);
CREATE INDEX idx_font_styles_slug ON font_styles(slug);

-- License indexes
CREATE INDEX idx_license_tiers_type_id ON license_tiers(license_type_id);
CREATE INDEX idx_package_license_tiers_package_id ON package_license_tiers(package_id);

-- Purchase indexes
CREATE INDEX idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at);
CREATE INDEX idx_purchase_items_order_id ON purchase_items(purchase_order_id);
CREATE INDEX idx_purchase_items_font_style_id ON purchase_items(font_style_id);

-- License and download indexes
CREATE INDEX idx_user_licenses_user_id ON user_licenses(user_id);
CREATE INDEX idx_user_licenses_font_style_id ON user_licenses(font_style_id);
CREATE INDEX idx_font_downloads_user_id ON font_downloads(user_id);
CREATE INDEX idx_font_downloads_downloaded_at ON font_downloads(downloaded_at);

-- Selection indexes
CREATE INDEX idx_font_selections_session_id ON font_selections(session_id);
CREATE INDEX idx_font_selections_user_id ON font_selections(user_id);
CREATE INDEX idx_font_selections_created_at ON font_selections(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE font_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE font_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_license_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE font_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE font_selections ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Service role can insert users (for API endpoints)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Font policies (public read access)
CREATE POLICY "Anyone can view active fonts" ON font_families
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active font styles" ON font_styles
    FOR SELECT USING (is_active = TRUE);

-- License policies (public read access)
CREATE POLICY "Anyone can view license types" ON license_types
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view license tiers" ON license_tiers
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view license packages" ON license_packages
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view package contents" ON package_license_tiers
    FOR SELECT USING (TRUE);

-- Purchase policies
CREATE POLICY "Users can view own purchases" ON purchase_orders
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create purchases" ON purchase_orders
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can view own purchase items" ON purchase_items
    FOR SELECT USING (
        purchase_order_id IN (
            SELECT id FROM purchase_orders 
            WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

-- License policies
CREATE POLICY "Users can view own licenses" ON user_licenses
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can view own downloads" ON font_downloads
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Selection policies
CREATE POLICY "Users can view own selections" ON font_selections
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR user_id IS NULL);

CREATE POLICY "Anyone can create selections" ON font_selections
    FOR INSERT WITH CHECK (TRUE);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_font_families_updated_at BEFORE UPDATE ON font_families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_font_styles_updated_at BEFORE UPDATE ON font_styles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_licenses_updated_at BEFORE UPDATE ON user_licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || LPAD(nextval('order_sequence')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for order numbers
CREATE SEQUENCE order_sequence START 1;

-- Apply order number trigger
CREATE TRIGGER generate_purchase_order_number BEFORE INSERT ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default license types
INSERT INTO license_types (name, slug, description) VALUES
('Desktop', 'desktop', 'For use in desktop applications and print materials'),
('Web', 'web', 'For use on websites and web applications'),
('App', 'app', 'For use in mobile and desktop applications'),
('Social Media', 'social', 'For use in social media posts and campaigns');

-- Insert license tiers for each type
INSERT INTO license_tiers (license_type_id, name, slug, price_cents, description, limitations) VALUES
-- Desktop licenses
((SELECT id FROM license_types WHERE slug = 'desktop'), 'Small', 'small', 6000, 'Small Desktop License', '{"users": "1-5", "locations": "1"}'),
((SELECT id FROM license_types WHERE slug = 'desktop'), 'Medium', 'medium', 12000, 'Medium Desktop License', '{"users": "6-15", "locations": "2"}'),
((SELECT id FROM license_types WHERE slug = 'desktop'), 'Large', 'large', 24000, 'Large Desktop License', '{"users": "16-30", "locations": "5"}'),

-- Web licenses
((SELECT id FROM license_types WHERE slug = 'web'), 'Small', 'small', 5000, 'Small Web License', '{"domains": "1", "monthly_visitors": "50000"}'),
((SELECT id FROM license_types WHERE slug = 'web'), 'Medium', 'medium', 10000, 'Medium Web License', '{"domains": "1", "monthly_visitors": "100000"}'),
((SELECT id FROM license_types WHERE slug = 'web'), 'Large', 'large', 20000, 'Large Web License', '{"domains": "1", "monthly_visitors": "500000"}'),

-- App licenses
((SELECT id FROM license_types WHERE slug = 'app'), 'Small', 'small', 5000, 'Small App License', '{"apps": "1", "downloads": "10000"}'),
((SELECT id FROM license_types WHERE slug = 'app'), 'Medium', 'medium', 10000, 'Medium App License', '{"apps": "1", "downloads": "50000"}'),
((SELECT id FROM license_types WHERE slug = 'app'), 'Large', 'large', 20000, 'Large App License', '{"apps": "1", "downloads": "200000"}'),

-- Social Media licenses
((SELECT id FROM license_types WHERE slug = 'social'), 'Small', 'small', 4000, 'Small Social Media License', '{"platforms": "all", "followers": "10000"}'),
((SELECT id FROM license_types WHERE slug = 'social'), 'Medium', 'medium', 8000, 'Medium Social Media License', '{"platforms": "all", "followers": "50000"}'),
((SELECT id FROM license_types WHERE slug = 'social'), 'Large', 'large', 16000, 'Large Social Media License', '{"platforms": "all", "followers": "100000"}');

-- Insert license packages
INSERT INTO license_packages (name, slug, price_cents, description) VALUES
('Small', 'small', 20000, 'Small package with basic licensing for all usage types'),
('Medium', 'medium', 40000, 'Medium package with expanded licensing for growing businesses'),
('Large', 'large', 80000, 'Large package with comprehensive licensing for enterprises');

-- Link packages to license tiers
INSERT INTO package_license_tiers (package_id, license_tier_id) VALUES
-- Small package
((SELECT id FROM license_packages WHERE slug = 'small'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'desktop') AND slug = 'small')),
((SELECT id FROM license_packages WHERE slug = 'small'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'web') AND slug = 'small')),
((SELECT id FROM license_packages WHERE slug = 'small'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'app') AND slug = 'small')),
((SELECT id FROM license_packages WHERE slug = 'small'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'social') AND slug = 'small')),

-- Medium package
((SELECT id FROM license_packages WHERE slug = 'medium'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'desktop') AND slug = 'medium')),
((SELECT id FROM license_packages WHERE slug = 'medium'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'web') AND slug = 'medium')),
((SELECT id FROM license_packages WHERE slug = 'medium'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'app') AND slug = 'medium')),
((SELECT id FROM license_packages WHERE slug = 'medium'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'social') AND slug = 'medium')),

-- Large package
((SELECT id FROM license_packages WHERE slug = 'large'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'desktop') AND slug = 'large')),
((SELECT id FROM license_packages WHERE slug = 'large'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'web') AND slug = 'large')),
((SELECT id FROM license_packages WHERE slug = 'large'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'app') AND slug = 'large')),
((SELECT id FROM license_packages WHERE slug = 'large'), (SELECT id FROM license_tiers WHERE license_type_id = (SELECT id FROM license_types WHERE slug = 'social') AND slug = 'large'));

-- Insert JANT font family
INSERT INTO font_families (name, slug, description, designer, foundry, release_date, featured, sort_order, character_sets, opentype_features, preview_text) VALUES
('JANT', 'jant', 'A modern typeface with distinctive character and versatility.', 'Scott Joseph', 'Scott Joseph Studio', '2024-01-01', true, 1, '{"latin": true, "extended_latin": true}', '["kern", "liga", "clig"]', 'The quick brown fox jumps over the lazy dog');

-- Insert JANT font style
INSERT INTO font_styles (font_family_id, name, slug, weight, style, font_files, metrics, glyph_count, supported_languages) VALUES
((SELECT id FROM font_families WHERE slug = 'jant'), 'Regular', 'regular', 400, 'normal', '{"otf": "/fonts/JANTReg.otf", "ttf": "/fonts/JANTReg.ttf", "woff": "/fonts/JANTReg.woff", "woff2": "/fonts/JANTReg.woff2"}', '{"units_per_em": 1000, "ascender": 800, "descender": -200, "line_gap": 0, "cap_height": 700, "x_height": 500}', 256, '["en", "es", "fr", "de", "it", "pt", "nl", "da", "sv", "no"]');

-- Insert system configuration
INSERT INTO system_config (key, value, description) VALUES
('stripe_webhook_secret', '""', 'Stripe webhook endpoint secret'),
('font_download_expiry_hours', '24', 'Hours until download links expire'),
('max_downloads_per_license', '1', 'Maximum downloads per license'),
('enable_font_previews', 'true', 'Enable font preview functionality'); 