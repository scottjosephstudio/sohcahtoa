import React from "react";
import PropTypes from "prop-types";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { AnimatePresence } from "framer-motion";
import {
  InputContainer,
  CustomPlaceholder,
  Label,
  StripeErrorMessage,
  CardNumberContainer,
  ExpiryAndCVVContainer,
  baseStyles,
  inputContainerVariants,
} from "@/components/cart/PaymentSection/PaymentSectionStyles";

export const CardNumberInput = ({
  placeholderVisible,
  onElementChange,
  error,
}) => (
  <CardNumberContainer>
    <Label name="cardNumber">Card Number</Label>
    <InputContainer
      $hasError={!!error}
      variants={inputContainerVariants}
      initial="initial"
      whileHover="hover"
      custom={{ $hasError: !!error }}
    >
      <div className="custom-placeholder-wrapper">
        {placeholderVisible && (
          <CustomPlaceholder
            $visible={placeholderVisible}
            className="placeholder"
          >
            Card Number
          </CustomPlaceholder>
        )}
        <CardNumberElement
          options={{
            style: {
              ...baseStyles,
              invalid: {
                color: "#FF0000",
                iconColor: "#FF0000",
              },
            },
            placeholder: "",
          }}
          onChange={onElementChange}
        />
      </div>
    </InputContainer>
    <AnimatePresence>
      {error && <StripeErrorMessage>{error}</StripeErrorMessage>}
    </AnimatePresence>
  </CardNumberContainer>
);

export const CardExpiryAndCVCInputs = ({
  placeholderStates,
  onElementChange,
  errors,
}) => (
  <ExpiryAndCVVContainer>
    {/* Expiry Input */}
    <div style={{ flex: 1 }}>
      <Label name="expiry">Expiry</Label>
      <InputContainer
        $hasError={!!errors.cardExpiry}
        variants={inputContainerVariants}
        initial="initial"
        whileHover="hover"
        custom={{ $hasError: !!errors.cardExpiry }}
      >
        <div className="custom-placeholder-wrapper">
          {placeholderStates.cardExpiry && (
            <CustomPlaceholder
              $visible={placeholderStates.cardExpiry}
              className="placeholder"
            >
              MM / YY
            </CustomPlaceholder>
          )}
          <CardExpiryElement
            options={{
              style: {
                ...baseStyles,
                invalid: {
                  color: "#FF0000",
                  iconColor: "#FF0000",
                },
              },
              placeholder: "",
            }}
            onChange={(event) => onElementChange("cardExpiry", event)}
          />
        </div>
      </InputContainer>
      <AnimatePresence>
        {errors.cardExpiry && (
          <StripeErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {errors.cardExpiry}
          </StripeErrorMessage>
        )}
      </AnimatePresence>
    </div>

    {/* CVC Input */}
    <div style={{ flex: 1 }}>
      <Label name="cvc">CVC</Label>
      <InputContainer
        $hasError={!!errors.cardCvc}
        variants={inputContainerVariants}
        initial="initial"
        whileHover="hover"
        custom={{ $hasError: !!errors.cardCvc }}
      >
        <div className="custom-placeholder-wrapper">
          {placeholderStates.cardCvc && (
            <CustomPlaceholder
              $visible={placeholderStates.cardCvc}
              className="placeholder"
            >
              CVC
            </CustomPlaceholder>
          )}
          <CardCvcElement
            options={{
              style: {
                ...baseStyles,
                invalid: {
                  color: "#FF0000",
                  iconColor: "#FF0000",
                },
              },
              placeholder: "",
            }}
            onChange={(event) => onElementChange("cardCvc", event)}
          />
        </div>
      </InputContainer>
      <AnimatePresence>
        {errors.cardCvc && (
          <StripeErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {errors.cardCvc}
          </StripeErrorMessage>
        )}
      </AnimatePresence>
    </div>
  </ExpiryAndCVVContainer>
);

CardExpiryAndCVCInputs.propTypes = {
  placeholderStates: PropTypes.shape({
    cardExpiry: PropTypes.bool.isRequired,
    cardCvc: PropTypes.bool.isRequired,
  }).isRequired,
  onElementChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    cardExpiry: PropTypes.string,
    cardCvc: PropTypes.string,
  }).isRequired,
};

export default { CardNumberInput, CardExpiryAndCVCInputs };
