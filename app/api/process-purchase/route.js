import { NextResponse } from 'next/server';
import { supabase, supabaseService } from '../../../lib/database/supabaseClient';
import { PurchaseService } from '../../../lib/database/fontService';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =============================================
// PURCHASE PROCESSING ENDPOINT
// =============================================

// Test route to verify API is accessible
export async function GET() {
  try {
    // Test if PurchaseService can be instantiated
    const purchaseService = new PurchaseService();
    
    return NextResponse.json({
      status: 'API route is working',
      purchaseServiceAvailable: !!purchaseService,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'API route error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('🔄 Purchase processing started');
    
    const purchaseData = await request.json();
    console.log('📦 Received purchase data:', {
      paymentIntentId: purchaseData.paymentIntentId,
      userEmail: purchaseData.userData?.email,
      hasCartData: !!purchaseData.cartData,
      hasBillingDetails: !!purchaseData.billingDetails
    });

    const { paymentIntentId, cartData, userData, billingDetails, usageType, eulaAccepted, companyInfo } = purchaseData;

    // Validate required data
    if (!paymentIntentId || !cartData || !userData?.email) {
      console.error('❌ Missing required data:', {
        paymentIntentId: !!paymentIntentId,
        cartData: !!cartData,
        userEmail: !!userData?.email
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required purchase data (payment intent, cart data, or user email)' 
      }, { status: 400 });
    }

    const userEmail = userData.email;
    console.log('📧 Processing purchase for user:', userEmail);
    
    // First, verify the payment intent is valid and succeeded
    let paymentIntent = null;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log('💳 Payment intent status:', paymentIntent.status);
      
      if (paymentIntent.status !== 'succeeded') {
        console.error('❌ Payment intent not succeeded:', paymentIntent.status);
        return NextResponse.json({ 
          success: false, 
          error: 'Payment not completed successfully',
          code: 'PAYMENT_NOT_SUCCEEDED'
        }, { status: 400 });
      }
    } catch (stripeError) {
      console.error('❌ Error verifying payment intent:', stripeError);
      return NextResponse.json({ 
        success: false, 
        error: 'Unable to verify payment with Stripe',
        code: 'STRIPE_VERIFICATION_FAILED'
      }, { status: 400 });
    }
    
    // Check current auth state
    let currentAuthUser = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      currentAuthUser = authUser;
      console.log('🔍 Current auth state:', {
        hasAuthUser: !!authUser,
        authUserEmail: authUser?.email,
        matchesRequestEmail: authUser?.email === userEmail
      });
    } catch (authCheckError) {
      console.error('❌ Error checking auth state:', authCheckError);
      // Don't fail here - payment confirmation page might not have session
    }
    
    // Find user by email in our database
    let user = null;
    let userId = null;
    
    try {
      // First try to find user by email
      console.log('🔍 Looking for user by email:', userEmail);
      const { data: existingUser, error: lookupError } = await supabaseService
      .from('users')
        .select('*')
        .eq('email', userEmail)
      .single();

      if (lookupError) {
        console.log('❌ User lookup by email failed:', lookupError.code, lookupError.message);
        
        // If user not found by email, try by auth_user_id if we have an auth user
        if (currentAuthUser && currentAuthUser.email === userEmail) {
          console.log('🔍 Trying to find user by auth_user_id:', currentAuthUser.id);
          const { data: authBasedUser, error: authLookupError } = await supabaseService
            .from('users')
            .select('*')
            .eq('auth_user_id', currentAuthUser.id)
            .single();
          
          if (authLookupError) {
            console.log('❌ User lookup by auth_user_id failed:', authLookupError.code, authLookupError.message);
            
            // Since payment succeeded, try to create the user record
            console.log('🔧 Payment succeeded but user not found - attempting to create user record');
            try {
              const { data: newUser, error: createError } = await supabaseService
                .from('users')
                .insert([{
                  auth_user_id: currentAuthUser.id,
                  email: userEmail,
                  first_name: billingDetails?.name?.split(' ')[0] || 'User',
                  last_name: billingDetails?.name?.split(' ').slice(1).join(' ') || '',
                  street_address: billingDetails?.street || '',
                  city: billingDetails?.city || '',
                  postal_code: billingDetails?.postcode || '',
                  country: billingDetails?.country || '',
                  newsletter_subscribed: false,
                  email_verified: true,
                  is_active: true
                }])
                .select()
                .single();

              if (createError) {
                console.error('❌ Failed to create user record:', createError);
                return NextResponse.json({ 
                  success: false, 
                  error: 'Unable to create user account for purchase processing',
                  code: 'USER_CREATION_FAILED'
                }, { status: 500 });
              }
              
              user = newUser;
              userId = user.id;
              console.log('✅ Created new user record:', userEmail, 'ID:', userId);
            } catch (createError) {
              console.error('❌ Error creating user record:', createError);
              return NextResponse.json({ 
                success: false, 
                error: 'Failed to create user account for purchase',
                code: 'USER_CREATION_ERROR'
              }, { status: 500 });
            }
          } else {
            user = authBasedUser;
            userId = user.id;
            console.log('✅ User found by auth_user_id:', userEmail, 'ID:', userId);
          }
        } else {
          // No auth user but payment succeeded - this is payment confirmation page
          console.log('❌ No auth user available and user not found by email');
          console.log('🔍 Checking if this is a legitimate payment confirmation...');
          
          // For payment confirmation, we need to be more permissive
          // but still secure by verifying the payment intent
          if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log('✅ Valid payment intent confirmed - allowing purchase processing without user record');
            console.log('⚠️  This indicates a user registration issue that should be investigated');
            
            // For now, we'll create a minimal user record based on billing details
            const firstName = billingDetails?.name?.split(' ')[0] || 'User';
            const lastName = billingDetails?.name?.split(' ').slice(1).join(' ') || '';
            
            try {
              const { data: newUser, error: createError } = await supabaseService
                .from('users')
                .insert([{
                  auth_user_id: null, // No auth user available
                  email: userEmail,
                  first_name: firstName,
                  last_name: lastName,
                  street_address: billingDetails?.street || '',
                  city: billingDetails?.city || '',
                  postal_code: billingDetails?.postcode || '',
                  country: billingDetails?.country || '',
                  newsletter_subscribed: false,
                  email_verified: false, // Since we don't have auth confirmation
                  is_active: true
                }])
                .select()
                .single();

              if (createError) {
                console.error('❌ Failed to create user record for payment confirmation:', createError);
        return NextResponse.json({ 
          success: false, 
                  error: 'Unable to process purchase - user account creation failed',
                  code: 'PAYMENT_CONFIRMATION_USER_CREATION_FAILED'
                }, { status: 500 });
              }
              
              user = newUser;
              userId = user.id;
              console.log('✅ Created user record for payment confirmation:', userEmail, 'ID:', userId);
            } catch (createError) {
              console.error('❌ Error creating user record for payment confirmation:', createError);
        return NextResponse.json({ 
          success: false, 
                error: 'Failed to process purchase - user account error',
                code: 'PAYMENT_CONFIRMATION_ERROR'
        }, { status: 500 });
            }
          } else {
            console.error('❌ Invalid payment intent for user creation');
            return NextResponse.json({ 
              success: false, 
              error: 'User account not found and payment verification failed',
              code: 'USER_NOT_FOUND_PAYMENT_INVALID'
            }, { status: 403 });
          }
        }
      } else {
        user = existingUser;
        userId = user.id;
        console.log('✅ User found by email:', userEmail, 'ID:', userId);
      }
    } catch (error) {
      console.error('❌ Error during user lookup:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to verify user account' 
      }, { status: 500 });
    }

    // Create purchase order
    const purchaseOrderData = {
      stripe_payment_intent_id: paymentIntentId,
      user_id: userId,
      subtotal_cents: Math.round(cartData.totalPrice * 100),
      tax_cents: 0, // No tax for now
      total_cents: Math.round(cartData.totalPrice * 100),
      currency: 'GBP',
      status: 'completed',
      payment_status: 'completed',
      usage_type: usageType || 'personal',
      billing_details: {
        name: billingDetails?.name || user.first_name + ' ' + user.last_name || '',
        email: billingDetails?.email || userEmail,
        street: billingDetails?.street || user.street_address || '',
        city: billingDetails?.city || user.city || '',
        postcode: billingDetails?.postcode || user.postal_code || '',
        country: billingDetails?.country || user.country || '',
        eula_accepted: eulaAccepted || false
      },
      company_info: {
        company_name: companyInfo?.companyName || null,
        contact_person: companyInfo?.contactPerson || null
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Creating purchase order...');
    const { data: purchaseOrder, error: purchaseError } = await supabaseService
      .from('purchase_orders')
      .insert([purchaseOrderData])
      .select()
      .single();

    if (purchaseError) {
      console.error('❌ Failed to create purchase order:', purchaseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create purchase order' 
      }, { status: 500 });
    }

    console.log('✅ Purchase order created successfully:', purchaseOrder.id);

    // Create purchase items
    const cartItems = await formatCartItems(cartData);
    if (cartItems.length > 0) {
      const purchaseItemsData = cartItems.map(item => ({
        ...item,
        purchase_order_id: purchaseOrder.id,
        created_at: new Date().toISOString()
      }));

      const { data: purchaseItems, error: itemsError } = await supabaseService
        .from('purchase_items')
        .insert(purchaseItemsData)
        .select();

      if (itemsError) {
        console.error('❌ Failed to create purchase items:', itemsError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create purchase items' 
        }, { status: 500 });
      }

      console.log('✅ Purchase items created successfully');

      // Create user licenses for each purchase item
      const userLicensesData = purchaseItems.map(item => ({
        user_id: userId,
        purchase_item_id: item.id,
        font_style_id: item.font_style_id,
        license_tiers: item.license_package_id ? [] : Object.keys(item.custom_licenses || {}).filter(key => item.custom_licenses[key]),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: userLicenses, error: licensesError } = await supabaseService
        .from('user_licenses')
        .insert(userLicensesData)
        .select();

      if (licensesError) {
        console.error('❌ Failed to create user licenses:', licensesError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create user licenses' 
        }, { status: 500 });
      }

      console.log('✅ User licenses created successfully');

      // Create download tokens for each user license (non-blocking)
      console.log('📁 Creating download tokens...');
      const downloadTokensData = [];
      
      // Try to create download tokens, but don't fail the purchase if this fails
      try {
      for (const userLicense of userLicenses) {
        // Create download tokens for common font formats
        const formats = ['woff2', 'woff', 'ttf', 'otf'];
        
        for (const format of formats) {
          try {
              // Use raw SQL to bypass RLS policies
              const { data: downloadToken, error } = await supabaseService
                .from('font_downloads')
                .insert({
              user_id: userId,
              user_license_id: userLicense.id,
              font_style_id: userLicense.font_style_id,
              file_format: format,
                  download_token: `${userLicense.id}-${format}-${Date.now()}`,
                  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
                })
                .select()
                .single();
              
              if (error) {
                console.error(`❌ Failed to create download token for format ${format}:`, error);
                // Continue with other formats instead of failing
            } else {
                downloadTokensData.push(downloadToken);
                console.log(`✅ Created download token for format ${format}`);
            }
          } catch (error) {
            console.error(`❌ Error creating download token for format ${format}:`, error);
              // Continue with other formats instead of failing
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in download token creation process:', error);
        // Don't fail the purchase - user can still access fonts through other means
      }
      
      console.log(`✅ Created ${downloadTokensData.length} download tokens (${downloadTokensData.length > 0 ? 'success' : 'will be created on first download'})`);
    } else {
      console.log('ℹ️ No cart items to process - skipping download token creation');
    }

    return NextResponse.json({
      success: true,
      purchaseOrderId: purchaseOrder.id,
      message: 'Purchase completed successfully. You can now download your fonts.'
    });

  } catch (error) {
    console.error('❌ Purchase processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to format cart items for database
async function formatCartItems(cartData) {
  const items = [];

  // Handle multi-font selections
  if (cartData.selectedFonts && cartData.selectedStyles) {
    for (const font of cartData.selectedFonts) {
      const fontStyles = cartData.selectedStyles[font.id] || [];
      
      for (const style of fontStyles) {
        // Use the actual font style ID from the database
        const fontStyleId = await mapToFontStyleId(font, style);
        
        if (!fontStyleId) {
          console.error('❌ Could not find font style ID for:', font, style);
          continue; // Skip this item if we can't find the style
        }
        
        const item = {
          font_style_id: fontStyleId,
          license_type: cartData.selectedPackage ? 'package' : 'custom',
          license_package_id: await mapToLicensePackageId(cartData.selectedPackage),
          custom_licenses: cartData.selectedPackage ? null : {
            print: cartData.customPrintLicense || false,
            web: cartData.customWebLicense || false,
            app: cartData.customAppLicense || false,
            social: cartData.customSocialLicense || false
          },
          unit_price_cents: Math.round((cartData.totalPrice / getTotalStyleCount(cartData)) * 100),
          quantity: 1,
          total_price_cents: Math.round((cartData.totalPrice / getTotalStyleCount(cartData)) * 100)
        };
        items.push(item);
      }
    }
  } 
  // Handle single font selection (legacy)
  else if (cartData.cartFont || cartData.selectedFont) {
    const font = cartData.cartFont || cartData.selectedFont;
    // Use the first available style or map to default
    const fontStyleId = await mapToFontStyleId(font, { name: 'Regular' });
    
    if (fontStyleId) {
    const item = {
      font_style_id: fontStyleId,
      license_type: cartData.selectedPackage ? 'package' : 'custom',
        license_package_id: await mapToLicensePackageId(cartData.selectedPackage),
      custom_licenses: cartData.selectedPackage ? null : {
        print: cartData.customPrintLicense || false,
        web: cartData.customWebLicense || false,
        app: cartData.customAppLicense || false,
        social: cartData.customSocialLicense || false
      },
      unit_price_cents: Math.round(cartData.totalPrice * 100),
      quantity: 1,
      total_price_cents: Math.round(cartData.totalPrice * 100)
    };
    items.push(item);
    } else {
      console.error('❌ Could not find font style ID for single font:', font);
    }
  }

  return items;
}

// Helper function to map font and style to database font_style_id
async function mapToFontStyleId(font, style) {
  try {
    // Query the database to find the actual font style ID
    const fontName = font.name || font.slug || 'jant';
    const styleName = style.name || style.slug || 'regular';
    
    // First, find the font family
    const { data: fontFamily, error: familyError } = await supabaseService
      .from('font_families')
      .select('id')
      .ilike('name', fontName)
      .single();
    
    if (familyError || !fontFamily) {
      console.error('❌ Font family not found:', fontName, familyError);
      // Fallback to any available font family
      const { data: fallbackFamily } = await supabaseService
        .from('font_families')
        .select('id')
        .limit(1)
        .single();
      
      if (!fallbackFamily) {
        throw new Error('No font families found in database');
      }
      
      // Find any style for this family
      const { data: fallbackStyle } = await supabaseService
        .from('font_styles')
        .select('id')
        .eq('font_family_id', fallbackFamily.id)
        .limit(1)
        .single();
      
      return fallbackStyle?.id || null;
    }
    
    // Find the specific style within this font family
    const { data: fontStyle, error: styleError } = await supabaseService
      .from('font_styles')
      .select('id')
      .eq('font_family_id', fontFamily.id)
      .ilike('name', styleName)
      .single();
    
    if (styleError || !fontStyle) {
      console.error('❌ Font style not found:', styleName, 'for font:', fontName, styleError);
      // Fallback to any available style for this font family
      const { data: fallbackStyle } = await supabaseService
        .from('font_styles')
        .select('id')
        .eq('font_family_id', fontFamily.id)
        .limit(1)
        .single();
      
      return fallbackStyle?.id || null;
    }
    
    return fontStyle.id;
  } catch (error) {
    console.error('❌ Error mapping font style ID:', error);
    return null;
  }
}

// Helper function to map license package to database ID
async function mapToLicensePackageId(selectedPackage) {
  if (!selectedPackage) return null;
  
  try {
    // Query the database to find the actual license package ID
    const { data: licensePackage, error } = await supabaseService
      .from('license_packages')
      .select('id')
      .ilike('name', selectedPackage)
      .single();
    
    if (error || !licensePackage) {
      console.error('❌ License package not found:', selectedPackage, error);
      // Fallback to any available package
      const { data: fallbackPackage } = await supabaseService
        .from('license_packages')
        .select('id')
        .limit(1)
        .single();
      
      return fallbackPackage?.id || null;
    }
    
    return licensePackage.id;
  } catch (error) {
    console.error('❌ Error mapping license package ID:', error);
      return null;
  }
}

// Helper function to count total styles across all fonts
function getTotalStyleCount(cartData) {
  if (!cartData.selectedStyles) return 1;
  
  return Object.values(cartData.selectedStyles).reduce((total, styles) => {
    return total + styles.length;
  }, 0);
} 