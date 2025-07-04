import { useState, useEffect, useRef } from "react";
import { getCartState } from "../../cart/Utils/authUtils";

export const useCartState = () => {
  // Add refs for cart details
  const cartDetailsRef = useRef(null);
  const cartCountRef = useRef(null);

  // Cart visibility states
  const [cartItems, setCartItems] = useState(0);
  const [isCartDetailsOpen, setIsCartDetailsOpen] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isFullCartOpen, setIsFullCartOpen] = useState(false);
  const [$isCartOpen, set$isCartOpen] = useState(false);

  // Cart customization states
  const [weightOption, setWeightOption] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customizing, setCustomizing] = useState(false);
  const [customPrintLicense, setCustomPrintLicense] = useState(null);
  const [customWebLicense, setCustomWebLicense] = useState(null);
  const [customAppLicense, setCustomAppLicense] = useState(null);
  const [customSocialLicense, setCustomSocialLicense] = useState(null);

  // Add useEffect for outside click handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cartDetailsRef.current &&
        !cartDetailsRef.current.contains(event.target) &&
        cartCountRef.current &&
        !cartCountRef.current.contains(event.target)
      ) {
        setIsCartDetailsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedCart = getCartState();
    if (savedCart) {
      setCartItems(1);
      setIsInCart(true);
      setWeightOption(savedCart.weightOption || "");
      setSelectedPackage(savedCart.selectedPackage || null);
      setCustomizing(savedCart.customizing || false);
      setCustomPrintLicense(savedCart.customPrintLicense || null);
      setCustomWebLicense(savedCart.customWebLicense || null);
      setCustomAppLicense(savedCart.customAppLicense || null);
      setCustomSocialLicense(savedCart.customSocialLicense || null);
    }
  }, []);

  const handleAddToCart = () => {
    setCartItems((prev) => prev + 1);
    setIsInCart(true);
  };

  const handleCartClose = () => {
    // Force immediate state reset to prevent animation lock
    setIsFullCartOpen(false);
    set$isCartOpen(false);

    // Force a re-render to ensure state is properly updated
    setTimeout(() => {
      setIsFullCartOpen(false);
      set$isCartOpen(false);
    }, 0);
  };

  const handleViewCart = () => {
    setIsFullCartOpen(true);
    set$isCartOpen(true);
  };

  const handleRemoveFromCart = () => {
    setCartItems(0);
    setIsInCart(false);
    setIsCartDetailsOpen(false);
    setIsFullCartOpen(false);
    setWeightOption("");
    setSelectedPackage(null);
    setCustomizing(false);
    setCustomPrintLicense(null);
    setCustomWebLicense(null);
    setCustomAppLicense(null);
    setCustomSocialLicense(null);
    localStorage.removeItem("cartState");
  };

  const handleGoToCart = () => {
    setIsFullCartOpen(true);
    setIsCartDetailsOpen(false);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    setIsFullCartOpen(true);
  };

  const handleCartHover = () => {
    if (cartItems > 0) {
      setIsCartDetailsOpen(true);
    }
  };

  return {
    state: {
      cartItems,
      isCartDetailsOpen,
      isInCart,
      isFullCartOpen,
      $isCartOpen,
      weightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
    },
    setters: {
      setCartItems,
      setIsCartDetailsOpen,
      setIsInCart,
      setIsFullCartOpen,
      set$isCartOpen,
      setWeightOption,
      setSelectedPackage,
      setCustomizing,
      setCustomPrintLicense,
      setCustomWebLicense,
      setCustomAppLicense,
      setCustomSocialLicense,
    },
    handlers: {
      handleAddToCart,
      handleCartClose,
      handleViewCart,
      handleRemoveFromCart,
      handleGoToCart,
      handleCartClick,
      handleCartHover,
    },
    refs: {
      cartDetailsRef,
      cartCountRef,
    },
  };
};
