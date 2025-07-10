"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import ResponsiveHeader from "../ResponsiveHeader/ResponsiveHeader";
import TypefaceOverview from "../Typeface_Overview/TabMenu/TypefaceOverview";
import LoginModal from "../Elements/Auth/LoginModal";
import ResetPassword from "../Elements/Auth/ResetPassword";
import EnhancedUserDashboard from "../Elements/Auth/EnhancedUserDashboard";
import CartPanel from "../../cart/Controller/CartPanel";
import ModalOverlay from "./ModalOverlay";
import ResponsiveFooter from "../ResponsiveFooter/ResponsiveFooter";
import { useCartState } from "../hooks/useCartState";
import { useAuthState } from "../hooks/useAuthState";
import { useFormState } from "../hooks/useFormState";
import { useUIState } from "../hooks/useUIState";
import { useFontSelection } from "../../../context/FontSelectionContext";
import ClientOnly from "./ClientOnly";
import { PageContainer } from "./ProductPage_Styles";
import { calculateDefaultFontSize } from "../Typeface_Overview/Sections/Tester/LetterSpacingUtils";

const ProductPage = () => {
  // IMPORTANT: Keep ALL hooks at the top level and in the same order on every render
  const [activeTab, setActiveTab] = useState("specimen");
  const [fontSettings, setFontSettings] = useState({
    fontSize: calculateDefaultFontSize(),
    lineHeight: 1,
    letterSpacing: 0,
    isManuallySet: false,
  });
  const [isMounted, setIsMounted] = useState(false);
  const typefaceOverviewRef = useRef(null);

  // Get selected font from slot machine
  const { selectedFont, loading: fontsLoading } = useFontSelection();

  // Search handler function
  const handleSearch = (query) => {
    if (typefaceOverviewRef.current?.handleSearch) {
      typefaceOverviewRef.current.handleSearch(query);
    }
  };

  // Always keep effects after state declarations
  useEffect(() => {
    setIsMounted(true);

    // Preload font for glyphs tab to prevent FOUT when switching tabs
    if (typeof window !== "undefined" && document.fonts && selectedFont) {
      // Use requestIdleCallback for better performance, fallback to setTimeout
      const preloadFont = async () => {
        try {
          await document.fonts.ready;
          // Check if font is already loaded to avoid re-triggering font load
          const fontFace = `100px ${selectedFont.name}`;
          if (!document.fonts.check(fontFace)) {
            await document.fonts.load(fontFace);
          }
        } catch (error) {
          // Silently handle font preload errors to not affect user experience
        }
      };

      // Use requestIdleCallback for non-critical font preloading
      if (window.requestIdleCallback) {
        window.requestIdleCallback(preloadFont, { timeout: 2000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(preloadFont, 1000);
      }
    }
  }, [selectedFont]);

  // Initialize hooks with conditional loading for better performance
  const cartState = useCartState();
  const authState = useAuthState();
  const formState = useFormState();
  const uiState = useUIState({ activeTab });

  // Handle tab changes
  const handleTabChange = (newTab) => {
    if (newTab === "test") {
      // Reset font settings when entering test tab
      setFontSettings((prev) => ({
        ...prev,
        fontSize: calculateDefaultFontSize(),
        isManuallySet: false,
      }));
    }
    uiState.handlers.handleTabExit(activeTab, newTab, setActiveTab);
  };

  // Early return for client-side only rendering or while fonts are loading
  if (!isMounted || fontsLoading) {
    return null;
  }

  // Show fallback if no font is selected
  if (!selectedFont) {
    return (
      <ClientOnly>
        <PageContainer>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            fontSize: '18px',
            color: '#666'
          }}>
            Please select a font from the Typefaces page
          </div>
        </PageContainer>
      </ClientOnly>
    );
  }

  const {
    state: {
      isFullCartOpen,
      weightOption,
      selectedPackage,
      customizing,
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
      cartItems,
      isInCart,
      isCartDetailsOpen,
      cartSelectedFont,
    },
    setters: cartSetters,
    handlers: cartHandlers,
    refs: { cartDetailsRef, cartCountRef },
  } = cartState;

  const {
      isLoginModalOpen,
      isLoggedIn,
      userEmail,
      userPassword,
      emailError,
      passwordError,
      billingDetails,
      newsletter,
      isEditMode,
    setUserEmail,
    setUserPassword,
    setBillingDetails,
    setNewsletter,
    setIsEditMode,
    setIsLoginModalOpen,
    setIsLoggedIn,
    handleLoginSubmit,
    handleInputFocus,
    handleSaveChanges,
    handleLogout,
    handleUpdateBillingDetailsFromRegistration,
    loginError,
    isLoggingIn,
    currentUser,
    showResendVerification,
    isResendingVerification,
    handleResendVerification,
  } = authState;

  const {
    state: { isResetPassword, showPassword, $isSaving },
    setters: formSetters,
    handlers: formHandlers,
  } = formState;

  const {
    state: { isNavigatingHome, windowWidth, isTestExiting, isGlyphsExiting },
    handlers: uiHandlers,
  } = uiState;

  return (
    <ClientOnly>
      <PageContainer>
        <ResponsiveHeader
          isNavigatingHome={isNavigatingHome}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          cartState={{
            cartItems,
            isCartDetailsOpen,
            cartDetailsRef,
            cartCountRef,
            cartSelectedFont,
            handlers: cartHandlers,
          }}
          authState={{
            isLoggedIn,
            handleLoginClick: () => setIsLoginModalOpen(!isLoginModalOpen),
          }}
          uiHandlers={uiHandlers}
        />

        <TypefaceOverview
          isNavigatingHome={isNavigatingHome}
          onClick={uiHandlers.handleHomeClick}
          activeTab={activeTab}
          fontSettings={fontSettings}
          isTestExiting={isTestExiting}
          isGlyphsExiting={isGlyphsExiting}
          selectedFont={selectedFont}
          ref={typefaceOverviewRef}
        />

        <ResponsiveFooter
          isTestTab={activeTab === "test"}
          activeTab={activeTab}
          fontSettings={fontSettings}
          setFontSettings={setFontSettings}
          showInitialAnimation={true}
          hasInitialAnimationOccurred={false}
          handleTypefaceNavigation={uiHandlers.handleHomeClick}
          homeLink="/"
          typefacesLink="/Typefaces"
          isInCart={isInCart}
          isFullCartOpen={isFullCartOpen}
          handleAddToCart={cartHandlers.handleAddToCart}
          handleViewCart={cartHandlers.handleViewCart}
          isNavigatingHome={isNavigatingHome}
          windowWidth={windowWidth}
          isTestExiting={isTestExiting}
          isGlyphsExiting={isGlyphsExiting}
          onSearch={handleSearch}
        />

        {isLoginModalOpen &&
          !isLoggedIn &&
          (!isResetPassword ? (
            <LoginModal
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              userPassword={userPassword}
              setUserPassword={setUserPassword}
              emailError={emailError}
              passwordError={passwordError}
              loginError={loginError}
              isLoggingIn={isLoggingIn}
              showResendVerification={showResendVerification}
              isResendingVerification={isResendingVerification}
              handleResendVerification={handleResendVerification}
              handleLoginSubmit={handleLoginSubmit}
              handleInputFocus={handleInputFocus}
              handleModalClick={uiHandlers.handleModalClick}
              handleClose={() => setIsLoginModalOpen(false)}
              formSetters={formSetters}
              formState={formState.state}
            />
          ) : (
            <LoginModal
              handleModalClick={uiHandlers.handleModalClick}
              handleClose={() => setIsLoginModalOpen(false)}
              formSetters={formSetters}
              formState={formState.state}
            >
              <ResetPassword
                setIsLoginModalOpen={setIsLoginModalOpen}
                resetEmail={formState.state.resetEmail}
                setResetEmail={formSetters.setResetEmail}
                newPassword={formState.state.newPassword}
                setNewPassword={formSetters.setNewPassword}
                showNewPassword={formState.state.showNewPassword}
                setShowNewPassword={formSetters.setShowNewPassword}
                showSuccessMessage={formState.state.showSuccessMessage}
                resetEmailError={formState.state.resetEmailError}
                newPasswordError={formState.state.newPasswordError}
                handleInputFocus={handleInputFocus}
                handleResetPassword={formHandlers.handleResetPassword}
                handleBackToLogin={() => formSetters.setIsResetPassword(false)}
                handleSubmitNewPassword={formHandlers.handleSubmitNewPassword}
                isResetting={formState.state.isResetting}
              />
            </LoginModal>
          ))}

        <AnimatePresence>
          {isLoggedIn && isLoginModalOpen && (
            <>
              <ModalOverlay
                onClick={() => setIsLoginModalOpen(false)}
                zIndex={60}
              />
              <EnhancedUserDashboard
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                userPassword={userPassword}
                setUserPassword={setUserPassword}
                showPassword={showPassword}
                setShowPassword={formSetters.setShowPassword}
                billingDetails={billingDetails}
                setBillingDetails={setBillingDetails}
                newsletter={newsletter}
                setNewsletter={setNewsletter}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                handleSaveChanges={handleSaveChanges}
                handleLogout={handleLogout}
                handleModalClick={uiHandlers.handleModalClick}
                setIsLoginModalOpen={setIsLoginModalOpen}
                $isSaving={$isSaving}
                userId={currentUser?.id || null}
              />
            </>
          )}
        </AnimatePresence>
      </PageContainer>

      {/* Cart is now portal-rendered outside PageContainer */}
      <AnimatePresence>
        {isFullCartOpen && (
          <>
            <ModalOverlay onClick={cartHandlers.handleCartClose} zIndex={70} />
            <CartPanel
              key="cart-panel"
              isOpen={isFullCartOpen}
              onClose={cartHandlers.handleCartClose}
              setIsLoggedIn={setIsLoggedIn}
              onNavigateHome={uiHandlers.handleHomeClick}
              weightOption={weightOption}
              setWeightOption={cartSetters.setWeightOption}
              selectedPackage={selectedPackage}
              setSelectedPackage={cartSetters.setSelectedPackage}
              customizing={customizing}
              setCustomizing={cartSetters.setCustomizing}
              customPrintLicense={customPrintLicense}
              setCustomPrintLicense={cartSetters.setCustomPrintLicense}
              customWebLicense={customWebLicense}
              setCustomWebLicense={cartSetters.setCustomWebLicense}
              customAppLicense={customAppLicense}
              setCustomAppLicense={cartSetters.setCustomAppLicense}
              customSocialLicense={customSocialLicense}
              setCustomSocialLicense={cartSetters.setCustomSocialLicense}
              onUpdateBillingDetails={handleUpdateBillingDetailsFromRegistration}
            />
          </>
        )}
      </AnimatePresence>
    </ClientOnly>
  );
};

export default ProductPage;
