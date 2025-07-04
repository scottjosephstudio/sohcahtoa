'use client';

import React, { useMemo, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TransitionWrapper from '../../components/providers/TransitionWrapper';
import { usePortal } from '../../context/PortalContext';
import { useMenuOverlay } from '../../components/menu-overlay/MenuOverlayContext';

// Hooks
import { useAuthState } from '../../components/product-section/hooks/useAuthState';
import { useFormState } from '../../components/product-section/hooks/useFormState';
import { useUIState } from '../../components/product-section/hooks/useUIState';

// Authentication Components
import LoginButton from '../../components/product-section/Elements/Auth/LoginButton';
import AuthenticationWrapper from '../../components/product-section/Controller/AuthenticationWrapper';

// Dynamic Imports
const Banner = dynamic(() => 
  import('../../components/typefaces/Banner'), 
  { loading: () => <div></div> }
);

const Spinner = dynamic(() => 
  import('../../components/typefaces/Spinner'), 
  { loading: () => <div></div> }
);

const SlotMachine = dynamic(() => 
  import('../../components/typefaces/SlotMachine'), 
  { loading: () => <div></div> }
);

// Styled Components
const HeaderContainer = styled(motion.header)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90px;
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
`;

export default function TypefacesContent() {
  const authState = useAuthState();
  const formState = useFormState();
  const uiState = useUIState();
  const { setIsModalOpen } = usePortal();
  const { setIsLoginModalOpen } = useMenuOverlay();

  // Sync login modal state with portal context and menu overlay context
  useEffect(() => {
    setIsModalOpen(authState.state.isLoginModalOpen);
    setIsLoginModalOpen(authState.state.isLoginModalOpen);
  }, [authState.state.isLoginModalOpen, setIsModalOpen, setIsLoginModalOpen]);

  const MemoizedLoginButton = useMemo(() => (
    <LoginButton
      isLoggedIn={authState.state.isLoggedIn}
      handleLoginClick={authState.handlers.handleLoginClick}
      isNavigatingHome={false}
    />
  ), [authState.state.isLoggedIn, authState.handlers.handleLoginClick]);

  return (
    <TransitionWrapper>
      <div className="typefaces-container">
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
          {MemoizedLoginButton}
        </HeaderContainer>

        <Suspense fallback={<div></div>}>
          <Banner bannerText="// UNDER CONSTRUCTION //" />
          <Spinner />
          <SlotMachine />
          <AuthenticationWrapper 
            authState={authState}
            formState={formState}
            uiState={uiState}
          />
        </Suspense>
      </div>
    </TransitionWrapper>
  );
}