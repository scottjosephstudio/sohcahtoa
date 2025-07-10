-- Migration Script: Update to Current Schema
-- This script safely updates your existing database without losing data

-- First, let's see what tables exist and update them incrementally

-- 1. Update font_families table (if it exists, add missing columns)
DO $$ 
BEGIN
    -- Add designer column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_families' AND column_name = 'designer') THEN
        ALTER TABLE font_families ADD COLUMN designer TEXT;
    END IF;
    
    -- Add foundry column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_families' AND column_name = 'foundry') THEN
        ALTER TABLE font_families ADD COLUMN foundry TEXT;
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_families' AND column_name = 'release_date') THEN
        ALTER TABLE font_families ADD COLUMN release_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_families' AND column_name = 'featured') THEN
        ALTER TABLE font_families ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_families' AND column_name = 'sort_order') THEN
        ALTER TABLE font_families ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_families' AND column_name = 'character_sets') THEN
        ALTER TABLE font_families ADD COLUMN character_sets JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_families' AND column_name = 'opentype_features') THEN
        ALTER TABLE font_families ADD COLUMN opentype_features JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_families' AND column_name = 'preview_text') THEN
        ALTER TABLE font_families ADD COLUMN preview_text TEXT DEFAULT 'The quick brown fox jumps over the lazy dog';
    END IF;
END $$;

-- 2. Update font_styles table (add missing columns)
DO $$ 
BEGIN
    -- Add font_files column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_styles' AND column_name = 'font_files') THEN
        ALTER TABLE font_styles ADD COLUMN font_files JSONB DEFAULT '{}';
    END IF;
    
    -- Add metrics column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_styles' AND column_name = 'metrics') THEN
        ALTER TABLE font_styles ADD COLUMN metrics JSONB DEFAULT '{}';
    END IF;
    
    -- Add glyph_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_styles' AND column_name = 'glyph_count') THEN
        ALTER TABLE font_styles ADD COLUMN glyph_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add supported_languages column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_styles' AND column_name = 'supported_languages') THEN
        ALTER TABLE font_styles ADD COLUMN supported_languages JSONB DEFAULT '[]';
    END IF;
    
    -- Add price_cents column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'font_styles' AND column_name = 'price_cents') THEN
        ALTER TABLE font_styles ADD COLUMN price_cents INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Create new tables that don't exist yet
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    company_name TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    street_address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    country_code TEXT,
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS public.license_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.license_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_type_id UUID NOT NULL REFERENCES license_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    description TEXT,
    limitations JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(license_type_id, slug),
    CONSTRAINT license_tiers_price_check CHECK (price_cents >= 0)
);

CREATE TABLE IF NOT EXISTS public.license_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    price_cents INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT license_packages_price_check CHECK (price_cents >= 0)
);

CREATE TABLE IF NOT EXISTS public.package_license_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES license_packages(id) ON DELETE CASCADE,
    license_tier_id UUID NOT NULL REFERENCES license_tiers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_id, license_tier_id)
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    stripe_payment_intent_id TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    tax_cents INTEGER DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    billing_details JSONB DEFAULT '{}',
    usage_type TEXT,
    company_info JSONB DEFAULT '{}',
    CONSTRAINT purchase_orders_totals_check CHECK (
        subtotal_cents >= 0 AND 
        tax_cents >= 0 AND 
        total_cents >= 0
    )
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    font_style_id UUID NOT NULL REFERENCES font_styles(id) ON DELETE CASCADE,
    license_tier_id UUID REFERENCES license_tiers(id),
    license_package_id UUID REFERENCES license_packages(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL,
    total_price_cents INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT purchase_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT purchase_items_price_check CHECK (unit_price_cents >= 0 AND total_price_cents >= 0)
);

CREATE TABLE IF NOT EXISTS public.user_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    font_style_id UUID NOT NULL REFERENCES font_styles(id) ON DELETE CASCADE,
    license_tier_id UUID REFERENCES license_tiers(id),
    license_package_id UUID REFERENCES license_packages(id),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    download_limit INTEGER,
    downloads_used INTEGER DEFAULT 0,
    UNIQUE(user_id, font_style_id, license_tier_id)
);

CREATE TABLE IF NOT EXISTS public.font_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    font_style_id UUID NOT NULL REFERENCES font_styles(id) ON DELETE CASCADE,
    user_license_id UUID REFERENCES user_licenses(id),
    file_format TEXT NOT NULL,
    download_token TEXT UNIQUE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 4. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_font_families_slug ON font_families(slug);
CREATE INDEX IF NOT EXISTS idx_font_families_featured ON font_families(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_font_styles_family_id ON font_styles(font_family_id);
CREATE INDEX IF NOT EXISTS idx_font_styles_slug ON font_styles(slug);

-- 5. Create functions and triggers if they don't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (DROP IF EXISTS first to avoid conflicts)
DROP TRIGGER IF EXISTS update_font_families_updated_at ON font_families;
CREATE TRIGGER update_font_families_updated_at 
    BEFORE UPDATE ON font_families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_font_styles_updated_at ON font_styles;
CREATE TRIGGER update_font_styles_updated_at 
    BEFORE UPDATE ON font_styles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Update existing data to match new structure
-- Update Soh Cah Toa font with proper designer info if it exists
UPDATE font_families 
SET designer = 'Scott Joseph' 
WHERE name = 'Soh Cah Toa' AND designer IS NULL;

-- Add price to existing font styles if they don't have it
UPDATE font_styles 
SET price_cents = 5000 
WHERE price_cents = 0 OR price_cents IS NULL;

-- Success message
SELECT 'Migration completed successfully! Your database schema is now up to date.' as result; 