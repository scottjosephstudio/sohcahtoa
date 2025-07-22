// src/components/cart/constants.js

export const LICENSE_TYPES = {
  print: { displayName: "Desktop", optionsKey: "print" },
  web: { displayName: "Web", optionsKey: "web" },
  app: { displayName: "App", optionsKey: "app" },
  social: { displayName: "Social Media", optionsKey: "social" },
};

// DEPRECATED: Legacy font pricing - kept for backward compatibility
// New pricing should come from database via pricingService.js
export const FONT_BASE_PRICES = {
  // JANT pricing (fallback if database is unavailable)
  'jant': {
    basePrice: 100, // Base price for JANT
    styleMultipliers: {
      'Regular': 1.0,
      'Bold': 1.2,
      'Italic': 1.1,
      'Display': 1.3,
    }
  }
};

// Multi-font discount tiers
export const MULTI_FONT_DISCOUNTS = {
  1: 1.0,    // No discount for 1 font
  2: 0.9,    // 10% discount on total when buying 2 fonts
  3: 0.8,    // 20% discount on total when buying 3 fonts
  4: 0.75,   // 25% discount on total when buying 4+ fonts
  5: 0.7,    // 30% discount on total when buying 5+ fonts
};

// DEPRECATED: Legacy package pricing - now handled by database
// Package pricing multipliers for fallback
export const packages = {
  small: {
    priceMultiplier: 2.0, // 2x the base font price
    price: 200, // Fallback price in dollars
    print: "(1-5 users, maximum 1 location)",
    web: "(1 domain, maximum 50k monthly visitors)",
    app: "(1 app, maximum 10k downloads)",
    social: "(maximum 10k followers)",
  },
  medium: {
    priceMultiplier: 4.0, // 4x the base font price
    price: 400, // Fallback price in dollars
    print: "(6–15 users, maximum 2 locations)",
    web: "(1 domain, maximum 100k monthly visitors)",
    app: "(1 app, maximum 50k downloads)",
    social: "(maximum 50k followers)",
  },
  large: {
    priceMultiplier: 8.0, // 8x the base font price
    price: 800, // Fallback price in dollars
    print: "(16–30 users, maximum 5 locations)",
    web: "(1 domain, maximum 500k monthly visitors)",
    app: "(1 app, maximum 200k downloads)",
    social: "(maximum 100k followers)",
  },
};

// DEPRECATED: Legacy individual license pricing - now handled by database
// Individual license pricing multipliers for fallback
export const licenseOptions = {
  print: {
    small: {
      name: "Small",
      limit: "(1-5 users, maximum 1 location)",
      price: 60, // Fallback price in dollars
      priceMultiplier: 0.6, // 60% of base font price
    },
    medium: {
      name: "Medium",
      limit: "(6–15 users, maximum 2 locations)",
      price: 120, // Fallback price in dollars
      priceMultiplier: 1.2, // 120% of base font price
    },
    large: {
      name: "Large",
      limit: "(15–30 users, maximum 5 locations)",
      price: 240, // Fallback price in dollars
      priceMultiplier: 2.4, // 240% of base font price
    },
  },
  web: {
    small: {
      name: "Small",
      limit: "(1 domain, maximum 50k monthly visitors)",
      price: 50, // Fallback price in dollars
      priceMultiplier: 0.5, // 50% of base font price
    },
    medium: {
      name: "Medium",
      limit: "(1 domain, maximum 100k monthly visitors)",
      price: 100, // Fallback price in dollars
      priceMultiplier: 1.0, // 100% of base font price
    },
    large: {
      name: "Large",
      limit: "(1 domain, maximum 500k monthly visitors)",
      price: 200, // Fallback price in dollars
      priceMultiplier: 2.0, // 200% of base font price
    },
  },
  app: {
    small: {
      name: "Small",
      limit: "(1 app, maximum 10k downloads)",
      price: 50, // Fallback price in dollars
      priceMultiplier: 0.5,
    },
    medium: {
      name: "Medium",
      limit: "(1 app, maximum 50k downloads)",
      price: 100, // Fallback price in dollars
      priceMultiplier: 1.0,
    },
    large: {
      name: "Large",
      limit: "(1 app, maximum 100k downloads)",
      price: 200, // Fallback price in dollars
      priceMultiplier: 2.0,
    },
  },
  social: {
    small: {
      name: "Small",
      limit: "(all platforms, maximum 10k followers)",
      price: 40, // Fallback price in dollars
      priceMultiplier: 0.4,
    },
    medium: {
      name: "Medium",
      limit: "(all platforms, maximum 50k followers)",
      price: 80, // Fallback price in dollars
      priceMultiplier: 0.8,
    },
    large: {
      name: "Large",
      limit: "(all platforms, maximum 100k followers)",
      price: 160, // Fallback price in dollars
      priceMultiplier: 1.6,
    },
  },
};

// DEPRECATED: Legacy helper functions - use pricingService.js instead
// Helper function to calculate font price (fallback)
export const calculateFontPrice = (fontSlug, styles = ['Regular']) => {
  const fontPricing = FONT_BASE_PRICES[fontSlug];
  if (!fontPricing) return 0;

  let totalPrice = 0;
  styles.forEach(styleName => {
    const styleMultiplier = fontPricing.styleMultipliers[styleName] || 1.0;
    totalPrice += fontPricing.basePrice * styleMultiplier;
  });

  return totalPrice;
};

// Helper function to calculate package price for multiple fonts (fallback)
export const calculatePackagePrice = (selectedFonts, selectedStyles, packageType) => {
  const packageData = packages[packageType];
  if (!packageData) return 0;

  let totalPrice = 0;

  selectedFonts.forEach(font => {
    const styles = selectedStyles[font.id] || [font.font_styles?.[0]];
    const styleNames = styles.map(s => s.name);
    const fontPrice = calculateFontPrice(font.slug, styleNames);
    totalPrice += fontPrice * packageData.priceMultiplier;
  });

  // Apply multi-font discount
  const fontCount = selectedFonts.length;
  const discount = MULTI_FONT_DISCOUNTS[fontCount] || MULTI_FONT_DISCOUNTS[5];
  
  return Math.round(totalPrice * discount);
};

// Helper function to calculate custom license price for multiple fonts (fallback)
export const calculateCustomLicensePrice = (selectedFonts, selectedStyles, customLicenses) => {
  let totalPrice = 0;

  selectedFonts.forEach(font => {
    const styles = selectedStyles[font.id] || [font.font_styles?.[0]];
    const styleNames = styles.map(s => s.name);
    const baseFontPrice = calculateFontPrice(font.slug, styleNames);

    // Calculate price for each active license type
    Object.entries(customLicenses).forEach(([licenseKey, licenseValue]) => {
      if (licenseValue && licenseKey.includes('License')) {
        const licenseType = licenseKey.replace('custom', '').replace('License', '').toLowerCase();
        const licenseData = licenseOptions[licenseType]?.[licenseValue];
        
        if (licenseData) {
          totalPrice += baseFontPrice * licenseData.priceMultiplier;
        }
      }
    });
  });

  // Apply multi-font discount
  const fontCount = selectedFonts.length;
  const discount = MULTI_FONT_DISCOUNTS[fontCount] || MULTI_FONT_DISCOUNTS[5];
  
  return Math.round(totalPrice * discount);
};

// Database license type mapping
export const LICENSE_TYPE_MAPPING = {
  package: {
    small: 'package_small',
    medium: 'package_medium',
    large: 'package_large'
  },
  print: {
    small: 'print_small',
    medium: 'print_medium',
    large: 'print_large'
  },
  web: {
    small: 'web_small',
    medium: 'web_medium',
    large: 'web_large'
  },
  app: {
    small: 'app_small',
    medium: 'app_medium',
    large: 'app_large'
  },
  social: {
    small: 'social_small',
    medium: 'social_medium',
    large: 'social_large'
  }
};
