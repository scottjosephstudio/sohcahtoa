import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Import styled components and styles
import {
  GlobalStyle,
  CardDetailsWrapper,
  ErrorText,
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

export const PaymentSection = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  isApplePayAvailable,
  onFormComplete,
  error,
  insideElements,
  onAddressChange,
  cartPanelRef,
  isLoading: externalLoading,
  clientSecret,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const elements = insideElements ? useElements() : null;
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

  useEffect(() => {
    if (elements && clientSecret) {
      // Add a small delay to ensure fonts are loaded
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!insideElements) {
      setIsLoading(false);
    }
  }, [elements, clientSecret, insideElements]);

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
          } else {
            cartPanelRef.current.scrollTo({
              top: cartPanelRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }, 1000);
      setInputTimeoutRef(timeout);
    }

    const isFormComplete =
      cardComplete.cardNumber &&
      cardComplete.cardExpiry &&
      cardComplete.cardCvc &&
      (type === "country" ? value.trim() !== "" : country.trim() !== "") &&
      (type === "postcode" ? value.trim() !== "" : postcode.trim() !== "") &&
      !Object.values({
        ...fieldErrors,
        [type]: error,
      }).some((err) => err);

    onFormComplete?.(isFormComplete);

    const countryValue = type === "country" ? value : country;
    const countryCode =
      countryCodeMap[countryValue.toLowerCase().trim()] || countryValue;

    onAddressChange?.({
      country: countryCode,
      postcode: type === "postcode" ? value : postcode,
    });
  };

  const handleInputBlur = (type) => () => {
    const value = type === "country" ? country : postcode;
    const error = validateField(type, value);
    setFieldErrors((prev) => ({
      ...prev,
      [type]: value.trim() === "" ? "" : error,
    }));

    checkAllFieldsAndScroll();
  };

  const handleElementChange = (type, event) => {
    // Update placeholder visibility
    setPlaceholderStates((prev) => ({
      ...prev,
      [type]: event.empty,
    }));

    // Existing changes for Stripe Elements
    setCardComplete((prev) => ({
      ...prev,
      [type]: event.complete,
    }));

    setFieldErrors((prev) => {
      const newErrors = {
        ...prev,
        [type]: event.error ? getCustomStripeError(event.error) : "",
      };

      return newErrors;
    });

    const newComplete = {
      ...cardComplete,
      [type]: event.complete,
    };

    const isAllComplete =
      newComplete.cardNumber &&
      newComplete.cardExpiry &&
      newComplete.cardCvc &&
      country.trim() !== "" &&
      postcode.trim() !== "";

    if (isAllComplete) {
      setTimeout(() => {
        if (cartPanelRef.current) {
          if (window.matchMedia("(max-width: 768px)").matches) {
            const totalHeight = cartPanelRef.current.scrollHeight;
            const viewportHeight = cartPanelRef.current.clientHeight;
            cartPanelRef.current.scrollTo({
              top: Math.max(0, totalHeight - viewportHeight + 30),
              behavior: "smooth",
            });
          } else {
            // Desktop scroll behavior
            cartPanelRef.current.scrollTo({
              top: cartPanelRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }, 300);
    }

    const isFormComplete =
      newComplete.cardNumber &&
      newComplete.cardExpiry &&
      newComplete.cardCvc &&
      country.trim() !== "" &&
      postcode.trim() !== "" &&
      !Object.values(fieldErrors).some((error) => error);

    onFormComplete?.(isFormComplete);
  };

  const checkAllFieldsAndScroll = () => {
    const isAllComplete =
      cardComplete.cardNumber &&
      cardComplete.cardExpiry &&
      cardComplete.cardCvc &&
      country.trim() !== "" &&
      postcode.trim() !== "";

    if (isAllComplete) {
      if (inputTimeoutRef) {
        clearTimeout(inputTimeoutRef);
      }

      const timeout = setTimeout(() => {
        if (cartPanelRef.current) {
          if (window.matchMedia("(max-width: 768px)").matches) {
            const totalHeight = cartPanelRef.current.scrollHeight;
            const viewportHeight = cartPanelRef.current.clientHeight;
            cartPanelRef.current.scrollTo({
              top: Math.max(0, totalHeight - viewportHeight + 30),
              behavior: "smooth",
            });
          } else {
            cartPanelRef.current.scrollTo({
              top: cartPanelRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }, 1000);

      setInputTimeoutRef(timeout);
    }

    return isAllComplete;
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (inputTimeoutRef) {
        clearTimeout(inputTimeoutRef);
      }
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <StepContainer>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OptionHeader>Loading...</OptionHeader>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OptionHeader>Payment Details</OptionHeader>
              {!isLoading && (
                <PaymentMethodSelector
                  selectedPaymentMethod={selectedPaymentMethod}
                  onPaymentMethodSelect={onPaymentMethodSelect}
                  isApplePayAvailable={isApplePayAvailable}
                />
              )}

              {insideElements && elements && clientSecret && !isLoading && (
                <CardDetailsWrapper>
                  <div>
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
            </motion.div>
          )}
        </AnimatePresence>

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
  insideElements: PropTypes.bool.isRequired,
  onAddressChange: PropTypes.func.isRequired,
  cartPanelRef: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  clientSecret: PropTypes.string,
};

export default PaymentSection;
