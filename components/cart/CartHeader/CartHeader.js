import React, { useState, useEffect } from "react";
import {
  CloseButton,
  CartProgressContainer,
  CartPill,
  CartText,
  StageContainer,
  StageNumber,
  headerElementsVariants,
  stageNumberVariants,
} from "../styles";

export const CartHeader = ({
  showCloseButton = true,
  showCartPill = true,
  enableScrollOpacity = true,
  isAuthenticated,
  showPaymentForm,
  showUsageSelection,
  showRegistration,
  hasLicenseSelected,
  weightOption,
  isRegistrationComplete,
  didReturnToStageOne,
  hasProceedBeenClicked,
  summaryModifiedAfterTab,
  cartPanelRef,
  onStageChange,
  onClose,
}) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!enableScrollOpacity) return;

    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      setOpacity(scrollTop > 50 ? 0.8 : 1);
    };

    const cartPanel = cartPanelRef?.current;
    if (cartPanel) {
      cartPanel.addEventListener("scroll", handleScroll);
      return () => cartPanel.removeEventListener("scroll", handleScroll);
    }
  }, [enableScrollOpacity]);

  const handleStageOneClick = () => {
    if (showPaymentForm) {
      onStageChange({
        showPaymentForm: false,
        didReturnToStageOne: true,
        summaryModifiedAfterTab: true,
        scrollToTop: true,
      });
      return;
    }

    if (showUsageSelection || showRegistration) {
      onStageChange({
        showUsageSelection: false,
        showRegistration: false,
        selectedUsage: null,
        eulaAccepted: false,
        isAuthenticatedAndPending: false,
        summaryModifiedAfterTab: true,
        hasProceedBeenClicked: false,
        scrollToTop: true,
      });
    }
  };

  const handleStageTwoClick = () => {
    if ((showPaymentForm || didReturnToStageOne) && hasLicenseSelected) {
      onStageChange({
        showPaymentForm: false,
        showUsageSelection: true,
        scrollToTop: true,
      });
    } else if (
      hasProceedBeenClicked &&
      weightOption &&
      hasLicenseSelected &&
      !summaryModifiedAfterTab
    ) {
      if (!showRegistration && !showUsageSelection) {
        onStageChange({
          showRegistration: true,
          scrollToTop: true,
        });
      }
    }
  };

  const handleStageThreeClick = () => {
    if (isRegistrationComplete) {
      onStageChange({
        showPaymentForm: true,
        scrollToTop: true,
      });
    }
  };

  const isStageOneActive =
    !showRegistration && !showUsageSelection && !showPaymentForm;
  const isStageTwoActive =
    (showRegistration && !isRegistrationComplete) ||
    (showUsageSelection && !isRegistrationComplete);
  const isStageThreeActive = isRegistrationComplete || showPaymentForm;

  const isStageTwoClickable =
    showPaymentForm ||
    (isAuthenticated &&
      isRegistrationComplete &&
      hasLicenseSelected &&
      (didReturnToStageOne || showUsageSelection)) ||
    (hasProceedBeenClicked &&
      weightOption &&
      hasLicenseSelected &&
      !summaryModifiedAfterTab);

  const isStageThreeClickable = isRegistrationComplete;

  return (
    <>
      {showCloseButton && (
        <CloseButton
          onClick={onClose}
          style={{ opacity }}
          variants={headerElementsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <svg
            id="a"
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 17.96 17.95"
            style={{ transform: "rotate(45deg)" }}
          >
            <path
              d="M16.73,7.75h-6.53V1.23c0-.68-.55-1.23-1.22-1.23s-1.23.55-1.23,1.23v6.53H1.23c-.68,0-1.23.55-1.23,1.23s.55,1.23,1.23,1.23h6.53v6.53c0,.68.55,1.22,1.23,1.22s1.22-.55,1.22-1.22v-6.53h6.53c.68,0,1.22-.55,1.22-1.23s-.55-1.23-1.22-1.23Z"
              fill="lime"
              strokeWidth="0"
            />
          </svg>
        </CloseButton>
      )}

      <CartProgressContainer
        variants={headerElementsVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {showCartPill && (
            <CartPill style={{ opacity }}>
              <CartText>Cart</CartText>
            </CartPill>
          )}
          <StageContainer>
            <StageNumber
              active={isStageOneActive}
              clickable={true}
              onClick={handleStageOneClick}
              style={{ opacity }}
              variants={stageNumberVariants}
              initial="initial"
              whileHover="hover"
              custom={{ clickable: true, active: isStageOneActive }}
            >
              1
            </StageNumber>
            <StageNumber
              active={isStageTwoActive}
              clickable={isStageTwoClickable}
              onClick={isStageTwoClickable ? handleStageTwoClick : undefined}
              style={{ opacity }}
              variants={stageNumberVariants}
              initial="initial"
              whileHover="hover"
              custom={{
                clickable: isStageTwoClickable,
                active: isStageTwoActive,
              }}
            >
              2
            </StageNumber>
            <StageNumber
              active={isStageThreeActive}
              clickable={isStageThreeClickable}
              onClick={
                isStageThreeClickable ? handleStageThreeClick : undefined
              }
              style={{ opacity }}
              variants={stageNumberVariants}
              initial="initial"
              whileHover="hover"
              custom={{
                clickable: isStageThreeClickable,
                active: isStageThreeActive,
              }}
            >
              3
            </StageNumber>
          </StageContainer>
        </div>
      </CartProgressContainer>
    </>
  );
};

export default CartHeader;
