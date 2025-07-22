"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  startTransition,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  LICENSE_TYPES,
  packages,
  licenseOptions,
} from "../Constants/constants";
import { useFontSelection } from "../../../context/FontSelectionContext";
import { useNavigation } from "../../../context/NavigationContext";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  calculateMultiFontPrice, 
  getPricingBreakdown,
  addFontToSelection,
  calculatePackagePrice,
  calculateCustomTotal
} from './multiFontPricing';
import gsap from 'gsap';
import VerificationPrompt from '../Forms/VerificationPrompt';
import secureCartStorage from './secureCartStorage.js';
import { getAuthCallbackUrl } from '../../../lib/authRedirectUtils';

export const CartContext = createContext();

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  {
    betas: ["payment_element_apple_pay_beta_1"],
  },
);

// Secure cart state management functions
const getCartState = async () => {
  const state = await secureCartStorage.getCartState();
  console.log('[CartContext] Loaded cart state:', JSON.stringify(state, null, 2));
  return state;
};

const saveCartState = async (cartState) => {
  console.log('[CartContext] Saving cart state:', JSON.stringify(cartState, null, 2));
  await secureCartStorage.saveCartState(cartState);
};

export const CartProvider = ({ children, onClose, isOpen, setIsLoggedIn, currentUser: propCurrentUser, billingDetails: propBillingDetails, isLoggedIn: propIsLoggedIn }) => {
  console.log('🔍 CartProvider received props:', {
    propCurrentUser: propCurrentUser?.email || propCurrentUser || 'none',
    type: typeof propCurrentUser,
    isObject: typeof propCurrentUser === 'object',
    hasEmail: !!(propCurrentUser?.email),
    hasId: !!(propCurrentUser?.id),
    emailConfirmed: propCurrentUser?.email_confirmed_at ? 'confirmed' : 'unconfirmed',
    billingDetails: propBillingDetails,
    isLoggedIn: propIsLoggedIn
  });

  const router = useRouter();
  const pathname = usePathname();

  // Get selected font from context (for fallback)
  const { selectedFont } = useFontSelection();

  // Get navigation context
  const { set$isNavigating } = useNavigation();

  // Authentication state from props
  const currentUser = propCurrentUser;
  const isAuthenticated = propIsLoggedIn;

  // State Management
  const [isFullCartOpen, setIsFullCartOpen] = useState(false);
  const [weightOption, setWeightOption] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLicenceOpen, setIsLicenceOpen] = useState(false);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const [bottomPadding, setBottomPadding] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [preventAutoScroll, setPreventAutoScroll] = useState(false);

  // Authentication states
  const [showRegistration, setShowRegistration] = useState(false);
  const [showUsageSelection, setShowUsageSelection] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [isAuthenticatedAndPending, setIsAuthenticatedAndPending] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [isUsageComplete, setIsUsageComplete] = useState(false);
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [clearRegistrationErrors, setClearRegistrationErrors] = useState(false);
  const [clearLoginErrors, setClearLoginErrors] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [requireProceedClick, setRequireProceedClick] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [usageFormData, setUsageFormData] = useState({
    usage: '',
    company: '',
    address: '',
    city: '',
    postcode: '',
    country: '',
    newsletter: false,
  });

  // Use billing details from props (database data)
  const [cartBillingDetails, setCartBillingDetails] = useState(() => {
    return propBillingDetails || {
      street: "",
      city: "",
      postcode: "",
      country: "",
    };
  });

  // Sync cart billing details with auth state billing details
  useEffect(() => {
    console.log('🔄 Cart: Syncing billing details from auth state:', propBillingDetails);
    if (propBillingDetails) {
      setCartBillingDetails(propBillingDetails);
    }
  }, [propBillingDetails]);

  // Cart font state - this will hold the font that was selected when added to cart
  const [cartFont, setCartFont] = useState(null);

  // Multi-font selection state - NEW
  const [selectedFonts, setSelectedFonts] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState({});
  const [selectedFontIds, setSelectedFontIds] = useState(new Set());
  const [fontPricingMultipliers, setFontPricingMultipliers] = useState({});

  // Form Data States
  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    street: "",
    city: "",
    postcode: "",
    country: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [resetData, setResetData] = useState({
    email: "",
    newPassword: "",
  });

  const [clientData, setClientData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  // Payment States
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [addressData, setAddressData] = useState({
    country: "",
    postcode: "",
  });
  const [clientSecret, setClientSecret] = useState("");
  const [isStripeFormComplete, setIsStripeFormComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // Error and Display States
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [resetEmailError, setResetEmailError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [viewPreference, setViewPreference] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Navigation States
  const [hasProceedBeenClicked, setHasProceedBeenClicked] = useState(false);
  const [summaryModifiedAfterTab, setSummaryModifiedAfterTab] = useState(false);
  const [savedRegistrationData, setSavedRegistrationData] = useState(null);
  const [didReturnToStageOne, setDidReturnToStageOne] = useState(false);

  // License States
  const [customizing, setCustomizing] = useState(false);
  const [customPrintLicense, setCustomPrintLicense] = useState(null);
  const [customWebLicense, setCustomWebLicense] = useState(null);
  const [customAppLicense, setCustomAppLicense] = useState(null);
  const [customSocialLicense, setCustomSocialLicense] = useState(null);

  // Refs
  const totalSectionRef = useRef(null);
  const cartPanelRef = useRef(null);
  const registerButtonRef = useRef(null);
  const loginButtonRef = useRef(null);
  const usageTypeButtonRef = useRef(null);
  const inputTimeoutRef = useRef(null);
  const formDividerRef = useRef(null);
  const stripeWrapperRef = useRef(null);

  // Verification handling
  useEffect(() => {
    const handleVerificationStatus = () => {
      const params = new URLSearchParams(window.location.search);
      const verificationStatus = params.get('verification');

      if (verificationStatus === 'success') {
        setShowVerificationPrompt(false);
        setShowUsageSelection(true);
        // Clean up the URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (verificationStatus === 'failed') {
        // Handle verification failure
        setError('Email verification failed. Please try again.');
        setShowVerificationPrompt(false);
        // Clean up the URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    // Add message listener for verification status
    const handleMessage = (event) => {
      if (event.data?.type === 'verification') {
        if (event.data.status === 'success') {
          setShowVerificationPrompt(false);
          setShowUsageSelection(true);
        } else if (event.data.status === 'failed') {
          setError('Email verification failed. Please try again.');
          setShowVerificationPrompt(false);
        }
      }
    };

    // Handle verification failure events from auth callback
    const handleVerificationFailed = (event) => {
      console.log('❌ Verification failed event received:', event.detail);
      
      const { reason, message, email } = event.detail;
      
      if (reason === 'expired') {
        setError('Your verification link has expired. Please request a new verification email.');
        // Keep the user in the verification prompt state
        setShowVerificationPrompt(true);
        setIsAuthenticatedAndPending(true);
      } else if (reason === 'invalid') {
        setError('Invalid verification link. Please check your email and try again.');
        setShowVerificationPrompt(true);
        setIsAuthenticatedAndPending(true);
      } else {
        setError(message || 'Verification failed. Please try again.');
        setShowVerificationPrompt(true);
        setIsAuthenticatedAndPending(true);
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('verificationFailed', handleVerificationFailed);
    handleVerificationStatus();

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('verificationFailed', handleVerificationFailed);
    };
  }, []);

  const handleVerificationComplete = async () => {
    setShowVerificationPrompt(false);
    setShowUsageSelection(true);
  };

  // Registration function
  const register = async (userData) => {
    try {
      // Import the actual register function from authUtils
      const { registerUser } = await import('./authUtils');
      const result = await registerUser(userData);
      
      if (result.success) {
        // Wait a short time for the database to propagate the new user record
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Structure the user data
        const structuredUser = {
          ...result.user,
          dbData: result.dbData
        };
        
        // Set the structured user data
  
        // If email verification is needed, show verification UI
        if (result.needsVerification) {
          // Lock UI and show verification message
          setIsRegistrationComplete(true);
          setShowVerificationPrompt(true);
          return { 
            success: true, 
            user: structuredUser, 
            needsVerification: true,
            message: "Please check your email to verify your account before continuing."
          };
        }

        return { success: true, user: structuredUser, needsVerification: false };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // Simplified login function - removed complex wrapper that was causing hangs
  const login = async (email, password) => {
    try {
      const { getSupabaseClient } = await import('../../../lib/database/supabaseClient');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Get the database user record
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single();
        
        if (dbError) {
          console.error('Error fetching user record:', dbError);
        }
        
        // Structure the user data
        const structuredUser = {
          ...data.user,
          dbData: dbUser || null
        };
        
        return { success: true, user: structuredUser };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // User state is now passed as prop - no longer managed internally

  // Debug function to clear session (for testing)
  const debugLogout = async () => {
    try {
      // Import the actual logout function from authUtils
      const { logoutUser } = await import('./authUtils');
      await logoutUser();
      
      // Clear all authentication-related state
      setShowRegistration(false);
      setIsRegistrationComplete(false);
      setShowUsageSelection(false);
      setShowPaymentForm(false);
      setSelectedUsage(null);
      setEulaAccepted(false);
      setIsAuthenticatedAndPending(false);
      
      // Clear registration and login data
      setRegistrationData({
        firstName: "",
        surname: "",
        email: "",
        password: "",
        street: "",
        city: "",
        postcode: "",
        country: "",
      });
      setLoginData({
        email: "",
        password: "",
      });
      
      // Clear client data
      setClientData({
        companyName: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });
      
      // Reset proceed state
      setHasProceedBeenClicked(false);
      localStorage.removeItem("hasProceedBeenClicked");
      
      // Trigger UI update by dispatching events
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authStateChange', { 
          detail: { isAuthenticated: false } 
        }));
      }
      
      console.log('🔄 Session cleared');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, clear local state
      setShowRegistration(false);
      setIsRegistrationComplete(false);
      setShowUsageSelection(false);
      setShowPaymentForm(false);
      setSelectedUsage(null);
      setEulaAccepted(false);
      setIsAuthenticatedAndPending(false);
    }
  };

  // Effects
  useEffect(() => {
    handleCartState();
  }, [
    weightOption,
    selectedPackage,
    customizing,
    customPrintLicense,
    customWebLicense,
    customAppLicense,
    customSocialLicense,
    showRegistration,
    showUsageSelection,
    showPaymentForm,
    isRegistrationComplete,
    selectedUsage,
    eulaAccepted,
    isAuthenticatedAndPending,
    cartFont,
    selectedFonts,
    selectedStyles,
    selectedFontIds,
  ]);

  useEffect(() => {
    if (
      !preventAutoScroll &&
      (showRegistration || showUsageSelection || showPaymentForm)
    ) {
      scrollToTop();
    }
  }, [
    showRegistration,
    showUsageSelection,
    showPaymentForm,
    preventAutoScroll,
  ]);

  useEffect(() => {
    if (showPaymentForm && selectedPaymentMethod === "card") {
      createPaymentIntent();
    } else {
      resetPaymentState();
    }
  }, [showPaymentForm, selectedPaymentMethod]);

  useEffect(() => {
    console.log('🔍 CART STATE LOAD TRIGGER:', {
      isOpen,
      currentUser: currentUser?.id || 'none',
      showRegistration,
      showUsageSelection,
      showPaymentForm,
      isAuthenticatedAndPending,
      isRegistrationComplete,
      trigger: 'useEffect[isOpen only]'
    });
    
    // Only run when cart opens, not when currentUser changes
    if (isOpen) {
    handleCartStateLoad();
    }
  }, [isOpen]); // CRITICAL FIX: Remove currentUser from dependencies

  // Handle currentUser changes separately - only for authentication updates
  useEffect(() => {
    console.log('🔍 CURRENT USER CHANGED:', {
      userId: currentUser?.id || 'none',
      isOpen,
      showRegistration,
      showUsageSelection,
      showPaymentForm,
      isAuthenticatedAndPending,
      isRegistrationComplete
    });
    
    // If user just completed registration and currentUser is now available
    if (isOpen && currentUser && isRegistrationComplete && showVerificationPrompt) {
      console.log('🔄 Auth state updated after registration, checking verification status...');
      
      if (!currentUser.email_confirmed_at) {
        console.log('⚠️ User needs verification - staying on verification prompt');
        // User needs verification - keep showing verification prompt
        setShowVerificationPrompt(true);
        setShowUsageSelection(false);
        setShowPaymentForm(false);
      } else {
        console.log('✅ User is verified - proceeding to usage selection');
        // User is verified - proceed to usage selection
        setShowVerificationPrompt(false);
        setShowUsageSelection(true);
        setShowPaymentForm(false);
      }
    }
    
    // If user logs in/out while cart is open, we may need to update some states
    // but we should NOT reset the active flow
    if (isOpen && currentUser) {
      // User is now authenticated - update registration complete state if needed
      if (!isRegistrationComplete && !showRegistration && !showUsageSelection && !showPaymentForm) {
        console.log('🔄 User authenticated, marking registration complete');
        setIsRegistrationComplete(true);
      }
    }
  }, [currentUser]);

  // Load cart state immediately on mount, not just when cart opens
  useEffect(() => {
    handleCartStateLoad();
  }, []);

  useEffect(() => {
    const handleAuthChange = (event) => {
      console.log('🔍 HANDLE AUTH CHANGE CALLED:', {
        isOpen,
        currentUser: currentUser?.id || 'none',
        newUser: event.detail.user?.id || 'none',
        showRegistration,
        showUsageSelection,
        showPaymentForm,
        isAuthenticatedAndPending,
        isRegistrationComplete,
        trigger: 'authStateChange event'
      });
      
      const { isAuthenticated: authState, user } = event.detail;
      
      if (authState && user) {
        // User has logged in via main login modal
        console.log('🔄 User logged in via main modal, updating cart state');
        
        // Update current user in cart
        
        // If cart is open and user just logged in, update the cart flow
        if (isOpen) {
          // CRITICAL FIX: Don't reset if user is in active flow
          const isInActiveFlow = showRegistration || showUsageSelection || showPaymentForm || 
                                isAuthenticatedAndPending || isRegistrationComplete;
          
          if (!isInActiveFlow) {
            console.log('🔄 Resetting cart state after main login (not in active flow)');
          setShowRegistration(false);
          setShowUsageSelection(false);
          setShowPaymentForm(false);
            setIsAuthenticatedAndPending(false);
            setIsRegistrationComplete(false);
            setRequireProceedClick(true);
          }
        }
      } else {
        // User logged out
        console.log('🔄 User logged out, clearing cart state');
        setShowRegistration(false);
        setShowUsageSelection(false);
        setShowPaymentForm(false);
        setIsAuthenticatedAndPending(false);
        setIsRegistrationComplete(false);
        setRequireProceedClick(false);
      }
    };

    const handleProceedToUsageType = (event) => {
      console.log('🔄 PROCEED TO USAGE TYPE EVENT:', {
        isOpen,
        currentUser: currentUser?.id || 'none',
        verified: event.detail.verified,
        fromEmailVerification: event.detail.fromEmailVerification
      });
      
      if (isOpen && event.detail.verified && currentUser?.email_confirmed_at) {
        console.log('✅ User verified, proceeding to usage type selection');
        setShowVerificationPrompt(false);
        setShowUsageSelection(true);
        setShowPaymentForm(false);
        setIsAuthenticatedAndPending(true);
        setIsRegistrationComplete(true);
      }
    };

    window.addEventListener("authStateChange", handleAuthChange);
    window.addEventListener("proceedToUsageType", handleProceedToUsageType);

    return () => {
      window.removeEventListener("authStateChange", handleAuthChange);
      window.removeEventListener("proceedToUsageType", handleProceedToUsageType);
    };
  }, [isOpen, currentUser, showRegistration, showUsageSelection, showPaymentForm, isAuthenticatedAndPending, isRegistrationComplete]);

  // NEW: Initialize multi-font selection with current cart font
  // [FIX] Comment out the useEffect that saves cart state with empty/default values on mount or cart open.
  // useEffect(() => {
  //   if (cartFont && Array.isArray(selectedFonts) && selectedFonts.length === 0) {
  //     const { selectedFonts: fonts, selectedStyles: styles } = addFontToSelection([], {}, cartFont, []);
  //     setSelectedFonts(fonts || []);
  //     setSelectedStyles(styles || {});
  //     // Persist this initialization to localStorage
  //     const cartState = {
  //       weightOption,
  //       selectedPackage,
  //       customizing,
  //       customPrintLicense,
  //       customWebLicense,
  //       customAppLicense,
  //       customSocialLicense,
  //       selectedFont: cartFont,
  //       selectedFonts: fonts || [],
  //       selectedStyles: styles || {},
  //     };
  //     saveCartState(cartState);
  //   }
  // }, [cartFont, selectedFonts?.length]);

  // Authentication check
  const handleAuthenticationCheck = async () => {
    try {
      // Clear any invalid tokens before checking authentication
      try {
        const { getSupabaseClient } = await import('../../../lib/database/supabaseClient');
        const supabase = getSupabaseClient();
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
          
          // Set user to null and return early
          return;
        }
      } catch (tokenError) {
        // If there's any error during token clearing, just continue
        console.warn('Error clearing invalid tokens in handleAuthenticationCheck:', tokenError);
      }
      
      // Import the getCurrentUser function from authUtils
      const { getCurrentUser } = await import('./authUtils');
      const authUser = await getCurrentUser();
      
      if (authUser) {
        // If getCurrentUser returns a database user record, structure it properly
        if (authUser.auth_user_id) {
          // This is a database user record
          const structuredUser = {
            id: authUser.auth_user_id,
            email: authUser.email,
            dbData: authUser
          };
        } else {
          // This is a Supabase auth user, get the database record
          const { getUserByAuthId } = await import('../../../lib/database/supabaseClient');
          const { data: dbUser, error: dbError } = await getUserByAuthId(authUser.id);
          
          if (dbError) {
            console.error('Error fetching user record:', dbError);
          }
          
          const structuredUser = {
            ...authUser,
            dbData: dbUser || null
          };
        }
      } else {
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };

  // Handlers
  const handleCartState = () => {
    if (weightOption || selectedPackage || customizing || cartFont) {
      saveCartState({
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        showRegistration,
        showUsageSelection,
        showPaymentForm,
        isRegistrationComplete,
        selectedUsage,
        eulaAccepted,
        isAuthenticatedAndPending,
        selectedFont: cartFont,
        selectedFonts,
        selectedStyles,
        selectedFontIds: Array.from(selectedFontIds),
      });
      
      // Dispatch custom event to notify cart count components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartStateChanged'));
      }
    }
  };

  const handleCartStateLoad = async (userToCheck = currentUser) => {
    console.log('🔍 HANDLE CART STATE LOAD CALLED:', {
      isOpen,
      currentUser: userToCheck?.id || 'none',
      showRegistration,
      showUsageSelection,
      showPaymentForm,
      isAuthenticatedAndPending,
      isRegistrationComplete,
      hasProceedBeenClicked: await secureCartStorage.getSessionFlag("hasProceedBeenClicked")
    });
    
    const savedCart = await getCartState();
    if (savedCart) {
      if (isOpen && userToCheck) {
        loadSavedCartState(savedCart);
        
        // For authenticated users, override any saved form states
        // and set the correct stage based on current state
        if (savedCart.weightOption || weightOption) {
          const hasLicenseSelection = savedCart.selectedPackage || savedCart.customizing || 
            selectedPackage || customizing;
          
          if (hasLicenseSelection) {
            // Only override stages if user is not currently in usage selection flow
            // This preserves the login -> usage selection progression
            if (!showUsageSelection && !isAuthenticatedAndPending) {
            // User is authenticated and has made selections
            setShowRegistration(false);
            setShowUsageSelection(false);
            setShowPaymentForm(false);
            setIsRegistrationComplete(true);
            setIsAuthenticatedAndPending(false);
            
            // Don't automatically advance to any stage - let user proceed manually
            // This prevents the cart from jumping to registration form
            }
          }
        }
      } else {
        // Always load the saved font, regardless of open state or authentication
        setCartFont(savedCart.selectedFont || null);
        // Also load multi-font selections
        setSelectedFonts(savedCart.selectedFonts || []);
        setSelectedStyles(savedCart.selectedStyles || {});
        // Load selectedFontIds and convert back to Set
        setSelectedFontIds(new Set(savedCart.selectedFontIds || []));
        // Load weightOption so Continue button is enabled
        setWeightOption(savedCart.weightOption || "");
        
        // Ensure Continue button works on first cart open
        setIsContinueClicked(false);
        setIsLicenceOpen(false);
      }
    }
    
          // FIXED: Don't reset cart state when user is in active flow
      // When cart opens, check authentication state and set appropriate stage
      if (isOpen && userToCheck) {
        // For authenticated users, only reset to stage 1 if they're not in an active flow
        const hasProceedBeenClicked = await secureCartStorage.getSessionFlag("hasProceedBeenClicked");
        
        // CRITICAL FIX: Don't reset if user is in ANY active flow state
        // This prevents the cart from resetting after registration/login completion
        const isInActiveFlow = showRegistration || showUsageSelection || showPaymentForm || 
                              isAuthenticatedAndPending || isRegistrationComplete;
        
        // Check if password reset just completed
        const passwordResetJustCompleted = await secureCartStorage.getSessionFlag('passwordResetCompleted');
      
      if (!hasProceedBeenClicked && !isInActiveFlow && !passwordResetJustCompleted) {
        // User hasn't clicked proceed yet and isn't in active flow, keep them at stage 1
        // BUT don't reset if password reset just completed
        console.log('🔄 Resetting authenticated user to stage 1 (not in active flow)');
          setShowRegistration(false);
        setShowUsageSelection(false);
          setShowPaymentForm(false);
        setIsAuthenticatedAndPending(false);
        setIsRegistrationComplete(true); // Mark as complete since they're authenticated
      } else if (isInActiveFlow || passwordResetJustCompleted) {
        console.log('✅ User is in active flow or password reset just completed, preserving current state:', {
          showRegistration,
          showUsageSelection,
          showPaymentForm,
          isAuthenticatedAndPending,
          isRegistrationComplete,
          passwordResetJustCompleted
        });
        // Don't reset anything - preserve the current flow state
        // If password reset just completed, clear the flag
        if (passwordResetJustCompleted) {
          await secureCartStorage.removeSessionFlag('passwordResetCompleted');
        }
      }
    } else if (isOpen && !userToCheck) {
      // For unauthenticated users with cart items, they'll need to register
      const hasCartItems = (savedCart?.weightOption || weightOption) && 
        (savedCart?.selectedPackage || savedCart?.customizing || selectedPackage || customizing);
      
      if (hasCartItems) {
        setShowRegistration(false); // Don't auto-show registration, let them proceed manually
        setShowUsageSelection(false);
        setShowPaymentForm(false);
        setIsAuthenticatedAndPending(false);
      }
    }
  };

  const handleResponsiveLayout = () => {
    const mobileMatch = window.matchMedia("(max-width: 768px)").matches;
    const isPortrait = window.innerHeight > window.innerWidth;
    const wasDesktop = !isMobile;

    setIsMobile(mobileMatch);

    // Reset shouldScrollToBottom when switching to desktop
    if (!mobileMatch) {
      setShouldScrollToBottom(false);
    }

    // Don't update bottom padding when showing usage selection - prevents scroll conflicts
    if (!showUsageSelection) {
      updateBottomPadding(mobileMatch);
    }

    setTimeout(() => {
      if (cartPanelRef.current && !preventAutoScroll) {
        // On mobile portrait, scroll to bottom
        // On desktop and landscape, scroll to top
        if (mobileMatch && isPortrait) {
          scrollToBottom(true);
        } else {
          cartPanelRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }
    }, 100);
  };

  const updateBottomPadding = (isMobile) => {
    if (isMobile) {
      // Check if there are any selections first
      const hasSelections =
        weightOption &&
        (selectedPackage || (customizing && hasLicenseSelected()));

      if (!hasSelections) {
        setBottomPadding(0);
        return;
      }

      // Only calculate padding if we have selections and totalSectionRef exists
      if (totalSectionRef.current) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          setTimeout(() => {
            // Double-check selections again in case they changed during the delay
            const currentHasSelections =
              weightOption &&
              (selectedPackage || (customizing && hasLicenseSelected()));

            if (!currentHasSelections) {
              setBottomPadding(0);
              return;
            }

            if (totalSectionRef.current) {
              const fixedTotalHeight =
                totalSectionRef.current.getBoundingClientRect().height || 0;
              if (fixedTotalHeight > 0) {
                setBottomPadding(fixedTotalHeight + 24);
              } else {
                // Fallback - try again with longer delay
                setTimeout(() => {
                  const finalHasSelections =
                    weightOption &&
                    (selectedPackage || (customizing && hasLicenseSelected()));
                  if (finalHasSelections && totalSectionRef.current) {
                    const retryHeight =
                      totalSectionRef.current.getBoundingClientRect().height ||
                      0;
                    setBottomPadding(retryHeight + 24);
                  } else {
                    setBottomPadding(0);
                  }
                }, 200);
              }
            }
          }, 100);
        });
      }
    } else {
      setBottomPadding(0);
    }
  };

  const createPaymentIntent = async () => {
    setIsLoadingPayment(true);
    try {
      setError(null);
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedPackage
            ? packages[selectedPackage].price
            : calculateCustomTotal(),
          currency: "gbp",
          forceNew: true,
          automatic_payment_methods: {
            enabled: false,
          },
          payment_method_types: ["card"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      setError(err);
      resetPaymentState();
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleClose = () => {
    // Save cart state before closing to maintain persistence
    if (currentUser) {
      // For authenticated users, save current state
      saveCartState({
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        showRegistration: false,
        showUsageSelection: showUsageSelection,
        showPaymentForm: showPaymentForm,
        isRegistrationComplete: isRegistrationComplete,
        selectedUsage,
        eulaAccepted,
        isAuthenticatedAndPending: isAuthenticatedAndPending,
        selectedFont: cartFont,
        selectedFonts,
        selectedStyles,
      });
    } else {
      // For unauthenticated users, save basic cart state
      saveCartState({
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        selectedFont: cartFont,
        selectedFonts,
        selectedStyles,
      });
    }

    // Reset scroll position
    if (cartPanelRef.current) {
      cartPanelRef.current.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }

    // Call the parent's close function
    onClose();
  };

  const handleAuthenticatedClose = () => {
    setShowRegistration(false);
    setShowUsageSelection(false);
    setShowPaymentForm(false);
    setIsAuthenticatedAndPending(false);
    setSelectedUsage(null);
    setEulaAccepted(false);

    // Save cart state before closing
    saveCartState({
      weightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
      showRegistration: false,
      showUsageSelection: false,
      showPaymentForm: false,
      isRegistrationComplete: false,
      selectedUsage: null,
      eulaAccepted: false,
      isAuthenticatedAndPending: false,
      selectedFont: cartFont,
      selectedFonts,
      selectedStyles,
    });
  };

  const handleUnauthenticatedClose = () => {
    setIsLicenceOpen(false);
    setIsContinueClicked(false);
    setShowRegistration(false);
    setShowUsageSelection(false);
    setShowPaymentForm(false);
    setIsAuthenticatedAndPending(false);
    setHasProceedBeenClicked(false);
    localStorage.removeItem("hasProceedBeenClicked");
  };

  const resetPaymentState = () => {
    setSelectedPaymentMethod("card");
    setClientSecret("");
    setIsStripeFormComplete(false);
    setIsProcessing(false);
    setError(null);
    setAddressData({
      country: "",
      postcode: "",
    });
  };

  const handleProceed = async () => {
    console.log('🔄 handleProceed called with state:', {
      showRegistration,
      showUsageSelection,
      showPaymentForm,
      isRegistrationComplete,
      selectedUsage,
      eulaAccepted,
      selectedPackage,
      customizing,
      calculateCustomTotal: customizing ? calculateCustomTotal() : 0
    });
    
    // PRIORITY 1: Handle transition from usage selection to payment
    // After usage form completion, proceed directly to payment (no package selection required)
    if (showUsageSelection && isRegistrationComplete && selectedUsage && eulaAccepted) {
      console.log('✅ Transitioning from usage selection to payment form');
      
      // Use React's batch update to prevent intermediate state
      const newCartState = {
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        showRegistration: false,
        showUsageSelection: false,
        showPaymentForm: true,
        isRegistrationComplete: true,
        selectedUsage,
        eulaAccepted,
        isAuthenticatedAndPending: false,
        selectedFont: cartFont,
        selectedFonts,
        selectedStyles,
      };
      
      // Update all states atomically using startTransition to prevent intermediate renders
      startTransition(() => {
        setShowRegistration(false);
        setShowUsageSelection(false);
        setShowPaymentForm(true);
      });
      
      // Save the updated cart state
      saveCartState(newCartState);
      
      scrollToTop();
      return;
    }
    
    // PRIORITY 2: Check if user has completed usage selection and is ready for payment (with package)
    if (
      !showRegistration &&
      !showPaymentForm &&
      isRegistrationComplete &&
      selectedUsage &&
      eulaAccepted &&
      (selectedPackage || (customizing && calculateCustomTotal() > 0))
    ) {
      console.log('✅ Proceeding to payment form (with package)');
      // User has completed usage selection, proceed to payment
      // Transition atomically to prevent flash
      const newCartState = {
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        showRegistration: false,
        showUsageSelection: false,
        showPaymentForm: true,
        isRegistrationComplete: true,
        selectedUsage,
        eulaAccepted,
        isAuthenticatedAndPending: false,
        selectedFont: cartFont,
        selectedFonts,
        selectedStyles,
      };
      
      // Update all states atomically using startTransition to prevent intermediate renders
      startTransition(() => {
        setShowRegistration(false);
        setShowUsageSelection(false);
        setShowPaymentForm(true);
      });
      
      // Save the updated cart state
      saveCartState(newCartState);
      
      scrollToTop();
      return;
    }

    // PRIORITY 3: Handle initial proceed (from summary/style selection)
    if (
      !showRegistration &&
      !showUsageSelection &&
      !showPaymentForm &&
      (selectedPackage || (customizing && calculateCustomTotal() > 0))
    ) {
      console.log('🔄 Calling handleInitialProceed');
      await handleInitialProceed();
      return;
    }

    // PRIORITY 4: Handle payment form submission
    if (showPaymentForm && isPaymentFormValid() && !isProcessing) {
      // Payment processing is handled by the PaymentProcessor component
      // through the onPayment prop in CartSummary
      console.log('💳 Payment form is valid, ready for processing');
      return;
    }

    // PRIORITY 5: Handle registration form
    if (
      showRegistration &&
      !isCheckoutDisabled
    ) {
      console.log('📝 Calling handleFormProceed');
      handleFormProceed();
    }

    // Note: showUsageSelection should NOT trigger handleFormProceed
    // Usage selection completion is handled by handleUsageComplete
    // The Proceed button should only be enabled after usage completion

    scrollToTop();
  };

  const handleInitialProceed = async () => {
    console.log('🔄 handleInitialProceed called', { 
      currentUserEmail: currentUser?.email || 'none',
      currentUserType: typeof currentUser,
      hasCurrentUser: !!currentUser,
      hasEmailConfirmed: currentUser?.email_confirmed_at ? 'yes' : 'no',
      isAuthenticated,
      isRegistrationComplete,
      showVerificationPrompt
    });
    
    if (isAuthenticated) {
      console.log('✅ User is authenticated, going to usage selection');
      setShowRegistration(false);
        setShowVerificationPrompt(false);
        setShowUsageSelection(true);
      setShowPaymentForm(false);
      setIsAuthenticatedAndPending(false);
        setIsRegistrationComplete(true);
      } else {
      console.log('❌ User not authenticated, showing registration');
      setShowRegistration(true);
      setShowVerificationPrompt(false);
      setShowUsageSelection(false);
      setShowPaymentForm(false);
      setIsAuthenticatedAndPending(false);
      setIsRegistrationComplete(false);
    }

    setHasProceedBeenClicked(true);
    await secureCartStorage.setSessionFlag("hasProceedBeenClicked", true);

    saveCartState({
      weightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
      showRegistration: !isAuthenticated,
      showVerificationPrompt: false,
      showUsageSelection: isAuthenticated,
      showPaymentForm: false,
      isRegistrationComplete: isAuthenticated,
      selectedUsage,
      eulaAccepted,
      isAuthenticatedAndPending: false,
      selectedFont: cartFont,
      selectedFonts,
      selectedStyles,
    });
  };

  const handleFormProceed = () => {
    if (showRegistration && isRegistrationFormValid()) {
      // Check if user needs verification
      if (!currentUser?.email_confirmed_at) {
      setShowRegistration(false);
        setShowVerificationPrompt(true);
        setShowUsageSelection(false);
        setIsAuthenticatedAndPending(true);
      } else {
        setShowRegistration(false);
        setShowVerificationPrompt(false);
      setShowUsageSelection(true);
      setIsAuthenticatedAndPending(true);
      }
    } else if (showUsageSelection && selectedUsage && eulaAccepted && (selectedUsage === "personal" || (selectedUsage === "client" && isClientDataValid()))) {
      // User has completed usage selection, proceed to payment
      console.log('Usage selection complete, proceeding to payment');
        setShowUsageSelection(false);
      setShowPaymentForm(true);
      setShowRegistration(false);
      
      // Save the updated cart state
      saveCartState({
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        showRegistration: false,
        showUsageSelection: false,
        showPaymentForm: true,
        isRegistrationComplete: true,
        selectedUsage,
        eulaAccepted,
        isAuthenticatedAndPending: false,
        selectedFont: cartFont,
        selectedFonts,
        selectedStyles,
      });
      
      scrollToTop();
      
    } else if (showPaymentForm && isPaymentFormValid()) {
      // Handle payment processing
      handlePaymentComplete();
    }
  };

  const isRegistrationFormValid = () => {
    return (
      registrationData.firstName &&
      registrationData.surname &&
      registrationData.email &&
      registrationData.password &&
      registrationData.street &&
      registrationData.city &&
      registrationData.postcode &&
      registrationData.country
    );
  };

  const isLoginFormValid = () => {
    return loginData.email && loginData.password;
  };

  const isClientDataValid = () => {
    return selectedUsage === "client"
      ? clientData.companyName &&
          clientData.contactName &&
          clientData.contactEmail &&
          clientData.contactPhone
      : true;
  };

  // To this:
  const isPaymentFormValid = () => {
    if (selectedPaymentMethod === "card") {
      return isStripeFormComplete;
    }
    return false; // Since you're only supporting card payments now
  };

  const hasCartSelections = () => {
    return (
      (weightOption && (selectedPackage || (customizing && hasLicenseSelected()))) ||
      (selectedFonts.length > 0 && Object.keys(selectedStyles).length > 0)
    );
  };

  const hasLicenseSelected = () => {
    return (
      selectedPackage ||
      (customizing &&
        (customPrintLicense ||
          customWebLicense ||
          customAppLicense ||
          customSocialLicense))
    );
  };

  const getLicenseTypeDisplay = (type) => {
    return (
      LICENSE_TYPES[type]?.displayName ||
      type.charAt(0).toUpperCase() + type.slice(1)
    );
  };

  const getLicenseDetails = (type, value) => {
    const optionsKey = LICENSE_TYPES[type].optionsKey;
    return licenseOptions[optionsKey][value];
  };

  const getActiveLicenses = () => {
    const licenses = [
      { type: "print", value: customPrintLicense },
      { type: "web", value: customWebLicense },
      { type: "app", value: customAppLicense },
      { type: "social", value: customSocialLicense },
    ];
    return licenses.filter((license) => license.value !== null);
  };

  const calculateCustomTotal = () => {
    let total = 0;
    const activeLicenses = getActiveLicenses();
    activeLicenses.forEach((license) => {
      total += getLicenseDetails(license.type, license.value).price;
    });
    return total;
  };

  const isCheckoutDisabled = !(
    (selectedPackage || (customizing && calculateCustomTotal() > 0)) &&
    (showRegistration
      ? isRegistrationFormValid()
      : showUsageSelection
        ? isRegistrationComplete && eulaAccepted && selectedUsage && (selectedUsage === "personal" || (selectedUsage === "client" && isClientDataValid()))
      : showPaymentForm
        ? isPaymentFormValid()
          : true) // Allow proceed in initial stage when selections are made
  );

  // Safe scroll utility function
  const safeScrollTo = (options, delay = 0) => {
    console.log('🔄 safeScrollTo called', {
      hasCartPanelRef: !!cartPanelRef.current,
      delay,
      options
    });
    
    if (cartPanelRef.current) {
      const executeScroll = () => {
        if (cartPanelRef.current) {
          console.log('✅ Executing safe scroll');
          cartPanelRef.current.scrollTo(options);
        } else {
          console.log('❌ cartPanelRef became null during scroll execution');
        }
      };
      
      if (delay > 0) {
      setTimeout(() => {
          requestAnimationFrame(executeScroll);
        }, delay);
      } else {
        requestAnimationFrame(executeScroll);
      }
    } else {
      console.log('❌ cartPanelRef is null, cannot scroll');
    }
  };

  const scrollToTop = () => {
    safeScrollTo({
            top: 0,
            behavior: "smooth",
      }, 300);
  };

  const scrollToBottom = (isMobileView) => {
    if (cartPanelRef.current && isMobileView) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (totalSectionRef.current && cartPanelRef.current) {
            const fixedTotalHeight =
              totalSectionRef.current.getBoundingClientRect().height || 0;
            if (fixedTotalHeight > 0) {
              setBottomPadding(fixedTotalHeight + 24);
              setShouldScrollToBottom(true);
            } else {
              // Fallback - try again with longer delay
              setTimeout(() => {
                if (totalSectionRef.current) {
                  const retryHeight =
                    totalSectionRef.current.getBoundingClientRect().height || 0;
                  setBottomPadding(retryHeight + 24);
                  setShouldScrollToBottom(true);
                }
              }, 200);
            }
          }
        }, 100);
      });
    }
  };

  const getCurrentStage = () => {
    if (showPaymentForm) return 3;
    if (showUsageSelection || (showRegistration && !isRegistrationComplete))
      return 2;
    return 1;
  };

  const handleStageClick = (stageNumber) => {
    if (cartPanelRef.current) {
      scrollToTop();

      switch (stageNumber) {
        case 1:
          if (showPaymentForm) {
            setShowPaymentForm(false);
            setDidReturnToStageOne(true);
            setSummaryModifiedAfterTab(true);
          }
          if (showUsageSelection) {
            setShowUsageSelection(false);
            setShowRegistration(false);
            setSelectedUsage(null);
            setEulaAccepted(false);
            setIsAuthenticatedAndPending(false);
            setSummaryModifiedAfterTab(true);
            setHasProceedBeenClicked(false);
            localStorage.removeItem("hasProceedBeenClicked");
          }
          break;
        case 2:
          if (
            (showPaymentForm || didReturnToStageOne) &&
            hasLicenseSelected()
          ) {
            setShowPaymentForm(false);
            setShowUsageSelection(true);
          } else if (
            hasProceedBeenClicked &&
            weightOption &&
            hasLicenseSelected() &&
            !summaryModifiedAfterTab
          ) {
            if (!showRegistration && !showUsageSelection) {
              setShowRegistration(true);
            }
          }
          break;
        case 3:
          if (isRegistrationComplete) {
            setShowPaymentForm(true);
          }
          break;
      }
    }
  };

  const handleNavigateHome = (event, path) => {
    if (event) {
      event.preventDefault();
    }
    
    // Special handling for navigation from ID path to Typefaces - use the same event system as typefaces icon
    if (path === "/Typefaces" && pathname === "/ID") {
      // Dispatch the same event that the typefaces icon uses
      const pageTransitionEvent = new CustomEvent("pageTransitionStart", {
        detail: {
          isNavigatingToTypefaces: true,
        },
      });
      window.dispatchEvent(pageTransitionEvent);
    } else {
      // Normal navigation for other paths
      router.push(path);
    }
  };

  // Modify your handleContinue function
  const handleContinue = () => {
    if (!isLicenceOpen) {
      // Always open license selection if it's not already open
      setIsContinueClicked(true);
      setIsLicenceOpen(true);
      // Ensure weightOption is set so LicenseSelection component renders
      if (!weightOption) {
        setWeightOption("display");
      }
      scrollToTop();
    } else {
      // If license selection is open, close cart and navigate immediately
      onClose(); // Close cart immediately
      handleNavigateHome(null, "/Typefaces"); // Navigate immediately
    }
  };

  const handleRemoveStyle = () => {
    // Reset style-related states
    setWeightOption("");

    // Reset package and license states
    setSelectedPackage(null);
    setCustomizing(false);
    setCustomPrintLicense(null);
    setCustomWebLicense(null);
    setCustomAppLicense(null);
    setCustomSocialLicense(null);

    // Clear multi-font selection state
    setSelectedFonts([]);
    setSelectedStyles({});
    setSelectedFontIds(new Set());
    setCartFont(null);

    // Reset the Continue button state so it will work properly
    setIsContinueClicked(false);
    setIsLicenceOpen(false);

    // Important: Do NOT reset authentication state
    // Only reset cart-specific states
    setShowRegistration(false);
    setShowUsageSelection(false);
    setShowPaymentForm(false);
    setSelectedUsage(null);
    setEulaAccepted(false);
    setIsAuthenticatedAndPending(false);

    // Reset the proceed state
    setHasProceedBeenClicked(false);
    localStorage.removeItem("hasProceedBeenClicked");

    // Clear cart state but preserve authentication
    localStorage.removeItem("cartState");
    // Notify other components that cart was cleared
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartCleared'));
      window.dispatchEvent(new CustomEvent('cartStateChanged'));
    }

    // Update bottom padding since all items are removed
    updateBottomPadding(window.matchMedia("(max-width: 768px)").matches);

    // Scroll to top
    scrollToTop();
  };

  const resetRegistrationState = () => {
    setShowRegistration(false);
    setIsRegistrationComplete(false);
    setShowUsageSelection(false);
    setShowPaymentForm(false);
    setIsAuthenticatedAndPending(false);
    setSelectedUsage(null);
    setEulaAccepted(false);
    setRegistrationData({
      firstName: "",
      surname: "",
      email: "",
      password: "",
      street: "",
      city: "",
      postcode: "",
      country: "",
    });
    setLoginData({
      email: "",
      password: "",
    });
    setClientData({
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });
    setHasProceedBeenClicked(false);
    localStorage.removeItem("hasProceedBeenClicked");
  };

  const handleRemoveLicense = (type) => {
    const isLastLicense = getActiveLicenses().length === 1;

    switch (type) {
      case "print":
        setCustomPrintLicense(null);
        break;
      case "web":
        setCustomWebLicense(null);
        break;
      case "app":
        setCustomAppLicense(null);
        break;
      case "social":
        setCustomSocialLicense(null);
        break;
    }

    // Return to stage 1 if in any form stage
    if (showPaymentForm || showUsageSelection || showRegistration) {
      setShowPaymentForm(false);
      setShowUsageSelection(false);
      setShowRegistration(false);
      setSelectedUsage(null);
      setEulaAccepted(false);
      setIsAuthenticatedAndPending(false);
      setHasProceedBeenClicked(false);
      localStorage.removeItem("hasProceedBeenClicked");
      scrollToTop();
    } else {
      // Original scroll behavior for stage 1
      if (isLastLicense) {
        setCustomizing(false);
        setSelectedPackage(null);
        setHasProceedBeenClicked(false);
        localStorage.removeItem("hasProceedBeenClicked");
        scrollToTop();
      } else {
        if (isContinueClicked) {
          setTimeout(() => {
            if (cartPanelRef.current) {
              // Original scroll logic for mobile and desktop
              const customLicenseSection = cartPanelRef.current.querySelector(
                "[data-custom-license]",
              );
              if (customLicenseSection) {
                const yOffset = -101;
                const y =
                  customLicenseSection.getBoundingClientRect().top +
                  cartPanelRef.current.scrollTop +
                  yOffset;
                cartPanelRef.current.scrollTo({
                  top: y,
                  behavior: "smooth",
                });
              }
            }
          }, 100);
        }
      }
    }

    // Update bottom padding after removing license
    // If this is the last license, immediately reset padding
    if (isLastLicense) {
      setBottomPadding(0);
    }

    setTimeout(() => {
      updateBottomPadding(window.matchMedia("(max-width: 768px)").matches);
    }, 50);

    setSummaryModifiedAfterTab(true);
  };

  const handleRemovePackage = () => {
    setSelectedPackage(null);
    if (showPaymentForm) {
      setShowPaymentForm(false);
      setShowUsageSelection(false);
    } else if (showUsageSelection) {
      setShowUsageSelection(false);
    }
    setShowRegistration(false);
    setSelectedUsage(null);
    setEulaAccepted(false);
    setIsAuthenticatedAndPending(false);
    setRequireProceedClick(true);
    setHasProceedBeenClicked(false);
    localStorage.removeItem("hasProceedBeenClicked");

    // Don't close license selection panel - keep it open so Continue button works
    // setIsLicenceOpen(false); // Remove this line if it exists
    // setIsContinueClicked(false); // Remove this line if it exists

    // Immediately reset bottom padding since we're removing the package
    setBottomPadding(0);

    // Also use setTimeout to double-check after state updates
    setTimeout(() => {
      updateBottomPadding(window.matchMedia("(max-width: 768px)").matches);
    }, 50);

    scrollToTop();
  };

  const handleAddLicense = () => {
    // If in stage 2 or 3, reset and go back to stage 1
    if (showRegistration || showUsageSelection || showPaymentForm) {
      setShowRegistration(false);
      setShowUsageSelection(false);
      setShowPaymentForm(false);
      setSelectedUsage(null);
      setEulaAccepted(false);
      setIsAuthenticatedAndPending(false);
      setHasProceedBeenClicked(false);
      localStorage.removeItem("hasProceedBeenClicked");
      setSummaryModifiedAfterTab(true);

      setIsLicenceOpen(true);
      setIsContinueClicked(true);

      scrollToTop();
    } else {
      // Always ensure the license section is open
      if (!isContinueClicked) {
        setIsContinueClicked(true);
        setIsLicenceOpen(true);
        scrollToTop();
      } else {
        // Original stage 1 behavior - scroll to custom license section
        if (cartPanelRef.current) {
          const customLicenseSection = cartPanelRef.current.querySelector(
            "[data-custom-license]",
          );
          if (customLicenseSection) {
            const yOffset = -101;
            const y =
              customLicenseSection.getBoundingClientRect().top +
              cartPanelRef.current.scrollTop +
              yOffset;
            cartPanelRef.current.scrollTo({
              top: y,
              behavior: "smooth",
            });
          }
        }
      }
    }
  };

  // REMOVED: Old handlePayment function that conflicted with PaymentProcessor
  // Payment is now handled by PaymentProcessor component using modern Stripe Elements API

  const handlePaymentComplete = async (paymentIntent) => {
    console.log('🔄 handlePaymentComplete called', { 
      currentUser: currentUser?.email || 'none',
      paymentIntentId: paymentIntent?.id || 'none',
      currentUserStructure: currentUser
    });
    
    // Prevent double payment processing
    const paymentProcessingKey = `payment_processing_${paymentIntent?.id}`;
    if (await secureCartStorage.getSessionFlag(paymentProcessingKey)) {
      console.log('⚠️ Payment already being processed, skipping duplicate');
      return;
    }
    
    // Set processing lock
    await secureCartStorage.setSessionFlag(paymentProcessingKey, true);
    
    // Clean up processing lock after 60 seconds (safety measure)
    setTimeout(async () => {
      await secureCartStorage.removeSessionFlag(paymentProcessingKey);
    }, 60000);
    
    if (!currentUser) {
      console.error('❌ No current user found during payment completion');
      setError({ message: 'Authentication error. Please log in again and retry.' });
      setIsProcessing(false);
      localStorage.removeItem(paymentProcessingKey);
      return;
    }

    // Get user email from current user
    const userEmail = currentUser.email || currentUser.dbData?.email;
    
    if (!userEmail) {
      console.error('❌ No user email found', { currentUser });
      setError({ message: 'Unable to verify user account. Please log in again and retry.' });
        setIsProcessing(false);
        localStorage.removeItem(paymentProcessingKey);
        return;
      }
    
    console.log('✅ User email found:', userEmail);

    // Save data to localStorage for payment confirmation page
    const cartData = {
      totalPrice: calculateTotalPrice(),
      selectedFonts,
      selectedStyles,
      cartFont,
      selectedFont,
      selectedPackage,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense
    };
    
    // Save essential data to secure storage for payment confirmation page
    await secureCartStorage.saveCartState(cartData);
    await secureCartStorage.saveUserData({
      email: userEmail,
      firstName: currentUser.dbData?.first_name || savedRegistrationData?.firstName || registrationData?.firstName || '',
      lastName: currentUser.dbData?.last_name || savedRegistrationData?.surname || registrationData?.surname || ''
    });
    await secureCartStorage.setSessionFlag("selectedUsage", selectedUsage || 'personal');
    await secureCartStorage.setSessionFlag("eulaAccepted", eulaAccepted);
    
    const billingDetails = {
      street: currentUser.dbData?.street_address || savedRegistrationData?.street || registrationData?.street || '',
      city: currentUser.dbData?.city || savedRegistrationData?.city || registrationData?.city || '',
      postcode: currentUser.dbData?.postal_code || savedRegistrationData?.postcode || registrationData?.postcode || '',
      country: currentUser.dbData?.country || savedRegistrationData?.country || registrationData?.country || ''
    };
    
    try {
      // Process the purchase in the database
      const purchaseData = {
        paymentIntentId: paymentIntent.id,
        cartData: {
          totalPrice: calculateTotalPrice(),
          selectedFonts,
          selectedStyles,
          cartFont,
          selectedFont,
          selectedPackage,
          customPrintLicense,
          customWebLicense,
          customAppLicense,
          customSocialLicense
        },
        userData: {
          email: userEmail
        },
        billingDetails: {
          name: `${currentUser.dbData?.first_name || savedRegistrationData?.firstName || registrationData?.firstName} ${currentUser.dbData?.last_name || savedRegistrationData?.surname || registrationData?.surname}`,
          email: userEmail,
          street: currentUser.dbData?.street_address || savedRegistrationData?.street || registrationData?.street,
          city: currentUser.dbData?.city || savedRegistrationData?.city || registrationData?.city,
          postcode: currentUser.dbData?.postal_code || savedRegistrationData?.postcode || registrationData?.postcode,
          country: currentUser.dbData?.country || savedRegistrationData?.country || registrationData?.country
        },
        usageType: selectedUsage,
        eulaAccepted,
        companyInfo: clientData
      };

      const response = await fetch('/api/process-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData)
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Purchase processing failed:', result.error);
        setError({ message: result.error || 'Purchase processing failed. Please try again.' });
        setIsProcessing(false);
        await secureCartStorage.removeSessionFlag(paymentProcessingKey);
        return;
      }

    } catch (error) {
      console.error('Error processing purchase:', error);
      setError({ message: 'Network error during purchase processing. Please try again.' });
      setIsProcessing(false);
      await secureCartStorage.removeSessionFlag(paymentProcessingKey);
      return;
    }

    // Save local copy for immediate UI feedback (legacy support)
    const purchase = {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      date: new Date().toLocaleDateString(),
      fontName: cartFont?.name || selectedFont?.name || "Font",
      licenseType: selectedPackage || "custom",
      licenses: {
        print: selectedPackage ? true : !!customPrintLicense,
        web: selectedPackage ? true : !!customWebLicense,
        app: selectedPackage ? true : !!customAppLicense,
        social: selectedPackage ? true : !!customSocialLicense,
      },
    };

    const purchases = await secureCartStorage.getPurchases();
    purchases.push(purchase);
    await secureCartStorage.savePurchases(purchases);

    // Notify other components that cart was cleared
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartCleared'));
      window.dispatchEvent(new CustomEvent('cartStateChanged'));
    }
    
    // Clean up processing lock on successful completion
    localStorage.removeItem(paymentProcessingKey);
    
    // DON'T clean up storage here - let payment confirmation page handle it
    // localStorage.removeItem("userEmail");
    // localStorage.removeItem("firstName");
    // localStorage.removeItem("lastName");
    // localStorage.removeItem("billingDetails");
    // localStorage.removeItem("hasProceedBeenClicked");

    // Trigger fade-out animation with slightly faster timing
    setIsPaymentCompleted(true);

    // Close cart with shorter animation duration
    setTimeout(() => {
      onClose();
    }, 250); // Slightly faster than before to ensure smooth transition
  };

  const handleRegistrationInput = (field, value) => {
    const updatedData = {
      ...registrationData,
      [field]: value,
    };
    setRegistrationData(updatedData);

    // Debug billing details input
    if (['street', 'city', 'postcode', 'country'].includes(field)) {
      console.log(`🔍 Billing detail updated: ${field} = "${value}"`);
      console.log('🔍 Updated registrationData:', updatedData);
    }

    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }

    const isFormComplete =
      updatedData.firstName?.trim() &&
      updatedData.surname?.trim() &&
      updatedData.email?.trim() &&
      updatedData.password?.trim() &&
      updatedData.street?.trim() &&
      updatedData.city?.trim() &&
      updatedData.postcode?.trim() &&
      updatedData.country?.trim();

    if (isFormComplete) {
      inputTimeoutRef.current = setTimeout(() => {
        const isMobileView = window.innerWidth <= 768;

        if (isMobileView) {
          if (formDividerRef.current && cartPanelRef.current) {
            const formDividerRect =
              formDividerRef.current.getBoundingClientRect();
            const panelRect = cartPanelRef.current.getBoundingClientRect();

            const loginFormOffset = showLoginForm ? 658 : 54;

            const targetScroll =
              cartPanelRef.current.scrollTop +
              (formDividerRect.bottom - panelRect.bottom) +
              formDividerRect.height -
              loginFormOffset;

            cartPanelRef.current.scrollTo({
              top: targetScroll,
              behavior: "smooth",
            });
          }
        } else {
          // Desktop: scroll to bottom of cart when registration form is complete
          if (cartPanelRef.current) {
            cartPanelRef.current.scrollTo({
              top: cartPanelRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }, 1500);
    }
  };

  const handleRegistrationFocus = (field) => {
    // Clear login data and errors when any registration field is focused
    if (showLoginForm) {
      setLoginData({
        email: "",
        password: "",
      });
      setEmailError(false);
      setPasswordError(false);
      // Clear any general error that might be from login
      setError(null);
    }
  };

  const handleLoginFocus = (field) => {
    // Clear registration data and errors when any login field is focused
    // This ensures clean state when switching from registration to login
    setRegistrationData({
      firstName: "",
      surname: "",
      email: "",
      password: "",
      street: "",
      city: "",
      postcode: "",
      country: "",
    });
    
    // Clear login data when switching to reset password mode
    // This ensures clean state when switching from login to reset password
    setLoginData({
      email: "",
      password: "",
    });
    
    // Trigger registration error clearing
    setClearRegistrationErrors(true);
    
    // Clear any general error that might be from registration
    setError(null);
  };

  const scrollToRef = (ref) => {
    if (ref.current && cartPanelRef.current) {
      const isMobileView = window.innerWidth <= 768;

      if (!isMobileView) {
        // Desktop view
        const buttonRect = ref.current.getBoundingClientRect();
        const panelRect = cartPanelRef.current.getBoundingClientRect();
        const buttonBottom = buttonRect.bottom;
        const panelBottom = panelRect.bottom;

        if (buttonBottom > panelBottom) {
          // Add extra scroll when login form is open
          const loginOffset = showLoginForm ? 650 : 0;
          const targetScroll =
            cartPanelRef.current.scrollTop +
            (buttonBottom - panelBottom) +
            loginOffset;

          cartPanelRef.current.scrollTo({
            top: targetScroll,
            behavior: "smooth",
          });
        }
      }
    }
  };

  // Helper function to show error and scroll to top
  const showErrorWithScroll = (errorMessage) => {
    setError({ message: errorMessage });
    if (cartPanelRef.current) {
      cartPanelRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleRegister = async () => {
    console.log('🔍 handleRegister called, checking form validity...');
    console.log('🔍 Current registrationData state:', registrationData);
    console.log('🔍 Form validation result:', isRegistrationFormValid());
    
    if (isRegistrationFormValid()) {
      setIsRegistering(true);
      try {
        const registrationPayload = {
          email: registrationData.email,
          password: registrationData.password,
          firstName: registrationData.firstName,
          lastName: registrationData.surname,
          streetAddress: registrationData.street,
          city: registrationData.city,
          postalCode: registrationData.postcode,
          country: registrationData.country,
          newsletter: registrationData.newsletter || false,
        };

        console.log('🔍 Registration data from form:', registrationData);
        console.log('🔍 Registration payload being sent to registerUser:', registrationPayload);

        const result = await register(registrationPayload);

        if (result.success) {
          // Registration successful - user is NOT logged in yet, needs to verify email
          console.log('✅ Registration successful, waiting for auth state update...');
          
          // Store registration data for later
          setSavedRegistrationData({
            firstName: registrationData.firstName,
            surname: registrationData.surname,
            email: registrationData.email,
            street: registrationData.street,
            city: registrationData.city,
            postcode: registrationData.postcode,
            country: registrationData.country,
          });

          // Store basic info securely
          await secureCartStorage.saveUserData({
            email: registrationData.email,
            firstName: registrationData.firstName,
            lastName: registrationData.surname
          });
          
          await secureCartStorage.saveBillingDetails({
            street: registrationData.street,
            city: registrationData.city,
            postcode: registrationData.postcode,
            country: registrationData.country,
          });

          // Set registration complete but don't proceed immediately
          // Wait for currentUser prop to be updated by parent component
          setIsRegistrationComplete(true);
          
          // Save registration state securely
          const registrationState = {
            isRegistrationComplete: true,
            needsVerification: result.needsVerification,
            registrationData: {
              firstName: registrationData.firstName,
              surname: registrationData.surname,
              email: registrationData.email,
              street: registrationData.street,
              city: registrationData.city,
              postcode: registrationData.postcode,
              country: registrationData.country,
            }
          };
          await secureCartStorage.saveRegistrationState(registrationState);
          
          // First transition to usage type stage, then show verification prompt over it
          setShowRegistration(false);
          setShowUsageSelection(true);
          setShowPaymentForm(false);
          setIsAuthenticatedAndPending(true);
          
          // Show verification prompt after a brief delay to ensure usage type is rendered
          setTimeout(() => {
            setShowVerificationPrompt(true);
          }, 100);
          
          // Clear any previous errors
          setError(null);
          
          console.log('🔄 Registration flow completed, verification prompt shown');
          
          // Don't call handleInitialProceed here - let the currentUser prop update trigger it
        } else {
          // Registration failed - show error
          // Don't log "already exists" or "invalid email" errors as they're expected
          if (!result.error?.includes('already exists') && !result.error?.includes('valid email')) {
            console.error('Registration failed:', result.error);
          }
          showErrorWithScroll(result.error || 'Registration failed. Please try again.');
        }
      } catch (error) {
        // Don't log "already exists" or "invalid email" errors as they're expected
        if (!error.message?.includes('already exists') && !error.message?.includes('valid email')) {
          console.error('Registration error:', error);
        }
        showErrorWithScroll('Registration failed. Please try again.');
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const handleLoginToggle = () => {
    const isHiding = showLoginForm;
    const isShowing = !showLoginForm;
    
    // If we're showing the login form, clear registration data and errors
    if (isShowing) {
      setRegistrationData({
        firstName: "",
        surname: "",
        email: "",
        password: "",
        street: "",
        city: "",
        postcode: "",
        country: "",
      });
      // Clear any general error that might be from registration
      setError(null);
    } else {
      // If we're hiding the login form (showing registration), clear login data and errors
      setLoginData({
        email: "",
        password: "",
      });
      setEmailError(false);
      setPasswordError(false);
      // Trigger login error clearing
      setClearLoginErrors(true);
      // Clear any general error that might be from login
      setError(null);
    }
    
    setShowLoginForm(!showLoginForm);

    if (cartPanelRef.current && formDividerRef.current) {
      const isMobileView = window.innerWidth <= 768;

      setTimeout(() => {
        if (!isMobileView) {
          const fullHeight = cartPanelRef.current.scrollHeight;
          const scrollTarget = Math.min(
            formDividerRef.current.offsetTop + 300,
            fullHeight,
          );

          cartPanelRef.current.scrollTo({
            top: scrollTarget,
            behavior: "smooth",
          });
        }
      }, 300);
    }
  };

  const handleLoginInput = (field, value) => {
    const updatedData = {
      ...loginData,
      [field]: value,
    };
    setLoginData(updatedData);

    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }

    const isFormComplete =
      updatedData.email?.trim() && updatedData.password?.trim();

    if (isFormComplete) {
      inputTimeoutRef.current = setTimeout(() => {
        if (cartPanelRef.current && loginButtonRef.current) {
          const isMobileView = window.innerWidth <= 768;

          if (!isMobileView) {
            scrollToRef(loginButtonRef);
          }
        }
      }, 1000);
    }
  };

  const handleLogin = async () => {
    console.log('🔄 Cart handleLogin called', { 
      loginData,
      hasEmail: !!loginData.email,
      hasPassword: !!loginData.password
    });
    
    // Clear any previous errors and set loading state
    setEmailError(false);
    setPasswordError(false);
    console.log('🔄 Setting isLoggingIn to true');
    setIsLoggingIn(true);

    // Basic validation
    if (!loginData.email || !loginData.password) {
      console.log('❌ Validation failed:', { 
        email: !loginData.email, 
        password: !loginData.password 
      });
      if (!loginData.email) {
        setEmailError(true);
        setLoginData((prev) => ({ ...prev, email: "" }));
      }
      if (!loginData.password) {
        setPasswordError(true);
        setLoginData((prev) => ({ ...prev, password: "" }));
      }
      console.log('❌ Setting isLoggingIn to false due to validation failure');
      setIsLoggingIn(false);
      return;
    }

    try {
      console.log('🔄 Attempting login with:', loginData.email);
      
      // Use the direct Supabase auth login instead of the complex wrapper
      const { getSupabaseClient } = await import('../../../lib/database/supabaseClient');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        console.log('❌ Cart login failed:', error.message);
        
        // Provide specific error messages based on error type
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the verification link before logging in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
        }
        
        // Show error message in UI
        showErrorWithScroll(errorMessage);
        
        // Also set field errors for visual feedback
        setEmailError(true);
        setPasswordError(true);
        setLoginData((prev) => ({ ...prev, password: "" }));
        console.log('❌ Setting isLoggingIn to false due to login error');
        setIsLoggingIn(false);
        return;
      }

      if (data.user) {
        console.log('✅ Cart login successful');
        
        // Get the database user record
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single();

        if (dbError) {
          console.error('Error fetching user record:', dbError);
        }

        // Check if user's email is verified using Supabase auth user's email_confirmed_at
        if (data.user && !data.user.email_confirmed_at) {
          console.log('⚠️ User email not verified, showing verification prompt');
          
          // Store the user data for later use after verification
          setSavedRegistrationData({
            email: data.user.email,
            firstName: dbUser?.first_name || '',
            surname: dbUser?.last_name || '',
            street: dbUser?.street || '',
            city: dbUser?.city || '',
            postcode: dbUser?.postcode || '',
            country: dbUser?.country || '',
          });
          
          // Set authentication state but mark as pending verification
          setIsAuthenticatedAndPending(true);
          setShowLoginForm(false);
          setShowRegistration(false);
          setShowVerificationPrompt(true);
          
          // Dispatch auth event with pending verification status
          const authEvent = new CustomEvent("authStateChange", {
            detail: {
              isAuthenticated: true,
              email: loginData.email,
              user: {
                ...data.user,
                dbData: dbUser,
                emailVerified: false
              },
              pendingVerification: true
            },
          });
          window.dispatchEvent(authEvent);
          
          console.log('🔄 Setting isLoggingIn to false for email verification flow');
          setIsLoggingIn(false);
          return;
        }

        // Structure the user data
        const structuredUser = {
          ...data.user,
          dbData: dbUser || null
        };

        // Set the user and update state
    setIsAuthenticatedAndPending(true);
    setShowLoginForm(false);
    setShowRegistration(false);
        setShowUsageSelection(true);

    // Enable auto-scroll prevention during transition
    setPreventAutoScroll(true);
    setShouldScrollToBottom(false);

    // Manual scroll to top after all other effects are done
    setTimeout(() => {
      scrollToTop();
      // Re-enable auto-scroll after transition
      setPreventAutoScroll(false);
    }, 500);

        // Dispatch auth event for other components
        const authEvent = new CustomEvent("authStateChange", {
          detail: {
            isAuthenticated: true,
            email: loginData.email,
            user: structuredUser,
          },
        });
        window.dispatchEvent(authEvent);
      }
    } catch (error) {
      console.error('❌ Cart login error:', error);
      setEmailError(true);
      setPasswordError(true);
      setLoginData((prev) => ({ ...prev, password: "" }));
    } finally {
      console.log('🔄 Setting isLoggingIn to false in finally block');
      setIsLoggingIn(false);
    }
  };

  const handleResetPasswordClick = () => {
    if (cartPanelRef.current && formDividerRef.current) {
      const isMobileView = window.innerWidth <= 768;

      if (!isMobileView) {
        // Desktop: Always scroll to bottom
        cartPanelRef.current.scrollTo({
          top: cartPanelRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const handleBackToLogin = () => {
    setIsResettingPassword(false);
    setResetStep("email");
    setResetData({
      email: "",
      newPassword: "",
    });

    // Ensure we stay in the login form state and don't reset to stage 1
    // Only reset registration/usage states if we're not in an active authentication flow
    if (!showRegistration && !showUsageSelection && !isAuthenticatedAndPending) {
      // Keep the current stage - don't reset to stage 1
      console.log('🔄 handleBackToLogin: Maintaining current cart state, not resetting to stage 1');
    }

    setTimeout(() => {
      if (cartPanelRef.current && formDividerRef.current) {
        const isMobileView = window.innerWidth <= 768;

        if (!isMobileView) {
          const scrollTarget = Math.min(
            formDividerRef.current.offsetTop + 300,
            cartPanelRef.current.scrollHeight,
          );

          cartPanelRef.current.scrollTo({
            top: scrollTarget,
            behavior: "smooth",
          });
        }
      }
    }, 300);
  };

  const handleUsageTypeChange = async (value) => {
    if (value !== selectedUsage) {
      // Reset form state when changing usage type
      if (selectedUsage === "client" && value === "personal" && eulaAccepted) {
        setIsRegistrationComplete(false);
        setEulaAccepted(false);
        setClientData({
          companyName: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
        });
      } else {
        setIsRegistrationComplete(false);
        setEulaAccepted(false);

        if (value === "personal") {
          setClientData({
            companyName: "",
            contactName: "",
            contactEmail: "",
            contactPhone: "",
          });
        }
      }
    }

    setSelectedUsage(value);
    
    // Note: Usage type will be saved to purchase_orders table during checkout
    // No need to update user table since this is purchase-specific data
  };

  const loadSavedCartState = (savedCart) => {
    console.log('[CartContext] loadSavedCartState called with:', JSON.stringify(savedCart, null, 2));
    console.log('🔄 loadSavedCartState called with:', {
      savedCartStates: {
        showRegistration: savedCart.showRegistration,
        showUsageSelection: savedCart.showUsageSelection,
        showPaymentForm: savedCart.showPaymentForm,
        isRegistrationComplete: savedCart.isRegistrationComplete,
        selectedUsage: savedCart.selectedUsage,
        eulaAccepted: savedCart.eulaAccepted
      },
      currentStates: {
        showRegistration,
        showUsageSelection,
        isAuthenticatedAndPending
      }
    });
    
    setWeightOption(savedCart.weightOption || "");
    setSelectedPackage(savedCart.selectedPackage || null);
    setCustomizing(savedCart.customizing || false);
    setCustomPrintLicense(savedCart.customPrintLicense || null);
    setCustomWebLicense(savedCart.customWebLicense || null);
    setCustomAppLicense(savedCart.customAppLicense || null);
    setCustomSocialLicense(savedCart.customSocialLicense || null);
    
    // Load the saved font
    setCartFont(savedCart.selectedFont || null);
    
    // Load multi-font selection - NEW
    setSelectedFonts(savedCart.selectedFonts || []);
    setSelectedStyles(savedCart.selectedStyles || {});
    // Load selectedFontIds and convert back to Set
    setSelectedFontIds(new Set(savedCart.selectedFontIds || []));

    // Only reset stage states if user is not currently in an active flow
    // Don't reset if user is showing usage selection (just logged in) or registration
    // Also don't reset if user just logged in (has currentUser but no saved auth state)
    if (!showRegistration && !showUsageSelection && !isAuthenticatedAndPending && !currentUser) {
      console.log('🔄 Resetting stage states in loadSavedCartState');
      setShowRegistration(false);
      setShowUsageSelection(false);
      setShowPaymentForm(false);
      setIsAuthenticatedAndPending(false);
      setSelectedUsage(null);
      setEulaAccepted(false);

      if (!didReturnToStageOne) {
        setIsRegistrationComplete(false);
      }
    } else {
      console.log('🔄 NOT resetting stage states - user in active flow or just logged in');
    }

    // Check if we have selections and handle mobile scroll/padding
    const hasSelections =
      savedCart.weightOption &&
      (savedCart.selectedPackage ||
        (savedCart.customizing &&
          (savedCart.customPrintLicense ||
            savedCart.customWebLicense ||
            savedCart.customAppLicense ||
            savedCart.customSocialLicense)));

    // If we have selections and we're on mobile, update padding and scroll to bottom
    if (hasSelections && window.matchMedia("(max-width: 768px)").matches) {
      // Add a delay to ensure state updates and DOM rendering are complete
      setTimeout(() => {
        updateBottomPadding(true);

        // Scroll to bottom after padding is set
        setTimeout(() => {
          if (cartPanelRef.current) {
            scrollToBottom(true);
          }
        }, 200);
      }, 300);
    }
  };

  const handlePackageSelect = (pkg) => {
    const isDeselecting = selectedPackage === pkg;

    if (currentUser && (showUsageSelection || isRegistrationComplete)) {
      const wasAtLaterStage = isRegistrationComplete || didReturnToStageOne;

      setRequireProceedClick(true);
      setIsAuthenticatedAndPending(false);
      setShowUsageSelection(false);
      setSelectedUsage(null);

      if (!wasAtLaterStage) {
        setIsRegistrationComplete(false);
      }

      setEulaAccepted(false);
      setClientData({
        companyName: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });
    }

    setSelectedPackage((prevPackage) => (prevPackage === pkg ? null : pkg));

    if (customizing) {
      setCustomizing(false);
      setCustomPrintLicense(null);
      setCustomWebLicense(null);
      setCustomAppLicense(null);
      setCustomSocialLicense(null);
    }

    if (hasProceedBeenClicked) {
      setSummaryModifiedAfterTab(false);
    }

    // If deselecting, handle cleanup
    if (isDeselecting) {
      setShowRegistration(false);
      setShowUsageSelection(false);
      setShowPaymentForm(false);
      setSelectedUsage(null);
      setEulaAccepted(false);
      setIsAuthenticatedAndPending(false);
      setHasProceedBeenClicked(false);
      localStorage.removeItem("hasProceedBeenClicked");
      scrollToTop();
    } else {
      // Instead of calling handleResponsiveLayout, just update the bottom padding
      if (
        window.matchMedia("(max-width: 768px)").matches &&
        totalSectionRef.current
      ) {
        const totalHeight =
          totalSectionRef.current.getBoundingClientRect().height || 0;
        setBottomPadding(totalHeight + 24);
      }

      // Then scroll with a longer delay to ensure everything is ready
      setTimeout(() => {
        if (cartPanelRef.current) {
          const isMobileView = window.matchMedia("(max-width: 768px)").matches;
          if (isMobileView) {
            scrollToBottom(isMobileView);
          } else {
            // Desktop behavior
            scrollToTop();
          }
        }
      }, 300); // Longer delay to ensure layout is complete
    }
  };



  const handleLicenseSelect = (type, value) => {
    const wasAtLaterStage = isRegistrationComplete || didReturnToStageOne;

    // Get current value to determine if we're selecting or deselecting
    const currentValue = (() => {
      switch (type) {
        case "print":
          return customPrintLicense;
        case "web":
          return customWebLicense;
        case "app":
          return customAppLicense;
        case "social":
          return customSocialLicense;
        default:
          return null;
      }
    })();

    // If clicking the same value, we're deselecting
    const newValue = currentValue === value ? null : value;

    if (currentUser && (showUsageSelection || isRegistrationComplete)) {
      setRequireProceedClick(true);
      setIsAuthenticatedAndPending(false);
      setShowUsageSelection(false);
      setSelectedUsage(null);

      if (!wasAtLaterStage) {
        setIsRegistrationComplete(false);
      }

      setEulaAccepted(false);
      setClientData({
        companyName: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });
    }

    // Update the specific license with the new value
    switch (type) {
      case "print":
        setCustomPrintLicense(newValue);
        break;
      case "web":
        setCustomWebLicense(newValue);
        break;
      case "app":
        setCustomAppLicense(newValue);
        break;
      case "social":
        setCustomSocialLicense(newValue);
        break;
    }

    if (hasProceedBeenClicked) {
      setSummaryModifiedAfterTab(false);
    }

    // Get count of active licenses after this change
    const getActiveCount = () => {
      let count = 0;
      if (type === "print" ? newValue : customPrintLicense) count++;
      if (type === "web" ? newValue : customWebLicense) count++;
      if (type === "app" ? newValue : customAppLicense) count++;
      if (type === "social" ? newValue : customSocialLicense) count++;
      return count;
    };

    const previousActiveCount = [
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
    ].filter((license) => license !== null).length;
    const newActiveCount = getActiveCount();

    // If this was the last license and we're deselecting it
    if (newActiveCount === 0) {
      setCustomizing(false);
      scrollToTop();
    } else {
      // Update bottom padding for mobile
      if (window.matchMedia("(max-width: 768px)").matches) {
        // If this is the first license being selected (transition from 0 to 1)
        // use a longer delay to allow DOM to update with the fixed total
        const isFirstLicense =
          previousActiveCount === 0 && newActiveCount === 1;
        const delay = isFirstLicense ? 150 : 50;

        setTimeout(() => {
          if (totalSectionRef.current) {
            const totalHeight =
              totalSectionRef.current.getBoundingClientRect().height || 0;
            if (totalHeight > 0) {
              setBottomPadding(totalHeight + 24);
            } else if (isFirstLicense) {
              // Fallback for first license - retry after additional delay
              setTimeout(() => {
                if (totalSectionRef.current) {
                  const retryHeight =
                    totalSectionRef.current.getBoundingClientRect().height || 0;
                  setBottomPadding(retryHeight + 24);
                }
              }, 100);
            }
          }
        }, delay);
      }

      // Use a longer delay for scrolling
      setTimeout(() => {
        if (cartPanelRef.current) {
          const isMobileView = window.matchMedia("(max-width: 768px)").matches;
          if (isMobileView) {
            scrollToBottom(isMobileView);
          } else {
            // Desktop behavior
            const customLicenseSection = cartPanelRef.current.querySelector(
              "[data-custom-license]",
            );
            if (customLicenseSection) {
              const yOffset = -101;
              const y =
                customLicenseSection.getBoundingClientRect().top +
                cartPanelRef.current.scrollTop +
                yOffset;
              cartPanelRef.current.scrollTo({
                top: y,
                behavior: "smooth",
              });
            }
          }
        }
      }, 300);
    }
  };

  const handleCustomize = () => {
    if (customizing) {
      // Canceling custom licensing - going from custom licensing back to empty state
      setCustomizing(false);
      setSelectedPackage(null);
      setCustomPrintLicense(null);
      setCustomWebLicense(null);
      setCustomAppLicense(null);
      setCustomSocialLicense(null);

      setHasProceedBeenClicked(false);
      localStorage.removeItem("hasProceedBeenClicked");

      // Reset bottom padding when canceling custom licensing (manual approach - don't call updateBottomPadding)
      setBottomPadding(0);

      // Force it to stay at 0 for empty state (no fixed total)
      setTimeout(() => setBottomPadding(0), 50);
      setTimeout(() => setBottomPadding(0), 100);
      setTimeout(() => setBottomPadding(0), 200);

      scrollToTop();
    } else {
      // Switching from package (or empty) to custom licensing
      const wasAtLaterStage = isRegistrationComplete || didReturnToStageOne;
      const hadPackageSelected = !!selectedPackage;

      if (currentUser && (showUsageSelection || isRegistrationComplete)) {
        setRequireProceedClick(true);
        setIsAuthenticatedAndPending(false);
        setShowUsageSelection(false);
        setSelectedUsage(null);

        if (!wasAtLaterStage) {
          setIsRegistrationComplete(false);
        }

        setEulaAccepted(false);

        setClientData({
          companyName: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
        });
      }

      setCustomizing(true);
      if (selectedPackage) {
        setSelectedPackage(null);
      }

      // Reset bottom padding when switching from package to custom (manual approach - don't call updateBottomPadding)
      if (hadPackageSelected) {
        setBottomPadding(0);

        // Force it to stay at 0 since no custom licenses selected yet (no fixed total)
        setTimeout(() => setBottomPadding(0), 50);
        setTimeout(() => setBottomPadding(0), 100);
        setTimeout(() => setBottomPadding(0), 200);
      }

      // Add slight delay to ensure state updates and DOM elements are ready
      setTimeout(() => {
        if (cartPanelRef.current) {
          const customLicenseSection = cartPanelRef.current.querySelector(
            "[data-custom-license]",
          );
          if (customLicenseSection) {
            const yOffset = -101; // Same offset as handleAddLicense
            const y =
              customLicenseSection.getBoundingClientRect().top +
              cartPanelRef.current.scrollTop +
              yOffset;
            cartPanelRef.current.scrollTo({
              top: y,
              behavior: "smooth",
            });
          }
        }
      }, 100);
    }

    if (hasProceedBeenClicked) {
      setSummaryModifiedAfterTab(false);
    }
  };

  const handleEulaChange = async (checked) => {
    setEulaAccepted(checked);

    if (!checked && isRegistrationComplete) {
      setIsRegistrationComplete(false);
    }

    // Note: EULA acceptance will be saved to purchase_orders table during checkout
    // No need to update user table since this is purchase-specific data

    // Desktop scrolling when EULA is checked with any usage type selected
    if (checked && selectedUsage) {
      setTimeout(() => {
        if (cartPanelRef.current) {
          const isMobileView = window.matchMedia("(max-width: 768px)").matches;

          if (!isMobileView) {
            // Desktop only: scroll to bottom when EULA is checked for any usage type
            cartPanelRef.current.scrollTo({
              top: cartPanelRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }, 100);
    }
  };

  const handleClientDataChange = (field, value) => {
    // Update the client data state
    const updatedData = {
      ...clientData,
      [field]: value,
    };
    setClientData(updatedData);

    // Clear any existing timeout
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }

    // Check if all fields are now complete
    const isFormComplete =
      updatedData.companyName?.trim() &&
      updatedData.contactName?.trim() &&
      updatedData.contactEmail?.trim() &&
      updatedData.contactPhone?.trim();

    if (isFormComplete) {
      // Set a 1 second timeout to allow typing to finish
      inputTimeoutRef.current = setTimeout(() => {
        if (cartPanelRef.current) {
          // Double check if the form is still complete
          if (
            clientData.companyName?.trim() &&
            clientData.contactName?.trim() &&
            clientData.contactEmail?.trim() &&
            clientData.contactPhone?.trim()
          ) {
            const isMobileView =
              window.matchMedia("(max-width: 768px)").matches;

            if (isMobileView) {
              // Mobile view - specific offset
              cartPanelRef.current.scrollTo({
                top: 276,
                behavior: "smooth",
              });
            } else {
              // All other widths - scroll to bottom
              cartPanelRef.current.scrollTo({
                top: cartPanelRef.current.scrollHeight,
                behavior: "smooth",
              });
            }
          }
        }
      }, 1000); // 1 second delay
    }
  };

  const handleUsageComplete = () => {
    if (
      selectedUsage === "personal" ||
      (selectedUsage === "client" && isClientDataValid())
    ) {
      console.log('🔄 handleUsageComplete: Usage selection complete, enabling proceed button');

      setIsRegistrationComplete(true);
      setIsAuthenticatedAndPending(false);
      setViewPreference(selectedUsage);
      
      // Mark usage as complete but stay in usage selection stage
      // Don't transition to payment - let user click main proceed button
      setShowUsageSelection(true);
      setShowPaymentForm(false);
      setShowRegistration(false);

      // Save the updated cart state
      saveCartState({
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        showRegistration: false,
        showUsageSelection: true,
        showPaymentForm: false,
        isRegistrationComplete: true,
        selectedUsage,
        eulaAccepted,
        isAuthenticatedAndPending: false,
        selectedFont: cartFont,
        selectedFonts,
        selectedStyles,
      });

      scrollToTop();
    }
  };

  const resetUsageState = () => {
    setShowUsageSelection(false);
    setSelectedUsage(null);
    setEulaAccepted(false);
    setClientData({
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });
    setIsAuthenticatedAndPending(false);
    setIsRegistrationComplete(false);
    setRequireProceedClick(true);
  };

  // NEW: Multi-font pricing calculation
  const calculateTotalPrice = () => {
    if (!Array.isArray(selectedFonts) || selectedFonts.length === 0) {
      // Fallback to original single-font pricing
      return selectedPackage
        ? packages[selectedPackage].price || 0
        : calculateCustomTotal();
    }

    const licenseType = selectedPackage ? "package" : "custom";
    const customLicenseData = {
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
    };

    try {
      return calculateMultiFontPrice(
        selectedFonts,
        selectedStyles || {},
        licenseType,
        selectedPackage,
        customLicenseData
      );
    } catch (error) {
      console.error('Error calculating multi-font price:', error);
      return 0;
    }
  };

  // NEW: Get pricing breakdown for display
  const getPricingBreakdownData = () => {
    if (!Array.isArray(selectedFonts) || selectedFonts.length === 0) {
      return {
        fonts: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        discountPercentage: 0,
        fontCount: 0
      };
    }

    const licenseType = selectedPackage ? "package" : "custom";
    const customLicenseData = {
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
    };

    try {
      return getPricingBreakdown(
        selectedFonts,
        selectedStyles || {},
        licenseType,
        selectedPackage,
        customLicenseData
      );
    } catch (error) {
      console.error('Error getting pricing breakdown:', error);
      return {
        fonts: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        discountPercentage: 0,
        fontCount: 0
      };
    }
  };

  // NEW: Handle font updates
  const handleUpdateFonts = (fonts) => {
    setSelectedFonts(Array.isArray(fonts) ? fonts : []);
    
    // Update cart state
    const cartState = {
      weightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
      selectedFont: cartFont,
      selectedFonts: Array.isArray(fonts) ? fonts : [],
      selectedStyles,
      selectedFontIds: Array.from(selectedFontIds),
    };
    saveCartState(cartState);
  };

  // NEW: Handle style updates
  const handleUpdateStyles = (styles) => {
    setSelectedStyles(styles || {});
    
    // Update cart state
    const cartState = {
      weightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
      selectedFont: cartFont,
      selectedFonts,
      selectedStyles: styles || {},
      selectedFontIds: Array.from(selectedFontIds),
    };
    saveCartState(cartState);
  };

  const handleWeightSelect = (newWeightOption) => {
    setWeightOption(newWeightOption);
    // The useEffect will handle persistence, but we can also do it immediately for responsiveness
    const cartState = {
      weightOption: newWeightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
      selectedFont: cartFont,
      selectedFonts,
      selectedStyles,
      selectedFontIds: Array.from(selectedFontIds),
    };
    if (newWeightOption || selectedPackage || customizing || cartFont) {
      saveCartState(cartState);
    }
  };

  function handleErrorClear() {
    setError(null);
  }

  // Utility function to refresh user dashboard data
  const refreshUserDashboard = () => {
    try {
      // Dispatch custom event that the dashboard listens for
      const refreshEvent = new CustomEvent('refreshUserDashboard');
      window.dispatchEvent(refreshEvent);
      console.log("🔄 Triggered user dashboard refresh");
    } catch (error) {
      console.error("Error triggering dashboard refresh:", error);
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      // Try to get email from currentUser, registrationData, or savedRegistrationData
      const email = currentUser?.email || registrationData?.email || savedRegistrationData?.email;
      
      if (!email) {
        console.error('No email found for resend:', { 
          currentUser, 
          registrationData, 
          savedRegistrationData 
        });
        return { success: false, error: 'No email address found' };
      }

      console.log('🔄 Attempting to resend verification email to:', email);
      console.log('📊 Current user verification status:', {
        email: email,
        email_confirmed_at: currentUser?.email_confirmed_at,
        isVerified: !!currentUser?.email_confirmed_at,
        user_id: currentUser?.id,
        full_user: currentUser,
        source: currentUser?.email ? 'currentUser' : registrationData?.email ? 'registrationData' : 'savedRegistrationData'
      });

      // Check if user is already verified (only if we have currentUser)
      if (currentUser?.email_confirmed_at) {
        console.log('✅ User is already verified, no need to resend');
        return { 
          success: false, 
          error: 'Your email is already verified! You can proceed with your purchase.' 
        };
      }

      const { getSupabaseClient } = await import('../../../lib/database/supabaseClient');
      const supabase = getSupabaseClient();
      
      // Use the same redirect URL as registration
      const redirectTo = getAuthCallbackUrl();
      
      console.log('🔗 Using redirect URL:', redirectTo);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error('❌ Resend verification error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText
        });
        
        // Handle specific error cases
        if (error.message.includes('rate limit') || error.message.includes('can only request this after')) {
          // Extract seconds from error message if available
          const secondsMatch = error.message.match(/(\d+) seconds/);
          const seconds = secondsMatch ? secondsMatch[1] : '60';
          return { success: false, error: `Please wait ${seconds} seconds before requesting another verification email.` };
        }
        if (error.message.includes('already confirmed')) {
          return { success: false, error: 'Your email is already verified. Please try logging in.' };
        }
        
        // Check for "invalid" error specifically
        if (error.message.includes('invalid')) {
          console.error('❌ Invalid error details:', error);
          return { success: false, error: `Invalid request: ${error.message}` };
        }
        
        return { success: false, error: error.message || 'Failed to send verification email' };
      }

      console.log('✅ Verification email resent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error resending verification email:', error);
      return { success: false, error: 'An error occurred while sending the email' };
    }
  };

  const value = {
    // All state values
    isLicenceOpen,
    isContinueClicked,
    bottomPadding,
    isMobile,
    isScrolled,
    shouldScrollToBottom,
    showRegistration,
    isRegistrationComplete,
    showLoginForm,
    isResettingPassword,
    clearRegistrationErrors,
    clearLoginErrors,
    resetStep,
    isAuthenticatedAndPending,
    showUsageSelection,
    eulaAccepted,
    requireProceedClick,
    isPaymentCompleted,
    registrationData,
    loginData,
    resetData,
    clientData,
    showPaymentForm,
    selectedPaymentMethod,
    isMobileDevice,
    paymentConfirmed,
    paymentDetails,
    addressData,
    clientSecret,
    isStripeFormComplete,
    isProcessing,
    isLoadingPayment,
    emailError,
    passwordError,
    resetEmailError,
    showPassword,
    selectedUsage,
    viewPreference,
    error,
    isLoggingIn,
    isRegistering,
    hasProceedBeenClicked,
    summaryModifiedAfterTab,
    savedRegistrationData,
    currentUser,
    isAuthenticated,
    didReturnToStageOne,
    weightOption,
    selectedPackage,
    customizing,
    customPrintLicense,
    customWebLicense,
    customAppLicense,
    customSocialLicense,
    cartFont,
    cartBillingDetails,

    // All refs
    totalSectionRef,
    cartPanelRef,
    registerButtonRef,
    loginButtonRef,
    usageTypeButtonRef,
    inputTimeoutRef,
    formDividerRef,
    stripeWrapperRef,

    // All setters
    setIsLicenceOpen,
    setIsContinueClicked,
    setBottomPadding,
    setIsMobile,
    setIsScrolled,
    setShouldScrollToBottom,
    setShowRegistration,
    setIsRegistrationComplete,
    setShowLoginForm,
    setIsResettingPassword,
    setClearRegistrationErrors,
    setClearLoginErrors,
    setResetStep,
    setIsAuthenticatedAndPending,
    setShowUsageSelection,
    setEulaAccepted,
    setRequireProceedClick,
    setIsPaymentCompleted,
    setRegistrationData,
    setLoginData,
    setResetData,
    setClientData,
    setShowPaymentForm,
    setSelectedPaymentMethod,
    setIsMobileDevice,
    setPaymentConfirmed,
    setPaymentDetails,
    setAddressData,
    setClientSecret,
    setIsStripeFormComplete,
    setIsProcessing,
    setIsLoadingPayment,
    setEmailError,
    setPasswordError,
    setResetEmailError,
    setShowPassword,
    setSelectedUsage,
    setViewPreference,
    setError,
    setIsLoggingIn,
    setIsRegistering,
    setHasProceedBeenClicked,
    setSummaryModifiedAfterTab,
    setSavedRegistrationData,
    setDidReturnToStageOne,
    setWeightOption,
    setSelectedPackage,
    setCustomizing,
    setCustomPrintLicense,
    setCustomWebLicense,
    setCustomAppLicense,
    setCustomSocialLicense,
    setCartFont,

    // All handlers and utility functions
    handleNavigateHome,
    handleCartState,
    handleCartStateLoad,
    handleAuthenticationCheck,
    handleResponsiveLayout,
    updateBottomPadding,
    createPaymentIntent,
    handleClose,
    handleAuthenticatedClose,
    handleUnauthenticatedClose,
    resetPaymentState,
    handleProceed,
    handleInitialProceed,
    handleFormProceed,
    isRegistrationFormValid,
    isLoginFormValid,
    isClientDataValid,
    isPaymentFormValid,
    hasCartSelections,
    hasLicenseSelected,
    getLicenseTypeDisplay,
    getLicenseDetails,
    getActiveLicenses,
    calculateCustomTotal,
    isCheckoutDisabled,
    scrollToTop,
    scrollToBottom,
    getCurrentStage,
    handleStageClick,
    handleContinue,
    handleRemoveStyle,
    resetRegistrationState,
    handleRemoveLicense,
    handleRemovePackage,
    handleAddLicense,
    handlePaymentComplete,
    handleRegistrationInput,
    handleRegistrationFocus,
    handleLoginFocus,
    scrollToRef,
    handleRegister,
    handleLoginToggle,
    handleLoginInput,
    handleLogin,
    handleResetPasswordClick,
    handleBackToLogin,
    handleUsageTypeChange,
    loadSavedCartState,
    handlePackageSelect,
    handleLicenseSelect,
    handleCustomize,
    handleEulaChange,
    handleClientDataChange,
    handleUsageComplete,
    resetUsageState,

    // Constants and external references
    stripePromise,
    router,

    // NEW: Multi-font values
    selectedFonts,
    selectedStyles,
    selectedFontIds,
    setSelectedFontIds,
    handleUpdateFonts,
    handleUpdateStyles,
    calculateTotalPrice,
    getPricingBreakdownData,
    handleWeightSelect,
    debugLogout,
    handleErrorClear,
    refreshUserDashboard,
    handleResendVerificationEmail,
  };

  // Add verification status handling
  useEffect(() => {
    const handleVerificationStatus = () => {
      const params = new URLSearchParams(window.location.search);
      const verificationStatus = params.get('verification');

      if (verificationStatus === 'success') {
        setShowVerificationPrompt(false);
        setShowUsageSelection(true);
        // Clean up the URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (verificationStatus === 'failed') {
        // Handle verification failure
        setError('Email verification failed. Please try again.');
        setShowVerificationPrompt(false);
        // Clean up the URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    // Add message listener for verification status
    const handleMessage = (event) => {
      if (event.data?.type === 'verification') {
        if (event.data.status === 'success') {
          setShowVerificationPrompt(false);
          setShowUsageSelection(true);
        } else if (event.data.status === 'failed') {
          setError('Email verification failed. Please try again.');
          setShowVerificationPrompt(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    handleVerificationStatus();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleVerificationPromptClose = () => {
    setShowVerificationPrompt(false);
    // Just close the prompt - usage type form is already visible behind it
  };

  const handleVerificationPromptContinue = () => {
    setShowVerificationPrompt(false);
    // Just close the prompt - usage type form is already visible behind it
    // User can interact with usage type form but won't be able to complete purchase without verification
  };

  // Update cart billing details when props change
  useEffect(() => {
    if (propBillingDetails) {
      console.log('🔄 Updating cart billing details from props:', propBillingDetails);
      setCartBillingDetails(propBillingDetails);
    }
  }, [propBillingDetails]);

  // Refresh billing details when usage selection is shown
  useEffect(() => {
    if (showUsageSelection && currentUser?.email_confirmed_at) {
      console.log('🔄 Usage selection shown, ensuring billing details are up to date');
      // Trigger a custom event to refresh billing details
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshBillingDetails'));
      }
    }
  }, [showUsageSelection, currentUser?.email_confirmed_at]);

  // Handle responsive layout changes (resize events)
  useEffect(() => {
    const handleResize = () => {
      handleResponsiveLayout();
    };

    // Set up resize event listener
    window.addEventListener('resize', handleResize);
    
    // Initial call to set up responsive state
    handleResponsiveLayout();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle scroll to bottom when shouldScrollToBottom is set
  useEffect(() => {
    if (shouldScrollToBottom && cartPanelRef.current) {
      // Wait for DOM/layout to update
      setTimeout(() => {
        if (cartPanelRef.current) {
          cartPanelRef.current.scrollTo({
            top: cartPanelRef.current.scrollHeight,
            behavior: "smooth",
          });
          setShouldScrollToBottom(false);
        }
      }, 100);
    }
  }, [shouldScrollToBottom]);

  // Reset clearRegistrationErrors after it's been used
  useEffect(() => {
    if (clearRegistrationErrors) {
      // Reset after a short delay to ensure the Registration component has processed it
      const timer = setTimeout(() => {
        setClearRegistrationErrors(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [clearRegistrationErrors]);

  // Reset clearLoginErrors after it's been used
  useEffect(() => {
    if (clearLoginErrors) {
      // Reset after a short delay to ensure the LoginForm component has processed it
      const timer = setTimeout(() => {
        setClearLoginErrors(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [clearLoginErrors]);

  // Add verification prompt to render
  return (
    <CartContext.Provider value={value}>
      {children}
      {showVerificationPrompt && (currentUser || savedRegistrationData) && (
        <VerificationPrompt 
          isVisible={showVerificationPrompt}
          email={currentUser?.email || savedRegistrationData?.email} 
          onClose={handleVerificationPromptClose}
          onContinue={handleVerificationPromptContinue}
          onResendEmail={handleResendVerificationEmail}
        />
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartProvider;
