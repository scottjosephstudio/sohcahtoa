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
  isUserAuthenticated,
  loginUser,
  getCartState,
  saveCartState,
} from "./authUtils";
import {
  LICENSE_TYPES,
  packages,
  licenseOptions,
} from "../Constants/constants";

export const CartContext = createContext();

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  {
    betas: ["payment_element_apple_pay_beta_1"],
  },
);

export const CartProvider = ({ children, onClose, isOpen, setIsLoggedIn }) => {
  const router = useRouter();
  const pathname = usePathname();

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

  // Authentication States
  const [showRegistration, setShowRegistration] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticatedAndPending, setIsAuthenticatedAndPending] =
    useState(false);
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
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    handleAuthenticationCheck();
  }, []);

  useEffect(() => {
    handleResponsiveLayout();
    const resizeHandler = () => {
      handleResponsiveLayout();
      updateBottomPadding(window.matchMedia("(max-width: 768px)").matches);
    };
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (cartPanelRef.current) {
        setIsScrolled(cartPanelRef.current.scrollTop > 50);
      }
    };

    if (cartPanelRef.current) {
      cartPanelRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (cartPanelRef.current) {
        cartPanelRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    // Handle scroll to bottom after state updates are complete
    if (
      !preventAutoScroll &&
      shouldScrollToBottom &&
      bottomPadding > 0 &&
      cartPanelRef.current &&
      window.matchMedia("(max-width: 768px)").matches
    ) {
      const totalHeight = cartPanelRef.current.scrollHeight;
      const viewportHeight = cartPanelRef.current.clientHeight;

      cartPanelRef.current.scrollTo({
        top: Math.max(0, totalHeight - viewportHeight + 24),
        behavior: "smooth",
      });

      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom, bottomPadding, preventAutoScroll]);

  useEffect(() => {
    const handleAuthChange = (event) => {
      const { isAuthenticated } = event.detail;
      setIsAuthenticated(isAuthenticated);

      if (!isAuthenticated) {
        setShowRegistration(false);
        setIsRegistrationComplete(false);
        setShowUsageSelection(false);
        setSelectedUsage(null);
        setEulaAccepted(false);
        setIsAuthenticatedAndPending(false);
      }
    };

    window.addEventListener("authStateChange", handleAuthChange);

    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(isAuth);

    return () => {
      window.removeEventListener("authStateChange", handleAuthChange);
    };
  }, []);

  // Handlers
  const handleCartState = () => {
    if (weightOption || selectedPackage || customizing) {
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
      });
    }
  };

  const handleCartStateLoad = () => {
    if (isOpen) {
      const savedCart = getCartState();
      if (savedCart && isAuthenticated) {
        loadSavedCartState(savedCart);
      }
    }
  };

  const handleAuthenticationCheck = () => {
    const wasAuthenticated = localStorage.getItem("isAuthenticated");
    if (wasAuthenticated === "true") {
      setIsAuthenticated(true);
      if (hasCartSelections()) {
        setSavedRegistrationData({
          firstName: "Scott",
          surname: "Joseph",
          email: "info@scottpauljoseph.com",
          street: "Studio 80, 1 Cardwell Terrace",
          city: "London",
          postcode: "N7 0NH",
          country: "UK",
        });
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
    // Reset scroll position
    if (cartPanelRef.current) {
      cartPanelRef.current.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }

    // Call the parent's close function immediately like UserDashboard
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
    if (
      !showRegistration &&
      !showUsageSelection &&
      !showPaymentForm &&
      (selectedPackage || (customizing && calculateCustomTotal() > 0))
    ) {
      handleInitialProceed();
      return;
    }

    if (
      (showRegistration || showUsageSelection || showPaymentForm) &&
      !isCheckoutDisabled
    ) {
      handleFormProceed();
    }

    scrollToTop();
  };

  const handleInitialProceed = () => {
    if (isAuthenticated) {
      if (isRegistrationComplete || didReturnToStageOne) {
        setShowPaymentForm(true);
        setShowUsageSelection(false);
        setSelectedUsage(null);
      } else {
        setShowUsageSelection(true);
        setIsAuthenticatedAndPending(true);
      }
    } else {
      setShowRegistration(true);
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
      showRegistration: !isAuthenticated,
      showUsageSelection: isAuthenticated && !isRegistrationComplete,
      showPaymentForm: isAuthenticated && isRegistrationComplete,
      isRegistrationComplete,
      selectedUsage,
      eulaAccepted,
      isAuthenticatedAndPending: isAuthenticated && !isRegistrationComplete,
    });
  };

  const handleFormProceed = () => {
    if (showRegistration && isRegistrationFormValid()) {
      setShowRegistration(false);
      setShowUsageSelection(true);
      setIsAuthenticatedAndPending(true);
    } else if (showUsageSelection && selectedUsage && eulaAccepted) {
      setShowPaymentForm(true);
      setShowUsageSelection(false);
      setIsRegistrationComplete(true);
    } else if (showPaymentForm && selectedPaymentMethod) {
      handlePayment();
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
      weightOption && (selectedPackage || (customizing && hasLicenseSelected()))
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
        : !showRegistration || isRegistrationComplete)
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
    router.push(path);
  };

  // Modify your handleContinue function
  const handleContinue = () => {
    if (!isContinueClicked) {
      setIsContinueClicked(true);
      setIsLicenceOpen(true);
      if (!isLicenceOpen) {
        scrollToTop();
      }
    } else {
      setTimeout(() => {
        onClose(); // This should set isFullCartOpen to false in ProductPage
        setTimeout(() => {
          // Wait for overlay animation to complete before navigating
          if (router.pathname === "/Typeface") {
            handleNavigateHome(null, "/Typefaces");
          }
        }, 300); // Additional delay for overlay animation
      }, 300);
    }

    if (isContinueClicked && isLicenceOpen) {
      setHasProceedBeenClicked(false);
      localStorage.removeItem("hasProceedBeenClicked");
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

    // Preserve authentication state when clearing cart
    const currentAuthState = localStorage.getItem("isAuthenticated");
    const userEmail = localStorage.getItem("userEmail");

    // Clear cart state
    localStorage.removeItem("cartState");

    // Restore authentication state
    if (currentAuthState === "true" && userEmail) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", userEmail);
    }

    // Update bottom padding since all items are removed
    updateBottomPadding(window.matchMedia("(max-width: 768px)").matches);

    // Scroll to top
    scrollToTop();
  };

  const resetRegistrationState = () => {
    // Reset authentication and registration-related states
    setShowRegistration(false);
    setIsRegistrationComplete(false);
    setShowLoginForm(false);
    setIsResettingPassword(false);
    setResetStep("email");
    setIsAuthenticated(false);
    setIsAuthenticatedAndPending(false);
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
    setResetData({
      email: "",
      newPassword: "",
    });

    // Remove authentication-related local storage items
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("billingDetails");
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

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !clientSecret) {
      console.error("Payment method or client secret not available");
      return;
    }

    setIsProcessing(true);

    try {
      const stripe = await stripePromise;

      // Get the Elements instance from the Stripe context
      const { error: paymentError, paymentIntent } =
        await stripe.confirmPayment({
          elements: stripe.elements(), // This is the correct way to pass elements
          confirmParams: {
            payment_method_data: {
              billing_details: {
                name:
                  savedRegistrationData?.firstName +
                  " " +
                  savedRegistrationData?.surname,
                email: savedRegistrationData?.email,
                address: {
                  line1: savedRegistrationData?.street,
                  city: savedRegistrationData?.city,
                  postal_code: savedRegistrationData?.postcode,
                  country: savedRegistrationData?.country,
                },
              },
            },
            return_url: `${window.location.origin}/payment-confirmation`,
          },
        });

      if (paymentError) {
        console.error("Payment error:", paymentError);
        setError(paymentError);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        handlePaymentComplete(paymentIntent);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err);
      setIsProcessing(false);
    }
  };

  const handlePaymentComplete = (paymentIntent) => {
    // Save the purchase details
    const purchase = {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      date: new Date().toLocaleDateString(),
      fontName: "Soh-Cah-Toa",
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

    // Clean up storage
    localStorage.removeItem("cartState");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("billingDetails");
    localStorage.removeItem("hasProceedBeenClicked");

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

  const handleRegister = () => {
    if (isRegistrationFormValid()) {
      loginUser({
        email: registrationData.email,
        password: registrationData.password,
        firstName: registrationData.firstName,
        lastName: registrationData.surname,
      });

      setIsAuthenticated(true);

      if (setIsLoggedIn) {
        setIsLoggedIn(true);
      }

      setShowRegistration(false);

      // Enable auto-scroll prevention during transition
      setPreventAutoScroll(true);
      setShouldScrollToBottom(false);

      setShowUsageSelection(true);

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

      localStorage.setItem("isAuthenticated", "true");

      setIsAuthenticatedAndPending(true);
      setSelectedUsage("personal");
      setEulaAccepted(true);
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

  const handleLogin = () => {
    const TEST_EMAIL = "info@scottpauljoseph.com";
    const TEST_PASSWORD = "Hybrid1983";

    if (
      loginData.email !== TEST_EMAIL ||
      loginData.password !== TEST_PASSWORD
    ) {
      if (loginData.email !== TEST_EMAIL) {
        setEmailError(true);
        setLoginData((prev) => ({ ...prev, email: "" }));
      }
      if (loginData.password !== TEST_PASSWORD) {
        setPasswordError(true);
        setLoginData((prev) => ({ ...prev, password: "" }));
      }
      return;
    }

    loginUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    setSavedRegistrationData({
      firstName: "Scott",
      surname: "Joseph",
      email: TEST_EMAIL,
      street: "Studio 80, 1 Cardwell Terrace",
      city: "London",
      postcode: "N7 0NH",
      country: "UK",
    });

    setIsAuthenticated(true);
    setIsAuthenticatedAndPending(true);
    setShowLoginForm(false);
    setShowRegistration(false);

    // Enable auto-scroll prevention during transition
    setPreventAutoScroll(true);
    setShouldScrollToBottom(false);

    setShowUsageSelection(true);

    // Manual scroll to top after all other effects are done
    setTimeout(() => {
      scrollToTop();
      // Re-enable auto-scroll after transition
      setPreventAutoScroll(false);
    }, 500);
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
    localStorage.removeItem("isCartAuthenticated");

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

  const handleUsageTypeChange = (value) => {
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
  };

  const loadSavedCartState = (savedCart) => {
    setWeightOption(savedCart.weightOption || "");
    setSelectedPackage(savedCart.selectedPackage || null);
    setCustomizing(savedCart.customizing || false);
    setCustomPrintLicense(savedCart.customPrintLicense || null);
    setCustomWebLicense(savedCart.customWebLicense || null);
    setCustomAppLicense(savedCart.customAppLicense || null);
    setCustomSocialLicense(savedCart.customSocialLicense || null);

    if (!showRegistration && !showUsageSelection) {
      setShowRegistration(false);
      setShowUsageSelection(false);
      setShowPaymentForm(false);
      setIsAuthenticatedAndPending(false);
      setSelectedUsage(null);
      setEulaAccepted(false);

      if (!didReturnToStageOne) {
        setIsRegistrationComplete(false);
      }
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

    if (isAuthenticated && (showUsageSelection || isRegistrationComplete)) {
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

    if (isAuthenticated && (showUsageSelection || isRegistrationComplete)) {
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

      if (isAuthenticated && (showUsageSelection || isRegistrationComplete)) {
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

  const handleEulaChange = (checked) => {
    setEulaAccepted(checked);

    if (!checked && isRegistrationComplete) {
      setIsRegistrationComplete(false);
    }

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
      setIsRegistrationComplete(true);
      setIsAuthenticatedAndPending(false);
      setViewPreference(selectedUsage);

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
    isAuthenticated,
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
    hasProceedBeenClicked,
    summaryModifiedAfterTab,
    savedRegistrationData,
    didReturnToStageOne,
    weightOption,
    selectedPackage,
    customizing,
    customPrintLicense,
    customWebLicense,
    customAppLicense,
    customSocialLicense,

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
    setIsAuthenticated,
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
    handlePayment,
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
