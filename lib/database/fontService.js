import { getSupabaseClient, getUserByAuthId, recordFontSelection, updateFontSelectionCart, createPurchaseOrder, addPurchaseItem, createUserLicense, updatePurchaseOrderStatus } from './supabaseClient';

// =============================================
// FONT SELECTION SERVICE
// =============================================

export class FontSelectionService {
  constructor() {
    this.sessionId = null;
    this.userId = null;
  }

  // Initialize session for font selection tracking
  async initializeSession(authUserId = null) {
    // Generate session ID for anonymous users
    this.sessionId = this.generateSessionId();
    
    // Get user ID if authenticated
    if (authUserId) {
      const { data: user } = await getUserByAuthId(authUserId);
      this.userId = user?.id || null;
    }
    
    return {
      sessionId: this.sessionId,
      userId: this.userId
    };
  }

  // Record font selection from slot machine
  async recordSelection(fontFamilyId, fontStyleId, selectedLetter, clientInfo = {}) {
    try {
      const selectionData = {
        session_id: this.sessionId,
        user_id: this.userId,
        font_family_id: fontFamilyId,
        font_style_id: fontStyleId,
        selected_letter: selectedLetter,
        selection_method: 'slot_machine',
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
      };

      const { data, error } = await recordFontSelection(selectionData);
      
      if (error) {
        console.error('Error recording font selection:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Font selection service error:', err);
      return { success: false, error: err };
    }
  }

  // Mark selection as added to cart
  async addToCart(selectionId) {
    try {
      const { data, error } = await updateFontSelectionCart(selectionId, true);
      
      if (error) {
        console.error('Error updating cart status:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Add to cart service error:', err);
      return { success: false, error: err };
    }
  }

  // Generate unique session ID
  generateSessionId() {
    return crypto.randomUUID();
  }
}

// =============================================
// PURCHASE PROCESSING SERVICE
// =============================================

export class PurchaseService {
  constructor() {
    this.stripeService = null; // Will be initialized with Stripe
  }

  // Process complete purchase workflow
  async processPurchase(purchaseData) {
    try {
      // 1. Create purchase order
      const orderResult = await this.createOrder(purchaseData);
      if (!orderResult.success) {
        return orderResult;
      }

      const purchaseOrder = orderResult.data;

      // 2. Add purchase items
      const itemsResult = await this.addPurchaseItems(purchaseOrder.id, purchaseData.items);
      if (!itemsResult.success) {
        return itemsResult;
      }

      // 3. Process payment (if not already processed)
      if (purchaseData.payment_intent_id) {
        const paymentResult = await this.confirmPayment(purchaseOrder.id, purchaseData.payment_intent_id);
        if (!paymentResult.success) {
          return paymentResult;
        }
      }

      // 4. Create user licenses
      const licensesResult = await this.createUserLicenses(purchaseOrder.id, purchaseData.user_id, itemsResult.data);
      if (!licensesResult.success) {
        return licensesResult;
      }

      // 5. Mark order as completed
      await updatePurchaseOrderStatus(purchaseOrder.id, 'completed', 'completed');

      return {
        success: true,
        data: {
          order: purchaseOrder,
          items: itemsResult.data,
          licenses: licensesResult.data
        }
      };

    } catch (err) {
      console.error('Purchase processing error:', err);
      return { success: false, error: err };
    }
  }

  // Create purchase order
  async createOrder(purchaseData) {
    try {
      const orderData = {
        user_id: purchaseData.user_id, // This might be null
        stripe_payment_intent_id: purchaseData.payment_intent_id,
        payment_method: purchaseData.payment_method || 'card',
        subtotal_cents: purchaseData.subtotal_cents,
        tax_cents: purchaseData.tax_cents || 0,
        total_cents: purchaseData.total_cents,
        currency: purchaseData.currency || 'USD',
        billing_details: purchaseData.billing_details,
        usage_type: purchaseData.usage_type,
        company_info: purchaseData.company_info,
      };

      const { data, error } = await createPurchaseOrder(orderData);
      
      if (error) {
        console.error('Error creating purchase order:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Create order error:', err);
      return { success: false, error: err };
    }
  }

  // Add purchase items to order
  async addPurchaseItems(purchaseOrderId, items) {
    try {
      const createdItems = [];

      for (const item of items) {
        const itemData = {
          purchase_order_id: purchaseOrderId,
          font_style_id: item.font_style_id,
          license_type: item.license_type, // "package" or "custom"
          license_package_id: item.license_package_id,
          custom_licenses: item.custom_licenses,
          unit_price_cents: item.unit_price_cents,
          quantity: item.quantity || 1,
          total_price_cents: item.total_price_cents,
        };

        const { data, error } = await addPurchaseItem(itemData);
        
        if (error) {
          console.error('Error adding purchase item:', error);
          return { success: false, error };
        }

        createdItems.push(data);
      }

      return { success: true, data: createdItems };
    } catch (err) {
      console.error('Add purchase items error:', err);
      return { success: false, error: err };
    }
  }

  // Confirm payment with Stripe
  async confirmPayment(purchaseOrderId, paymentIntentId) {
    try {
      // This would integrate with Stripe to confirm payment
      // For now, we'll assume payment is successful
      
      const { data, error } = await updatePurchaseOrderStatus(
        purchaseOrderId, 
        'processing', 
        'completed'
      );
      
      if (error) {
        console.error('Error confirming payment:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Payment confirmation error:', err);
      return { success: false, error: err };
    }
  }

  // Create user licenses after successful purchase
  async createUserLicenses(purchaseOrderId, userId, purchaseItems) {
    try {
      // If no userId, skip license creation for now
      // The purchase will be completed but licenses will need to be created later
      // when the user is properly registered
      if (!userId) {
        console.log('⚠️ Skipping license creation - no user_id provided');
        return { 
          success: true, 
          data: [],
          note: 'Licenses will be created when user is properly registered'
        };
      }

      const createdLicenses = [];

      for (const item of purchaseItems) {
        // Determine license tiers based on purchase type
        let licenseTiers = [];
        
        if (item.license_type === 'package' && item.license_package_id) {
          // Get license tiers from package
          licenseTiers = await this.getPackageLicenseTiers(item.license_package_id);
        } else if (item.license_type === 'custom' && item.custom_licenses) {
          // Get custom license tiers
          licenseTiers = Object.values(item.custom_licenses);
        }

        const licenseData = {
          user_id: userId,
          purchase_item_id: item.id,
          font_style_id: item.font_style_id,
          license_tiers: licenseTiers,
          expires_at: null, // Perpetual license
        };

        const { data, error } = await createUserLicense(licenseData);
        
        if (error) {
          console.error('Error creating user license:', error);
          return { success: false, error };
        }

        createdLicenses.push(data);
      }

      return { success: true, data: createdLicenses };
    } catch (err) {
      console.error('Create user licenses error:', err);
      return { success: false, error: err };
    }
  }

  // Get license tiers from package
  async getPackageLicenseTiers(packageId) {
    try {
      const { data, error } = await supabase
        .from('package_license_tiers')
        .select('license_tier_id')
        .eq('package_id', packageId);

      if (error) {
        console.error('Error fetching package license tiers:', error);
        return [];
      }

      return data.map(item => item.license_tier_id);
    } catch (err) {
      console.error('Get package license tiers error:', err);
      return [];
    }
  }
}

// =============================================
// DOWNLOAD SERVICE
// =============================================

export class FontDownloadService {
  constructor() {
    this.downloadBaseUrl = process.env.NEXT_PUBLIC_FONT_DOWNLOAD_URL || '/api/download';
  }

  // Get available download formats for a font
  async getAvailableFormats(fontStyleId) {
    try {
      const { data, error } = await supabase
        .from('font_styles')
        .select('font_files')
        .eq('id', fontStyleId)
        .single();

      if (error || !data?.font_files) {
        return [];
      }

      return Object.keys(data.font_files);
    } catch (err) {
      console.error('Get available formats error:', err);
      return [];
    }
  }

  // Download font method (used by dashboard)
  async downloadFont(userLicenseId, fontStyleId, format) {
    try {
      // Call the download API endpoint instead of direct database access
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userLicenseId,
          fontStyleId,
          format
        })
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Download API failed:', result.error);
        return { success: false, error: result.error };
      }

      // Create a download link and trigger download in same tab
      if (typeof window !== 'undefined' && result.data.file_path) {
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = result.data.file_path;
        link.download = result.data.file_path.split('/').pop(); // Extract filename from path
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return {
        success: true,
        data: {
          download_url: result.data.download_url,
          file_path: result.data.file_path,
          message: 'Download started'
        }
      };

    } catch (err) {
      console.error('Download font error:', err);
      return { success: false, error: err.message || 'Download failed' };
    }
  }
}

// =============================================
// CART INTEGRATION SERVICE
// =============================================

export class CartIntegrationService {
  constructor() {
    this.fontSelectionService = new FontSelectionService();
    this.purchaseService = new PurchaseService();
  }

  // Convert cart data to purchase format
  async procesCartCheckout(cartData, userInfo, paymentInfo) {
    try {
      // Initialize user session
      await this.fontSelectionService.initializeSession(userInfo.auth_user_id);

      // Calculate totals
      const totals = this.calculateCartTotals(cartData);

      // Prepare purchase data
      const purchaseData = {
        user_id: userInfo.id,
        payment_intent_id: paymentInfo.payment_intent_id,
        payment_method: paymentInfo.payment_method,
        subtotal_cents: totals.subtotal_cents,
        tax_cents: totals.tax_cents,
        total_cents: totals.total_cents,
        currency: 'USD',
        billing_details: {
          email: userInfo.email,
          name: `${userInfo.first_name} ${userInfo.last_name}`,
          address: {
            line1: userInfo.street_address,
            city: userInfo.city,
            postal_code: userInfo.postal_code,
            country: userInfo.country,
          }
        },
        usage_type: cartData.usage_type,
        company_info: cartData.company_info,
        items: this.formatCartItems(cartData)
      };

      // Process purchase
      const result = await this.purchaseService.processPurchase(purchaseData);
      
      return result;

    } catch (err) {
      console.error('Cart checkout error:', err);
      return { success: false, error: err };
    }
  }

  // Calculate cart totals
  calculateCartTotals(cartData) {
    let subtotal_cents = 0;

    // Calculate based on license type
    if (cartData.license_type === 'package' && cartData.selected_package) {
      // Get package price from constants
      const packagePrices = {
        small: 20000,  // $200.00
        medium: 40000, // $400.00
        large: 80000   // $800.00
      };
      subtotal_cents = packagePrices[cartData.selected_package] || 0;
    } else if (cartData.license_type === 'custom' && cartData.custom_licenses) {
      // Calculate custom license total
      const customPrices = this.calculateCustomLicensePrice(cartData.custom_licenses);
      subtotal_cents = customPrices;
    }

    const tax_cents = Math.round(subtotal_cents * 0.08); // 8% tax example
    const total_cents = subtotal_cents + tax_cents;

    return {
      subtotal_cents,
      tax_cents,
      total_cents
    };
  }

  // Format cart items for purchase
  formatCartItems(cartData) {
    const items = [];

    // For now, we'll use the selected font style from the cart
    // In a full implementation, this would come from the font selection
    const item = {
      font_style_id: cartData.font_style_id, // This would come from slot machine selection
      license_type: cartData.license_type,
      license_package_id: cartData.license_package_id,
      custom_licenses: cartData.custom_licenses,
      unit_price_cents: cartData.total_cents,
      quantity: 1,
      total_price_cents: cartData.total_cents
    };

    items.push(item);
    return items;
  }

  // Calculate custom license pricing
  calculateCustomLicensePrice(customLicenses) {
    const licensePrices = {
      print: { small: 6000, medium: 12000, large: 24000 },
      web: { small: 5000, medium: 10000, large: 20000 },
      app: { small: 5000, medium: 10000, large: 20000 },
      social: { small: 4000, medium: 8000, large: 16000 }
    };

    let total = 0;

    Object.entries(customLicenses).forEach(([type, tier]) => {
      if (tier && licensePrices[type] && licensePrices[type][tier]) {
        total += licensePrices[type][tier];
      }
    });

    return total;
  }
}

// =============================================
// EXPORTS
// =============================================

export const fontSelectionService = new FontSelectionService();
export const purchaseService = new PurchaseService();
export const fontDownloadService = new FontDownloadService();
export const cartIntegrationService = new CartIntegrationService();

export default {
  FontSelectionService,
  PurchaseService,
  FontDownloadService,
  CartIntegrationService,
  fontSelectionService,
  purchaseService,
  fontDownloadService,
  cartIntegrationService
}; 