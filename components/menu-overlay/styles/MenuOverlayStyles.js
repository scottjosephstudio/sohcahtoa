import styled from "styled-components";
import { motion } from "framer-motion";

export const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 90;
  will-change: opacity, visibility;

  /* Safari fallback for backdrop-filter */
  @supports not (backdrop-filter: blur(6px)) {
    background-color: rgba(0, 0, 0, 0.6);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(16, 12, 8);
  z-index: 990;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 109px 24px 24px 24px;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
  scroll-behavior: smooth;

  /* Prevent iOS text size adjustment on orientation change */
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;

  /* Create blur mask effects */
  &::before,
  &::after {
    content: "";
    position: fixed;
    left: 0;
    width: 100%;
    height: 20px; /* Adjust blur zone height */
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 991;
    pointer-events: none;

    /* Gradient mask to blend the blur */
    mask: linear-gradient(to bottom, transparent 0%, black 50%, black 100%);
    -webkit-mask: linear-gradient(
      to bottom,
      transparent 0%,
      black 50%,
      black 100%
    );
  }

  /* Top blur mask */
  &::before {
    top: 0px; /* Align with your padding-top */
    background: rgba(16, 12, 8, 0.5);
    mask: linear-gradient(to bottom, black 0%, black 50%, transparent 100%);
    -webkit-mask: linear-gradient(
      to bottom,
      black 0%,
      black 50%,
      transparent 100%
    );
  }

  /* Bottom blur mask */
  &::after {
    bottom: 0px; /* Align with your padding-bottom */
    background: rgba(16, 12, 8, 0.5);
    mask: linear-gradient(to top, black 0%, black 50%, transparent 100%);
    -webkit-mask: linear-gradient(
      to top,
      black 0%,
      black 50%,
      transparent 100%
    );
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

export const StudioName = styled(motion.div)`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: white;
  margin-bottom: 24px;
  display: block;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  text-decoration-color: #39ff14 !important;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
`;

export const SectionContainer = styled(motion.div)`
  margin-bottom: 12px;
`;

export const SectionTitle = styled.div`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: white;
  margin-bottom: 12px;
  display: block;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  text-decoration-color: #39ff14 !important;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;

  /* Apply negative top margin to all SectionTitles except in the first SectionContainer */
  ${SectionContainer}:not(:first-child) > & {
    margin-top: -12px;
  }
`;

export const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0px;
  column-gap: 20px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
`;

export const MenuItem = styled.div`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  position: relative;
  color: white;
  display: inline-block;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;

  /* Better Safari touch handling */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  a:hover {
    text-decoration: underline !important;
    text-decoration-color: #39ff14 !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px;
  }

  /* Enhanced touch feedback for Safari */
  a:active {
    opacity: 0.8;
    transition: opacity 0.1s ease;
  }

  &.break-before-see,
  &.break-before-speak {
    @media (max-width: 480px) {
      word-break: break-word;
    }
  }
`;

export const Divider = styled(motion.hr)`
  border: none;
  height: 2px;
  background-color: white;
  margin: 6px 0 18px 0;
`;

export const AboutContent = styled(motion.div)`
  column-count: 2;
  column-gap: 20px;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: white;
  margin-bottom: 12px;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;

  p {
    margin: 0 0 12px 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 600px) {
    column-count: 1;
  }
`;

export const ClientsGrid = styled(motion.div)`
  column-count: 3;
  column-gap: 12px;
  gap: 20px;
  margin-bottom: 12px;

  @media (max-width: 600px) {
    column-count: 2;
  }

  @media (max-width: 500px) {
    column-count: 1;
  }
`;

export const ClientLocation = styled.span`
  display: block;
`;

export const ClientItem = styled.div`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: white;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
`;

export const ContactInfo = styled(motion.div)`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: white;
  margin-bottom: 0px;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;

  /* Disable automatic link detection for phone numbers and emails */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;

  /* Ensure no automatic styling is applied */
  * {
    text-decoration: none !important;
    color: white !important;
    border: none !important;
    background: transparent !important;
    outline: none !important;
    pointer-events: none;
  }
`;

export const Footer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 0px;
  margin-bottom: 0px;
`;

export const FooterLink = styled.div`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: white;
  position: relative;
  display: flex;
  align-items: center;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;

  a:hover {
    text-decoration: underline !important;
    text-decoration-color: #39ff14 !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px;
  }
`;

export const VerticalDivider = styled.div`
  height: 20px; /* Match the font height */
  width: 2px;
  background-color: white;
  margin: 0 0px;
`;

// Newsletter styled components
export const NewsletterTitle = styled.p`
  color: white;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  position: relative;
  margin-top: 0px;
  margin-bottom: 12px;
  z-index: 2;
  display: block;
  text-decoration: underline !important;
  text-decoration-color: #39ff14 !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 3px;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
`;

export const NewsletterForm = styled(motion.form)`
  margin-top: 12px;
  margin-bottom: 0px;
`;

export const NewsletterInput = styled.input`
  background-color: transparent;
  border: none;
  border-bottom: 2px solid white;
  color: white;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  padding: 0px 0;
  margin-bottom: 12px;
  width: 100%;
  max-width: 300px;
  outline: none;
  font-family: "Jant", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;

  /* Fix for curved edges on mobile */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0;

  /* Prevent Safari zoom on input focus */
  @media screen and (max-width: 768px) {
    font-size: max(16px, 20px);
  }

  /* Prevent Safari input shadow */
  box-shadow: none;
  -webkit-box-shadow: none;

  /* Override autofill styles in WebKit browsers */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-text-fill-color: white !important;
    -webkit-box-shadow: 0 0 0 30px rgb(16, 12, 8) inset !important;
    transition: background-color 5000s ease-in-out 0s;
    font-family: "Jant", sans-serif !important;
  }

  /* Firefox and other browsers */
  &:autofill,
  &:autofill:hover,
  &:autofill:focus,
  &:autofill:active {
    -webkit-text-fill-color: white !important;
    box-shadow: 0 0 0 30px rgb(16, 12, 8) inset !important;
    caret-color: white;
    font-family: "Jant", sans-serif !important;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-family: "Jant", sans-serif;
  }

  &:focus {
    border-bottom-color: #39ff14;
  }
`;

export const SubscribeButton = styled(motion.button)`
  background-color: transparent;
  border: 2px solid #39ff14;
  color: #39ff14;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  padding: 6px 15px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0px;
  font-family: "Jant", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-weight: normal; /* Ensure consistent font weight */
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;

  /* Fix for mobile appearance */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* Better touch handling for Safari */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;

  /* Prevent Safari button shadow */
  box-shadow: none;
  -webkit-box-shadow: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
