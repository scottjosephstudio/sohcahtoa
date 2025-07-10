import { useState, useEffect, useCallback } from 'react';
import { cartIntegrationService } from '../../../lib/database/fontService';
import { createUser, getUserByAuthId, updateUser, updateUserCartPreferences as updateUserCartPrefsInDB } from '../../../lib/database/supabaseClient';

export const useCartDatabaseIntegration = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [selectedFont, setSelectedFont] = useState(null);
  const [userDatabaseId, setUserDatabaseId] = useState(null);

  // Listen for font selection events from slot machine
  useEffect(() => {
    const handleFontSelected = (event) => {
      const { fontFamily, fontStyle, selectedLetter, selectionId } = event.detail;
      
      setSelectedFont({
        id: fontStyle.id,
        name: `${fontFamily.name} - ${fontStyle.name}`,
        family: fontFamily,
        style: fontStyle,
        selectedLetter,
        selectionId
      });
    };

    const handleFontAddedToCart = (event) => {
      console.log('Font added to cart:', event.detail);
      // Additional cart logic can be added here
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('fontSelected', handleFontSelected);
      window.addEventListener('fontAddedToCart', handleFontAddedToCart);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('fontSelected', handleFontSelected);
        window.removeEventListener('fontAddedToCart', handleFontAddedToCart);
      }
    };
  }, []);

  // Create or get user in database
  const ensureUserInDatabase = useCallback(async (registrationData) => {
    try {
      setProcessingError(null);

      // First, try to get existing user by auth ID
      if (registrationData.auth_user_id) {
        const { data: existingUser } = await getUserByAuthId(registrationData.auth_user_id);
        
        if (existingUser) {
          setUserDatabaseId(existingUser.id);
          return { success: true, user: existingUser };
        }
      }

      // Create new user if not exists
      const userData = {
        auth_user_id: registrationData.auth_user_id,
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.surname,
        street: registrationData.street,
        city: registrationData.city,
        postcode: registrationData.postcode,
        country: registrationData.country,
        newsletter: registrationData.newsletter || false,
        companyName: registrationData.companyName,
        contactName: registrationData.contactName,
        contactEmail: registrationData.contactEmail,
        contactPhone: registrationData.contactPhone,
      };

      const { data: newUser, error } = await createUser(userData);

      if (error) {
        console.error('Error creating user:', error);
        setProcessingError('Failed to create user account');
        return { success: false, error };
      }

      setUserDatabaseId(newUser.id);
      return { success: true, user: newUser };

    } catch (err) {
      console.error('Error ensuring user in database:', err);
      setProcessingError('Database error: ' + err.message);
      return { success: false, error: err };
    }
  }, []);

  // Process complete cart checkout
  const processCartCheckout = useCallback(async (cartData, userInfo, paymentInfo) => {
    try {
      setIsProcessing(true);
      setProcessingError(null);

      // Ensure user exists in database
      const userResult = await ensureUserInDatabase(userInfo);
      if (!userResult.success) {
        throw new Error('Failed to create user account');
      }

      // Prepare cart data with selected font
      const enhancedCartData = {
        ...cartData,
        font_style_id: selectedFont?.id,
        font_family_id: selectedFont?.family?.id,
        selected_letter: selectedFont?.selectedLetter,
        selection_id: selectedFont?.selectionId,
      };

      // Process purchase through cart integration service
      const result = await cartIntegrationService.procesCartCheckout(
        enhancedCartData,
        userResult.user,
        paymentInfo
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Purchase processing failed');
      }

      return {
        success: true,
        data: {
          order: result.data.order,
          items: result.data.items,
          licenses: result.data.licenses,
          user: userResult.user
        }
      };

    } catch (err) {
      console.error('Cart checkout error:', err);
      setProcessingError(err.message);
      return { success: false, error: err };
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFont, ensureUserInDatabase]);

  // Update user information
  const updateUserInformation = useCallback(async (userId, updates) => {
    try {
      setProcessingError(null);

      const { data, error } = await updateUser(userId, updates);

      if (error) {
        console.error('Error updating user:', error);
        setProcessingError('Failed to update user information');
        return { success: false, error };
      }

      return { success: true, data };

    } catch (err) {
      console.error('Error updating user information:', err);
      setProcessingError('Update error: ' + err.message);
      return { success: false, error: err };
    }
  }, []);

  // Update user cart preferences (usage type and EULA)
  const updateUserCartPreferences = useCallback(async (userId, preferences) => {
    try {
      setProcessingError(null);

      const { data, error } = await updateUserCartPrefsInDB(userId, preferences);

      if (error) {
        console.error('Error updating user cart preferences:', error);
        setProcessingError('Failed to save preferences');
        return { success: false, error };
      }

      return { success: true, data };

    } catch (err) {
      console.error('Error updating user cart preferences:', err);
      setProcessingError('Preferences update error: ' + err.message);
      return { success: false, error: err };
    }
  }, []);

  // Validate cart for payment (usage type and EULA must be set)
  const validateCartForPayment = useCallback((cartData, userPreferences) => {
    const errors = [];

    if (!cartData.selectedUsage) {
      errors.push('Usage type must be selected');
    }

    if (!cartData.eulaAccepted) {
      errors.push('EULA must be accepted');
    }

    if (!cartData.selectedPackage && !cartData.customLicenses) {
      errors.push('License package must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Calculate cart totals with database pricing
  const calculateCartTotals = useCallback((cartData) => {
    let subtotal_cents = 0;

    if (cartData.selectedPackage) {
      // Package pricing from database/constants
      const packagePrices = {
        small: 20000,  // $200.00
        medium: 40000, // $400.00
        large: 80000   // $800.00
      };
      subtotal_cents = packagePrices[cartData.selectedPackage] || 0;
    } else if (cartData.customLicenses) {
      // Custom license pricing
      const licensePrices = {
        customPrintLicense: { small: 6000, medium: 12000, large: 24000 },
        customWebLicense: { small: 5000, medium: 10000, large: 20000 },
        customAppLicense: { small: 5000, medium: 10000, large: 20000 },
        customSocialLicense: { small: 4000, medium: 8000, large: 16000 }
      };

      Object.entries(cartData.customLicenses).forEach(([licenseType, tier]) => {
        if (tier && licensePrices[licenseType] && licensePrices[licenseType][tier]) {
          subtotal_cents += licensePrices[licenseType][tier];
        }
      });
    }

    const tax_cents = Math.round(subtotal_cents * 0.08); // 8% tax
    const total_cents = subtotal_cents + tax_cents;

    return {
      subtotal_cents,
      tax_cents,
      total_cents,
      formatted: {
        subtotal: formatPrice(subtotal_cents),
        tax: formatPrice(tax_cents),
        total: formatPrice(total_cents)
      }
    };
  }, []);

  // Format price helper
  const formatPrice = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Get cart summary for display
  const getCartSummary = useCallback((cartData) => {
    const totals = calculateCartTotals(cartData);
    
    return {
      selectedFont: selectedFont,
      packageType: cartData.selectedPackage,
      customLicenses: cartData.customLicenses,
      usageType: cartData.selectedUsage,
      totals: totals,
      hasValidSelection: !!selectedFont && (!!cartData.selectedPackage || !!cartData.customLicenses)
    };
  }, [selectedFont, calculateCartTotals]);

  // Clear cart state after successful purchase
  const clearCartState = useCallback(() => {
    setSelectedFont(null);
    setUserDatabaseId(null);
    setProcessingError(null);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lastFontSelection');
      localStorage.removeItem('cartState');
    }
  }, []);

  return {
    // State
    isProcessing,
    processingError,
    selectedFont,
    userDatabaseId,

    // Methods
    ensureUserInDatabase,
    processCartCheckout,
    updateUserInformation,
    updateUserCartPreferences,
    validateCartForPayment,
    calculateCartTotals,
    getCartSummary,
    clearCartState,

    // Utilities
    formatPrice,
  };
};

export default useCartDatabaseIntegration; 