import { useState, useEffect, useRef } from "react";
import secureCartStorage from "../../cart/Utils/secureCartStorage";
import { useFontSelection } from "../../../context/FontSelectionContext";

export const useCartState = () => {
  // Get selected font from context
  const { selectedFont } = useFontSelection();
  
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

  // Font selection state
  const [cartSelectedFont, setCartSelectedFont] = useState(null);
  
  // Multi-font selection state
  const [selectedFonts, setSelectedFonts] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState({});

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
    (async () => {
      const savedCart = await secureCartStorage.getCartState();
      if (savedCart) {
        let totalFonts = 0;
        if (savedCart.selectedFontIds && savedCart.selectedFontIds.length > 0) {
          totalFonts = savedCart.selectedFontIds.length;
        } else if (savedCart.selectedFont) {
          totalFonts = 1;
        }
        setCartItems(totalFonts);
        setIsInCart(totalFonts > 0);
        setWeightOption(savedCart.weightOption || "");
        setSelectedPackage(savedCart.selectedPackage || null);
        setCustomizing(savedCart.customizing || false);
        setCustomPrintLicense(savedCart.customPrintLicense || null);
        setCustomWebLicense(savedCart.customWebLicense || null);
        setCustomAppLicense(savedCart.customAppLicense || null);
        setCustomSocialLicense(savedCart.customSocialLicense || null);
        setCartSelectedFont(savedCart.selectedFont || null);
        setSelectedFonts(savedCart.selectedFonts || []);
        setSelectedStyles(savedCart.selectedStyles || {});
      }
    })();
  }, []);

  // Listen for cart state changes (not just localStorage changes)
  useEffect(() => {
    const handleCartUpdate = async () => {
      console.log('🔄 useCartState: Cart state changed, updating cart count...');
      const savedCart = await secureCartStorage.getCartState();
      if (savedCart) {
        let totalFonts = 0;
        if (savedCart.selectedFontIds && savedCart.selectedFontIds.length > 0) {
          totalFonts = savedCart.selectedFontIds.length;
        } else if (savedCart.selectedFont) {
          totalFonts = 1;
        }
        console.log('🔄 useCartState: Cart count calculation:', {
          selectedFontIds: savedCart.selectedFontIds,
          selectedFont: savedCart.selectedFont,
          totalFonts,
          cartItems: totalFonts
        });
        setCartItems(totalFonts);
        setIsInCart(totalFonts > 0);
        setWeightOption(savedCart.weightOption || "");
        setSelectedPackage(savedCart.selectedPackage || null);
        setCustomizing(savedCart.customizing || false);
        setCustomPrintLicense(savedCart.customPrintLicense || null);
        setCustomWebLicense(savedCart.customWebLicense || null);
        setCustomAppLicense(savedCart.customAppLicense || null);
        setCustomSocialLicense(savedCart.customSocialLicense || null);
        setCartSelectedFont(savedCart.selectedFont || null);
        setSelectedFonts(savedCart.selectedFonts || []);
        setSelectedStyles(savedCart.selectedStyles || {});
      }
    };

    const handleCartCleared = () => {
      console.log('🔄 useCartState: Cart cleared, setting count to 0');
      setCartItems(0);
      setIsInCart(false);
      setWeightOption("");
      setSelectedPackage(null);
      setCustomizing(false);
      setCustomPrintLicense(null);
      setCustomWebLicense(null);
      setCustomAppLicense(null);
      setCustomSocialLicense(null);
      setCartSelectedFont(null);
      setSelectedFonts([]);
      setSelectedStyles({});
    };

    // Listen for custom cart update events
    window.addEventListener('cartStateChanged', handleCartUpdate);
    window.addEventListener('cartCleared', handleCartCleared);
    
    return () => {
      window.removeEventListener('cartStateChanged', handleCartUpdate);
      window.removeEventListener('cartCleared', handleCartCleared);
    };
  }, []);

  // Sync cart selected font with current font selection if no cart state exists
  useEffect(() => {
    if (selectedFont && !cartSelectedFont && cartItems === 0) {
      setCartSelectedFont(selectedFont);
    }
  }, [selectedFont, cartSelectedFont, cartItems]);

  const handleAddToCart = async () => {
    setCartItems((prev) => prev + 1);
    setIsInCart(true);
    setCartSelectedFont(selectedFont);
    
    // Save cart state using the proper saveCartState function
    const cartState = {
      weightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
      selectedFont: selectedFont, // Save the selected font
      selectedFonts,
      selectedStyles
    };
    console.log('[useCartState] handleAddToCart saving cartState:', JSON.stringify(cartState, null, 2));
    await secureCartStorage.saveCartState(cartState);
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
    setCartSelectedFont(null);
    setSelectedFonts([]);
    setSelectedStyles({});
    localStorage.removeItem("cartState");
    
    // Notify other components that cart was cleared
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartCleared'));
    }
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
      cartSelectedFont,
      selectedFonts,
      selectedStyles,
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
      setCartSelectedFont,
      setSelectedFonts,
      setSelectedStyles,
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
