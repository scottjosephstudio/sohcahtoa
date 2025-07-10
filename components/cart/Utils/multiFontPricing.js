// Multi-font pricing utility functions
import { 
  FONT_BASE_PRICES, 
  MULTI_FONT_DISCOUNTS, 
  calculatePackagePrice, 
  calculateCustomLicensePrice 
} from '../Constants/constants';

/**
 * Calculate the total price for multiple fonts with their selected styles
 * @param {Array} selectedFonts - Array of font objects
 * @param {Object} selectedStyles - Object mapping font IDs to selected styles
 * @param {string} licenseType - "package" or "custom"
 * @param {string} packageType - "small", "medium", "large" (for package licensing)
 * @param {Object} customLicenses - Custom license selections (for custom licensing)
 * @returns {number} Total price in cents
 */
export const calculateMultiFontPrice = (
  selectedFonts = [],
  selectedStyles = {},
  licenseType = "package",
  packageType = "small",
  customLicenses = {}
) => {
  if (!selectedFonts || selectedFonts.length === 0) return 0;

  if (licenseType === "package") {
    return calculatePackagePrice(selectedFonts, selectedStyles, packageType);
  } else {
    return calculateCustomLicensePrice(selectedFonts, selectedStyles, customLicenses);
  }
};

/**
 * Get detailed pricing breakdown for display
 * @param {Array} selectedFonts - Array of font objects
 * @param {Object} selectedStyles - Object mapping font IDs to selected styles
 * @param {string} licenseType - "package" or "custom"
 * @param {string} packageType - "small", "medium", "large" (for package licensing)
 * @param {Object} customLicenses - Custom license selections (for custom licensing)
 * @returns {Object} Detailed pricing breakdown
 */
export const getPricingBreakdown = (
  selectedFonts = [],
  selectedStyles = {},
  licenseType = "package",
  packageType = "small",
  customLicenses = {}
) => {
  if (!selectedFonts || selectedFonts.length === 0) {
    return {
      fonts: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      discountPercentage: 0
    };
  }

  const fontBreakdowns = selectedFonts.map(font => {
    const styles = selectedStyles[font.id] || [font.font_styles?.[0]];
    const styleNames = styles.map(s => s.name);
    
    // Calculate base font price with styles
    const fontPricing = FONT_BASE_PRICES[font.slug];
    let baseFontPrice = 0;
    
    if (fontPricing) {
      styles.forEach(style => {
        const styleMultiplier = fontPricing.styleMultipliers[style.name] || 1.0;
        baseFontPrice += fontPricing.basePrice * styleMultiplier;
      });
    }

    // Calculate license price based on type
    let licensePrice = 0;
    
    if (licenseType === "package") {
      const { packages } = require('../Constants/constants');
      const packageData = packages[packageType];
      if (packageData) {
        licensePrice = baseFontPrice * packageData.priceMultiplier;
      }
    } else {
      const { licenseOptions } = require('../Constants/constants');
      // Calculate custom license price
      Object.entries(customLicenses).forEach(([licenseKey, licenseValue]) => {
        if (licenseValue && licenseKey.includes('License')) {
          const licenseTypeKey = licenseKey.replace('custom', '').replace('License', '').toLowerCase();
          const licenseData = licenseOptions[licenseTypeKey]?.[licenseValue];
          
          if (licenseData) {
            licensePrice += baseFontPrice * licenseData.priceMultiplier;
          }
        }
      });
    }

    return {
      font,
      styles: styleNames,
      baseFontPrice,
      licensePrice,
      totalPrice: licensePrice
    };
  });

  // Calculate totals
  const subtotal = fontBreakdowns.reduce((sum, breakdown) => sum + breakdown.totalPrice, 0);
  
  // Apply multi-font discount
  const fontCount = selectedFonts.length;
  const discountMultiplier = MULTI_FONT_DISCOUNTS[fontCount] || MULTI_FONT_DISCOUNTS[5];
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
};

/**
 * Add a font to the selection
 * @param {Array} selectedFonts - Current selected fonts
 * @param {Object} selectedStyles - Current selected styles
 * @param {Object} fontToAdd - Font object to add
 * @param {Array} stylesToAdd - Array of style objects to add
 * @returns {Object} Updated selection
 */
export const addFontToSelection = (selectedFonts, selectedStyles, fontToAdd, stylesToAdd = []) => {
  // Check if font is already selected
  if (selectedFonts.some(font => font.id === fontToAdd.id)) {
    return { selectedFonts, selectedStyles };
  }

  // Add font and styles
  const updatedFonts = [...selectedFonts, fontToAdd];
  const updatedStyles = {
    ...selectedStyles,
    [fontToAdd.id]: stylesToAdd.length > 0 ? stylesToAdd : [fontToAdd.font_styles?.[0]]
  };

  return {
    selectedFonts: updatedFonts,
    selectedStyles: updatedStyles
  };
};

/**
 * Remove a font from the selection
 * @param {Array} selectedFonts - Current selected fonts
 * @param {Object} selectedStyles - Current selected styles
 * @param {string} fontIdToRemove - Font ID to remove
 * @returns {Object} Updated selection
 */
export const removeFontFromSelection = (selectedFonts, selectedStyles, fontIdToRemove) => {
  const updatedFonts = selectedFonts.filter(font => font.id !== fontIdToRemove);
  const updatedStyles = { ...selectedStyles };
  delete updatedStyles[fontIdToRemove];

  return {
    selectedFonts: updatedFonts,
    selectedStyles: updatedStyles
  };
};

/**
 * Toggle a font style selection
 * @param {Object} selectedStyles - Current selected styles
 * @param {string} fontId - Font ID
 * @param {Object} styleToToggle - Style object to toggle
 * @returns {Object} Updated styles
 */
export const toggleFontStyle = (selectedStyles, fontId, styleToToggle) => {
  const currentStyles = selectedStyles[fontId] || [];
  const isSelected = currentStyles.some(style => style.id === styleToToggle.id);

  if (isSelected) {
    // Remove style (but keep at least one)
    const updatedStyles = currentStyles.filter(style => style.id !== styleToToggle.id);
    if (updatedStyles.length === 0) return selectedStyles; // Keep at least one style
    
    return {
      ...selectedStyles,
      [fontId]: updatedStyles
    };
  } else {
    // Add style
    return {
      ...selectedStyles,
      [fontId]: [...currentStyles, styleToToggle]
    };
  }
};

/**
 * Helper function to format price for display
 * @param {number} priceInCents - Price in cents
 * @returns {string} Formatted price string
 */
export const formatPrice = (priceInCents) => {
  const dollars = priceInCents / 100;
  return `$${dollars.toFixed(2)}`;
};

/**
 * Helper function to get font count text
 * @param {number} count - Number of fonts
 * @returns {string} Formatted count text
 */
export const getFontCountText = (count) => {
  if (count === 0) return "No fonts selected";
  if (count === 1) return "1 font selected";
  return `${count} fonts selected`;
}; 