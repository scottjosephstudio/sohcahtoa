-- Migration: Add per-font pricing support
-- This migration adds pricing information to font families and styles
-- to support different pricing per font rather than global pricing

BEGIN;

-- Add pricing columns to font_families table
ALTER TABLE font_families 
ADD COLUMN base_price_cents INTEGER DEFAULT 10000, -- Default $100.00
ADD COLUMN pricing_tier TEXT DEFAULT 'standard', -- 'standard', 'premium', 'exclusive'
ADD COLUMN pricing_notes TEXT;

-- Add pricing multipliers to font_styles table
ALTER TABLE font_styles 
ADD COLUMN style_price_multiplier DECIMAL(3,2) DEFAULT 1.00; -- e.g., 1.00 for regular, 1.20 for bold

-- Create font_pricing table for more complex pricing rules
CREATE TABLE font_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    font_family_id UUID NOT NULL REFERENCES font_families(id) ON DELETE CASCADE,
    font_style_id UUID REFERENCES font_styles(id) ON DELETE CASCADE,
    license_type TEXT NOT NULL, -- 'package_small', 'package_medium', 'package_large', 'print_small', etc.
    price_cents INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(font_family_id, font_style_id, license_type),
    CONSTRAINT font_pricing_price_check CHECK (price_cents >= 0),
    CONSTRAINT font_pricing_license_type_check CHECK (
        license_type IN (
            'package_small', 'package_medium', 'package_large',
            'print_small', 'print_medium', 'print_large',
            'web_small', 'web_medium', 'web_large',
            'app_small', 'app_medium', 'app_large',
            'social_small', 'social_medium', 'social_large'
        )
    )
);

-- Create index for font_pricing lookups
CREATE INDEX idx_font_pricing_family_id ON font_pricing(font_family_id);
CREATE INDEX idx_font_pricing_style_id ON font_pricing(font_style_id);
CREATE INDEX idx_font_pricing_license_type ON font_pricing(license_type);

-- Add trigger for font_pricing updated_at
CREATE TRIGGER update_font_pricing_updated_at 
    BEFORE UPDATE ON font_pricing
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample pricing for JANT font
-- First, get the JANT font family ID
DO $$
DECLARE
    jant_family_id UUID;
    jant_regular_style_id UUID;
    jant_display_style_id UUID;
BEGIN
    -- Get JANT font family ID
    SELECT id INTO jant_family_id FROM font_families WHERE slug = 'jant';
    
    IF jant_family_id IS NOT NULL THEN
        -- Update JANT base pricing
        UPDATE font_families 
        SET base_price_cents = 10000, -- $100.00
            pricing_tier = 'standard',
            pricing_notes = 'Introductory pricing for JANT typeface'
        WHERE id = jant_family_id;
        
        -- Get style IDs
        SELECT id INTO jant_regular_style_id FROM font_styles 
        WHERE font_family_id = jant_family_id AND name = 'Regular';
        
        SELECT id INTO jant_display_style_id FROM font_styles 
        WHERE font_family_id = jant_family_id AND name = 'Display';
        
        -- Update style multipliers
        IF jant_regular_style_id IS NOT NULL THEN
            UPDATE font_styles 
            SET style_price_multiplier = 1.00 
            WHERE id = jant_regular_style_id;
        END IF;
        
        IF jant_display_style_id IS NOT NULL THEN
            UPDATE font_styles 
            SET style_price_multiplier = 1.30 
            WHERE id = jant_display_style_id;
        END IF;
        
        -- Insert package pricing for JANT
        INSERT INTO font_pricing (font_family_id, license_type, price_cents) VALUES
        (jant_family_id, 'package_small', 20000),   -- $200.00
        (jant_family_id, 'package_medium', 40000),  -- $400.00
        (jant_family_id, 'package_large', 80000);   -- $800.00
        
        -- Insert individual license pricing for JANT
        INSERT INTO font_pricing (font_family_id, license_type, price_cents) VALUES
        (jant_family_id, 'print_small', 6000),    -- $60.00
        (jant_family_id, 'print_medium', 12000),  -- $120.00
        (jant_family_id, 'print_large', 24000),   -- $240.00
        (jant_family_id, 'web_small', 5000),      -- $50.00
        (jant_family_id, 'web_medium', 10000),    -- $100.00
        (jant_family_id, 'web_large', 20000),     -- $200.00
        (jant_family_id, 'app_small', 5000),      -- $50.00
        (jant_family_id, 'app_medium', 10000),    -- $100.00
        (jant_family_id, 'app_large', 20000),     -- $200.00
        (jant_family_id, 'social_small', 4000),   -- $40.00
        (jant_family_id, 'social_medium', 8000),  -- $80.00
        (jant_family_id, 'social_large', 16000);  -- $160.00
    END IF;
END $$;

-- Add comment to document the migration
COMMENT ON TABLE font_pricing IS 'Per-font pricing table supporting different prices for different fonts and license types';

COMMIT;

-- Rollback script (run separately if needed to undo this migration):
/*
BEGIN;

DROP TABLE IF EXISTS font_pricing;
ALTER TABLE font_families DROP COLUMN IF EXISTS base_price_cents;
ALTER TABLE font_families DROP COLUMN IF EXISTS pricing_tier;
ALTER TABLE font_families DROP COLUMN IF EXISTS pricing_notes;
ALTER TABLE font_styles DROP COLUMN IF EXISTS style_price_multiplier;

COMMIT;
*/ 