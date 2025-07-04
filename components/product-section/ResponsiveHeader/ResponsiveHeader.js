import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import TypefaceHeaderTabs from '../Typeface_Overview/TabMenu/TypefaceTabs';
import CartPreview from '../Elements/Cart/CartPreview';
import LoginButton from '../Elements/Auth/LoginButton';

const HeaderContainer = styled(motion.header)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 0px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 28px 30px;
  z-index: 45;
  pointer-events: none;
  transition: filter 0.3s ease;

  > * {
    pointer-events: auto;
  }

  &.cart-open {
    > *:not(.cart-preview) {
      filter: blur(4px);
      pointer-events: none;
    }
  }

  @media (max-width: 600px) {
    height: 150px;
    padding-top: 28px;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
`;

const CenterSection = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;

  @media (max-width: 600px) {
    position: fixed;
    top: 28px;
    right: ${props => props.$hasCartCount ? '68px' : '20px'};
    left: auto;
    transform: none;
    transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const ResponsiveHeader = ({
  isNavigatingHome,
  activeTab,
  onTabChange,
  cartState,
  authState,
  uiHandlers
}) => {
  const {
    cartItems,
    isCartDetailsOpen,
    cartDetailsRef,
    cartCountRef,
    handlers: cartHandlers,
  } = cartState;

  const {
    isLoggedIn,
    handlers: authHandlers
  } = authState;

  return (
    <HeaderContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: {
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1]
        }
      }}
    >
      <LoginButton 
        isLoggedIn={isLoggedIn}
        handleLoginClick={authHandlers.handleLoginClick}
        isNavigatingHome={isNavigatingHome}
      />

<CenterSection $hasCartCount={cartItems > 0}>
  <TypefaceHeaderTabs
    activeTab={activeTab}
    onTabChange={onTabChange}
    isNavigatingHome={isNavigatingHome}
  />
</CenterSection>

      <CartPreview
        className="cart-preview"
        cartItems={cartItems}
        isCartDetailsOpen={isCartDetailsOpen}
        handleCartHover={cartHandlers.handleCartHover}
        handleCartClick={cartHandlers.handleCartClick}
        handleRemoveFromCart={cartHandlers.handleRemoveFromCart}
        handleGoToCart={cartHandlers.handleGoToCart}
        isNavigatingHome={isNavigatingHome}
        cartDetailsRef={cartDetailsRef}
        cartCountRef={cartCountRef}
      />
    </HeaderContainer>
  );
};

export default ResponsiveHeader;