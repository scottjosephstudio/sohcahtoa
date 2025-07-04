import React from "react";
import PropTypes from "prop-types";
import {
  PaymentMethodContainer,
  PaymentMethodButton,
  paymentMethodButtonVariants,
} from "@/components/cart/PaymentSection/PaymentSectionStyles";

export const PaymentMethodSelector = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
}) => {
  return (
    <PaymentMethodContainer>
      <PaymentMethodButton
        selected={selectedPaymentMethod === "card"}
        onClick={() => onPaymentMethodSelect("card")}
        variants={paymentMethodButtonVariants}
        initial="initial"
        whileHover="hover"
        custom={{ selected: selectedPaymentMethod === "card" }}
      >
        Debit/Credit Card
      </PaymentMethodButton>
    </PaymentMethodContainer>
  );
};

PaymentMethodSelector.propTypes = {
  selectedPaymentMethod: PropTypes.string,
  onPaymentMethodSelect: PropTypes.func.isRequired,
  isApplePayAvailable: PropTypes.bool.isRequired,
};

export default PaymentMethodSelector;
