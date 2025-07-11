"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
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
  addFontToSelection 
} from './multiFontPricing';
import gsap from 'gsap';

export const CartContext = createContext();

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  {
    betas: ["payment_element_apple_pay_beta_1"],
  },
);

// Simple cart state management functions
const getCartState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('cartState');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading cart state:', error);
    return null;
  }
};

const saveCartState = (cartState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cartState', JSON.stringify(cartState));
  } catch (error) {
    console.error('Error saving cart state:', error);
  }
};

export const CartProvider = ({ children, onClose, isOpen, setIsLoggedIn }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Get selected font from context (for fallback)
  const { selectedFont } = useFontSelection();

  // Get navigation context
  const { set$isNavigating } = useNavigation();

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

  // Cart font state - this will hold the font that was selected when added to cart
  const [cartFont, setCartFont] = useState(null);

  // Multi-font selection state - NEW
  const [selectedFonts, setSelectedFonts] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState({});
  const [selectedFontIds, setSelectedFontIds] = useState(new Set());
  const [fontPricingMultipliers, setFontPricingMultipliers] = useState({});

  // Authentication States (simplified with NextAuth)
  const [showRegistration, setShowRegistration] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [isAuthenticatedAndPending, setIsAuthenticatedAndPending] = useState(false);
  const [showUsageSelection, setShowUsageSelection] = useState(false);
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [requireProceedClick, setRequireProceedClick] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
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
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [viewPreference, setViewPreference] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  // Placeholder authentication functions since useAuth was removed
  const register = async (userData) => {
    try {
      // Import the actual register function from authUtils
      const { registerUser } = await import('./authUtils');
      const result = await registerUser(userData);
      
      if (result.success) {
        // Get the full user record from the database
        const { getUserByAuthId } = await import('../../../lib/database/supabaseClient');
        const { data: dbUser, error: dbError } = await getUserByAuthId(result.user.id);
        
        if (dbError) {
          console.error('Error fetching user record:', dbError);
        }
        
        // Structure the user data with both auth and database info
        const structuredUser = {
          ...result.user,
          dbData: dbUser || null
        };
        
        // Set the structured user data
        setCurrentUser(structuredUser);
        return { success: true, user: structuredUser, needsVerification: result.needsVerification };
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
      const { supabase } = await import('../../../lib/database/supabaseClient');
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
        
        setCurrentUser(structuredUser);
        return { success: true, user: structuredUser };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // User state
  const [currentUser, setCurrentUser] = useState(null);

  // Debug function to clear session (for testing)
  const debugLogout = async () => {
    try {
      // Import the actual logout function from authUtils
      const { logoutUser } = await import('./authUtils');
      await logoutUser();
      
      // Clear all authentication-related state
      setCurrentUser(null);
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
      setCurrentUser(null);
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
    handleCartStateLoad();
  }, [isOpen, currentUser]);

  // Load cart state immediately on mount, not just when cart opens
  useEffect(() => {
    handleCartStateLoad();
  }, []);

  useEffect(() => {
    const handleAuthChange = (event) => {
      const { isAuthenticated: authState, user } = event.detail;
      
      if (authState && user) {
        // User has logged in via main login modal
        console.log('🔄 User logged in via main modal, updating cart state');
        
        // Update current user in cart
        setCurrentUser(user);
        
        // If cart is open and user just logged in, update the cart flow
        if (isOpen) {
          setShowRegistration(false);
          setIsRegistrationComplete(true);
          setIsAuthenticatedAndPending(false);
          
          // Don't automatically advance to usage selection
          // Let the user proceed manually from stage 1
          setShowUsageSelection(false);
          setShowPaymentForm(false);
        }
      } else if (!authState) {
        // User has logged out
        console.log('🔄 User logged out, clearing cart auth state');
        setCurrentUser(null);
        setShowRegistration(false);
        setIsRegistrationComplete(false);
        setShowUsageSelection(false);
        setShowPaymentForm(false);
        setSelectedUsage(null);
        setEulaAccepted(false);
        setIsAuthenticatedAndPending(false);
      }
    };

    window.addEventListener("authStateChange", handleAuthChange);

    // Remove localStorage check and call proper auth check
    handleAuthenticationCheck();

    // Add Supabase auth state listener
    const setupAuthListener = async () => {
      try {
        const { supabase } = await import('../../../lib/database/supabaseClient');
        const { getUserByAuthId } = await import('../../../lib/database/supabaseClient');
        
        // Clear any invalid tokens before setting up the listener
        try {
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
        } catch (tokenError) {
          // If there's any error during token clearing, just continue
          console.warn('Error clearing invalid tokens in CartContext:', tokenError);
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            try {
              if (event === 'SIGNED_IN' && session?.user) {
                // Get the full user record from the database
                const { data: dbUser, error: dbError } = await getUserByAuthId(session.user.id);
                
                if (dbError) {
                  console.error('Error fetching user record on auth change:', dbError);
                }
                
                const structuredUser = {
                  ...session.user,
                  dbData: dbUser || null
                };
                
                setCurrentUser(structuredUser);
              } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
              } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                // For token refresh, we might already have the user data
                // Only fetch if we don't have it or if it's incomplete
                if (!currentUser || !currentUser.dbData) {
                  const { data: dbUser, error: dbError } = await getUserByAuthId(session.user.id);
                  
                  if (dbError) {
                    console.error('Error fetching user record on token refresh:', dbError);
                  }
                  
                  const structuredUser = {
                    ...session.user,
                    dbData: dbUser || null
                  };
                  
                  setCurrentUser(structuredUser);
                }
              }
            } catch (authError) {
              console.error('Error in auth state change handler:', authError);
              // If there's an error, ensure user is set to null
              setCurrentUser(null);
            }
          }
        );
        
        // Store subscription for cleanup
        return subscription;
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        return null;
      }
    };

    let authSubscription = null;
    setupAuthListener().then(subscription => {
      authSubscription = subscription;
    });

    return () => {
      window.removeEventListener("authStateChange", handleAuthChange);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Check authentication when cart opens
  useEffect(() => {
    if (isOpen) {
      handleAuthenticationCheck();
    }
  }, [isOpen]);

  // NEW: Initialize multi-font selection with current cart font
  useEffect(() => {
    if (cartFont && Array.isArray(selectedFonts) && selectedFonts.length === 0) {
      const { selectedFonts: fonts, selectedStyles: styles } = addFontToSelection([], {}, cartFont, []);
      setSelectedFonts(fonts || []);
      setSelectedStyles(styles || {});
      
      // Persist this initialization to localStorage
      const cartState = {
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        selectedFont: cartFont,
        selectedFonts: fonts || [],
        selectedStyles: styles || {},
      };
      saveCartState(cartState);
    }
  }, [cartFont, selectedFonts?.length]);

  // Update authentication check to use NextAuth session
  const handleAuthenticationCheck = async () => {
    try {
      // Clear any invalid tokens before checking authentication
      try {
        const { supabase } = await import('../../../lib/database/supabaseClient');
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
          setCurrentUser(null);
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
          setCurrentUser(structuredUser);
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
          setCurrentUser(structuredUser);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setCurrentUser(null);
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

  const handleCartStateLoad = () => {
    const savedCart = getCartState();
    if (savedCart) {
      if (isOpen && currentUser) {
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
    
    // When cart opens, check authentication state and set appropriate stage
    if (isOpen && currentUser) {
      // For authenticated users, always start at stage 1 unless they've already proceeded
      const hasProceedBeenClicked = localStorage.getItem("hasProceedBeenClicked") === "true";
      
      // Don't reset stage if user has completed usage selection, is in active flow, 
      // OR is currently in authentication flow (just logged in)
      if (!hasProceedBeenClicked && 
          !showUsageSelection && 
          !isAuthenticatedAndPending && 
          !isRegistrationComplete) {
        // User hasn't clicked proceed yet and isn't in active flow, keep them at stage 1
          setShowRegistration(false);
        setShowUsageSelection(false);
          setShowPaymentForm(false);
        setIsAuthenticatedAndPending(false);
        setIsRegistrationComplete(true); // Mark as complete since they're authenticated
      }
    } else if (isOpen && !currentUser) {
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

    // Don't update bottom padding when showing usage selection - prevents scroll conflicts
    if (!showUsageSelection) {
      updateBottomPadding(mobileMatch);
    }

    setTimeout(() => {
      if (cartPanelRef.current && !preventAutoScroll) {
        // Don't auto-scroll when showing usage selection - let manual scroll control
        if (showUsageSelection) {
          return;
        }

        // On mobile portrait, scroll to summary section
        // On desktop and landscape, scroll to top
        if (mobileMatch && isPortrait) {
          scrollToSummary();
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

  const handleProceed = () => {
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
    
    // Check if user has completed usage selection and is ready for payment
    if (
      !showRegistration &&
      !showPaymentForm &&
      isRegistrationComplete &&
      selectedUsage &&
      eulaAccepted &&
      (selectedPackage || (customizing && calculateCustomTotal() > 0))
    ) {
      console.log('✅ Proceeding to payment form');
      // User has completed usage selection, proceed to payment
      // Transition atomically to prevent flash
      setShowUsageSelection(false);
      setShowPaymentForm(true);
      
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
      return;
    }

    if (
      !showRegistration &&
      !showUsageSelection &&
      !showPaymentForm &&
      (selectedPackage || (customizing && calculateCustomTotal() > 0))
    ) {
      console.log('🔄 Calling handleInitialProceed');
      handleInitialProceed();
      return;
    }

    if (showPaymentForm && isPaymentFormValid() && !isProcessing) {
      // Payment processing is handled by the PaymentProcessor component
      // through the onPayment prop in CartSummary
      console.log('💳 Payment form is valid, ready for processing');
      return;
    }

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



  const handleInitialProceed = () => {
    console.log('🔄 handleInitialProceed called', { 
      currentUser: currentUser?.email || 'none'
    });
    
    if (currentUser) {
      // If user is authenticated, skip to usage selection
      console.log('✅ Authenticated user, going to usage selection');
      setShowRegistration(false);
        setShowUsageSelection(true);
      setShowPaymentForm(false);
        setIsAuthenticatedAndPending(true);
      setIsRegistrationComplete(true); // Mark as complete since user is logged in
      } else {
      console.log('❌ Not authenticated, showing registration');
      setShowRegistration(true);
      setShowUsageSelection(false);
      setShowPaymentForm(false);
      setIsAuthenticatedAndPending(false);
    }

    setHasProceedBeenClicked(true);
    localStorage.setItem("hasProceedBeenClicked", "true");

    saveCartState({
      weightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
      showRegistration: !currentUser,
      showUsageSelection: !!currentUser,
      showPaymentForm: false,
      isRegistrationComplete: !!currentUser,
      selectedUsage,
      eulaAccepted,
      isAuthenticatedAndPending: !!currentUser,
      selectedFont: cartFont,
      selectedFonts,
      selectedStyles,
    });
  };

  const handleFormProceed = () => {
    if (showRegistration && isRegistrationFormValid()) {
      setShowRegistration(false);
      setShowUsageSelection(true);
      setIsAuthenticatedAndPending(true);
    } else if (showUsageSelection && selectedUsage && eulaAccepted) {
      // REQUIRED: User must be authenticated to proceed to payment
      if (!currentUser) {
        setError({ message: "You must be logged in to purchase fonts. Please register or sign in." });
        return;
      }
      
      const userEmail = currentUser.email || currentUser.dbData?.email;
      if (!userEmail) {
        setError({ message: "Valid user account required. Please ensure you're properly logged in." });
        return;
      }

      // Let handleUsageComplete handle the transition from usage selection to summary
      // This function should NOT directly set showPaymentForm=true
      // The proper flow is: usage completion -> summary stage -> proceed button -> payment
      console.log('Usage selection complete, should trigger handleUsageComplete instead');
      
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
    (showUsageSelection
      ? isRegistrationComplete && eulaAccepted
      : showPaymentForm
        ? isPaymentFormValid()
        : !showRegistration || (isRegistrationComplete && selectedUsage && eulaAccepted))
  );

  const scrollToTop = () => {
    if (cartPanelRef.current) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          cartPanelRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });
      }, 300);
    }
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
    if (localStorage.getItem(paymentProcessingKey)) {
      console.log('⚠️ Payment already being processed, skipping duplicate');
      return;
    }
    
    // Set processing lock
    localStorage.setItem(paymentProcessingKey, 'true');
    
    // Clean up processing lock after 60 seconds (safety measure)
    setTimeout(() => {
      localStorage.removeItem(paymentProcessingKey);
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
    
    // Save essential data to localStorage for payment confirmation page
    localStorage.setItem("cartState", JSON.stringify(cartData));
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("firstName", currentUser.dbData?.first_name || savedRegistrationData?.firstName || registrationData?.firstName || '');
    localStorage.setItem("lastName", currentUser.dbData?.last_name || savedRegistrationData?.surname || registrationData?.surname || '');
    localStorage.setItem("selectedUsage", selectedUsage || 'personal');
    localStorage.setItem("eulaAccepted", eulaAccepted ? 'true' : 'false');
    
    const billingDetails = {
      street: currentUser.dbData?.street_address || savedRegistrationData?.street || registrationData?.street || '',
      city: currentUser.dbData?.city || savedRegistrationData?.city || registrationData?.city || '',
      postcode: currentUser.dbData?.postal_code || savedRegistrationData?.postcode || registrationData?.postcode || '',
      country: currentUser.dbData?.country || savedRegistrationData?.country || registrationData?.country || ''
    };
    localStorage.setItem("billingDetails", JSON.stringify(billingDetails));
    
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
        localStorage.removeItem(paymentProcessingKey);
        return;
      }

    } catch (error) {
      console.error('Error processing purchase:', error);
      setError({ message: 'Network error during purchase processing. Please try again.' });
      setIsProcessing(false);
      localStorage.removeItem(paymentProcessingKey);
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

    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    purchases.push(purchase);
    localStorage.setItem("purchases", JSON.stringify(purchases));

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

  const handleRegister = async () => {
    if (isRegistrationFormValid()) {
      try {
        const result = await register({
        email: registrationData.email,
        password: registrationData.password,
        firstName: registrationData.firstName,
        lastName: registrationData.surname,
          streetAddress: registrationData.street,
          city: registrationData.city,
          postalCode: registrationData.postcode,
          country: registrationData.country,
          newsletter: registrationData.newsletter || false,
      });

        if (result.success) {
          // Registration successful - NextAuth handles authentication state
      if (setIsLoggedIn) {
        setIsLoggedIn(true);
      }
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

      setSavedRegistrationData({
        firstName: registrationData.firstName,
        surname: registrationData.surname,
        email: registrationData.email,
        street: registrationData.street,
        city: registrationData.city,
        postcode: registrationData.postcode,
        country: registrationData.country,
      });

      localStorage.setItem("userEmail", registrationData.email);
      localStorage.setItem("firstName", registrationData.firstName);
      localStorage.setItem("lastName", registrationData.surname);
      localStorage.setItem(
        "billingDetails",
        JSON.stringify({
          street: registrationData.street,
          city: registrationData.city,
          postcode: registrationData.postcode,
          country: registrationData.country,
        }),
      );

      setIsAuthenticatedAndPending(true);
      setSelectedUsage("personal");
      setEulaAccepted(true);
        } else {
          // Registration failed - show error
          console.error('Registration failed:', result.error);
          setError({ message: result.error || 'Registration failed. Please try again.' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setError({ message: 'Registration failed. Please try again.' });
      }
    }
  };

  const handleLoginToggle = () => {
    const isHiding = showLoginForm;
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
      setIsLoggingIn(false);
      return;
    }

    try {
      console.log('🔄 Attempting login with:', loginData.email);
      
      // Use the direct Supabase auth login instead of the complex wrapper
      const { supabase } = await import('../../../lib/database/supabaseClient');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        console.log('❌ Cart login failed:', error.message);
        setEmailError(true);
        setPasswordError(true);
        setLoginData((prev) => ({ ...prev, password: "" }));
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

        // Structure the user data
        const structuredUser = {
          ...data.user,
          dbData: dbUser || null
        };

        // Set the user and update state
        setCurrentUser(structuredUser);
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

  const scrollToSummary = () => {
    if (cartPanelRef.current) {
      // Add a small delay to ensure all state updates and renders are complete
      setTimeout(() => {
        const isMobileView = window.matchMedia("(max-width: 768px)").matches;
        if (isMobileView) {
          // Scroll to the summary section on mobile instead of bottom
          const summarySection = cartPanelRef.current.querySelector(
            "[data-mobile-summary]",
          );
          if (summarySection) {
            const yOffset = -24; // Small offset from top
            const y =
              summarySection.getBoundingClientRect().top +
              cartPanelRef.current.scrollTop +
              yOffset;
            cartPanelRef.current.scrollTo({
              top: Math.max(0, y),
              behavior: "smooth",
            });
          } else {
            // Fallback to scroll to bottom if summary section not found
            scrollToBottom(isMobileView);
          }
        } else {
          cartPanelRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }, 100);
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
      // REQUIRED: User must be authenticated to proceed to payment
      if (!currentUser) {
        setError({ message: "You must be logged in to purchase fonts. Please register or sign in." });
        return;
      }
      
      const userEmail = currentUser.email || currentUser.dbData?.email;
      if (!userEmail) {
        setError({ message: "Valid user account required. Please ensure you're properly logged in." });
        return;
      }

      console.log('🔄 handleUsageComplete: Enabling Proceed button, keeping usage form visible');

      setIsRegistrationComplete(true);
      setIsAuthenticatedAndPending(false);
      setViewPreference(selectedUsage);
      
      // CRITICAL: Keep usage form visible, just enable the Proceed button
      // setShowUsageSelection remains true to keep usage form visible
      setShowPaymentForm(false); // Ensure payment form is not shown
      setShowRegistration(false);

      // Save the updated cart state - keep usage selection visible
      saveCartState({
        weightOption,
        selectedPackage,
        customizing,
        customPrintLicense,
        customWebLicense,
        customAppLicense,
        customSocialLicense,
        showRegistration: false,
        showUsageSelection: true, // Keep usage form visible
        showPaymentForm: false, // CRITICAL: Ensure payment form is false
        isRegistrationComplete: true,
        selectedUsage,
        eulaAccepted,
        isAuthenticatedAndPending: false,
        selectedFont: cartFont,
        selectedFonts,
        selectedStyles,
      });

      setTimeout(() => {
        if (cartPanelRef.current) {
          // Scroll to bottom for both desktop and mobile
          cartPanelRef.current.scrollTo({
            top: cartPanelRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
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
    hasProceedBeenClicked,
    summaryModifiedAfterTab,
    savedRegistrationData,
    currentUser,
    didReturnToStageOne,
    weightOption,
    selectedPackage,
    customizing,
    customPrintLicense,
    customWebLicense,
    customAppLicense,
    customSocialLicense,
    cartFont,

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
    scrollToSummary,
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartProvider;
