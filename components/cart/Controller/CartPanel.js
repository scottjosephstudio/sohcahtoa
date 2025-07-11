// CartPanel.js
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import Portal from "../../providers/Portal";
import { usePortal } from "../../../context/PortalContext";
import { CartHeader } from "../CartHeader/CartHeader";
import Footer from "../../product-footer/TypefaceFooter";
import { StyleSelection } from "../Style_Licence_Selection/StyleSelection";
import { LicenseSelection } from "../Style_Licence_Selection/LicenseSelection";
import { Registration } from "../Forms/RegistrationForm";
import { UsageSelection } from "../Forms/UsageTypeForm";
import { PaymentSection } from "../PaymentSection/Elements/PaymentSection";
import CartSummary from "../SummarySection/CartSummary";
import PaymentProcessor from "../PaymentSection/hooks/PaymentProcessor";
import { CartProvider, useCart } from "../Utils/CartContext";
import {
  CartOverlay,
  CartPanelContainer,
  CartContent,
  overlayVariants,
  cartPanelVariants,
  contentVariants,
  stageTransitionVariants,
  formElementsVariants,
  headerElementsVariants,
  Stage1Container,
} from "../styles";

const CartPanelContent = ({
  isOpen,
  onClose,
  onNavigateHome,
  setIsLoggedIn,
}) => {
  const { setIsModalOpen } = usePortal();

  // Register with portal context when cart opens
  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
      return () => setIsModalOpen(false);
    }
  }, [isOpen, setIsModalOpen]);

  const {
    setShowPaymentForm,
    setShowUsageSelection,
    setShowRegistration,
    setSelectedUsage,
    setEulaAccepted,
    setIsAuthenticatedAndPending,
    setSummaryModifiedAfterTab,
    setHasProceedBeenClicked,
    setDidReturnToStageOne,
    scrollToTop,
    isClosing,
    showPaymentForm,
    showUsageSelection,
    showRegistration,
    clientSecret,
    stripePromise,
    cartPanelRef,
    totalSectionRef,
    bottomPadding,
    isMobile,
    weightOption,
    selectedPackage,
    customizing,
    customPrintLicense,
    customWebLicense,
    customAppLicense,
    customSocialLicense,
    cartFont,
    isLicenceOpen,
    isContinueClicked,
    isPaymentCompleted,
    isLoadingPayment,
    isScrolled,
    router,
    isRegistrationComplete,
    isAuthenticated,
    handleClose,
    handleStageClick,
    getCurrentStage,
    hasLicenseSelected,
    getActiveLicenses,
    selectedPaymentMethod,
    isStripeFormComplete,
    isProcessing,
    handleProceed,
    isCheckoutDisabled,
    handleRemoveStyle,
    handleRemoveLicense,
    handleRemovePackage,
    handleAddLicense,
    selectedUsage,
    eulaAccepted,
    handleContinue,
    handleWeightSelect,
    handlePackageSelect,
    handleCustomize,
    handleLicenseSelect,
    handleUsageTypeChange,
    handleEulaChange,
    clientData,
    handleClientDataChange,
    handleUsageComplete,
    isClientDataValid,
    usageTypeButtonRef,
    registrationData,
    handleRegistrationInput,
    handleRegister,
    showLoginForm,
    handleLoginToggle,
    formDividerRef,
    registerButtonRef,
    showPassword,
    setShowPassword,
    isRegistrationFormValid,
    loginData,
    handleLoginInput,
    handleLogin,
    isLoginFormValid,
    emailError,
    passwordError,
    handleResetPasswordClick,
    loginButtonRef,
    isResettingPassword,
    setIsResettingPassword,
    handleBackToLogin,
    savedRegistrationData,
    currentUser,
    addressData,
    error,
    isLoggingIn,
    setSelectedPaymentMethod,
    isApplePayAvailable,
    setIsStripeFormComplete,
    setAddressData,
    handlePaymentComplete,
    setIsProcessing,
    didReturnToStageOne,
    hasProceedBeenClicked,
    summaryModifiedAfterTab,
    selectedFonts,
    selectedStyles,
    handleUpdateFonts,
    handleUpdateStyles,
  } = useCart();

  // Handle removing a font from multi-font selection
  const handleRemoveFont = (fontId) => {
    const updatedFonts = selectedFonts.filter(font => font.id !== fontId);
    const updatedStyles = { ...selectedStyles };
    delete updatedStyles[fontId];
    
    // If this was the last font in the selection, clear the entire cart but keep it open
    if (updatedFonts.length === 0) {
      // Use the available handleRemoveStyle function but prevent any cart-closing side effects
      // by calling it in a way that clears everything but keeps the cart open
      handleRemoveStyle();
      
      return;
    }
    
    // Otherwise, just update the font selection
    handleUpdateFonts(updatedFonts);
    handleUpdateStyles(updatedStyles);
  };

  if (!isOpen) return null;

  const cartContent = (
    <>
      <CartPanelContainer
        key="cart-panel"
        className="cart-panel"
        ref={cartPanelRef}
        variants={cartPanelVariants}
        initial="hidden"
        animate={
          isPaymentCompleted
            ? {
                opacity: 0,
                scale: 1,
                transition: {
                  opacity: { duration: 0.3, ease: "easeOut" },
                  scale: { duration: 0.2, ease: "easeInOut" },
                  when: "afterChildren",
                },
              }
            : "visible"
        }
        exit={{
          opacity: 0,
          scale: 1,
          transition: {
            opacity: { duration: 0.3, ease: "easeOut" },
            scale: { duration: 0.2, ease: "easeInOut" },
            when: "afterChildren",
          },
        }}
      >
        <CartHeader
          variants={headerElementsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClose={handleClose}
          currentStage={getCurrentStage()}
          isAuthenticated={isAuthenticated}
          showPaymentForm={showPaymentForm}
          showUsageSelection={showUsageSelection}
          showRegistration={showRegistration}
          hasLicenseSelected={hasLicenseSelected}
          weightOption={weightOption}
          isRegistrationComplete={isRegistrationComplete}
          didReturnToStageOne={didReturnToStageOne}
          hasProceedBeenClicked={hasProceedBeenClicked}
          summaryModifiedAfterTab={summaryModifiedAfterTab}
          cartPanelRef={cartPanelRef}
          onStageChange={(changes) => {
            if (changes.showPaymentForm !== undefined)
              setShowPaymentForm(changes.showPaymentForm);
            if (changes.showUsageSelection !== undefined)
              setShowUsageSelection(changes.showUsageSelection);
            if (changes.showRegistration !== undefined)
              setShowRegistration(changes.showRegistration);
            if (changes.selectedUsage !== undefined)
              setSelectedUsage(changes.selectedUsage);
            if (changes.eulaAccepted !== undefined)
              setEulaAccepted(changes.eulaAccepted);
            if (changes.isAuthenticatedAndPending !== undefined)
              setIsAuthenticatedAndPending(changes.isAuthenticatedAndPending);
            if (changes.summaryModifiedAfterTab !== undefined)
              setSummaryModifiedAfterTab(changes.summaryModifiedAfterTab);
            if (changes.hasProceedBeenClicked !== undefined) {
              setHasProceedBeenClicked(changes.hasProceedBeenClicked);
              if (!changes.hasProceedBeenClicked) {
                localStorage.removeItem("hasProceedBeenClicked");
              }
            }
            if (changes.didReturnToStageOne !== undefined)
              setDidReturnToStageOne(changes.didReturnToStageOne);
            if (changes.scrollToTop) scrollToTop();
          }}
          isScrolled={isScrolled}
        />

        {showPaymentForm && clientSecret ? (
          <Elements
            stripe={stripePromise}
            key={clientSecret} // Force remount when clientSecret changes
            options={{
                    clientSecret,
                    appearance: {
                      theme: "flat",
                      variables: {
                        colorPrimary: "#006efe",
                        colorBackground: "white",
                        colorText: "rgb(16, 12, 8)",
                        colorDanger: "#FF0000",
                        fontFamily: "Jant",
                        spacingUnit: "4px",
                        borderRadius: "10px",
                      },
                      rules: {
                        ".Input": {
                          border: "2px solid rgb(16, 12, 8)",
                          backgroundColor: "white",
                          borderRadius: "10px",
                          padding: "10px 12px 8px 12px",
                          fontFamily: "'Jant', sans-serif",
                          fontSize: "20px",
                          lineHeight: "24px",
                          letterSpacing: "0.8px",
                          transition: "all 0.15s ease",
                          color: "#006efe",
                        },
                        ".Input:hover": {
                          borderColor: "#006efe",
                        },
                        ".Input:focus": {
                          borderColor: "#006efe",
                          boxShadow: "none",
                        },
                        ".Input--invalid": {
                          borderColor: "#FF0000",
                          color: "#FF0000",
                        },
                        ".Error": {
                          color: "#FF0000",
                          fontSize: "16px",
                          letterSpacing: "0.8px",
                          marginTop: "14px",
                        },
                        ".Label": {
                          textTransform: "capitalize",
                        },
                      },
                    },
                    fonts: [
                      {
                        family: "Jant",
                        src: "url(https://utfs.io/f/J5IMjEXp8AEY8aPimJU4FNM8dJQrlw1iAPGOIvB3xfXUaLEp)",
                        weight: "400",
                        style: "normal",
                      },
                    ],
                    loader: "never",
            }}
          >
            <PaymentProcessor
              onPaymentComplete={handlePaymentComplete}
              onError={(error) => {
                console.error("Payment error:", error);
                setIsProcessing(false);
              }}
              setIsProcessing={setIsProcessing}
              savedRegistrationData={savedRegistrationData}
              currentUser={currentUser}
              clientSecret={clientSecret}
              addressData={addressData}
            >
              {(processPayment) => (
                <CartContent
                  style={
                    isMobile ? { paddingBottom: `${bottomPadding}px` } : {}
                  }
                  $hasSelections={
                    !!(
                      weightOption ||
                      selectedPackage ||
                      (customizing && getActiveLicenses().length > 0)
                    )
                  }
                >
                  <motion.div
                    key="payment-section"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <PaymentSection
                      selectedPaymentMethod={selectedPaymentMethod}
                      onPaymentMethodSelect={setSelectedPaymentMethod}
                      isApplePayAvailable={isApplePayAvailable}
                      onFormComplete={setIsStripeFormComplete}
                      error={error}
                      insideElements={true}
                      onAddressChange={setAddressData}
                      cartPanelRef={cartPanelRef}
                      isLoading={isLoadingPayment}
                      clientSecret={clientSecret}
                    />
                  </motion.div>

                  <motion.div
                    key="payment-summary"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <CartSummary
                      weightOption={weightOption}
                      selectedPackage={selectedPackage}
                      customizing={customizing}
                      customLicenses={{
                        customPrintLicense,
                        customWebLicense,
                        customAppLicense,
                        customSocialLicense,
                      }}
                      onRemoveStyle={handleRemoveStyle}
                      onRemoveLicense={handleRemoveLicense}
                      onRemovePackage={handleRemovePackage}
                      onRemoveFont={handleRemoveFont}
                      onAddLicense={handleAddLicense}
                      showPaymentForm={showPaymentForm}
                      selectedPaymentMethod={selectedPaymentMethod}
                      isStripeFormComplete={isStripeFormComplete}
                      isCheckoutDisabled={isCheckoutDisabled}
                      onPayment={processPayment}
                      isProcessing={isProcessing}
                      onProceed={handleProceed}
                      isMobileLayout={isMobile}
                      totalSectionRef={totalSectionRef}
                      hasSelections={
                        !!(
                          weightOption ||
                          selectedPackage ||
                          (customizing && getActiveLicenses().length > 0)
                        )
                      }
                      isLoadingPayment={isLoadingPayment}
                      currentStage={getCurrentStage()}
                      showUsageSelection={showUsageSelection}
                      showRegistration={showRegistration}
                    />
                  </motion.div>
                </CartContent>
              )}
            </PaymentProcessor>
          </Elements>
        ) : (
          <CartContent
            style={isMobile ? { paddingBottom: `${bottomPadding}px` } : {}}
            $hasSelections={
              !!(
                weightOption ||
                selectedPackage ||
                (customizing && getActiveLicenses().length > 0)
              )
            }
          >
            <motion.div
              key="main-content"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <AnimatePresence mode="wait">
                {showUsageSelection ? (
                  <motion.div key="usage" variants={contentVariants}>
                    <UsageSelection
                      selectedUsage={selectedUsage}
                      onUsageTypeChange={handleUsageTypeChange}
                      eulaAccepted={eulaAccepted}
                      onEulaChange={handleEulaChange}
                      savedRegistrationData={savedRegistrationData}
                      currentUser={currentUser}
                      clientData={clientData}
                      onClientDataChange={handleClientDataChange}
                      onUsageComplete={handleUsageComplete}
                      isClientDataValid={isClientDataValid}
                      usageTypeButtonRef={usageTypeButtonRef}
                    />
                  </motion.div>
                ) : showRegistration ? (
                  <motion.div key="registration" variants={contentVariants}>
                    <Registration
                      registrationData={registrationData}
                      onRegistrationInput={handleRegistrationInput}
                      onRegister={handleRegister}
                      showLoginForm={showLoginForm}
                      onLoginToggle={handleLoginToggle}
                      formDividerRef={formDividerRef}
                      registerButtonRef={registerButtonRef}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      isRegistrationFormValid={isRegistrationFormValid}
                      loginData={loginData}
                      onLoginInput={handleLoginInput}
                      onLogin={handleLogin}
                      isLoginFormValid={isLoginFormValid}
                      emailError={emailError}
                      passwordError={passwordError}
                      onResetPasswordClick={handleResetPasswordClick}
                      loginButtonRef={loginButtonRef}
                      isResettingPassword={isResettingPassword}
                      setIsResettingPassword={setIsResettingPassword}
                      onBackToLogin={handleBackToLogin}
                      isLoggingIn={isLoggingIn}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="stage1" variants={contentVariants}>
                    <Stage1Container>
                      <StyleSelection
                        weightOption={weightOption}
                        onWeightSelect={handleWeightSelect}
                        isContinueClicked={isContinueClicked}
                        isLicenceOpen={isLicenceOpen}
                        onContinue={handleContinue}
                        selectedPackage={selectedPackage}
                        customizing={customizing}
                        onNavigateHome={onNavigateHome}
                        customLicenses={{
                          customPrintLicense,
                          customWebLicense,
                          customAppLicense,
                          customSocialLicense,
                        }}
                        cartFont={cartFont}
                        selectedFonts={selectedFonts}
                        selectedStyles={selectedStyles}
                        onUpdateFonts={handleUpdateFonts}
                        onUpdateStyles={handleUpdateStyles}
                        onRemoveStyle={handleRemoveStyle}
                      />

                      <LicenseSelection
                        isOpen={isLicenceOpen}
                        weightOption={weightOption}
                        selectedPackage={selectedPackage}
                        customizing={customizing}
                        onPackageSelect={handlePackageSelect}
                        onCustomizeClick={handleCustomize}
                        customLicenses={{
                          customPrintLicense,
                          customWebLicense,
                          customAppLicense,
                          customSocialLicense,
                        }}
                        onLicenseSelect={handleLicenseSelect}
                        showingCustom={customizing}
                      />
                    </Stage1Container>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              key="main-summary"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CartSummary
                weightOption={weightOption}
                selectedPackage={selectedPackage}
                customizing={customizing}
                customLicenses={{
                  customPrintLicense,
                  customWebLicense,
                  customAppLicense,
                  customSocialLicense,
                }}
                onRemoveStyle={handleRemoveStyle}
                onRemoveLicense={handleRemoveLicense}
                onRemovePackage={handleRemovePackage}
                onRemoveFont={handleRemoveFont}
                onAddLicense={handleAddLicense}
                showPaymentForm={showPaymentForm}
                selectedPaymentMethod={selectedPaymentMethod}
                isStripeFormComplete={isStripeFormComplete}
                isCheckoutDisabled={isCheckoutDisabled}
                isProcessing={isProcessing}
                onProceed={handleProceed}
                isMobileLayout={isMobile}
                totalSectionRef={totalSectionRef}
                hasSelections={
                  !!(
                    weightOption ||
                    selectedPackage ||
                    (customizing && getActiveLicenses().length > 0)
                  )
                }
                currentStage={getCurrentStage()}
                showUsageSelection={showUsageSelection}
                showRegistration={showRegistration}
              />
            </motion.div>
          </CartContent>
        )}
      </CartPanelContainer>

      {router.pathname === "/Typefaces" && (
        <Footer key="cart-footer" $isCartOpen={isOpen} />
      )}
    </>
  );

  return <Portal>{cartContent}</Portal>;
};

export const CartPanel = ({
  isOpen,
  onClose,
  onNavigateHome,
  setIsLoggedIn,
}) => {
  return (
    <CartProvider
      onClose={onClose}
      isOpen={isOpen}
      setIsLoggedIn={setIsLoggedIn}
      onNavigateHome={onNavigateHome}
    >
      <CartPanelContent
        isOpen={isOpen}
        onClose={onClose}
        onNavigateHome={onNavigateHome}
        setIsLoggedIn={setIsLoggedIn}
      />
    </CartProvider>
  );
};

export default CartPanel;
