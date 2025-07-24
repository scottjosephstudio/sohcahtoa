// useAuthState.js
import React, { useState, useEffect, useCallback } from "react";
import {
  isUserAuthenticated,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../../cart/Utils/authUtils";
import { getSupabaseClient } from "../../../lib/database/supabaseClient";
import secureAuthStorage from './secureAuthStorage.js';
import { getAuthCallbackUrl } from '../../../lib/authRedirectUtils';

export const useAuthState = (prefetchedUser = null, prefetchedDatabaseDataLoaded = false) => {
  // Authentication states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Current user data - initialize with pre-fetched data if available
  const [currentUser, setCurrentUser] = useState(prefetchedUser);
  const [databaseDataLoaded, setDatabaseDataLoaded] = useState(prefetchedDatabaseDataLoaded);

  // Password Reset states
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [resetEmailError, setResetEmailError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [isSuccessTimeout, setIsSuccessTimeout] = useState(false);
  const [resetRateLimitCountdown, setResetRateLimitCountdown] = useState(0);
  const [resetRateLimitMessage, setResetRateLimitMessage] = useState("");

  // Email verification states
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  // Dashboard states
  const [$isSaving, set$isSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [hasPurchases, setHasPurchases] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    street: "",
    city: "",
    postcode: "",
    country: "",
  });

  // Enhanced setBillingDetails with logging
  const setBillingDetailsWithLogging = (newBillingDetails) => {
    console.log('📋 Auth State: setBillingDetails called with:', newBillingDetails);
    console.log('📋 Auth State: Previous billing details:', billingDetails);
    setBillingDetails(newBillingDetails);
    console.log('📋 Auth State: Billing details updated successfully');
  };

  // Initialize with pre-fetched data if available
  useEffect(() => {
    if (prefetchedUser) {
      const isAuth = !!(prefetchedUser && prefetchedUser.email_confirmed_at);
      setIsAuthenticated(isAuth);
      setIsLoggedIn(isAuth);
      setCurrentUser(prefetchedUser);
      setUserEmail(prefetchedUser.email || "");
      
      // If we have pre-fetched database data, set billing details
      if (prefetchedUser.dbData) {
        const dbBillingDetails = {
          street: prefetchedUser.dbData.street_address || "",
          city: prefetchedUser.dbData.city || "",
          postcode: prefetchedUser.dbData.postal_code || "",
          country: prefetchedUser.dbData.country || "",
        };
        setBillingDetails(dbBillingDetails);
        setDatabaseDataLoaded(true);
      }
    }
  }, [prefetchedUser, prefetchedDatabaseDataLoaded]);

  // Load user data from database with retry mechanism
  const loadUserData = async (userId, retryCount = 0) => {
    try {
      console.log("🔄 Loading user data for:", userId, `(attempt ${retryCount + 1})`);
      
      // Reset database data loaded flag to ensure fresh data
      setDatabaseDataLoaded(false);
      
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        const { user } = data;
        
        console.log("📊 API response user data:", user);
        
        // Update billing details from database
        if (user) {
          const dbBillingDetails = {
            street: user.street_address || "",
            city: user.city || "",
            postcode: user.postal_code || "",
            country: user.country || "",
          };
          
          console.log("📋 Setting billing details from database:", dbBillingDetails);
          setBillingDetailsWithLogging(dbBillingDetails);
          setDatabaseDataLoaded(true); // Mark database data as loaded
          
          // Update currentUser with database data
          setCurrentUser(prevUser => ({
            ...prevUser,
            dbData: user
          }));
          
          console.log("✅ User data loaded successfully and billing details updated:", dbBillingDetails);
          console.log("✅ CurrentUser updated with dbData:", user);
        } else {
          console.log("⚠️ No user data found in response");
          
          // Retry if this is a fresh registration (within 5 seconds) and we haven't retried too many times
          if (retryCount < 3) {
            console.log(`🔄 Retrying user data load in 1 second (attempt ${retryCount + 1}/3)`);
            setTimeout(() => {
              loadUserData(userId, retryCount + 1);
            }, 1000);
          } else {
            console.log("❌ Max retries reached for user data load");
          }
        }
      } else {
        console.log("⚠️ Failed to load user data, status:", response.status);
        const errorText = await response.text();
        console.log("⚠️ Error response:", errorText);
        
        // Retry on server errors
        if (response.status >= 500 && retryCount < 3) {
          console.log(`🔄 Retrying user data load due to server error (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            loadUserData(userId, retryCount + 1);
          }, 1000);
        }
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      
      // Retry on network errors
      if (retryCount < 3) {
        console.log(`🔄 Retrying user data load due to network error (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          loadUserData(userId, retryCount + 1);
        }, 1000);
      }
    }
  };

  // Simple authentication check
  const checkAuthentication = useCallback(async () => {
    console.log("🔍 Checking authentication...");
    try {
      const user = await getCurrentUser();
      const isAuth = !!(user && user.email_confirmed_at);
      
      console.log("🔍 Auth check result:", { 
        user: !!user, 
        email: user?.email, 
        verified: !!user?.email_confirmed_at,
        isAuth 
      });
      
      setIsAuthenticated(isAuth);
      setIsLoggedIn(isAuth);
      setCurrentUser(user);

      if (user) {
        setUserEmail(user.email);
        if (user.email_confirmed_at) {
          console.log("🔄 Loading user data for verified user:", user.id);
          // Only load user data for verified users
        loadUserData(user.id);
        } else {
          console.log("⚠️ User found but not verified:", user.email);
        }
      } else {
        setUserEmail("");
        console.log("❌ No user found in auth check");
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUserEmail("");
    }
  }, []);

  // Initial authentication check
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Ensure billing details are loaded when dashboard is opened
  useEffect(() => {
    if (isDashboardOpen && isLoggedIn && currentUser?.email_confirmed_at && !databaseDataLoaded) {
      console.log("🔄 Dashboard opened but billing details not loaded, loading now");
      loadUserData(currentUser.id);
    }
  }, [isDashboardOpen, isLoggedIn, currentUser?.email_confirmed_at, databaseDataLoaded]);

  // Handle verification completion specifically
  useEffect(() => {
    if (currentUser?.email_confirmed_at && isLoggedIn && !databaseDataLoaded) {
      console.log("🎉 User verified, loading billing details immediately");
      loadUserData(currentUser.id);
    }
  }, [currentUser?.email_confirmed_at, isLoggedIn, databaseDataLoaded]);

  // Debug: Log billing details changes
  useEffect(() => {
    console.log("📋 Auth state billing details changed:", billingDetails);
  }, [billingDetails]);

  // Simple Supabase auth listener
  useEffect(() => {
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Supabase auth state change:", event, !!session?.user);
        
        const user = session?.user ?? null;

        // Always set currentUser if user exists (for verification status checking)
        setCurrentUser(user);

        // Handle different auth events
        if (event === 'SIGNED_IN' && user?.email_confirmed_at) {
          // User manually logged in and is verified
          setIsAuthenticated(true);
          setIsLoggedIn(true);
          setUserEmail(user.email);
          loadUserData(user.id);
        } else if (event === 'SIGNED_OUT') {
          // User logged out
          setIsAuthenticated(false);
          setIsLoggedIn(false);
          setCurrentUser(null);
        setUserEmail("");
        setUserPassword("");
            setBillingDetails({
              street: "",
              city: "",
              postcode: "",
              country: "",
            });
          setDatabaseDataLoaded(false);
        } else if (user && !user.email_confirmed_at) {
          // User exists but is unverified (after registration)
          setIsAuthenticated(false);
          setIsLoggedIn(false);
          setUserEmail(user.email);
        } else if (user && user.email_confirmed_at) {
          // User is verified (could be from email verification or manual login)
          // Load user data to get billing details
          loadUserData(user.id);
        }

        // Dispatch custom event for other components
        const authEvent = new CustomEvent("authStateChange", {
          detail: { 
            isAuthenticated: event === 'SIGNED_IN' && user?.email_confirmed_at, 
            email: user?.email,
            user: user 
          },
        });
        window.dispatchEvent(authEvent);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Listen for userLoggedOut event from payment confirmation
  useEffect(() => {
    const handleUserLoggedOut = () => {
      setIsAuthenticated(false);
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUserEmail("");
      setUserPassword("");
      setIsLoginModalOpen(false);
      setBillingDetails({
        street: "",
        city: "",
        postcode: "",
        country: "",
      });
      
      // Clear Supabase session
      const supabase = getSupabaseClient();
      supabase.auth.signOut();
    };

    window.addEventListener('userLoggedOut', handleUserLoggedOut);

    return () => {
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
    };
  }, []);

  // Remove localStorage fallbacks - rely on database data
  useEffect(() => {
    // Database data loading is handled by loadUserData function
    // when user is authenticated
  }, [isAuthenticated]);

  const handleInputFocus = (inputType) => {
    switch (inputType) {
      case "email":
        setEmailError(false);
        setLoginError("");
        break;
      case "password":
        setPasswordError(false);
        setLoginError("");
        break;
      case "resetEmail":
        setResetEmailError(false);
        break;
      case "newPassword":
        setNewPasswordError(false);
        break;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    setEmailError(false);
    setPasswordError(false);

    if (!userEmail) {
      setEmailError(true);
      setIsLoggingIn(false);
      return;
    }
    if (!userPassword) {
      setPasswordError(true);
      setIsLoggingIn(false);
      return;
    }

    try {
      console.log('🔄 LoginModal: Attempting login with:', userEmail);
      const result = await loginUser({ 
        email: userEmail, 
        password: userPassword 
      });

      console.log('📊 LoginModal: Login result:', { 
        success: result.success, 
        error: result.error,
        needsVerification: result.needsVerification 
      });

      if (result.success) {
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        setIsAuthenticated(true);
        setCurrentUser(result.user);
        // Load user data from database
        loadUserData(result.user.id);
        // Password will be cleared by auth state change
      } else {
        // Handle specific error cases with better error messages
        const errorMessage = result.error || '';
        console.log('❌ LoginModal: Login failed with error:', errorMessage);
        
        // Check for verification-related errors first
        if (result.needsVerification || 
            errorMessage.includes('email_not_confirmed') || 
            errorMessage.includes('Email not confirmed') ||
            errorMessage.includes('verification') ||
            errorMessage.includes('confirmed')) {
          setLoginError("Please check your email and click the verification link before logging in. Check your spam folder if you don't see it.");
          setShowResendVerification(true);
        } else if (errorMessage.includes('invalid_credentials') || 
                   errorMessage.includes('Invalid login credentials') ||
                   errorMessage.includes('Invalid email or password')) {
          setLoginError("Invalid email or password. Please check your credentials and try again.");
          setShowResendVerification(false);
        } else if (errorMessage.includes('user_not_found') ||
                   errorMessage.includes('No account found')) {
          setLoginError("No account found with this email address. Please check your email or sign up for a new account.");
          setShowResendVerification(false);
        } else if (errorMessage.includes('too_many_requests')) {
          setLoginError("Too many login attempts. Please wait a few minutes before trying again.");
          setShowResendVerification(false);
        } else if (errorMessage.includes('signup_disabled')) {
          setLoginError("Account registration is currently disabled. Please contact support.");
          setShowResendVerification(false);
        } else {
          // Default error message
          setLoginError("Login failed. Please check your email and password and try again.");
          setShowResendVerification(false);
        }
        setUserPassword("");
      }
    } catch (error) {
      console.error('❌ LoginModal: Login exception:', error);
      
      // Handle specific error cases from the caught error
      const errorMessage = error.message || '';
      console.log('❌ LoginModal: Exception error message:', errorMessage);
      
      if (errorMessage.includes('email_not_confirmed') || 
          errorMessage.includes('Email not confirmed') ||
          errorMessage.includes('verification') ||
          errorMessage.includes('confirmed')) {
        setLoginError("Please check your email and click the verification link before logging in. Check your spam folder if you don't see it.");
        setShowResendVerification(true);
      } else if (errorMessage.includes('invalid_credentials') || 
                 errorMessage.includes('Invalid login credentials') ||
                 errorMessage.includes('Invalid email or password')) {
        setLoginError("Invalid email or password. Please check your credentials and try again.");
        setShowResendVerification(false);
      } else if (errorMessage.includes('user_not_found')) {
        setLoginError("No account found with this email address. Please check your email or sign up for a new account.");
        setShowResendVerification(false);
      } else if (errorMessage.includes('too_many_requests')) {
        setLoginError("Too many login attempts. Please wait a few minutes before trying again.");
        setShowResendVerification(false);
      } else {
        setLoginError("Login failed. Please check your email and password and try again.");
        setShowResendVerification(false);
      }
      setUserPassword("");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) {
      setLoginError("Please enter your email address first.");
      return;
    }

    setIsResendingVerification(true);
    
    try {
      console.log('🔄 LoginModal: Attempting to resend verification email to:', userEmail);
      
      // Check if user is already verified
      if (currentUser?.email_confirmed_at) {
        console.log('✅ User is already verified, no need to resend');
        setLoginError("Your email is already verified! You can proceed with your purchase.");
        setShowResendVerification(false);
        return;
      }

      const { supabase } = await import('../../../lib/database/supabaseClient');
      
      // Use the same redirect URL as registration
      const redirectTo = getAuthCallbackUrl();
      
      console.log('🔗 Using redirect URL:', redirectTo);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
          email: userEmail,
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error('❌ Resend verification error:', error);
        
        // Handle specific error cases
        if (error.message.includes('rate limit') || error.message.includes('can only request this after')) {
          const secondsMatch = error.message.match(/(\d+) seconds/);
          const seconds = secondsMatch ? secondsMatch[1] : '60';
          setLoginError(`Please wait ${seconds} seconds before requesting another verification email.`);
        } else if (error.message.includes('already confirmed')) {
          setLoginError("Your email is already verified. Please try logging in.");
          setShowResendVerification(false);
        } else if (error.message.includes('invalid')) {
          setLoginError(`Invalid request: ${error.message}`);
        } else {
          setLoginError(error.message || 'Failed to send verification email. Please try again.');
        }
      } else {
        console.log('✅ Verification email resent successfully');
        setLoginError("Verification email sent! Please check your inbox and spam folder.");
        setShowResendVerification(false);
      }
    } catch (error) {
      console.error('❌ Error resending verification email:', error);
      setLoginError("An error occurred while sending the email. Please try again.");
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      // User is fully logged in and verified, open dashboard
      setIsDashboardOpen(!isDashboardOpen);
    } else {
      // Check if user is authenticated but unverified
      // Only show verification prompt if user is actually authenticated (has valid session)
      if (currentUser && currentUser.id && !currentUser.email_confirmed_at) {
        // User is unverified, show verification prompt/message
        setIsLoginModalOpen(true);
        setLoginError("Please check your email and verify your account before logging in.");
        setShowResendVerification(true);
      } else {
        // User is not authenticated at all, show normal login modal
      setIsLoginModalOpen(!isLoginModalOpen);
      // Clear any previous errors when opening modal
      if (!isLoginModalOpen) {
        setLoginError("");
        setEmailError(false);
        setPasswordError(false);
          setShowResendVerification(false);
        }
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetEmailError(true);
      return;
    }
    // Check secure storage for reset email sent flag
    const resetSent = await secureAuthStorage.getResetEmailSent(resetEmail);
    if (resetSent && resetSent.sent) {
      setResetRateLimitMessage("You've recently requested a password reset. Please wait before trying again.");
      setResetEmailError(true);
      return;
    }
    // Check if we're still in rate limit countdown
    if (resetRateLimitCountdown > 0) {
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: getAuthCallbackUrl()
      });
      if (error) {
        console.error('Password reset error:', error);
        setResetEmailError(true);
        setResetEmail("");
        // If rate limit, set flag in secure storage
        if (error.message && (error.message.includes('rate limit') || error.message.includes('Too many requests'))) {
          setResetRateLimitMessage("You've requested too many password resets. Please try again in an hour.");
          await secureAuthStorage.setResetEmailSent(resetEmail);
        }
      } else {
        setShowSuccessMessage(true);
        setResetEmailError(false);
        setResetRateLimitMessage("");
        await secureAuthStorage.setResetEmailSent(resetEmail);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Password reset exception:', error);
      setResetEmailError(true);
      setResetEmail("");
      setResetRateLimitMessage("An error occurred. Please try again later.");
    }
  };

  // Add effect to detect when user returns from auth callback with completed password reset
  useEffect(() => {
    const handlePasswordResetComplete = (event) => {
      if (event.detail?.passwordUpdated) {
        console.log('✅ Password reset completed, closing modal');
        setIsLoginModalOpen(false);
        setIsResetPassword(false);
        setResetEmail("");
        setNewPassword("");
        setShowSuccessMessage(false);
        setIsResetting(false);
      }
    };

    const handlePasswordResetCompleteEvent = (event) => {
      if (event.detail?.success) {
        console.log('✅ Password reset completed via specific event, closing modal');
        setIsLoginModalOpen(false);
        setIsResetPassword(false);
        setResetEmail("");
        setNewPassword("");
        setShowSuccessMessage(false);
        setIsResetting(false);
      }
    };

    window.addEventListener('authStateChange', handlePasswordResetComplete);
    window.addEventListener('passwordResetComplete', handlePasswordResetCompleteEvent);
    
    return () => {
      window.removeEventListener('authStateChange', handlePasswordResetComplete);
      window.removeEventListener('passwordResetComplete', handlePasswordResetCompleteEvent);
    };
  }, [setIsLoginModalOpen]);

  const handleBackToLogin = () => {
    setIsResetPassword(false);
    setIsResetting(false);
    setResetEmail("");
    setNewPassword("");
  };

  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    const isNewPasswordValid = newPassword.length >= 8;

    if (!isNewPasswordValid) {
      setNewPasswordError(true);
      setNewPassword("");
      return;
    }

    try {
      setIsResetting(true);
      
      // Use the new API route for updating the password
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        setNewPasswordError(false);
        setIsSuccessTimeout(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
          setIsResetting(false);
          setIsResetPassword(false);
          setResetEmail("");
          setNewPassword("");
          if (isSuccessTimeout) {
            setIsLoginModalOpen(false);
          }
          setIsSuccessTimeout(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Password update error:', errorData);
        setNewPasswordError(true);
        setNewPassword("");
      }
    } catch (error) {
      console.error('Password update exception:', error);
      setNewPasswordError(true);
      setNewPassword("");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    
    try {
      await logoutUser();
      
      // Only clear authentication state
      setIsLoggedIn(false);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserEmail("");
      setUserPassword("");
      setIsLoginModalOpen(false);
      setIsDashboardOpen(false);
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveChanges = async () => {
    set$isSaving(true);
    
    try {
      // Get current user auth data
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update database via API endpoint
        const response = await fetch('/api/update-user-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            email: userEmail,
            street_address: billingDetails.street,
            city: billingDetails.city,
            postal_code: billingDetails.postcode,
            country: billingDetails.country,
            newsletter_subscribed: newsletter
          })
        });

        if (response.ok) {
          // Update savedRegistrationData format for cart Personal Details
          const registrationData = {
            firstName: user.user_metadata?.first_name || 'Scott',
            surname: user.user_metadata?.last_name || 'Joseph',
            email: userEmail,
            street: billingDetails.street,
            streetAddress: billingDetails.street, // Alternative key for compatibility
            city: billingDetails.city,
            postcode: billingDetails.postcode,
            postalCode: billingDetails.postcode, // Alternative key for compatibility
            country: billingDetails.country,
            newsletter: newsletter
          };
          await secureAuthStorage.saveRegistrationData(registrationData);
          
          console.log('User data updated successfully in database and secure storage');
        } else {
          const errorData = await response.json();
          console.error('Failed to update user data:', errorData);
        }
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
    
    setTimeout(() => {
      set$isSaving(false);
      setIsEditMode(false);
    }, 1000);
  };

  const handleUpdateBillingDetailsFromRegistration = (registrationData) => {
    setBillingDetailsWithLogging({
      street: registrationData.streetAddress || "",
      city: registrationData.city || "",
      postcode: registrationData.postalCode || "",
      country: registrationData.country || "",
    });
    setNewsletter(registrationData.newsletter || false);
  };

  // Function to refresh billing details from database
  const refreshBillingDetails = useCallback(async () => {
    if (currentUser?.id) {
      console.log("🔄 Refreshing billing details for user:", currentUser.id);
      await loadUserData(currentUser.id);
    }
  }, [currentUser?.id]);

  return {
    // Authentication states
      isLoginModalOpen,
    setIsLoginModalOpen,
      isDashboardOpen,
      setIsDashboardOpen,
      isLoggedIn,
    setIsLoggedIn,
      isAuthenticated,
    setIsAuthenticated,
      userEmail,
    setUserEmail,
      userPassword,
    setUserPassword,
      showPassword,
    setShowPassword,
      emailError,
    setEmailError,
      passwordError,
    setPasswordError,
    loginError,
    isLoggingIn,
    currentUser,

    // Password Reset states
      isResetPassword,
    setIsResetPassword,
      isResetting,
    setIsResetting,
      resetEmail,
    setResetEmail,
      newPassword,
    setNewPassword,
      showNewPassword,
    setShowNewPassword,
      showSuccessMessage,
    setShowSuccessMessage,
      resetEmailError,
    setResetEmailError,
      newPasswordError,
    setNewPasswordError,
      isSuccessTimeout,
    setIsSuccessTimeout,
      resetRateLimitCountdown,
      resetRateLimitMessage,

    // Email verification states
      isResendingVerification,
    setIsResendingVerification,
      showResendVerification,
    setShowResendVerification,

    // Dashboard states
      $isSaving,
    set$isSaving,
      isEditMode,
    setIsEditMode,
      newsletter,
    setNewsletter,
      hasPurchases,
    setHasPurchases,
      billingDetails,
      setBillingDetails: setBillingDetailsWithLogging,
      databaseDataLoaded,
      setDatabaseDataLoaded,

    // Handlers
      handleInputFocus,
    handleLoginSubmit,
      handleLoginClick,
      handleResetPassword,
      handleBackToLogin,
      handleSubmitNewPassword,
      handleLogout,
      handleSaveChanges,
      handleUpdateBillingDetailsFromRegistration,
    checkAuthentication,
    handleResendVerification,
    refreshBillingDetails,
  };
};
