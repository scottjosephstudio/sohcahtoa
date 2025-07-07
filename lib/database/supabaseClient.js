import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================
// USER MANAGEMENT
// =============================================

export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        auth_user_id: userData.auth_user_id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        street_address: userData.street,
        city: userData.city,
        postal_code: userData.postcode,
        country: userData.country,
        newsletter_subscribed: userData.newsletter || false,
        company_name: userData.companyName,
        contact_name: userData.contactName,
        contact_email: userData.contactEmail,
        contact_phone: userData.contactPhone,
      }])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error creating user:', err);
    return { data: null, error: err };
  }
};

export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error fetching user:', err);
    return { data: null, error: err };
  }
};

export const getUserByAuthId = async (authUserId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error fetching user by auth ID:', err);
    return { data: null, error: err };
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error updating user:', err);
    return { data: null, error: err };
  }
};

// =============================================
// FONT MANAGEMENT
// =============================================

export const getFontFamilies = async (options = {}) => {
  try {
    let query = supabase
      .from('font_families')
      .select(`
        *,
        font_styles (
          id,
          name,
          slug,
          weight,
          style,
          font_files,
          glyph_count,
          supported_languages
        )
      `)
      .eq('is_active', true);

    if (options.featured) {
      query = query.eq('featured', true);
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending !== false });
    } else {
      query = query.order('sort_order', { ascending: true });
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    console.error('Error fetching font families:', err);
    return { data: null, error: err };
  }
};

export const getFontFamilyBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('font_families')
      .select(`
        *,
        font_styles (
          id,
          name,
          slug,
          weight,
          style,
          font_files,
          glyph_count,
          supported_languages,
          metrics
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error fetching font family:', err);
    return { data: null, error: err };
  }
};

export const getFontStyleById = async (styleId) => {
  try {
    const { data, error } = await supabase
      .from('font_styles')
      .select(`
        *,
        font_families (
          id,
          name,
          slug,
          description,
          designer,
          foundry
        )
      `)
      .eq('id', styleId)
      .eq('is_active', true)
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error fetching font style:', err);
    return { data: null, error: err };
  }
};

// =============================================
// LICENSING SYSTEM
// =============================================

export const getLicenseTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('license_types')
      .select(`
        *,
        license_tiers (
          id,
          name,
          slug,
          price_cents,
          description,
          limitations
        )
      `)
      .eq('is_active', true)
      .order('name');

    return { data, error };
  } catch (err) {
    console.error('Error fetching license types:', err);
    return { data: null, error: err };
  }
};

export const getLicensePackages = async () => {
  try {
    const { data, error } = await supabase
      .from('license_packages')
      .select(`
        *,
        package_license_tiers (
          license_tier_id,
          license_tiers (
            id,
            name,
            slug,
            price_cents,
            description,
            limitations,
            license_types (
              id,
              name,
              slug
            )
          )
        )
      `)
      .eq('is_active', true)
      .order('price_cents');

    return { data, error };
  } catch (err) {
    console.error('Error fetching license packages:', err);
    return { data: null, error: err };
  }
};

// =============================================
// PURCHASE MANAGEMENT
// =============================================

export const createPurchaseOrder = async (orderData) => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([{
        user_id: orderData.user_id,
        stripe_payment_intent_id: orderData.stripe_payment_intent_id,
        payment_method: orderData.payment_method,
        subtotal_cents: orderData.subtotal_cents,
        tax_cents: orderData.tax_cents || 0,
        total_cents: orderData.total_cents,
        currency: orderData.currency || 'USD',
        billing_details: orderData.billing_details,
        usage_type: orderData.usage_type,
        company_info: orderData.company_info,
      }])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error creating purchase order:', err);
    return { data: null, error: err };
  }
};

export const addPurchaseItem = async (itemData) => {
  try {
    const { data, error } = await supabase
      .from('purchase_items')
      .insert([{
        purchase_order_id: itemData.purchase_order_id,
        font_style_id: itemData.font_style_id,
        license_type: itemData.license_type,
        license_package_id: itemData.license_package_id,
        custom_licenses: itemData.custom_licenses,
        unit_price_cents: itemData.unit_price_cents,
        quantity: itemData.quantity || 1,
        total_price_cents: itemData.total_price_cents,
      }])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error adding purchase item:', err);
    return { data: null, error: err };
  }
};

export const updatePurchaseOrderStatus = async (orderId, status, paymentStatus = null) => {
  try {
    const updates = { status };
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error updating purchase order status:', err);
    return { data: null, error: err };
  }
};

export const getUserPurchases = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        purchase_items (
          *,
          font_styles (
            id,
            name,
            slug,
            font_families (
              id,
              name,
              slug
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (err) {
    console.error('Error fetching user purchases:', err);
    return { data: null, error: err };
  }
};

// =============================================
// USER LICENSES & DOWNLOADS
// =============================================

export const createUserLicense = async (licenseData) => {
  try {
    const { data, error } = await supabase
      .from('user_licenses')
      .insert([{
        user_id: licenseData.user_id,
        purchase_item_id: licenseData.purchase_item_id,
        font_style_id: licenseData.font_style_id,
        license_tiers: licenseData.license_tiers,
        expires_at: licenseData.expires_at,
      }])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error creating user license:', err);
    return { data: null, error: err };
  }
};

export const getUserLicenses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_licenses')
      .select(`
        *,
        font_styles (
          id,
          name,
          slug,
          font_files,
          font_families (
            id,
            name,
            slug
          )
        ),
        purchase_items (
          id,
          license_type,
          license_package_id,
          custom_licenses,
          purchase_orders (
            id,
            order_number,
            created_at
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (err) {
    console.error('Error fetching user licenses:', err);
    return { data: null, error: err };
  }
};

export const createFontDownload = async (downloadData) => {
  try {
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { data, error } = await supabase
      .from('font_downloads')
      .insert([{
        user_id: downloadData.user_id,
        user_license_id: downloadData.user_license_id,
        font_style_id: downloadData.font_style_id,
        file_format: downloadData.file_format,
        file_size_bytes: downloadData.file_size_bytes,
        download_url: downloadData.download_url,
        ip_address: downloadData.ip_address,
        user_agent: downloadData.user_agent,
        download_token: downloadToken,
        expires_at: expiresAt.toISOString(),
      }])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error creating font download:', err);
    return { data: null, error: err };
  }
};

export const getUserDownloads = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('font_downloads')
      .select(`
        *,
        font_styles (
          id,
          name,
          slug,
          font_families (
            id,
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .order('downloaded_at', { ascending: false });

    return { data, error };
  } catch (err) {
    console.error('Error fetching user downloads:', err);
    return { data: null, error: err };
  }
};

// =============================================
// FONT SELECTION & SLOT MACHINE
// =============================================

export const recordFontSelection = async (selectionData) => {
  try {
    const { data, error } = await supabase
      .from('font_selections')
      .insert([{
        session_id: selectionData.session_id,
        user_id: selectionData.user_id,
        font_family_id: selectionData.font_family_id,
        font_style_id: selectionData.font_style_id,
        selected_letter: selectionData.selected_letter,
        selection_method: selectionData.selection_method || 'slot_machine',
        ip_address: selectionData.ip_address,
        user_agent: selectionData.user_agent,
      }])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error recording font selection:', err);
    return { data: null, error: err };
  }
};

export const updateFontSelectionCart = async (selectionId, addedToCart = true) => {
  try {
    const updates = { 
      added_to_cart: addedToCart,
      cart_added_at: addedToCart ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('font_selections')
      .update(updates)
      .eq('id', selectionId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('Error updating font selection cart status:', err);
    return { data: null, error: err };
  }
};

export const getUserFontSelections = async (userId, sessionId = null) => {
  try {
    let query = supabase
      .from('font_selections')
      .select(`
        *,
        font_families (
          id,
          name,
          slug
        ),
        font_styles (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    console.error('Error fetching font selections:', err);
    return { data: null, error: err };
  }
};

// =============================================
// SYSTEM UTILITIES
// =============================================

export const getSystemConfig = async (key) => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', key)
      .single();

    return { data: data?.value, error };
  } catch (err) {
    console.error('Error fetching system config:', err);
    return { data: null, error: err };
  }
};

export const logAuditEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('audit_log')
      .insert([{
        user_id: eventData.user_id,
        action: eventData.action,
        entity_type: eventData.entity_type,
        entity_id: eventData.entity_id,
        old_values: eventData.old_values,
        new_values: eventData.new_values,
        ip_address: eventData.ip_address,
        user_agent: eventData.user_agent,
      }]);

    return { data, error };
  } catch (err) {
    console.error('Error logging audit event:', err);
    return { data: null, error: err };
  }
};

// =============================================
// HELPER FUNCTIONS
// =============================================

export const formatPrice = (cents, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
};

export const calculatePackagePrice = (packageData) => {
  if (!packageData?.package_license_tiers) return 0;
  
  return packageData.package_license_tiers.reduce((total, item) => {
    return total + (item.license_tiers?.price_cents || 0);
  }, 0);
};

export const calculateCustomLicensePrice = (customLicenses) => {
  if (!customLicenses || typeof customLicenses !== 'object') return 0;
  
  return Object.values(customLicenses).reduce((total, tierData) => {
    return total + (tierData?.price_cents || 0);
  }, 0);
};

// Generate a unique session ID for anonymous users
export const generateSessionId = () => {
  return crypto.randomUUID();
};

// Get client IP address (for server-side usage)
export const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

export default supabase; 