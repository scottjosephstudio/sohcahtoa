// src/components/cart/styles.js
import styled from "styled-components";
import { motion } from "framer-motion";
import { PaymentElement } from "@stripe/react-stripe-js";

// Independent Base Components
export const CartPanelContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100vh;
  background: #e0e0e0;
  z-index: 9999;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    font-size: 20px;
    line-height: 24px;
    letter-spacing: 0.8px;
  }

  @media (max-width: 768px) {
    /* Use dynamic viewport units that account for browser UI */
    height: 100dvh; /* Dynamic viewport height - adjusts for address bar */
    width: 100dvw; /* Dynamic viewport width */
    min-height: 100svh; /* Small viewport height - minimum space */
    max-height: 100lvh; /* Large viewport height - maximum space */
    /* Account for safe areas (notches, home indicators) */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);

    /* Prevent both Chrome and Safari from adjusting text size */
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;

    /* Force all child elements to maintain specified font sizes */
    * {
      -webkit-text-size-adjust: 100% !important;
      -moz-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
      text-size-adjust: 100% !important;
    }
  }

  /* Safari-specific fixes */
  @supports (-webkit-touch-callout: none) {
    @media (max-width: 768px) {
      /* Safari mobile specific adjustments */
      -webkit-text-size-adjust: 100%;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      /* Safari viewport handling */
      height: 100dvh;
      min-height: -webkit-fill-available;

      /* Safari text rendering consistency */
      * {
        -webkit-text-size-adjust: 100% !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
    }
  }
`;

export const CartOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  -moz-backdrop-filter: blur(6px);
  -ms-backdrop-filter: blur(6px);
  -o-backdrop-filter: blur(6px);
  z-index: 40;
  cursor: pointer;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const CartContent = styled.div.attrs((props) => {
  // Create a new props object without $hasSelections to avoid passing it to DOM
  const { $hasSelections, ...domProps } = props;
  return domProps;
})`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  padding: 86px 20px 0 20px;
  position: relative;
  z-index: 101;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    font-size: 20px;
    line-height: 24px;
    letter-spacing: 0.8px;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-bottom: ${(props) => (props.$hasSelections ? "100px" : "0px")};
  }

  /* Ensure padding is maintained at very narrow widths */
  @media (max-width: 375px) {
    padding-left: 20px;
    padding-right: 20px;
  }
`;

export const StyleSelectionContainer = styled(motion.div)`
  @media (max-width: 768px) {
    ${(props) => {
      const baseStyle = `margin-bottom: 0px;`;

      if (props.isLicenceOpen && props.isContinueClicked) {
        return `margin-bottom: 0;`;
      }
      if (
        !props.isContinueClicked &&
        (props.selectedPackage || props.hasCustomLicenses)
      ) {
        return `margin-bottom: 0;`;
      }
      if (props.isLicenceOpen) {
        return `margin-bottom: 0;`;
      }
      if (!props.isContinueClicked && props.hasItems) {
        return `margin-bottom: -24px;`;
      }

      return baseStyle;
    }}
  }
`;

export const StepContainer = styled(motion.div)`
  padding: 24px;
  background-color: #f9f9f9;
  border-radius: 10px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
  margin-top: ${(props) => (props.isLicenceOpen ? "24px" : "0")};
  margin-bottom: 24px;
  letter-spacing: 0.8px;
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 768px) {
    margin-top: ${(props) => (props.isLicenceOpen ? "24px" : "0")};
    margin-bottom: ${(props) => {
      if (props.isStylesForm) {
        return props.hasSelections ? "0" : "0px";
      }
      if (props.isUsageForm || props.isPaymentForm || props.isRegistration) {
        return "0";
      }
      return "0px";
    }};
  }
`;

export const SectionWrapper = styled.div`
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const SizeOptionsStack = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  letter-spacing: 0.8px;
  align-items: stretch; /* Ensures all cards stretch to same height */

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const OptionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  span {
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
    font-weight: normal;
  }
`;

export const OptionDetail = styled.div`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  margin-bottom: 0px;
  display: flex;
  align-items: flex-start;
  flex-grow: 1; /* Allows this section to expand and fill remaining space */
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const OptionCard = styled(motion.div)`
  border: 2px solid
    ${(props) => (props.selected ? "#006efe" : "rgb(16, 12, 8)")};
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  letter-spacing: 0.8px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const OptionHeader = styled.h3`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  font-weight: normal;
  margin: 0 0 24px 0;
  color: rgb(16, 12, 8);

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  ${(props) =>
    props.$isFormHeader &&
    `
    margin: 12px 0 36px 0;
  `}

  /* Billing Address section specific styling */
  ${(props) =>
    props.$isBillingHeader &&
    `
    @media (max-width: 1200px) {
      margin-top: 24px;
    }
  `}
`;

export const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  position: fixed;
  left: 8px;
  top: 19px;
  cursor: pointer;
  color: rgb(16, 12, 8);
  padding: 8px;
  transition:
    opacity 0.2s,
    transform 0.2s;
  transform: rotate(45deg);
  z-index: 1000;
  letter-spacing: 0.8px;
  font-size: 20px;
  line-height: 24px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const CartProgressContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 28px;
  position: fixed;
  width: 100%;
  left: 0;
  z-index: 1000; // Keep it visually on top
  pointer-events: none; // Make entire container click-through by default
  letter-spacing: 0.8px;

  // Re-enable pointer events just for the actual progress elements
  & > div {
    pointer-events: auto;
  }

  @media (max-width: 600px) {
    position: fixed;
    right: 20px;
    left: auto;
    width: auto;
    justify-content: flex-end;
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
`;

export const CartPill = styled(motion.div)`
  background: #006efe;
  color: white;
  padding-top: 8px;
  padding-bottom: 2px;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 10px;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const CartText = styled.span`
  display: inline-block;
  transform: translateY(-2px);
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const StageContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border-radius: 10px;
  margin-left: 8px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const StageNumber = styled(motion.span)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #006efe;
  color: ${(props) => (props.active ? "white" : "#e0e0e0")};
  cursor: ${(props) => (props.clickable ? "pointer" : "default")};
  user-select: none;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  span {
    display: inline-block;
    transform: translateY(-1px);
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  [data-resetting="true"] & {
    display: none;
  }

  [data-resetting="true"] & + & {
    display: none;
  }

  ${(props) => {
    if (props.fieldName === "firstName") {
      return `
      margin-top: 16px;
        @media (max-width: 1200px) {
          margin-top: 16px;
        }
      `;
    }
    if (props.fieldName === "surname") {
      return `
      margin-top: 16px;
        @media (max-width: 1200px) {
          margin-top: 0px;
        }
      `;
    }
    if (props.fieldName === "email") {
      return `
        @media (max-width: 1200px) {
          margin-top: 8px;
        }
      `;
    }
    if (props.fieldName === "street") {
      return `
      margin-top: 16px;
        @media (max-width: 1200px) {
          margin-top: 16px;
        }
      `;
    }
    if (props.fieldName === "city") {
      return `
      margin-top: 16px;
      @media (max-width: 1200px) {
          margin-top: 0px;
        }
      `;
    }
    if (props.fieldName === "postcode") {
      return `
        @media (max-width: 1200px) {
          margin-top: 8px;
        }
      `;
    }
    if (props.fieldName === "contactEmail") {
      return `
        @media (max-width: 1200px) {
          margin-top: 8px;
        }
      `;
    }
    return "";
  }}
`;

export const FormRow = styled.div`
  display: grid;
  gap: 24px;
  margin-bottom: ${(props) => (props.isLast ? "0" : "24px")};
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 1199px) {
    grid-template-columns: 1fr;
    margin-bottom: ${(props) => (props.isLast ? "0" : "16px")};
  }
`;

export const HiddenSpacer = styled.div`
  @media (max-width: 1199px) {
    display: none;
  }
`;

export const PaymentFormContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 1199px) {
    grid-template-columns: 1fr 1fr;

    & > div:nth-child(3),
    & > div:nth-child(4) {
      grid-column: span 1;
    }

    & > div:nth-child(1),
    & > div:nth-child(2) {
      grid-column: span 2;
    }
  }
`;

export const FormLabel = styled.label`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  font-weight: normal;
  margin-top: -12px;
  margin-bottom: 6px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  [data-resetting="true"] & {
    text-decoration: none;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
  color: ${(props) =>
    props.$hasError ? "#FF0000" : "#006efe"}; // Default blue color
  background-color: white;
  border: 2px solid
    ${(props) => (props.$hasError ? "#FF0000" : "rgb(16, 12, 8)")};
  outline: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: Jant;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  &::placeholder {
    color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  }

  &:focus {
    color: ${(props) =>
      props.$hasError
        ? "#FF0000"
        : "rgb(16, 12, 8)"}; // Near black when typing/focused
  }

  &:disabled {
    cursor: default;
    color: #666;
    background-color: none;
    border-color: rgb(16, 12, 8);
    opacity: 0.7;

    &:hover {
      border-color: rgb(16, 12, 8);
    }
  }

  &:not(:disabled) {
    &:hover {
      border-color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    }

    &:focus {
      border-color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    }
  }

  /* Autofill styles */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: ${(props) =>
      props.$hasError ? "#FF0000" : "#006efe"} !important;
    border-color: ${(props) =>
      props.$hasError ? "#FF0000" : "rgb(16, 12, 8)"} !important;
  }

  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: ${(props) =>
      props.$hasError ? "#FF0000" : "rgb(16, 12, 8)"} !important;
    border-color: ${(props) =>
      props.$hasError ? "#FF0000" : "#006efe"} !important;
  }

  &:-webkit-autofill:hover {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: ${(props) =>
      props.$hasError ? "#FF0000" : "#006efe"} !important;
    border-color: ${(props) =>
      props.$hasError ? "#FF0000" : "#006efe"} !important;
  }
`;

export const PlaceholderText = styled.div`
  margin-top: 0px;
  margin-bottom: ${(props) => (props.$hasStyle ? "-24px" : "-3px")};
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: #666;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 768px) {
    margin-bottom: ${(props) => (props.$hasStyle ? "0px" : "-3px")};
  }
`;

export const Button = styled(motion.button)`
  width: 100%;
  padding: 10px 12px 8px 12px;
  background-color: rgb(16, 12, 8);
  border: 2px solid rgb(16, 12, 8);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  &:disabled {
    opacity: 1;
    cursor: default;
    background-color: #ccc;
    border: 2px solid #ccc;
    pointer-events: all !important;
  }
`;

export const RegisterButton = styled(motion.button)`
  width: 100%;
  padding: 10px 12px 8px 12px;
  margin-top: 6px;
  background-color: rgb(16, 12, 8);
  border: 2px solid rgb(16, 12, 8);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 1200px) {
    margin-top: 16px;
  }

  &:disabled {
    opacity: 1;
    cursor: default;
    background-color: #ccc;
    border: 2px solid #ccc;
    pointer-events: all !important;
  }
`;

export const OutlineButton = styled(Button)`
  background: none;
  color: rgb(16, 12, 8);

  &:hover:not(:disabled) {
    color: white;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: -2px;
  margin-bottom: 23px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const RadioLabel = styled(motion.label)`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  &:hover input {
    background-color: rgb(16, 12, 8);
  }
`;

export const RadioInput = styled(motion.input)`
  cursor: pointer;
  appearance: none;
  width: 24px;
  height: 24px;
  background-color: rgb(16, 12, 8);
  border: none;
  border-radius: 50%;
  position: relative;
  outline: none;

  &:checked {
    background-color: #006efe;
  }
`;

export const PackageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  letter-spacing: 0.8px;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 1199px) {
    grid-template-columns: 1fr;
  }

  /* Custom license specific layout */
  &[data-custom-license] {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 1199px) {
      grid-template-columns: 1fr;
    }
  }
`;

export const PackageCard = styled(motion.div)`
  padding: 20px;
  border: 2px solid
    ${(props) => (props.selected ? "#006efe" : "rgb(16, 12, 8)")};
  border-radius: 10px;
  cursor: pointer;
  letter-spacing: 0.8px;
  box-sizing: border-box;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const PackageTitle = styled.h4`
  margin: 0 0 24px 0;
  font-size: 20px;
  line-height: 24px;
  font-weight: normal;
  letter-spacing: 0.8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  span {
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }
`;

export const StyledPaymentElement = styled(PaymentElement)`
  .Input {
    border: 2px solid rgb(16, 12, 8) !important;
    border-radius: 10px !important;
    color: #006efe !important;
    font-family: "Jant", sans-serif !important;
    font-size: 20px !important;
    line-height: 24px !important;
    letter-spacing: 0.6px !important;
    padding: 10px 12px 8px 12px !important;
    box-shadow: none !important;
    transition: all 0.15s ease !important;
    background-color: white !important;

    @media (min-width: 1420px) {
      letter-spacing: 0.6px !important;
    }
  }

  .Label {
    font-size: 16px !important;
    line-height: 20px !important;
    letter-spacing: 0.6px !important;
    color: rgb(16, 12, 8) !important;
    text-decoration: underline !important;
    text-underline-offset: 3px !important;
    text-decoration-thickness: 2px !important;
    font-weight: normal !important;
    margin-top: -2px !important;
    margin-bottom: 4px !important;

    @media (min-width: 1420px) {
      letter-spacing: 0.6px !important;
    }
  }
`;

export const LicenseDetailContainer = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin-bottom: 12px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  > div {
    flex: 1;
  }
`;

export const SummarySection = styled(motion.div)`
  background-color: #f9f9f9;
  padding: 24px;
  border-radius: 10px;
  height: fit-content;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (min-width: 769px) {
    position: sticky;
    top: 86px;
    margin-top: 0;
    margin-bottom: 24px;
  }

  @media (max-width: 768px) {
    margin-top: 0;
    margin-bottom: ${(props) => (props.$showTotal ? "0" : "24px")};
  }
`;

export const SummaryItem = styled(motion.div)`
  margin-bottom: ${(props) => (props.isLastWithAddLink ? "0" : "24px")};
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  ${LicenseDetailContainer}:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 0px;

    ${LicenseDetailContainer}:last-child {
      margin-bottom: 12px;
    }
  }
`;

export const TotalPrice = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: normal;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  margin-bottom: 24px;

  span {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const LicenseDetail = styled.div`
  margin: 0px 0;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const CustomLicenseSection = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  letter-spacing: 0.8px;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 375px) {
    gap: 24px;
  }
`;

export const LicenseTypeGroup = styled.div`
  border: 2px solid rgb(16, 12, 8);
  border-radius: 8px;
  padding: 24px;
  letter-spacing: 0.8px;
  box-sizing: border-box;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const AdditionalLicensingSection = styled.div`
  margin-top: 24px;
  padding: 24px;
  margin-bottom: 24px;
  background: #f9f9f9;
  border-radius: 10px;
  text-align: left;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 768px) {
    margin-bottom: 0px;
  }
`;

export const LicenseTypeHeader = styled.h4`
  margin: 0 0 24px 0;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  font-weight: normal;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  font-weight: normal;
  color: rgb(16, 12, 8);

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const PaymentMethodContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

export const PaymentMethodButton = styled(motion.button)`
  flex: 1;
  padding: 10px 12px 8px 12px;
  border: 2px solid
    ${(props) => (props.selected ? "#006efe" : "rgb(16, 12, 8)")};
  background: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  margin-bottom: ${(props) => (props.selected ? "6px" : "-12px")};

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const PaymentConfirmation = styled.div`
  text-align: center;
  padding: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const PaymentConfirmationText = styled.div`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  margin-bottom: 12px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const PaymentConfirmationDetails = styled.div`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  color: #666;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const CardIconsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const TogglePasswordButton = styled(motion.button)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #006efe;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  padding: 0;
  outline: none;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  span:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
`;

export const FormDivider = styled.div`
  margin-top: ${(props) => (props.hasFixedTotal ? "32px" : "32px")};
  padding-top: 24px;
  border-top: 2px solid rgb(16, 12, 8);
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const LoginHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${(props) => (props.isExpanded ? "24px" : "12px")};
  transition: padding-bottom 0.2s ease;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const LoginSectionHeader = styled.h3`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  font-weight: normal;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  font-weight: normal;
  color: rgb(16, 12, 8);
  margin: 0;
  display: inline;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const LoginToggleButton = styled(motion.button)`
  background: none;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  border: none;
  color: rgb(16, 12, 8);
  text-decoration: none;
  font-weight: normal;
  cursor: pointer;
  padding: 0;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  span:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
`;

export const LoginFormContainer = styled(motion.div)`
  overflow: hidden;
  transform-origin: top;
  margin-bottom: 0px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (min-width: 1200px) {
    position: relative;
    grid-column: span 2;
  }

  > div {
    padding-top: 12px;
  }

  [data-resetting="true"] & > div:first-child {
    display: none;
  }
`;

export const LinkWrapper = styled.div`
  text-align: left;
  margin: 12px 0;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const ResetPasswordLink = styled(motion.button)`
  background: none;
  border: none;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  text-decoration: none;
  font-weight: normal;
  padding: 0;
  margin-top: 0px;
  margin-bottom: 6px;
  cursor: pointer;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  span:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }

  [data-resetting="true"] & {
    margin-bottom: 0;
  }
`;

export const LoginPasswordLabel = styled(FormLabel)`
  @media (max-width: 1200px) {
    margin-top: -12px;
  }

  [data-resetting="true"] & {
    text-decoration: none;
  }
`;

export const EulaContainer = styled.div`
  margin-top: -12px;
  margin-bottom: ${(props) => (props.$hasSelections ? "18px" : "18px")};
  display: flex;
  align-items: flex-start;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const EulaCheckboxWrapper = styled.div`
  flex-shrink: 0;
  width: 24px;
  margin-right: 12px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const EulaCheckbox = styled(RadioInput)`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const EulaLabel = styled.label`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  cursor: ${(props) => (!props.$selectedUsage ? "default" : "pointer")};
  padding-top: 2px;
  color: ${(props) => (!props.$selectedUsage ? "#999" : "rgb(16, 12, 8)")};

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const EulaLink = styled.a`
  color: ${(props) =>
    !props.$selectedUsage ? "#999" : "rgb(16, 12, 8)"} !important;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  font-weight: normal;
  cursor: ${(props) => (!props.$selectedUsage ? "default" : "pointer")};
  transition: all 0.2s ease;
  pointer-events: ${(props) => (!props.$selectedUsage ? "none" : "auto")};
  // Override global link styles
  background-image: none;
  padding-bottom: 0;
  position: static;
  background-size: 0;
  background-repeat: no-repeat;
  background-position: 0 0;

  &:hover {
    color: ${(props) =>
      !props.$selectedUsage ? "#999" : "#006efe"} !important;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
    font-weight: normal;
    // Override global hover styles
    background-size: 0;
  }
`;

export const ReachOutLink = styled.a`
  color: rgb(16, 12, 8);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  font-weight: normal;
cursor: pointer;
  transition: color 0.2s;
  font-size: 16px;
  line-height: 20px;
   letter-spacing: 0.6px
  // Override global link styles
  background-image: none;
  padding-bottom: 0;
  position: static;
  background-size: 0;
  background-repeat: no-repeat;
  background-position: 0 0;

  &:hover {
    color: #006efe;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
    font-weight: normal;
    // Override global hover styles
    background-size: 0;
  }
`;

export const ContentSpacer = styled.div`
  height: ${(props) => {
    if (!props.$selectedUsage) return "18px";
    return props.$selectedUsage === "personal" ? "162px" : "256px";
  }};

  @media (max-width: 1200px) {
    height: ${(props) => {
      if (!props.$selectedUsage) return "18px";
      return props.$selectedUsage === "personal" ? "256px" : "432px";
    }};
  }
`;

export const FormContainer = styled.div`
  position: relative;
  margin-top: -12px;
`;

export const AnimatedContent = styled(motion.div)`
  position: absolute;
  width: 100%;
  z-index: 1;
`;

export const SummaryWrapper = styled.div`
  @media (min-width: 769px) {
    position: sticky;
    top: 24px;
  }
`;

export const SummaryHeader = styled.div`
  margin-bottom: 24px;
`;

export const SummaryContentContainer = styled.div`
  @media (min-width: 769px) {
    margin-bottom: ${(props) => (props.$showTotal ? "0" : "24px")};
  }
`;

export const StyleDetail = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid rgb(16, 12, 8);
  font-size: 20px;
  line-height: 24px;
   letter-spacing: 0.6px
  color: rgb(16, 12, 8);
`;

export const PriceDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  font-weight: normal;
  color: rgb(16, 12, 8);

  span {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
`;

export const FixedTotalSection = styled.div`
  @media (min-width: 769px) {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px solid rgb(16, 12, 8);
  }

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px 30px;
    background: white;
    border-top: 2px solid rgb(16, 12, 8);
    z-index: 1000;
  }
`;

export const MobileTotalSection = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 769px) {
    display: none;
  }
`;

export const AddTypefacesButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: 2px solid rgb(16, 12, 8);
  border-radius: 10px;
  padding: 10px 12px 8px 12px;
  width: 100%;
  font-size: 16px;
  line-height: 26px;
   letter-spacing: 0.6px
  opacity: 0.5;
  cursor: default;
  transition: opacity 0.2s;
  margin-bottom: 0px;
  overflow: hidden;

  > div {
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  > div:first-child {
    flex-grow: 1;
    max-width: 60%;
  }

  > div:last-child {
    max-width: 40%;
    padding-left: 8px;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:disabled {
    opacity: 1;
cursor: default;
    background: none;
    opacity: 0.5;
    border: 2px solid rgb(16, 12, 8);
    pointer-events: all !important;
  }

  &:hover {
    opacity: 0.5;
  }
`;

export const CustomizeButton = styled(motion.button)`
  width: 100%;
  padding: 10px 12px 8px 12px;
  margin-top: 24px;
  background-color: rgb(16, 12, 8);
  border: 2px solid rgb(16, 12, 8);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  &:disabled {
    opacity: 1;
    cursor: default;
    background-color: #ccc;
    border: 2px solid #ccc;
    pointer-events: all !important;
  }
`;

export const UsageText = styled.span`
  position: relative;
  top: 2px;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.6px;
`;

export const RemoveLink = styled.button`
  background: none;
  border: none;
  color: rgb(16, 12, 8);
  cursor: pointer;
  font-family: "Jant", sans-serif;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  padding: 0px 0px;
  margin-left: 12px;
  margin-top: 2px;
  transition: text-decoration 0.2s;
  white-space: nowrap;
  overflow: visible;
  text-overflow: ellipsis;
  max-width: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  span:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
`;

export const AddLicenseLink = styled(motion.span)`
  display: block;
  color: rgb(16, 12, 8);
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  cursor: pointer;
  margin-top: 24px;
  background: none;
  border: none;
  padding: 0;
`;

// Animation Variants
export const overlayVariants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

// Main cart panel variants
export const cartPanelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: {
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
      when: "afterChildren",
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: { duration: 0.3, ease: "easeOut" },
      scale: { duration: 0.3, ease: "easeOut" },
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Content section variants
export const contentVariants = {
  hidden: {
    opacity: 0,
    y: 20,
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
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

// Stage transition variants
export const stageTransitionVariants = {
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.2,
      ease: "easeIn",
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Form elements variants
export const formElementVariants = {
  hidden: {
    opacity: 0,
    y: 15,
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
    y: -15,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const summaryContentVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const headerElementsVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.1,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3, // Match the dashboard delay
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// Stage 1 specific wrapper to ensure proper padding behavior
export const Stage1Container = styled.div`
  /* Inherit and ensure CartContent padding behavior */
  padding-left: 0;
  padding-right: 0;
  margin-left: 0;
  margin-right: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  /* Ensure content respects viewport boundaries */
  @media (max-width: 768px) {
    /* Match CartContent padding constraints */
    padding-left: 0;
    padding-right: 0;
    max-width: calc(
      100vw - 40px
    ); /* Account for CartContent's 20px left + 20px right */
  }

  @media (max-width: 375px) {
    /* Extra constraint for very narrow widths */
    max-width: calc(100vw - 40px);
    overflow: hidden;
  }
`;

// Motion Variants
export const optionCardVariants = {
  initial: {
    borderColor: "rgb(16, 12, 8)",
  },
  hover: {
    borderColor: "#006efe",
    transition: { duration: 0.2 },
  },
  selected: {
    borderColor: "#006efe",
  },
};

export const stageNumberVariants = {
  initial: {
    backgroundColor: "#006efe",
  },
  hover: (props) => ({
    backgroundColor: props.clickable
      ? "rgb(16, 12, 8)"
      : props.active
        ? "rgb(16, 12, 8)"
        : "rgb(16, 12, 8)",
    transition: { duration: 0.2 },
  }),
};

export const buttonVariants = {
  initial: {
    backgroundColor: "rgb(16, 12, 8)",
    borderColor: "rgb(16, 12, 8)",
    color: "white",
    opacity: 1,
  },
  disabled: {
    backgroundColor: "rgb(16, 12, 8)",
    borderColor: "rgb(16, 12, 8)",
    color: "white",
    opacity: 0.5,
    transition: { duration: 0.2 },
  },
  enabled: {
    backgroundColor: "rgb(16, 12, 8)",
    borderColor: "rgb(16, 12, 8)",
    color: "white",
    opacity: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    backgroundColor: "#006efe",
    borderColor: "#006efe",
    color: "white",
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

export const radioInputVariants = {
  initial: {
    backgroundColor: "rgb(16, 12, 8, 0.5)",
    opacity: 1,
    scale: 1,
  },
  hover: {
    backgroundColor: "rgb(16, 12, 8)",
    scale: 1,
    transition: { duration: 0.2 },
  },
  checked: {
    backgroundColor: "#006efe",
    scale: 1,
    transition: { duration: 0.2 },
  },
  checkedHover: {
    backgroundColor: "#006efe",
    scale: 1,
    transition: { duration: 0.2 },
  },
};

export const packageCardVariants = {
  initial: {
    borderColor: "rgb(16, 12, 8)",
  },
  hover: {
    borderColor: "#006efe",
    transition: { duration: 0.2 },
  },
  selected: {
    borderColor: "#006efe",
  },
};

export const paymentMethodButtonVariants = {
  initial: {
    borderColor: "rgb(16, 12, 8)",
  },
  hover: {
    borderColor: "#006efe",
    transition: { duration: 0.2 },
  },
  selected: {
    borderColor: "#006efe",
  },
};

export const togglePasswordVariants = {
  initial: {
    textDecoration: "none",
  },
  hover: {
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    textDecorationThickness: "2px",
    transition: { duration: 0.2 },
  },
};

export const loginToggleVariants = {
  initial: {
    color: "rgb(16, 12, 8)",
  },
  hover: {
    color: "#006efe",
    transition: { duration: 0.2 },
  },
};

export const customizeButtonVariants = {
  initial: {
    backgroundColor: "transparent",
    borderColor: "rgb(16, 12, 8)",
    color: "rgb(16, 12, 8)",
  },
  hover: {
    backgroundColor: "#006efe",
    borderColor: "#006efe",
    color: "white",
    transition: { duration: 0.2 },
  },
};

export const addLicenseLinkVariants = {
  initial: {
    color: "rgb(16, 12, 8)",
  },
  hover: {
    color: "#006efe",
    transition: { duration: 0.2 },
  },
};

export const resetPasswordLinkVariants = {
  initial: {
    color: "rgb(16, 12, 8)",
  },
  hover: {
    color: "#006efe",
    transition: { duration: 0.2 },
  },
};

export const radioLabelVariants = {
  initial: {
    color: "rgb(16, 12, 8)",
  },
  hover: {
    color: "rgb(16, 12, 8)",
    transition: { duration: 0.2 },
  },
};

export const eulaCheckboxVariants = {
  initial: {
    backgroundColor: "rgb(16, 12, 8, 0.5)",
    opacity: 1,
    scale: 1,
  },
  hover: {
    backgroundColor: "rgb(16, 12, 8)",
    scale: 1,
    transition: { duration: 0.2 },
  },
  checked: {
    backgroundColor: "#006efe",
    scale: 1,
    transition: { duration: 0.2 },
  },
  checkedHover: {
    backgroundColor: "#006efe",
    scale: 1,
    transition: { duration: 0.2 },
  },
};

export const dashboardCheckboxVariants = {
  initial: (props) => ({
    backgroundColor: props.isEditMode ? "rgba(255, 255, 255, 0.5)" : "#006efe",
    borderColor: props.isEditMode ? "rgb(169, 169, 169)" : "#006efe",
    opacity: props.isEditMode ? 1 : 0.5,
    scale: 1,
  }),
  hover: (props) => ({
    backgroundColor: props.isEditMode ? "rgb(16, 12, 8)" : "#006efe",
    borderColor: props.isEditMode ? "rgb(16, 12, 8)" : "#006efe",
    opacity: props.isEditMode ? 1 : 0.5,
    scale: props.isEditMode ? 1 : 1,
    transition: { duration: 0.2 },
  }),
  checked: (props) => ({
    backgroundColor: "#006efe",
    borderColor: "#006efe",
    opacity: props.isEditMode ? 1 : 0.5,
    scale: 1,
    transition: { duration: 0.2 },
  }),
  checkedHover: (props) => ({
    backgroundColor: props.isEditMode ? "#0056cc" : "#006efe",
    borderColor: props.isEditMode ? "#0056cc" : "#006efe",
    opacity: props.isEditMode ? 1 : 0.5,
    scale: props.isEditMode ? 1 : 1,
    transition: { duration: 0.2 },
  }),
};
