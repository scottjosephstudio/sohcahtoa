import { getSupabaseClient } from './supabaseClient';

/**
 * Get pricing for a specific font and license type
 * @param {string} fontFamilyId - Font family UUID
 * @param {string} licenseType - License type (e.g., 'package_small', 'print_medium')
 * @returns {Promise<number>} Price in cents
 */
export async function getFontPrice(fontFamilyId, licenseType) {
  try {
    const { data, error } = await supabase
      .from('font_pricing')
      .select('price_cents')
      .eq('font_family_id', fontFamilyId)
      .eq('license_type', licenseType)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching font price:', error);
      return 0;
    }

    return data?.price_cents || 0;
  } catch (error) {
    console.error('Error in getFontPrice:', error);
    return 0;
  }
}

/**
 * Get all pricing for a font family
 * @param {string} fontFamilyId - Font family UUID
 * @returns {Promise<Object>} Pricing data organized by license type
 */
export async function getFontPricing(fontFamilyId) {
  try {
    const { data, error } = await supabase
      .from('font_pricing')
      .select('*')
      .eq('font_family_id', fontFamilyId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching font pricing:', error);
      return {};
    }

    // Organize pricing by license type
    const pricing = {};
    data.forEach(item => {
      pricing[item.license_type] = item.price_cents;
    });

    return pricing;
  } catch (error) {
    console.error('Error in getFontPricing:', error);
    return {};
  }
}

/**
 * Get font family with pricing information
 * @param {string} fontFamilyId - Font family UUID
 * @returns {Promise<Object>} Font family with pricing data
 */
export async function getFontWithPricing(fontFamilyId) {
  try {
    const { data, error } = await supabase
      .from('font_families')
      .select(`
        *,
        font_styles (
          *
        )
      `)
      .eq('id', fontFamilyId)
      .single();

    if (error) {
      console.error('Error fetching font with pricing:', error);
      return null;
    }

    // Get pricing data
    const pricing = await getFontPricing(fontFamilyId);

    return {
      ...data,
      pricing
    };
  } catch (error) {
    console.error('Error in getFontWithPricing:', error);
    return null;
  }
}

/**
 * Calculate multi-font pricing with database prices
 * @param {Array} selectedFonts - Array of font objects with IDs
 * @param {Object} selectedStyles - Object mapping font IDs to selected styles
 * @param {string} licenseType - 'package' or 'custom'
 * @param {string} packageType - 'small', 'medium', 'large' (for package licensing)
 * @param {Object} customLicenses - Custom license selections (for custom licensing)
 * @returns {Promise<Object>} Pricing breakdown
 */
export async function calculateDatabasePricing(
  selectedFonts = [],
  selectedStyles = {},
  licenseType = 'package',
  packageType = 'small',
  customLicenses = {}
) {
  if (!selectedFonts || selectedFonts.length === 0) {
    return {
      fonts: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      discountPercentage: 0,
      fontCount: 0
    };
  }

  try {
    const fontBreakdowns = await Promise.all(
      selectedFonts.map(async (font) => {
        const styles = selectedStyles[font.id] || [font.font_styles?.[0]];
        let totalFontPrice = 0;

        if (licenseType === 'package') {
          // Package pricing - get package price for this font
          const packagePrice = await getFontPrice(font.id, `package_${packageType}`);
          totalFontPrice = packagePrice;
        } else {
          // Custom licensing - sum up individual license prices
          const licensePromises = Object.entries(customLicenses)
            .filter(([key, value]) => value && key.includes('License'))
            .map(async ([licenseKey, licenseValue]) => {
              const licenseTypeKey = licenseKey.replace('custom', '').replace('License', '').toLowerCase();
              const dbLicenseType = `${licenseTypeKey}_${licenseValue}`;
              return await getFontPrice(font.id, dbLicenseType);
            });

          const licensePrices = await Promise.all(licensePromises);
          totalFontPrice = licensePrices.reduce((sum, price) => sum + price, 0);
        }

        // Apply style multipliers
        const styleMultiplier = styles.reduce((multiplier, style) => {
          // Get style multiplier from database or default to 1.0
          return multiplier * (style.style_price_multiplier || 1.0);
        }, 1.0);

        const finalPrice = Math.round(totalFontPrice * styleMultiplier);

        return {
          font,
          styles: styles.map(s => s.name),
          basePrice: totalFontPrice,
          styleMultiplier,
          totalPrice: finalPrice
        };
      })
    );

    // Calculate totals
    const subtotal = fontBreakdowns.reduce((sum, breakdown) => sum + breakdown.totalPrice, 0);
    
    // Apply multi-font discount
    const fontCount = selectedFonts.length;
    const discountMultipliers = {
      1: 1.0,    // No discount
      2: 0.9,    // 10% discount
      3: 0.8,    // 20% discount
      4: 0.75,   // 25% discount
      5: 0.7     // 30% discount
    };
    
    const discountMultiplier = discountMultipliers[fontCount] || discountMultipliers[5];
    const discountPercentage = Math.round((1 - discountMultiplier) * 100);
    
    const total = Math.round(subtotal * discountMultiplier);
    const discount = subtotal - total;

    return {
      fonts: fontBreakdowns,
      subtotal,
      discount,
      total,
      discountPercentage,
      fontCount
    };
  } catch (error) {
    console.error('Error calculating database pricing:', error);
    return {
      fonts: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      discountPercentage: 0,
      fontCount: 0
    };
  }
}

/**
 * Update font pricing in database
 * @param {string} fontFamilyId - Font family UUID
 * @param {string} licenseType - License type
 * @param {number} priceCents - Price in cents
 * @returns {Promise<boolean>} Success status
 */
export async function updateFontPrice(fontFamilyId, licenseType, priceCents) {
  try {
    const { error } = await supabase
      .from('font_pricing')
      .upsert({
        font_family_id: fontFamilyId,
        license_type: licenseType,
        price_cents: priceCents,
        is_active: true
      }, {
        onConflict: 'font_family_id,license_type'
      });

    if (error) {
      console.error('Error updating font price:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateFontPrice:', error);
    return false;
  }
}

/**
 * Get pricing for all fonts (for admin/management purposes)
 * @returns {Promise<Array>} All font pricing data
 */
export async function getAllFontPricing() {
  try {
    const { data, error } = await supabase
      .from('font_families')
      .select(`
        *,
        font_styles (*),
        font_pricing (*)
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching all font pricing:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getAllFontPricing:', error);
    return [];
  }
} 