/// In authUtils.js
import { getSupabaseClient } from '../../../lib/database/supabaseClient';
import secureAuthStorage from '../../product-section/hooks/secureAuthStorage';
import { getAuthCallbackUrl } from '../../../lib/authRedirectUtils';

// Supabase-based authentication utilities
export const loginUser = async (userData) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      // Handle specific Supabase auth errors gracefully
      if (error.message.includes('Email not confirmed') || error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'Please check your email and click the verification link before logging in.',
          needsVerification: true 
        };
      }
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        };
      }
      throw error;
    }

    // Check if user is verified
    if (!data.user.email_confirmed_at) {
      return { 
        success: false, 
        error: 'Please check your email and click the verification link before logging in.',
        needsVerification: true 
      };
    }

    // Create structured user object (avoid client-side database queries)
    const structuredUser = {
      ...data.user,
      email: data.user.email // Ensure email is available
    };

    // Note: User details are now stored securely via SecureStorage in other components

    // Dispatch event for components to listen to
    const authEvent = new CustomEvent("authStateChange", {
      detail: {
        isAuthenticated: true,
        email: userData.email,
        user: structuredUser,  // Pass structured user
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });
    window.dispatchEvent(authEvent);

    return { success: true, user: structuredUser };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

// Register new user with Supabase
export const registerUser = async (userData) => {
  // Check secure storage for registration email sent flag
  const regSent = await secureAuthStorage.getRegistrationEmailSent(userData.email);
  if (regSent && regSent.sent) {
    return { success: false, error: 'You have recently registered with this email. Please wait before trying again.' };
  }
  try {
    // First, create the auth user
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
        emailRedirectTo: getAuthCallbackUrl()
      }
    });
    
    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('already registered')) {
        return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
      }
      if (error.message.includes('Invalid email') || error.message.includes('is invalid')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (error.message.includes('Password')) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      // If rate limit, set flag in secure storage
      if (error.message && (error.message.includes('rate limit') || error.message.includes('Too many requests'))) {
        await secureAuthStorage.setRegistrationEmailSent(userData.email);
        return { success: false, error: 'You have requested registration too many times. Please try again in an hour.' };
      }
      // Don't throw the error, return it as a failure
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'User creation failed. Please try again.' };
    }

    // Supabase handles email verification automatically
    // No need to send manual verification email
    if (!data.user.email_confirmed_at) {
      console.log('User needs email verification - Supabase will send verification email automatically');
    }

    // Create user record using API endpoint only (no client-side database insert)
      try {
        const registrationPayload = {
          auth_user_id: data.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          street_address: userData.streetAddress,
          city: userData.city,
          postal_code: userData.postalCode,
          country: userData.country,
          newsletter_subscribed: userData.newsletter || false
        };

        console.log('🔍 Registration payload being sent to API:', registrationPayload);

        const apiResponse = await fetch('/api/create-user-record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationPayload)
        });

        const apiResult = await apiResponse.json();
      if (apiResult.success) {
        console.log('User record created successfully:', userData.email);
      } else {
        // Check if this is a duplicate user error - don't log this as it's expected
        if (apiResult.error && apiResult.error.includes('already exists')) {
          return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
        }
        // Only log other types of errors
        console.error('Failed to create user record:', apiResult.error);
        return { success: false, error: apiResult.error || 'Failed to create user record' };
      }
    } catch (apiError) {
      console.error('API endpoint error:', apiError);
      return { success: false, error: 'Failed to create user record. Please try again.' };
      }

    // Set registration email sent flag after successful registration
    await secureAuthStorage.setRegistrationEmailSent(userData.email);
    console.log('User registered successfully:', data.user?.email);

    return { success: true, user: data.user, needsVerification: !data.user?.email_confirmed_at };
  } catch (error) {
    // Don't log "already exists" errors as they're expected
    if (!error.message?.includes('already exists') && !error.message?.includes('is invalid')) {
      console.error('Registration error:', error);
    }
    // Always return a structured error response instead of throwing
    return { success: false, error: error.message || 'Registration failed. Please try again.' };
  }
};

// Logout user from Supabase
export const logoutUser = async () => {
  try {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  } catch (error) {
      console.error('Logout error:', error);
    }

    // Note: Authentication-related data is now cleared via SecureStorage in other components
  localStorage.removeItem("isCartAuthenticated");

  // Dispatch logout event
  const authEvent = new CustomEvent("authStateChange", {
    detail: { isAuthenticated: false },
  });
  window.dispatchEvent(authEvent);

    return { success: true };
};

// Check if user is authenticated with Supabase
export const isUserAuthenticated = async () => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Get current user from Supabase
export const getCurrentUser = async () => {
  try {
    // First get the auth user
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Return just the auth user - avoid client-side database queries
    // The cart context will handle loading additional user data if needed
    return {
      ...user,
      email: user.email
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

export const resetCartProgress = async () => {
  // Note: This functionality is now handled by secureCartStorage
  const { default: secureCartStorage } = await import('./secureCartStorage.js');
  await secureCartStorage.removeSessionFlag("hasProceedBeenClicked");
};

export const saveCartState = async (cartState) => {
  // Note: This functionality is now handled by secureCartStorage
  const { default: secureCartStorage } = await import('./secureCartStorage.js');
  
  // Save complete cart state including form position
  const completeState = {
    ...cartState,
    lastPosition: {
      showRegistration: cartState.showRegistration || false,
      showUsageSelection: cartState.showUsageSelection || false,
      showPaymentForm: cartState.showPaymentForm || false,
      isRegistrationComplete: cartState.isRegistrationComplete || false,
      selectedUsage: cartState.selectedUsage || null,
      eulaAccepted: cartState.eulaAccepted || false,
      isAuthenticatedAndPending: cartState.isAuthenticatedAndPending || false,
    },
  };
  await secureCartStorage.saveCartState(completeState);
};

export const getCartState = async () => {
  // Note: This functionality is now handled by secureCartStorage
  const { default: secureCartStorage } = await import('./secureCartStorage.js');
  
  const savedCart = await secureCartStorage.getCartState();
  if (!savedCart) return null;

  // Always return the complete state including lastPosition
  return {
    ...savedCart,
    lastPosition: savedCart.lastPosition || {},
  };
};

export const clearCartState = async () => {
  if (typeof window !== 'undefined') {
    // Note: This functionality is now handled by secureCartStorage
    const { default: secureCartStorage } = await import('./secureCartStorage.js');
    await secureCartStorage.clearCartData();
    
    // Notify other components that cart was cleared
    window.dispatchEvent(new CustomEvent('cartCleared'));
  }
};
