"use client";

import React, { useMemo, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import TransitionWrapper from "../../components/providers/TransitionWrapper";
import { usePortal } from "../../context/PortalContext";

import { useNavigation } from "../../context/NavigationContext";
import { useFontSelection } from "../../context/FontSelectionContext";

// Hooks
import { useAuthState } from "../../components/product-section/hooks/useAuthState";
import { useFormState } from "../../components/product-section/hooks/useFormState";
import { useUIState } from "../../components/product-section/hooks/useUIState";

// Authentication Components
import LoginButton from "../../components/product-section/Elements/Auth/LoginButton";
import AuthenticationWrapper from "../../components/product-section/Controller/AuthenticationWrapper";

// Dynamic Imports
const Banner = dynamic(() => import("../../components/typefaces/Banner"), {
  loading: () => <div></div>,
});

const Spinner = dynamic(() => import("../../components/typefaces/Spinner"), {
  loading: () => <div></div>,
});

const SlotMachine = dynamic(
  () => import("../../components/typefaces/SlotMachine"),
  { loading: () => <div></div> },
);

// Import font info styled components
import {
  FontInfoDisplayMotion,
  FontName,
  ScrollInstruction,
  ClickInstruction,
} from "../../components/typefaces/styles/FlashStartSlotMachine";

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
  const searchParams = useSearchParams();
  const authStateFlat = useAuthState();
  const formState = useFormState();
  const uiState = useUIState();
  const { setIsModalOpen } = usePortal();
  const { $isNavigating } = useNavigation();
  const { selectedFont, availableFonts, currentFontIndex } = useFontSelection();

  // Handle completed payment redirect
  useEffect(() => {
    const completedPayment = searchParams.get('completed_payment');
    const securityToken = searchParams.get('security_token');
    
    // Only run this logic if we have payment completion parameters
    if (completedPayment === 'true' && securityToken) {
      // Check if user is actually logged out (they should be after payment)
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!isAuthenticated || !authStateFlat.isLoggedIn) {
        // User is logged out as expected - show login modal
        authStateFlat.setIsLoginModalOpen(true);
      } else {
        // User is still logged in - force logout first, then show login modal
        if (authStateFlat.handleLogout) {
          authStateFlat.handleLogout();
        }
        
        // Show login modal after a brief delay to allow logout to complete
        setTimeout(() => {
          authStateFlat.setIsLoginModalOpen(true);
        }, 500);
      }
      
      // Clean up URL parameters
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('completed_payment');
      newUrl.searchParams.delete('security_token');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, authStateFlat.setIsLoginModalOpen, authStateFlat.isLoggedIn, authStateFlat.handleLogout]);

  // Structure authState for AuthenticationWrapper
  const authState = {
    state: {
      isLoginModalOpen: authStateFlat.isLoginModalOpen,
      isDashboardOpen: authStateFlat.isDashboardOpen,
      isLoggedIn: authStateFlat.isLoggedIn,
      userEmail: authStateFlat.userEmail,
      userPassword: authStateFlat.userPassword,
      emailError: authStateFlat.emailError,
      passwordError: authStateFlat.passwordError,
      billingDetails: authStateFlat.billingDetails,
      newsletter: authStateFlat.newsletter,
      isEditMode: authStateFlat.isEditMode,
      currentUser: authStateFlat.currentUser,
    },
    setters: {
      setIsLoginModalOpen: authStateFlat.setIsLoginModalOpen,
      setIsDashboardOpen: authStateFlat.setIsDashboardOpen,
      setUserEmail: authStateFlat.setUserEmail,
      setUserPassword: authStateFlat.setUserPassword,
      setBillingDetails: authStateFlat.setBillingDetails,
      setNewsletter: authStateFlat.setNewsletter,
      setIsEditMode: authStateFlat.setIsEditMode,
    },
    handlers: {
      handleLoginSubmit: authStateFlat.handleLoginSubmit,
      handleInputFocus: authStateFlat.handleInputFocus,
      handleSaveChanges: authStateFlat.handleSaveChanges,
      handleLogout: authStateFlat.handleLogout,
    },
  };

  // Sync login modal state with portal context only
  useEffect(() => {
    setIsModalOpen(authStateFlat.isLoginModalOpen);
  }, [authStateFlat.isLoginModalOpen, setIsModalOpen]);

  const MemoizedLoginButton = useMemo(
    () => (
      <LoginButton
        isLoggedIn={authStateFlat.isLoggedIn}
        handleLoginClick={authStateFlat.handleLoginClick}
        isNavigatingHome={false}
      />
    ),
    [authStateFlat.isLoggedIn, authStateFlat.handleLoginClick],
  );

  // Font info data
  const fontInfo = selectedFont ? {
    name: selectedFont.name,
    designer: selectedFont.designer,
    foundry: selectedFont.foundry,
    description: selectedFont.description,
    styles: selectedFont.font_styles || []
  } : null;

  const hasMultipleFonts = availableFonts.length > 1;
  const totalFonts = availableFonts.length;

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
              ease: [0.25, 0.1, 0.25, 1],
            },
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

        {/* Font info - completely separate from SlotMachine animations */}
        {fontInfo && totalFonts > 0 && (
          <FontInfoDisplayMotion
            initial={{ opacity: 1 }}
            animate={{
              opacity: $isNavigating ? 0 : 1,
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              },
            }}
            transition={{
              duration: $isNavigating ? 0.3 : 0.15,
              ease: "easeInOut",
            }}
          >
            <FontName>
              Font Name: {fontInfo.name}
            </FontName>
            <ScrollInstruction>
              Scroll: Change letter
            </ScrollInstruction>
            <ClickInstruction>
              {hasMultipleFonts ? (
                `Click: Change typeface`
              ) : (
                `Click: More typefaces soon`
              )}
            </ClickInstruction>
          </FontInfoDisplayMotion>
        )}
      </div>
    </TransitionWrapper>
  );
}
