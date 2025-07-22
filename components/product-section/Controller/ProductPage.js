"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
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
import { useNavigation } from "../../../context/NavigationContext";

const ProductPage = ({ currentUser: prefetchedUser, databaseDataLoaded: prefetchedDatabaseDataLoaded }) => {
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
  const searchParams = useSearchParams();

  // Get selected font from slot machine
  const { selectedFont, loading: fontsLoading } = useFontSelection();
  
  // Get navigation context for password reset mode
  const { isPasswordResetMode } = useNavigation();

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
  const authState = useAuthState(prefetchedUser, prefetchedDatabaseDataLoaded);
  const formState = useFormState();
  const uiState = useUIState({ activeTab });

  // Memoize userId to prevent unnecessary dashboard re-renders
  const memoizedUserId = useMemo(() => {
    const authCurrentUser = authState.currentUser;
    return authCurrentUser?.id || authCurrentUser?.dbData?.auth_user_id || null;
  }, [authState.currentUser?.id, authState.currentUser?.dbData?.auth_user_id]);

  // Handle openCart URL parameter
  useEffect(() => {
    if (searchParams.get('openCart') === 'true' && cartState.setIsFullCartOpen) {
      console.log('🔗 Opening cart from URL parameter');
      cartState.setIsFullCartOpen(true);
      
      // Clear the URL parameter after opening the cart
      if (typeof window !== 'undefined') {
        const url = new URL(window.location);
        url.searchParams.delete('openCart');
        window.history.replaceState({}, '', url);
      }
    }
  }, [searchParams, cartState.setIsFullCartOpen]);

  // Refresh billing details when cart is opened
  useEffect(() => {
    if (cartState.state.isFullCartOpen && authState.isLoggedIn && authState.currentUser?.email_confirmed_at) {
      console.log('🔄 Cart opened, refreshing billing details');
      authState.refreshBillingDetails();
    }
  }, [cartState.state.isFullCartOpen, authState.isLoggedIn, authState.currentUser?.email_confirmed_at, authState.refreshBillingDetails]);

  // Refresh billing details when dashboard is opened
  useEffect(() => {
    if (authState.isDashboardOpen && authState.isLoggedIn && authState.currentUser?.email_confirmed_at) {
      console.log('🔄 Dashboard opened, refreshing billing details');
      authState.refreshBillingDetails();
    }
  }, [authState.isDashboardOpen, authState.isLoggedIn, authState.currentUser?.email_confirmed_at, authState.refreshBillingDetails]);

  // Listen for auth state changes to refresh billing details
  useEffect(() => {
    const handleAuthStateChange = (event) => {
      if (event.detail?.verified && event.detail?.user?.email_confirmed_at) {
        console.log('🔄 Auth state change - user verified, refreshing billing details');
        authState.refreshBillingDetails();
      }
    };

    window.addEventListener('authStateChange', handleAuthStateChange);
    return () => window.removeEventListener('authStateChange', handleAuthStateChange);
  }, [authState.refreshBillingDetails]);

  // Listen for billing details refresh requests
  useEffect(() => {
    const handleRefreshBillingDetails = () => {
      if (authState.isLoggedIn && authState.currentUser?.email_confirmed_at) {
        console.log('🔄 Refresh billing details event received');
        authState.refreshBillingDetails();
      }
    };

    window.addEventListener('refreshBillingDetails', handleRefreshBillingDetails);
    return () => window.removeEventListener('refreshBillingDetails', handleRefreshBillingDetails);
  }, [authState.refreshBillingDetails, authState.isLoggedIn, authState.currentUser?.email_confirmed_at]);

  // Specific handler for verification success
  useEffect(() => {
    const handleVerificationSuccess = (event) => {
      if (event.detail?.verified && event.detail?.user?.email_confirmed_at) {
        console.log('🎉 Verification success detected, loading billing details');
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          authState.refreshBillingDetails();
        }, 500);
      }
    };

    window.addEventListener('authStateChange', handleVerificationSuccess);
    return () => window.removeEventListener('authStateChange', handleVerificationSuccess);
  }, [authState.refreshBillingDetails]);

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
      isDashboardOpen,
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
    setIsDashboardOpen,
    setIsLoggedIn,
    handleLoginSubmit,
    handleInputFocus,
    handleSaveChanges,
    handleLogout,
    handleLoginClick,
    handleUpdateBillingDetailsFromRegistration,
    refreshBillingDetails,
    loginError,
    isLoggingIn,
    showResendVerification,
    isResendingVerification,
    handleResendVerification,
    databaseDataLoaded,
  } = authState;

  // Get currentUser from authState to avoid naming conflict with props
  const { currentUser: authCurrentUser } = authState;

  const {
    state: { isResetPassword, showPassword, $isSaving },
    setters: formSetters,
    handlers: formHandlers,
  } = formState;

  const {
    state: { isNavigatingHome, windowWidth, isTestExiting, isGlyphsExiting, isSpecimenExiting },
    handlers: uiHandlers,
  } = uiState;

  // Prevent dashboard access during password reset mode
  const canAccessDashboard = isLoggedIn && isDashboardOpen && authCurrentUser?.email_confirmed_at && !isPasswordResetMode;

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
            handleLoginClick: handleLoginClick,
            currentUser: authCurrentUser,
            databaseDataLoaded,
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
          isSpecimenExiting={isSpecimenExiting}
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
          {canAccessDashboard && (
            <>
              <ModalOverlay
                onClick={() => setIsDashboardOpen(false)}
                zIndex={890}
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
                setIsLoginModalOpen={setIsDashboardOpen}
                $isSaving={$isSaving}
                userId={memoizedUserId}
              />
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isPasswordResetMode && (
            <ModalOverlay
              zIndex={80}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                textAlign: 'center',
                padding: '20px'
              }}
            >
              <div>
                <h3>Password Reset in Progress</h3>
                <p>Please complete your password reset in the other tab before continuing.</p>
              </div>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </PageContainer>

      {/* Cart is now portal-rendered outside PageContainer */}
      <AnimatePresence>
        {isFullCartOpen && (
          <>
            <ModalOverlay onClick={cartHandlers.handleCartClose} zIndex={9998} />
            <CartPanel
              key="cart-panel"
              isOpen={isFullCartOpen}
              onClose={cartHandlers.handleCartClose}
              setIsLoggedIn={setIsLoggedIn}
              onNavigateHome={uiHandlers.handleHomeClick}
              billingDetails={billingDetails}
              currentUser={authCurrentUser}
              isLoggedIn={isLoggedIn}
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
