import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { useElements } from "@stripe/react-stripe-js";
import styled from "styled-components";

// Import styled components and styles
import {
  GlobalStyle,
  CardDetailsWrapper,
  ErrorText,
  VerificationWarning,
  VerificationIcon,
  VerificationContent,
  VerificationTitle,
  VerificationMessage,
  ResendButton,
} from "../PaymentSectionStyles";

import { StepContainer, OptionHeader } from "../../styles";

// Import utility functions
import {
  validateField,
  getCustomStripeError,
  countryCodeMap,
} from "../hooks/PaymentValidationUtils";

// Import subcomponents
import PaymentMethodSelector from "./PaymentMethodSelector";
import {
  CardNumberInput,
  CardExpiryAndCVCInputs,
} from "../Inputs/CardInput";
import AddressInputs from "../Inputs/AddressInput";

// Animated loading components
const AnimatedLoading = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 20px;
  color: #666;
`;

const LoadingText = styled.span`
  font-size: 20px;
  letter-spacing: 0.8px;
  color: #666;
`;

const LoadingDot = styled(motion.span)`
  display: inline-block;
  margin-top: 6px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: #666;
  flex-shrink: 0;
`;

// Loading animation variants
const dotVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: [0, 1, 1, 0],
    scale: [0.5, 1, 1, 0.5],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const dot1Variants = {
  ...dotVariants,
  animate: {
    ...dotVariants.animate,
    transition: {
      ...dotVariants.animate.transition,
      delay: 0
    }
  }
};

const dot2Variants = {
  ...dotVariants,
  animate: {
    ...dotVariants.animate,
    transition: {
      ...dotVariants.animate.transition,
      delay: 0.2
    }
  }
};

const dot3Variants = {
  ...dotVariants,
  animate: {
    ...dotVariants.animate,
    transition: {
      ...dotVariants.animate.transition,
      delay: 0.4
    }
  }
};

// Loading component
const LoadingIndicator = () => (
  <AnimatedLoading>
    <LoadingText>Loading</LoadingText>
    <LoadingDot 
      initial="initial"
      animate="animate"
      variants={dot1Variants} 
    />
    <LoadingDot 
      initial="initial"
      animate="animate"
      variants={dot2Variants} 
    />
    <LoadingDot 
      initial="initial"
      animate="animate"
      variants={dot3Variants} 
    />
  </AnimatedLoading>
);

// Custom animation variants for PaymentSection - no vertical movement
const paymentSectionVariants = {
  hidden: {
    opacity: 0,
    y: 0, // No vertical movement
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 0, // No vertical movement
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const PaymentSection = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  isApplePayAvailable,
  onFormComplete,
  error,
  onAddressChange,
  cartPanelRef,
  isLoading: externalLoading,
  clientSecret,
  currentUser,
  onResendVerification,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [country, setCountry] = useState("");
  const [postcode, setPostcode] = useState("");
  const [placeholderStates, setPlaceholderStates] = useState({
    cardNumber: true,
    cardExpiry: true,
    cardCvc: true,
  });
  const [fieldErrors, setFieldErrors] = useState({
    country: "",
    postcode: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
    country: false,
    postcode: false,
  });

  const [inputTimeoutRef, setInputTimeoutRef] = useState(null);
  
  // Only use Elements hook when clientSecret is available
  let elements = null;
  if (clientSecret) {
    try {
      elements = useElements();
    } catch (error) {
      // Elements context not available, elements will remain null
    }
  }

  useEffect(() => {
    // If external loading is provided, use that
    if (externalLoading !== undefined) {
      setIsLoading(externalLoading);
      return;
    }
    
    // Otherwise, use internal loading logic
    if (clientSecret && elements) {
      // Add a small delay to ensure fonts are loaded
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!clientSecret) {
      // No clientSecret means we're in loading state
      setIsLoading(true);
    }
  }, [elements, clientSecret, externalLoading]);

  const handleInputChange = (type) => (e) => {
    const value = e.target.value;
    if (type === "country") setCountry(value);
    if (type === "postcode") setPostcode(value);

    const error = validateField(type, value);
    setFieldErrors((prev) => ({
      ...prev,
      [type]: value.trim() === "" ? "" : error,
    }));

    // Clear any existing timeout
    if (inputTimeoutRef) {
      clearTimeout(inputTimeoutRef);
    }

    const isAllComplete =
      cardComplete.cardNumber &&
      cardComplete.cardExpiry &&
      cardComplete.cardCvc &&
      (type === "country" ? value.trim() !== "" : country.trim() !== "") &&
      (type === "postcode" ? value.trim() !== "" : postcode.trim() !== "");

    if (isAllComplete) {
      const timeout = setTimeout(() => {
        if (cartPanelRef.current) {
          if (window.matchMedia("(max-width: 768px)").matches) {
            const totalHeight = cartPanelRef.current.scrollHeight;
            const viewportHeight = cartPanelRef.current.clientHeight;
            cartPanelRef.current.scrollTo({
              top: Math.max(0, totalHeight - viewportHeight + 30),
              behavior: "smooth",
            });
          }
        }
      }, 100);
      setInputTimeoutRef(timeout);
    }

    setCardComplete((prev) => ({
      ...prev,
      [type]: value.trim() !== "" && !error,
    }));
  };

  const handleInputBlur = (type) => (e) => {
    const value = e.target.value;
    const error = validateField(type, value);
    setFieldErrors((prev) => ({
      ...prev,
      [type]: error,
    }));
  };

  const handleElementChange = (type, event) => {
    const { complete, error } = event;

    setCardComplete((prev) => ({
      ...prev,
      [type]: complete,
    }));

    if (error) {
      const customError = getCustomStripeError(error);
      setFieldErrors((prev) => ({
        ...prev,
        [type]: customError,
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [type]: "",
      }));
    }

    if (type === "cardNumber") {
      setPlaceholderStates((prev) => ({
        ...prev,
        cardNumber: event.empty,
      }));
    } else if (type === "cardExpiry") {
      setPlaceholderStates((prev) => ({
        ...prev,
        cardExpiry: event.empty,
      }));
    } else if (type === "cardCvc") {
      setPlaceholderStates((prev) => ({
        ...prev,
        cardCvc: event.empty,
      }));
    }
  };

  const handleFocus = (type) => {
    setPlaceholderStates((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  const handleBlur = (type, event) => {
    setPlaceholderStates((prev) => ({
      ...prev,
      [type]: event.empty,
    }));
  };

  useEffect(() => {
    const isFormComplete =
      cardComplete.cardNumber &&
      cardComplete.cardExpiry &&
      cardComplete.cardCvc &&
      cardComplete.country &&
      cardComplete.postcode;

    onFormComplete(isFormComplete);

    // Update address data whenever country or postcode changes, not just when form is complete
    if (onAddressChange && (country.trim() || postcode.trim())) {
      const countryCode = countryCodeMap[country] || country;
      onAddressChange({
        country: countryCode,
        postcode: postcode,
      });
    }
  }, [cardComplete, onFormComplete, onAddressChange, country, postcode]);

  const handleResendEmail = async () => {
    setIsResendingEmail(true);
    try {
      const result = await onResendVerification();
      if (result.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      }
    } catch (error) {
      console.error("Error resending email:", error);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const isEmailNotVerified = currentUser && !currentUser.email_confirmed_at;

  return (
    <>
      <GlobalStyle />
      <StepContainer>
        <OptionHeader>
          {isLoading ? <LoadingIndicator /> : "Payment Details"}
        </OptionHeader>

        {!isLoading && (
            <motion.div
            initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
            {isEmailNotVerified && (
              <VerificationWarning>
                  <VerificationIcon>⚠️</VerificationIcon>
                  <VerificationContent>
                    <VerificationTitle>Email Verification Required</VerificationTitle>
                    <VerificationMessage>
                    Please verify your email address to complete your purchase.
                    {emailSent ? (
                      <span style={{ color: "#006efe", marginLeft: "8px" }}>
                        ✓ Email sent!
                      </span>
                    ) : (
                    <ResendButton
                        onClick={handleResendEmail}
                        disabled={isResendingEmail}
                      >
                        {isResendingEmail ? "Sending..." : "Resend Email"}
                    </ResendButton>
                    )}
                  </VerificationMessage>
                  </VerificationContent>
                </VerificationWarning>
              )}
              
            {!isEmailNotVerified && (
              <>
                <PaymentMethodSelector
                  selectedPaymentMethod={selectedPaymentMethod}
                  onPaymentMethodSelect={onPaymentMethodSelect}
                  isApplePayAvailable={isApplePayAvailable}
                  disabled={isLoading}
                />

                {selectedPaymentMethod === "card" && (
                <CardDetailsWrapper>
                    <div
                      style={{
                        marginBottom: "20px",
                        opacity: isLoading ? 0.5 : 1,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                    <CardNumberInput
                      placeholderVisible={placeholderStates.cardNumber}
                      onElementChange={(event) =>
                        handleElementChange("cardNumber", event)
                      }
                      error={fieldErrors.cardNumber}
                    />
                    <CardExpiryAndCVCInputs
                      placeholderStates={placeholderStates}
                      onElementChange={handleElementChange}
                      errors={{
                        cardExpiry: fieldErrors.cardExpiry,
                        cardCvc: fieldErrors.cardCvc,
                      }}
                    />
                  </div>

                  <AddressInputs
                    country={country}
                    postcode={postcode}
                    errors={{
                      country: fieldErrors.country,
                      postcode: fieldErrors.postcode,
                    }}
                    onInputChange={handleInputChange}
                    onInputBlur={handleInputBlur}
                  />
                </CardDetailsWrapper>
                )}
              </>
              )}
            </motion.div>
          )}

        {error && <ErrorText>{error.message}</ErrorText>}
      </StepContainer>
    </>
  );
};

PaymentSection.propTypes = {
  selectedPaymentMethod: PropTypes.string,
  onPaymentMethodSelect: PropTypes.func.isRequired,
  isApplePayAvailable: PropTypes.bool.isRequired,
  onFormComplete: PropTypes.func.isRequired,
  error: PropTypes.object,
  onAddressChange: PropTypes.func.isRequired,
  cartPanelRef: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  clientSecret: PropTypes.string,
  currentUser: PropTypes.object,
  onResendVerification: PropTypes.func,
};

export { PaymentSection };
export default PaymentSection;
