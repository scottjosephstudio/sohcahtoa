/// In authUtils.js
import { supabase } from '../../../lib/database/supabaseClient';

// Supabase-based authentication utilities
export const loginUser = async (userData) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      throw error;
    }

    // Get the full user record from our database
    let dbUser = null;
    if (data.user) {
      try {
        const { data: userRecord, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single();
        
        if (!dbError) {
          dbUser = userRecord;
        } else {
          console.error('Error fetching user record:', dbError);
        }
      } catch (dbError) {
        console.error('Error fetching user record:', dbError);
      }
    }

    // Create structured user object
    const structuredUser = {
      ...data.user,
      email: data.user.email, // Ensure email is available
      dbData: dbUser          // Database user record
    };

    // Store additional user details if provided
    if (userData.firstName) {
      localStorage.setItem("firstName", userData.firstName);
    }
    if (userData.lastName) {
      localStorage.setItem("lastName", userData.lastName);
    }

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
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      }
    });

    if (error) {
      throw error;
    }

    // Send verification email
    if (data.user && !data.user.email_confirmed_at) {
      try {
        // Generate verification token (in production, Supabase handles this)
        const verificationToken = crypto.randomUUID();
        
        const emailResponse = await fetch('/api/send-verification-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            firstName: userData.firstName,
            verificationToken: verificationToken
          })
        });

        const emailResult = await emailResponse.json();
        
        if (emailResult.success) {
          console.log('Verification email sent successfully');
          
          // In development, log the verification URL for testing
          if (process.env.NODE_ENV === 'development' && emailResult.verificationUrl) {
            console.log('Development verification URL:', emailResult.verificationUrl);
          }
        } else {
          console.error('Failed to send verification email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail registration if email sending fails
      }
    }

    // Create user record in our database
    if (data.user) {
      try {
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .insert([{
            auth_user_id: data.user.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            street_address: userData.streetAddress || userData.street_address,
            city: userData.city,
            postal_code: userData.postalCode || userData.postal_code,
            country: userData.country,
            newsletter_subscribed: userData.newsletter || false,
            email_verified: false,
            is_active: true
          }])
          .select()
          .single();

        if (dbError) {
          console.error('Error creating user record:', dbError);
          console.error('Database error details:', {
            code: dbError.code,
            message: dbError.message,
            details: dbError.details,
            hint: dbError.hint
          });
          
          // Try using our API endpoint as fallback
          console.log('Attempting to create user record via API endpoint...');
          try {
            const apiResponse = await fetch('/api/create-user-record', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                auth_user_id: data.user.id,
                email: userData.email,
                first_name: userData.firstName,
                last_name: userData.lastName,
                street_address: userData.streetAddress,
                city: userData.city,
                postal_code: userData.postalCode,
                country: userData.country,
                newsletter_subscribed: userData.newsletter || false
              })
            });
            
            const apiResult = await apiResponse.json();
            if (apiResult.success) {
              console.log('User record created via API endpoint:', userData.email);
            } else {
              console.error('API endpoint also failed:', apiResult.error);
            }
          } catch (apiError) {
            console.error('API endpoint error:', apiError);
          }
        } else {
          console.log('User record created in database:', dbUser.email);
        }
      } catch (dbError) {
        console.error('Error creating user record:', dbError);
        // Don't fail registration if database insert fails
      }
    }

    console.log('User registered successfully:', data.user?.email);

    return { success: true, user: data.user, needsVerification: !data.user?.email_confirmed_at };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

// Logout user from Supabase
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
    }

    // Clear local storage
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
  localStorage.removeItem("isCartAuthenticated");
    clearCartState();

  // Dispatch logout event
  const authEvent = new CustomEvent("authStateChange", {
    detail: { isAuthenticated: false },
  });
  window.dispatchEvent(authEvent);

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is authenticated with Supabase
export const isUserAuthenticated = async () => {
  try {
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Then get the full user record from our database
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (dbError) {
      console.error('Error fetching user record:', dbError);
      // Return just the auth user if database fetch fails
      return user;
    }

    // Return user in the format expected by the cart
    // with both auth user data and database user data
    return {
      ...user,
      email: user.email, // Auth user email
      dbData: dbUser     // Database user record
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

export const resetCartProgress = () => {
  localStorage.removeItem("hasProceedBeenClicked");
};

export const saveCartState = (cartState) => {
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
  localStorage.setItem("cartState", JSON.stringify(completeState));
};

export const getCartState = () => {
  const savedCart = localStorage.getItem("cartState");
  if (!savedCart) return null;

  const parsedCart = JSON.parse(savedCart);
  // Always return the complete state including lastPosition
  return {
    ...parsedCart,
    lastPosition: parsedCart.lastPosition || {},
  };
};

export const clearCartState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cartState');
    // Notify other components that cart was cleared
    window.dispatchEvent(new CustomEvent('cartCleared'));
  }
};
