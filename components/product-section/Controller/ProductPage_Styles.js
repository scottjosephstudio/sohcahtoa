import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";

// Cross-browser text decoration mixins
const textDecorationMixin = `
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  -webkit-text-decoration: underline;
  -webkit-text-decoration-thickness: 2px;
  -webkit-text-underline-offset: 3px;
  
  /* Safari-specific fixes for consistent underline thickness */
  @supports (-webkit-touch-callout: none) {
    -webkit-text-decoration-line: underline;
    -webkit-text-decoration-color: currentColor;
    -webkit-text-decoration-style: solid;
    text-decoration-color: currentColor;
    text-decoration-style: solid;
  }
`;

const textDecorationMixin4px = `
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  -webkit-text-decoration: underline;
  -webkit-text-decoration-thickness: 2px;
  -webkit-text-underline-offset: 3px;
  
  /* Safari-specific fixes for consistent underline thickness */
  @supports (-webkit-touch-callout: none) {
    -webkit-text-decoration-line: underline;
    -webkit-text-decoration-color: currentColor;
    -webkit-text-decoration-style: solid;
    text-decoration-color: currentColor;
    text-decoration-style: solid;
  }
`;

const textDecorationNone = `
  text-decoration: none;
  -webkit-text-decoration: none;
`;

// Font normalization mixin for consistent rendering across devices
const fontNormalization = `
  font-family: 'Jant', sans-serif;
  font-weight: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
`;

// Base styles
export const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-x: hidden;
  background-color: #f9f9f9;
`;

export const PortalContainer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 45; // Below modals (60-65) but above tabs/content
`;

export const typographyBase = `
font-family: 'Jant', sans-serif;
  font-size: 20px;
  line-height: 24px !important;
  letter-spacing: 0.8px;
`;

// Dashboard Components
export const UserDashboard = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 100%;
  height: 100vh;
  background: #e0e0e0; // Changed to match cart
  z-index: 65;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    /* Use dynamic viewport units that account for browser UI */
    height: 100dvh; /* Dynamic viewport height - adjusts for address bar */
    width: 100dvw; /* Dynamic viewport width */
    min-height: 100svh; /* Small viewport height - minimum space */
    max-height: 100lvh; /* Large viewport height - maximum space */

    /* Prevent both Chrome and Safari from adjusting text size */
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  /* Safari-specific fixes for all screen sizes */
  @supports (-webkit-touch-callout: none) {
    @media (max-width: 768px) {
      /* Safari mobile specific adjustments */
      -webkit-text-size-adjust: 100%;
      /* Ensure proper Safari mobile rendering */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      /* Safari viewport handling */
      height: 100dvh;
      min-height: -webkit-fill-available;
    }
  }
`;

export const DashboardContent = styled.div`
  position: relative;
  height: 100%;
  overflow-y: auto;
  background: #e0e0e0; // Changed to match cart

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    /* Use dynamic height that accounts for browser UI */
    height: 100%;
    max-height: calc(
      100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
    );
    overflow-y: scroll; /* Force scroll in Chrome */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    /* Ensure proper touch handling in Chrome */
    touch-action: pan-y;

    /* Prevent Chrome from adjusting text size */
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

  /* Safari-specific text rendering fixes */
  @supports (-webkit-touch-callout: none) {
    @media (max-width: 768px) {
      /* Safari mobile scrolling optimization */
      -webkit-overflow-scrolling: touch;
      /* Account for Safari UI elements */
      height: -webkit-fill-available;
      max-height: calc(
        100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
      );

      /* Safari text rendering consistency */
      * {
        -webkit-text-size-adjust: 100% !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
    }
  }
`;

export const ContentWrapper = styled.div`
  padding: 112px 20px 24px 20px;
`;

export const DashboardHeader = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: none;
  padding-top: 34px;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start; // Changed from center
  min-height: 100px; // Ensures consistent space for wrapped text
`;

export const ModalHeader = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
`;

export const DashboardGrid = styled(motion.div)`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 0 auto;
  margin-top: -26px;
  margin-bottom: -24px;
  align-items: start;

  @media (min-width: 1200px) {
    grid-template-columns: 2fr 1fr;
  }

  @media (max-width: 768px) {
    width: 100%;
    grid-template-columns: 1fr;
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
  margin-bottom: ${(props) => (props.isLast ? "0" : "24px")};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    margin-bottom: ${(props) => (props.isLast ? "0" : "16px")};
  }
`;

export const ModalTitleContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px; // Accommodates two lines of text
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

export const ModalTitleUserDashboard = styled.span`
  ${typographyBase}
  ${textDecorationMixin}
  color: rgb(16, 12, 8);
  margin: 0;
  text-align: center;
  max-width: 80%; // Prevents text from getting too close to buttons
`;

export const CloseButton = styled(motion.button)`
  ${fontNormalization}
  background: none;
  border: none;
  position: fixed;
  left: 8px;
  top: 12px;
  font-size: 64px;
  cursor: pointer;
  color: rgb(16, 12, 8);
  padding: 8px;
  transition:
    opacity 0.2s,
    transform 0.2s;
  transform: rotate(45deg);
  z-index: 1000;
`;

export const LogoutButton = styled(motion.button)`
  ${fontNormalization}
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: rgb(16, 12, 8);
  white-space: nowrap;
  overflow: visible;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;

  &:hover {
    text-shadow:
      -1px -1px 0 #e0e0e0,
      1px -1px 0 #e0e0e0,
      -1px 1px 0 #e0e0e0,
      1px 1px 0 #e0e0e0,
      -2px 0 0 #e0e0e0,
      2px 0 0 #e0e0e0,
      0 -2px 0 #e0e0e0,
      0 2px 0 #e0e0e0;
  }
`;

export const Section = styled(motion.div)`
  background-color: #f9f9f9;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;

  @media (max-width: 768px) {
    &:first-child {
      margin-top: -24px; /* Margin-top for screens <= 768px */
    }
  }
`;

export const UserInfoSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  gap: 24px;
`;

export const ListItem = styled.div`
  ${typographyBase}
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;

  &:not(:last-child) {
    margin-top: 24px;
    border-top: 2px solid rgb(16, 12, 8);
    border-bottom: 0px solid rgb(16, 12, 8);
  }
`;

export const PriceText = styled.span`
  color: rgb(16, 12, 8);
`;

export const DownloadButton = styled(motion.button)`
  ${fontNormalization}
  color: #006efe;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  transform: none;
`;

export const StyledHR = styled.hr`
  border: none;
  border-top: 2px solid rgb(16, 12, 8);
  margin: 0px 0;
  margin-bottom: 9px; /* Add margin-bottom here */
`;

export const InputDashboard = styled(motion.input)`
  width: 100%;
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
  color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  background-color: white;
  border: 2px solid
    ${(props) => (props.$hasError ? "#FF0000" : "rgb(16, 12, 8)")};
  outline: none;
  cursor: pointer;
  font-family: Jant;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;

  &::placeholder {
    color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  }

  &:focus {
    color: ${(props) => (props.$hasError ? "#FF0000" : "rgb(16, 12, 8)")};
  }

  &:disabled {
    cursor: default;
    color: #006efe;
    background-color: white;
    border-color: rgb(16, 12, 8);
    opacity: 0.7;

    &:hover {
      border-color: rgb(16, 12, 8);
    }
  }

  &:not(:disabled) {
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

export const SectionTitle = styled.span`
  ${typographyBase}
  margin-bottom: 100px;
  ${textDecorationMixin}
`;

export const SectionTitleBilling = styled.span`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  ${textDecorationMixin}
  font-weight: normal;
  margin: 0 0 24px 0;
  color: rgb(16, 12, 8);

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }


`;

export const AddressSection = styled.div`
  margin-top: 0px;
  position: relative;
  isolation: isolate;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }

  @media (max-width: 1200px) {
    & > h3 {
      margin-top: 24px;
    }
  }
`;

export const NewsletterSection = styled.div`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.6px;
  margin-top: -20px;
  margin-bottom: -6px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 1024px) {
    margin-top: -20px;
    margin-bottom: -6px;
  }

    @media (min-width: 1200px) {
    margin-top: -30px;
    margin-bottom: -6px;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  &:has(input:disabled) {
    cursor: normal;
    opacity: 0.7;
    pointer-events: all !important;
  }
`;

export const CheckboxText = styled.span`
  margin-top: 0px;
`;

export const Checkbox = styled(motion.input)`
  appearance: none;
  width: 24px;
  height: 24px;
  margin-top: -3px;
  cursor: pointer;
  background-color: rgb(16, 12, 8);
  border-radius: 5px;

  &:has(input:disabled) {
    cursor: normal;
    opacity: 0.7;
    pointer-events: all !important;
  }

  &:disabled {
    opacity: 1;
    cursor: normal;
    background-color: rgb(16, 12, 8);
    pointer-events: all !important;

    &:hover {
      cursor: normal;
      background-color: rgb(16, 12, 8);
    }

    &:checked {
      background-color: #006efe;
      opacity: 0.5;
    }
  }
`;

export const SaveButton = styled(motion.button)`
  ${fontNormalization}
  ${typographyBase}
  padding: 10px 12px 8px 12px;
  background-color: rgb(16, 12, 8);
  border: 2px solid rgb(16, 12, 8);
  color: #f9f9f9;
  border-radius: 10px;
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};
  margin-top: 24px; /* Add margin-top to create space */
`;

// Animation variants for the dashboard
export const dashboardVariants = {
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

export const formContentVariants = {
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      type: "tween",
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export const headerElementsVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export const loginPanelVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      type: "tween", // Changed to tween for smoother exit
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

// Cart Components
export const CartContainer = styled(motion.div)`
  position: fixed;
  top: 28px;
  right: 20px;
  z-index: 45;
`;

export const CartCountContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const CartCount = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background-color: rgb(16, 12, 8);
  color: #f9f9f9;
  border-radius: 10px;
  z-index: 5001;
  font-size: 24px;
  cursor: pointer;
  ${textDecorationNone}

  span {
    margin-top: -2px; /* Shift number up slightly */
    margin-left: -1px; /* Shift number left by 1px */
  }
`;

export const CartDetails = styled(motion.div)`
  position: absolute;
  background: rgba(145, 145, 145, 0.4);
  padding: 16px;
  border-radius: 10px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(16, 12, 8, 0.3);
  min-width: fit-content;
  max-width: 400px;
  width: max-content;
  z-index: 50;
  transform-origin: var(--transform-origin);
  transition:
    left 0.2s ease,
    top 0.3s ease;

  // CSS custom properties for dynamic values
  --transform-origin: top right;
  --right: 48px;
  --top: calc(100%);

  right: var(--right);
  top: var(--top);

  @media (min-width: 1024px) {
    --right: 50px;
    --top: 0;
  }

  @media (max-width: 1024px) {
    --transform-origin: top right;
    --right: 0;
    --top: calc(100% + 16px);
    transition:
      right 0.2s ease,
      bottom 0.3s ease;
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

export const CartContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
`;

export const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0; /* Allow text to wrap if needed */
`;

export const ProductName = styled.div`
  font-size: 16px;
  ${textDecorationMixin4px}
  margin-bottom: 0px;
  line-height: 1;
`;

export const ProductPrice = styled.div`
  color: rgb(16, 12, 8);
  font-size: 16px;
  line-height: 1;
`;

export const RemoveButton = styled(motion.button)`
  ${fontNormalization}
  background: none;
  border: none;
  color: rgb(16, 12, 8);
  cursor: normal;
  padding: 0;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  text-align: left;
  width: fit-content;
  font-family: "Jant", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  span:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
`;

export const MobileRemoveButton = styled(motion.button)`
  ${fontNormalization}
  display: none;
  background: none;
  border: none;
  color: rgb(16, 12, 8);
  cursor: pointer;
  position: absolute;
  top: 42px;
  right: 0px;
  transform: rotate(45deg);
  padding: 0px;

  @media (max-width: 600px) {
    display: block;
  }
`;

// Animation variants for consistent behavior
export const mobileButtonVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 0.2,
      bounce: 0.2,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const GoToCartButton = styled(motion.button)`
  ${fontNormalization}
  padding: 10px 12px 8px 12px;
  background-color: rgb(16, 12, 8);
  border: 2px solid rgb(16, 12, 8);
  color: #f9f9f9;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
`;

// Login Components
export const LoginContainer = styled(motion.div)`
  position: fixed;
  top: 34px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 0;

  @media (max-width: 768px) {
    left: ${(props) => (props.$isTypefaces ? "50%" : "20px")};
    transform: ${(props) => (props.$isTypefaces ? "translateX(-50%)" : "none")};
  }
`;

export const LoginButtonStyled = styled(motion.button)`
  ${fontNormalization}
  background: none;
  position: fixed;
  left: 0px;
  margin-top: 0px;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: rgb(16, 12, 8);
  margin-left: auto;
  white-space: nowrap;
  overflow: visible;
  position: relative;
`;

export const LoginModal = styled(motion.div)`
  position: fixed;
  padding-left: 20px;
  padding-right: 20px;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 910; /* Higher than overlay (900) and body pseudo-elements (889) */
`;

// Add or update this in your ProductPage_Styles.js

export const LoginModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 900; /* Increased to be above body pseudo-elements (z-index: 889) */
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: auto !important; /* Force this to be always active */

  /* Prevent mobile layout shifts and scrolling issues */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  /* Ensure fixed positioning on mobile */
  @media (max-width: 768px) {
    position: fixed;
    width: 100vw;
    height: 100vh;
    height: 100dvh; /* Use dynamic viewport height on mobile */
    overflow: hidden;
  }

  .slot-machine-container {
    backdrop-filter: blur(0) !important;
    -webkit-backdrop-filter: blur(0) !important;
  }
`;

// Login Panel Components
export const SimpleLoginPanel = styled(motion.div)`
  background: rgb(16, 12, 8);
  color: #f9f9f9;
  border-radius: 16px;
  width: 100%;
  max-width: 380px;
  max-height: 70.25vh;
  padding: 30px;
  margin: 0px;
  box-shadow: 10px 10px 15px rgba(0, 0, 0, 0.8);
  pointer-events: auto;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  transition: height 0.3s ease;
  position: relative; // Add this to ensure proper z-index stacking
  z-index: 920; // Highest z-index to be above everything

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DashboardModalHeader = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
`;

export const ModalTitleLogin = styled.span`
  ${typographyBase}
  ${textDecorationMixin}
  color: #f9f9f9;
  margin-top: -6px;
  margin-bottom: 20px;
`;

export const LoginSubmitButton = styled.button`
  ${fontNormalization}
  ${typographyBase}
  width: 100%;
  padding: 10px 12px 8px 12px;
  border: 2px solid #006efe;
  color: #f9f9f9;
  background-color: #006efe;
  border-radius: 10px;
  margin-top: 6px;
  cursor: pointer;
  margin-bottom: 0px;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background-color: rgb(16, 12, 8);
    border: 2px solid #006efe;
    color: #f9f9f9;
    cursor: pointer;
  }
`;

export const ResetPasswordLink = styled(motion.button)`
  ${fontNormalization}
  background: none;
  border: none;
  color: #f9f9f9;
  cursor: pointer;
  margin-top: 6px;
  font-size: 16px;
  letter-spacing: 0.8px;
  line-height: 20px;
  width: 100%;
  text-align: center;
  ${textDecorationNone}
`;

export const glowing = keyframes`
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 300% 0;
  }
  100% {
    background-position: 0 0;
  }
`;

export const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 30px 10px rgba(255, 255, 255, 0), inset 0 0 10px rgba(255, 255, 255, 0.4);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0), inset 0 0 20px rgba(255, 255, 255, 0.2);
  }
`;

export const SuccessMessage = styled(motion.div)`
  color: #fff;
  background-color: rgba(120, 120, 120, 0.2);
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
  margin-top: 6px;
  text-align: center;
  font-size: 20px;
  letter-spacing: 0.8px;
  line-height: 20px;
  position: relative;
  text-shadow: 0 0 0px rgba(255, 255, 255, 0.5);
  animation: ${pulse} 1.5s infinite;
  opacity: 0; /* Start with opacity 0 */
  animation-delay: 0.5s; /* Delay the text appearance */
  animation-fill-mode: forwards; /* Ensure the animation stays in the final state */

  &::before {
    content: "";
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    border-radius: 10px;
    background: linear-gradient(
      45deg,
      #a0a0a0,
      #ffffff,
      #707070,
      #ffffff,
      #a0a0a0,
      #ffffff
    );
    background-size: 300%;
    z-index: -1;
    animation: ${glowing} 3s linear infinite;
    filter: brightness(1);
  }

  &.animate {
    opacity: 1; /* Fade in the text */
    transition: opacity 0.5s ease-in; /* Smooth transition for opacity */
  }
`;

// Form Components
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
  gap: 8px;

  &.email-group {
    margin-top: -12px;
    margin-bottom: -24px;
    
    @media (max-width: 1200px) {
      margin-top: -12px;
      margin-bottom: -16px
    }
  }

  &.password-group {
    margin-top: -8px;
    margin-bottom: -24px;
    
    @media (max-width: 1200px) {
      margin-top: 24px;
      margin-bottom: -16px;
    }
  }

  &.street-address-group {
    margin-top: 40px;
    
    @media (max-width: 1200px) {
      margin-top: 40px;
    }
}
    &.city-address-group {
    margin-top: 40px;
   
    @media (max-width: 1200px) {
      margin-top: 0px;
    }
  }  &.postcode-group {
    margin-top: 0px;
   
    @media (max-width: 1200px) {
      margin-top: 8px;
   }

  &.country-group {
    margin-top: 0px;
   
    @media (max-width: 1200px) {
      margin-top: 16px;
    }
  }
`;

// Add it here
export const InputWrapper = styled.div`
  position: relative;
  isolation: isolate;
  z-index: 1;
`;

export const Label = styled.label`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  ${textDecorationMixin}
  color: #f9f9f9;
  margin-top: 6px;
  margin-bottom: 16px;
`;

export const DashboardLabel = styled.label`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  ${textDecorationMixin4px}
  margin-top: -12px;
  margin-bottom: 6px;

  @media (min-width: 1420px) {
    letter-spacing: 0.8px;
  }
`;

export const Input = styled.input`
  ${typographyBase}
  width: 100%;
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
  margin-bottom: 0px;
  color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  background-color: #f9f9f9;
  border: 2px solid ${(props) => (props.$hasError ? "#FF0000" : "#f9f9f9;")};
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
  position: relative;
  z-index: ${(props) => (props.$hasError ? "502" : "1")};

  @media (min-width: 1420px) {
    ${typographyBase}
  }

  &::placeholder {
    color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    transition: color 0.2s ease;
  }

  &:hover {
    color: #f9f9f9;
    background-color: rgb(16, 12, 8);
    border: 2px solid ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    cursor: pointer;
  }

  &:hover::placeholder {
    color: #f9f9f9;
  }

  &:-webkit-autofill {
    font-family: "Jant";
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: ${(props) =>
      props.$hasError ? "#FF0000" : "#006efe"};
    -webkit-box-shadow: 0 0 0px 1000px #f9f9f9 inset;
    transition:
      background-color 0s 600000s,
      color 0.2s ease;
  }

  &:-webkit-autofill:hover {
    -webkit-text-fill-color: #f9f9f9;
    -webkit-box-shadow: 0 0 0px 1000px rgb(16, 12, 8) inset;
  }

  &:focus {
    color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    border: 2px solid ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  }
`;

export const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const TogglePasswordButton = styled(motion.button)`
  ${fontNormalization}
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${(props) => (props.disabled ? "rgba(0, 110, 254, 0.7)" : "#006efe")};
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  font-size: 20px;
  letter-spacing: 0.8px;
  line-height: 24px;
  padding: 0;
  z-index: 501;
  pointer-events: ${(props) => (props.disabled ? "all" : "auto")};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};

  &:disabled {
    &:hover {
      color: rgba(0, 110, 254, 0.7);
      cursor: normal;
    }
  }
`;

// Add to Cart Components
export const AddToCartContainer = styled(motion.div)`
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  z-index: 45;
`;

export const AddToCartButton = styled(motion.button)`
  ${fontNormalization}
  ${typographyBase}
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
  margin-bottom: -4px;
  background-color: rgb(16, 12, 8);
  color: #f9f9f9;
  border: 2px solid rgb(16, 12, 8);
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  /* Ensure consistent height regardless of content */
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Target the span that wraps the content */
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  /* Icon sizing - different scales for different icons */
  svg {
    flex-shrink: 0;
    display: block;
  }

  /* Plus icon - needs to be smaller to fit properly */
  svg#a {
    width: 22px;
    height: 18px;
  }

  /* Eye icon - can be larger */
  svg:not(#a) {
    width: 28px;
    height: 22px;
  }

  @media (min-width: 1420px) {
    ${typographyBase}
  }

  @media (max-width: 768px) {
    /* Maintain same min-height for mobile */
    min-height: 44px;
    min-width: 44px; /* Make it square for icon-only state */
  }
`;

// Animation Variants
export const cartCountVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", duration: 0.2, bounce: 0.2 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const cartDetailsVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
  visible: {
    scale: 1,
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export const buttonVariants = {
  hover: {
    y: 0,
    transition: { duration: 0.2 },
  },
  tap: {
    y: 0,
    transition: { duration: 0.2 },
  },
  initial: {
    y: 0,
  },
};

export const hoverButtonVariants = {
  initial: {
    backgroundColor: "rgb(16, 12, 8)",
    borderColor: "rgb(16, 12, 8)",
    color: "#f9f9f9",
  },
  hover: {
    backgroundColor: "#006efe",
    borderColor: "#006efe",
    color: "#f9f9f9",
    transition: { duration: 0.2 },
  },
  tap: {
    backgroundColor: "#006efe",
    borderColor: "#006efe",
    color: "#f9f9f9",
    transition: { duration: 0.2 },
  },
};

export const removeButtonVariants = {
  initial: {
    color: "rgb(16, 12, 8)",
  },
  hover: {
    color: "rgb(16, 12, 8)",
    transition: { duration: 0.2 },
  },
};

export const loginButtonVariants = {
  initial: {
    color: "rgb(16, 12, 8)",
    textDecoration: "none",
    textDecorationThickness: "0px",
    textUnderlineOffset: "0px",
  },
  hover: {
    color: "rgb(16, 12, 8)",
    textDecoration: "underline",
    textDecorationThickness: "2px",
    textUnderlineOffset: "3px",
    transition: { duration: 0.2 },
  },
};

export const mobileRemoveButtonVariants = {
  initial: {
    color: "rgb(16, 12, 8)",
  },
  hover: {
    color: "#006efe",
    transition: { duration: 0.2 },
  },
  tap: {
    color: "#006efe",
    transition: { duration: 0.2 },
  },
};

export const downloadButtonVariants = {
  initial: {
    color: "#006efe",
    textDecoration: "none",
    textDecorationThickness: "0px",
    textUnderlineOffset: "0px",
  },
  hover: {
    color: "#006efe",
    textDecoration: "underline",
    textDecorationThickness: "2px",
    textUnderlineOffset: "3px",
    transition: { duration: 0.2 },
  },
};

export const checkboxVariants = {
  initial: {
    backgroundColor: "#ccc",
  },
  hover: {
    backgroundColor: "#ccc",
    transition: { duration: 0.2 },
  },
  checked: {
    backgroundColor: "#006efe",
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
    scale: props.isEditMode ? 1.05 : 1,
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
    scale: props.isEditMode ? 1.05 : 1,
    transition: { duration: 0.2 },
  }),
};

export const inputVariants = {
  initial: {
    borderColor: "rgb(16, 12, 8)",
  },
  hover: {
    borderColor: "#006efe",
    transition: { duration: 0.2 },
  },
  focus: {
    borderColor: "#006efe",
    transition: { duration: 0.2 },
  },
};

export const togglePasswordVariants = {
  initial: {
    color: "#006efe",
  },
  hover: {
    color: "rgb(16, 12, 8)",
    transition: { duration: 0.2 },
  },
};

export const saveButtonVariants = {
  initial: {
    backgroundColor: "rgb(16, 12, 8)",
    borderColor: "rgb(16, 12, 8)",
  },
  hover: {
    backgroundColor: "#006efe",
    borderColor: "#006efe",
    transition: { duration: 0.2 },
  },
  disabled: {
    backgroundColor: "rgb(16, 12, 8)",
    borderColor: "rgb(16, 12, 8)",
    transition: { duration: 0.2 },
  },
};

export const cartCountHoverVariants = {
  initial: {
    backgroundColor: "rgb(16, 12, 8)",
    color: "#f9f9f9",
  },
  hover: {
    backgroundColor: "#006efe",
    color: "#f9f9f9",
    transition: { duration: 0.2 },
  },
};

export const svgIconVariants = {
  initial: (props) => ({
    fill: props.$isTypefacePath ? "rgb(16, 12, 8)" : "#39ff14",
    color: props.$isTypefacePath ? "rgb(16, 12, 8)" : "#39ff14",
  }),
  hover: (props) => ({
    fill: props.$isTypefacePath ? "#006efe" : "rgb(169, 169, 169)",
    color: props.$isTypefacePath ? "#006efe" : "rgb(169, 169, 169)",
    transition: { duration: 0.2 },
  }),
};

export const logoutButtonVariants = {
  initial: {
    color: "rgb(16, 12, 8)",
    textDecoration: "none",
    textDecorationThickness: "0px",
    textUnderlineOffset: "0px",
  },
  hover: {
    color: "rgb(16, 12, 8)",
    textDecoration: "underline",
    textDecorationThickness: "2px",
    textUnderlineOffset: "3px",
    transition: { duration: 0.2 },
  },
};

export const resetPasswordLinkVariants = {
  initial: {
    color: "#f9f9f9",
    textDecoration: "none",
    textDecorationThickness: "0px",
    textUnderlineOffset: "0px",
  },
  hover: {
    color: "#f9f9f9",
    textDecoration: "underline",
    textDecorationThickness: "2px",
    textUnderlineOffset: "3px",
    transition: { duration: 0.2 },
  },
};
