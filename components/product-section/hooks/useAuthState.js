// useAuthState.js
import { useState, useEffect, useCallback } from "react";
import {
  isUserAuthenticated,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../../cart/Utils/authUtils";
import { supabase } from "../../../lib/database/supabaseClient";

export const useAuthState = () => {
  // Authentication states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Current user data
  const [currentUser, setCurrentUser] = useState(null);

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

  // Email verification states
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  // Dashboard states
  const [$isSaving, set$isSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [hasPurchases, setHasPurchases] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    street: "",
    city: "",
    postcode: "",
    country: "",
  });

  // Centralized authentication check and setup
  const checkAndSetupAuthentication = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const isAuth = !!user;
      
      setIsAuthenticated(isAuth);
      setIsLoggedIn(isAuth);
      setCurrentUser(user);

      if (user) {
        setUserEmail(user.email);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  }, []);

  // Initial authentication check
  useEffect(() => {
    // Clear any invalid tokens before checking authentication
    const clearInvalidTokens = async () => {
      try {
        // Try to get the current user - this will trigger the refresh token error if tokens are invalid
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error && error.message && error.message.includes('Invalid Refresh Token')) {
          // Clear the invalid session
          await supabase.auth.signOut();
          
          // Clear any remaining token data from localStorage
          if (typeof window !== 'undefined') {
            // Clear Supabase auth tokens
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('supabase.auth.token') || key.startsWith('sb-')) {
                localStorage.removeItem(key);
              }
            });
            
            // Clear session storage as well
            Object.keys(sessionStorage).forEach(key => {
              if (key.startsWith('supabase.auth.token') || key.startsWith('sb-')) {
                sessionStorage.removeItem(key);
              }
            });
          }
        }
      } catch (error) {
        // If there's any error during token clearing, just continue
        console.warn('Error clearing invalid tokens:', error);
      }
    };
    
    clearInvalidTokens().then(() => {
      checkAndSetupAuthentication();
    });
  }, [checkAndSetupAuthentication]);

  // Listen to Supabase auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        const isAuth = !!user;

        setIsAuthenticated(isAuth);
        setIsLoggedIn(isAuth);
        setCurrentUser(user);

        if (user) {
          setUserEmail(user.email);
      } else {
        setUserEmail("");
        setUserPassword("");
        }

        // Dispatch custom event for other components
        const authEvent = new CustomEvent("authStateChange", {
          detail: { 
            isAuthenticated: isAuth, 
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
      
      // Clear Supabase session
      supabase.auth.signOut();
    };

    window.addEventListener('userLoggedOut', handleUserLoggedOut);

    return () => {
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
    };
  }, []);

  // Load saved billing and newsletter details
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDetails = localStorage.getItem("billingDetails");
    const savedNewsletter = localStorage.getItem("newsletterPreference");

    if (savedDetails) {
      setBillingDetails(JSON.parse(savedDetails));
    }
    if (savedNewsletter) {
      setNewsletter(JSON.parse(savedNewsletter));
    }
  }, []);

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
      const result = await loginUser({ 
        email: userEmail, 
        password: userPassword 
      });

      if (result.success) {
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      setIsAuthenticated(true);
        setCurrentUser(result.user);
        // Password will be cleared by auth state change
      } else {
        // Handle specific error cases
        if (result.error && result.error.includes('Email not confirmed')) {
          setLoginError("Please check your email and click the verification link before logging in. Check your spam folder if you don't see it.");
          setShowResendVerification(true);
        } else if (result.error && result.error.includes('Invalid login credentials')) {
          setLoginError("Invalid email or password. Please check your credentials and try again.");
          setShowResendVerification(false);
        } else {
          setLoginError(result.error || "Login failed. Please try again.");
          setShowResendVerification(false);
        }
        setUserPassword("");
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases from the caught error
      if (error.message && error.message.includes('Email not confirmed')) {
        setLoginError("Please check your email and click the verification link before logging in. Check your spam folder if you don't see it.");
        setShowResendVerification(true);
      } else {
      setLoginError("Login failed. Please try again.");
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
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          verificationToken: crypto.randomUUID()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setLoginError("Verification email sent! Please check your inbox and spam folder.");
        setShowResendVerification(false);
      } else {
        setLoginError("Failed to send verification email. Please try again.");
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setLoginError("Failed to send verification email. Please try again.");
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
    // Clear any previous errors when opening modal
    if (!isLoginModalOpen) {
      setLoginError("");
      setEmailError(false);
      setPasswordError(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setResetEmailError(true);
      return;
    }

    try {
      setIsResetting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      
      if (error) {
        setResetEmailError(true);
        setResetEmail("");
      } else {
        setShowSuccessMessage(true);
      setResetEmailError(false);
        
        setTimeout(() => {
          setShowSuccessMessage(false);
          setIsResetting(false);
          setIsResetPassword(false);
          setResetEmail("");
          setIsLoginModalOpen(false);
        }, 3000);
      }
    } catch (error) {
      setResetEmailError(true);
      setResetEmail("");
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToLogin = () => {
    setIsResetPassword(false);
    setIsResetting(false);
    setResetEmail("");
    setNewPassword("");
  };

  const handleSubmitNewPassword = (e) => {
    e.preventDefault();
    const isNewPasswordValid = newPassword.length >= 8;

    if (!isNewPasswordValid) {
      setNewPasswordError(true);
      setNewPassword("");
    } else {
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
      }, 10000);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    setIsLoggedIn(false);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserEmail("");
    setUserPassword("");
      setIsLoginModalOpen(false); // Ensure login modal closes on logout
    } catch (error) {
      console.error('Logout error:', error);
      }
  };

  const handleSaveChanges = async () => {
    set$isSaving(true);
    
    try {
      // Get current user auth data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update database via API endpoint
        const response = await fetch('/api/update-user-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_user_id: user.id,
            email: userEmail,
            street_address: billingDetails.street,
            city: billingDetails.city,
            postal_code: billingDetails.postcode,
            country: billingDetails.country,
            newsletter_subscribed: newsletter
          })
        });

        if (response.ok) {
          // Update localStorage for cart compatibility
          localStorage.setItem("billingDetails", JSON.stringify(billingDetails));
          localStorage.setItem("newsletterPreference", JSON.stringify(newsletter));
          
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
          localStorage.setItem("savedRegistrationData", JSON.stringify(registrationData));
          
          console.log('User data updated successfully in database and localStorage');
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
    setBillingDetails({
      street: registrationData.streetAddress || "",
      city: registrationData.city || "",
      postcode: registrationData.postalCode || "",
      country: registrationData.country || "",
    });
    setNewsletter(registrationData.newsletter || false);
  };

  return {
    // Authentication states
      isLoginModalOpen,
    setIsLoginModalOpen,
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
      setBillingDetails,

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
    checkAndSetupAuthentication,
    handleResendVerification,
  };
};
