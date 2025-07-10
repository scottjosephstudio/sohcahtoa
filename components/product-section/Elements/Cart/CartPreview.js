import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CartContainer,
  CartCountContainer,
  CartCount,
  CartDetails,
  CartContent,
  TextColumn,
  ProductName,
  MobileRemoveButton,
  RemoveButton,
  GoToCartButton,
  hoverButtonVariants,
  mobileRemoveButtonVariants,
  removeButtonVariants,
  cartCountHoverVariants,
} from "../../Controller/ProductPage_Styles";

const cartCountVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 0.2,
      bounce: 0.15,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const cartDetailsVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    scale: 1,
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const CartPreview = ({
  cartItems,
  isCartDetailsOpen,
  handleCartHover,
  handleCartClick,
  handleRemoveFromCart,
  handleGoToCart,
  isNavigatingHome,
  cartDetailsRef,
  cartCountRef,
  cartSelectedFont,
}) => {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleMobileRemove = async (e) => {
    e.stopPropagation();

    const cartCountElement = cartCountRef.current;

    // Set removing state to trigger exit animations
    setIsRemoving(true);

    if (cartCountElement) {
      cartCountElement.style.pointerEvents = "none";
      cartCountElement.style.transform = "scale(1.1)";
      await new Promise((resolve) => setTimeout(resolve, 50));
      cartCountElement.style.transform = "scale(0)";
    }

    // Wait for animations to complete before removing
    await new Promise((resolve) => setTimeout(resolve, 50));
    handleRemoveFromCart(e);

    // Reset removing state
    setIsRemoving(false);
  };

  // Get the font name to display
  const getFontName = () => {
    if (cartSelectedFont?.name) {
      return cartSelectedFont.name;
    }
    return "Font"; // Fallback if no font selected
  };

  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && (
        <CartContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <CartCountContainer onMouseEnter={handleCartHover}>
            <AnimatePresence>
              {cartItems > 0 && !isRemoving && (
                <>
                  <CartCount
                    ref={cartCountRef}
                    href="#"
                    onClick={handleCartClick}
                    variants={{
                      ...cartCountVariants,
                      ...cartCountHoverVariants,
                    }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover="hover"
                    className="no-hover"
                    style={{
                      transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <span>{cartItems}</span>
                  </CartCount>
                  <MobileRemoveButton
                    onClick={handleMobileRemove}
                    variants={{
                      ...cartCountVariants,
                      ...mobileRemoveButtonVariants,
                    }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 17.96 17.95"
                    >
                      <path
                        d="M8.44,6.71l4.62-4.62c.23-.23.36-.54.36-.87s-.13-.64-.36-.87c-.48-.48-1.26-.48-1.73,0l-4.62,4.62L2.09.36C1.61-.12.84-.12.36.36c-.23.23-.36.54-.36.87s.13.63.36.87l4.62,4.62L.36,11.32c-.23.23-.36.54-.36.87s.13.63.36.87c.46.46,1.27.46,1.73,0l4.62-4.62,4.62,4.62c.23.23.54.36.87.36s.64-.13.87-.36c.23-.23.36-.54.36-.87s-.13-.64-.36-.87l-4.62-4.62Z"
                        fill="black"
                        strokeWidth="0"
                      />
                    </svg>
                  </MobileRemoveButton>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isCartDetailsOpen && cartItems > 0 && !isRemoving && (
                <CartDetails
                  key={cartSelectedFont?.name || 'no-font'}
                  ref={cartDetailsRef}
                  variants={cartDetailsVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CartContent>
                    <TextColumn>
                      <ProductName>{getFontName()}</ProductName>
                      <motion.div
                        variants={cartCountVariants}
                        initial="visible"
                        animate="visible"
                        exit="exit"
                      >
                        <RemoveButton
                          onClick={handleMobileRemove}
                          variants={removeButtonVariants}
                          initial="initial"
                          whileHover="hover"
                        >
                          <span>Remove</span>
                        </RemoveButton>
                      </motion.div>
                    </TextColumn>
                    <GoToCartButton
                      onClick={handleGoToCart}
                      variants={hoverButtonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      View Cart
                    </GoToCartButton>
                  </CartContent>
                </CartDetails>
              )}
            </AnimatePresence>
          </CartCountContainer>
        </CartContainer>
      )}
    </AnimatePresence>
  );
};

export default CartPreview;
