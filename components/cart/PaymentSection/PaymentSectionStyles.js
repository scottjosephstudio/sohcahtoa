import styled, { css, createGlobalStyle } from "styled-components";
import { motion } from "framer-motion";

export const GlobalStyle = createGlobalStyle`
  input::placeholder {
    color: white;
  }

  /* Chrome autofill background removal */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #006efe !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Ensure Stripe Elements have pointer cursor */
  .StripeElement,
  .StripeElement *,
  .StripeElement input,
  .StripeElement iframe {
    cursor: pointer !important;
  }

  .StripeElement:hover,
  .StripeElement:hover *,
  .StripeElement:hover input,
  .StripeElement:hover iframe {
    cursor: pointer !important;
  }
`;

export const CustomPlaceholder = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #006efe;
  font-family: url("https://utfs.io/f/J5IMjEXp8AEY8aPimJU4FNM8dJQrlw1iAPGOIvB3xfXUaLEp")
    format("woff2");
  font-size: 20px;
  pointer-events: none;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: color 0.3s ease;
  z-index: 1;
`;

export const baseStyles = {
  base: {
    fontFamily: "Jant",
    fontSize: "20px",
    lineHeight: "24px",
    letterSpacing: "0.8px",
    color: "#006efe",
    iconColor: "#006efe",
    cursor: "pointer",
    backgroundColor: "transparent",
    "::placeholder": {
      color: "transparent",
      cursor: "pointer",
    },
    ":focus": {
      color: "rgb(16, 12, 8)",
      cursor: "pointer",
    },
    ":hover": {
      cursor: "pointer",
    },
    "::selection": {
      color: "rgb(176, 38, 255)",
      background: "rgb(51, 255, 0)",
      cursor: "pointer",
    },
    "::-moz-selection": {
      color: "rgb(176, 38, 255)",
      background: "rgb(51, 255, 0)",
      cursor: "pointer",
    },
  },
  invalid: {
    color: "#FF0000",
    iconColor: "#FF0000",
    cursor: "pointer",
  },
};

export const CardDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 1200px) {
    > div:first-child {
      display: flex;
      flex-direction: row;
      gap: 20px;
    }
  }
`;

export const CardNumberContainer = styled.div`
  width: 100%;

  @media (min-width: 1200px) {
    width: 50%;
    padding-right: 0px;
  }
`;

export const ExpiryAndCVVContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;

  @media (min-width: 1200px) {
    width: 50%;
  }
`;

export const InputContainer = styled(motion.div)`
  padding: 10px 12px 8px 12px;
  border: 2px solid
    ${(props) => (props.$hasError ? "#FF0000" : "rgb(16, 12, 8)")};
  border-radius: 10px;
  margin-top: 0px;
  background-color: #ffffff;
  cursor: pointer;

  &:hover ${CustomPlaceholder} {
    color: ${(props) => (props.$hasError ? "#FF0000" : "rgb(16, 12, 8)")};
  }

  /* Stripe Elements autofill styles */
  .StripeElement--webkit-autofill {
    background: transparent !important;
  }

  .custom-placeholder-wrapper {
    position: relative;
    height: 100%;
  }
`;

export const Label = styled(motion.label)`
  display: block;
  font-size: 16px;
  color: rgb(16, 12, 8);
  letter-spacing: 0.8px;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  font-weight: normal;
  margin-bottom: 12px;

  ${(props) => {
    if (props.name === "cardNumber") {
      return css`
        margin-top: 0px;
        @media (max-width: 1200px) {
          margin-top: 0px;
        }
        @media (max-width: 1024px) {
          margin-top: 0px;
        }
      `;
    }
    if (["expiry", "cvc"].includes(props.name)) {
      return css`
        margin-top: 0px;
        @media (max-width: 1200px) {
          margin-top: 8px;
        }
        @media (max-width: 1024px) {
          margin-top: 8px;
        }
      `;
    }
    if (["country", "postcode"].includes(props.name)) {
      return css`
        margin-top: -12px;
        @media (max-width: 1200px) {
          margin-top: -12px;
        }
        @media (max-width: 1024px) {
          margin-top: -12px;
        }
      `;
    }
    return css`
      margin-top: 0px;
    `;
  }}
`;

export const InputField = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-family: Jant;
  font-size: 20px;
  color: ${(props) => {
    if (props.$hasError) return "#FF0000";
    if (props.value) return "#006efe"; // Show blue for completed fields
    return "#006efe";
  }};
  cursor: pointer;
  background: transparent;

  &:focus {
    color: ${(props) => (props.$hasError ? "#FF0000" : "rgb(16, 12, 8)")};
    border-color: ${(props) =>
      props.$hasError ? "#FF0000" : "rgb(16, 12, 8)"};
  }

  &::placeholder {
    font-family: Jant;
    color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  }

  &:hover::placeholder {
    color: ${(props) => (props.$hasError ? "#FF0000" : "rgb(16, 12, 8)")};
  }

  &:hover {
    cursor: pointer;
    border-color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: ${(props) => {
      if (props.$hasError) return "#FF0000";
      if (props.value) return "#006efe"; // Show blue for completed fields
      return "rgb(16, 12, 8)";
    }} !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  &:autofill {
    background: transparent;
    -webkit-text-fill-color: ${(props) => {
      if (props.$hasError) return "#FF0000";
      if (props.value) return "#006efe"; // Show blue for completed fields
      return "rgb(16, 12, 8)";
    }};
    box-shadow: 0 0 0 30px white inset !important;
  }
`;

export const CountryPostcodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

export const CountryContainer = styled.div`
  flex: 2;
`;

export const PostcodeContainer = styled.div`
  flex: 1;
`;

export const HintText = styled(motion.div)`
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.8px;
  color: #666;
  margin-top: 12px;
`;

export const ErrorText = styled(motion.div)`
  color: #ff0000;
  padding-top: 6px;
  font-size: 16px;
  line-height: 18px;
  letter-spacing: 0.8px;
  font-family: "Jant";
`;

export const StripeErrorMessage = styled(motion.div)`
  color: #ff0000;
  padding-top: 6px;
  padding-bottom: 0px;
  font-size: 16px;
  margin-top: 4px;
  letter-spacing: 0.8px;
  line-height: 20px;
`;

export const StepContainer = styled.div`
  /* Add any specific styling for the step container if needed */
`;

export const PaymentMethodContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

export const PaymentMethodButton = styled(motion.button)`
  padding: 10px 12px 8px 12px;
  border: 2px solid
    ${(props) => (props.selected ? "#006efe" : "rgb(16, 12, 8)")};
  background-color: ${(props) => (props.selected ? "#006efe" : "transparent")};
  color: ${(props) => (props.selected ? "white" : "rgb(16, 12, 8)")};
  border-radius: 10px;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  cursor: pointer;
`;

export const OptionHeader = styled(motion.h2)`
  font-size: 20px;
  margin-bottom: 20px;
`;

// Motion Variants
export const inputContainerVariants = {
  initial: (props) => ({
    borderColor: props.$hasError ? "#FF0000" : "rgb(16, 12, 8)",
  }),
  hover: (props) => ({
    borderColor: props.$hasError ? "#FF0000" : "#006efe",
    transition: { duration: 0.2 },
  }),
};

export const paymentMethodButtonVariants = {
  initial: (props) => ({
    backgroundColor: props.selected ? "#006efe" : "transparent",
    borderColor: props.selected ? "#006efe" : "rgb(16, 12, 8)",
    color: props.selected ? "white" : "rgb(16, 12, 8)",
  }),
  hover: (props) => ({
    backgroundColor: props.selected ? "#006efe" : "rgba(0, 110, 254, 0.1)",
    transition: { duration: 0.2 },
  }),
};
