import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  AddToCartContainer,
  AddToCartButton,
  hoverButtonVariants
} from '../../Controller/ProductPage_Styles';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-.5 1.5 24 20">
    <path
      d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="-1 1 22 16">
    <path d="M16.73,7.75h-6.53V1.23c0-.68-.55-1.23-1.22-1.23s-1.23.55-1.23,1.23v6.53H1.23c-.68,0-1.23.55-1.23,1.23s.55,1.23,1.23,1.23h6.53v6.53c0,.68.55,1.22,1.23,1.22s1.22-.55,1.22-1.22v-6.53h6.53c.68,0,1.22-.55,1.22-1.23s-.55-1.23-1.22-1.23Z" fill="white" strokeWidth="0"/>
  </svg>
);

const AddToCart = ({ 
  isInCart,
  isFullCartOpen,
  handleAddToCart,
  handleViewCart,
  isNavigatingHome,
  windowWidth,
  buttonPadding
}) => {
  // Add a local state to track the delayed button state
  const [displayState, setDisplayState] = useState(isInCart);
  
  // Update the displayState with a delay when isInCart changes
  useEffect(() => {
    if (isInCart) {
      // When adding to cart, update immediately
      setDisplayState(true);
    } else {
      // When removing from cart, delay the state change
      const timer = setTimeout(() => {
        setDisplayState(false);
      }, 250); // 300ms delay, adjust as needed
      
      return () => clearTimeout(timer);
    }
  }, [isInCart]);
  
  const getButtonText = () => {
    if (windowWidth <= 768) {
      return displayState ? <EyeIcon /> : <PlusIcon />;
    }
    return displayState ? 'View Cart' : 'Add to Cart';
  };

  // Check if we're showing an icon (mobile view)
  const isShowingIcon = windowWidth <= 768;

  // Create variants for the button text transition
  const textVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && windowWidth > 0 && (
        <AddToCartContainer
          data-testid="add-to-cart"
          initial={{ 
            opacity: 0,
            bottom: windowWidth >= 320 && windowWidth <= 440 ? -100 : 44 
          }}
          animate={{ 
            opacity: 1,
            bottom: 44,
            transition: {
              opacity: { duration: 0.3 },
              bottom: { 
                duration: 1,
                ease: [0.6, -0.05, 0.01, 0.99]
              }
            }
          }}
          exit={{ 
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }}
        >
          <AddToCartButton
            className="AddToCartButton"
            onClick={isInCart ? handleViewCart : handleAddToCart}
            variants={hoverButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            disabled={isFullCartOpen}
            style={{ 
              opacity: isFullCartOpen ? 0.6 : 1,
              minWidth: windowWidth <= 600 ? '42px' : 'auto',
              padding: windowWidth <= 768 
                ? displayState 
                  ? '10px 11px 11px 10px'   // Eye icon - larger, needs less padding
                  : '12px 13px 13px 14px' // Plus icon - smaller, needs more padding
                : buttonPadding || '10px 12px 8px 12px'  // Original padding for desktop (text)
            }}
          >
            {/* Wrap the button text in AnimatePresence for smooth transitions */}
            <AnimatePresence mode="wait">
              <span
                key={displayState ? 'view' : 'add'}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  // Add specific styling for icons to shift them up
                  ...(isShowingIcon && {
                    transform: 'translateY(-1px)',
                    height: '100%'
                  })
                }}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={textVariants}
              >
                {getButtonText()}
              </span>
            </AnimatePresence>
          </AddToCartButton>
        </AddToCartContainer>
      )}
    </AnimatePresence>
  );
};

export default AddToCart;