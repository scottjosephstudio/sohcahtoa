import styled from 'styled-components';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Styled components
export const MenuContainer = styled(motion.nav)`
  position: fixed;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${props => props.$isModalOpen && props.$isTypefacesPath ? 40 : 100};
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MenuPill = styled(motion.div)`
  display: flex;
  background-color: #39ff14;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 5px 14px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  justify-content: center;
  align-items: center;
  min-width: 84px;
  width: ${props => props.$isExpanded ? 'auto' : '84px'};
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  
  /* Better Safari touch handling */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;

  &:hover {
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.35);
  }
`;

export const MenuItem = styled(motion.div)`
  position: relative;
  margin: 0 12px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  white-space: nowrap;
  
  /* Better Safari touch handling */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
`;

export const MenuItemCollapsed = styled(motion.div)`
  position: relative;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  white-space: nowrap;
  text-align: center;
  margin: 0;
  padding: 0;
  width: 84px; /* Set fixed width to prevent shrinking */
`;

export const DirectLink = styled(motion(Link))`
  position: relative;
  margin: 0 12px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  transform: translateY(1.25px);
  color: rgb(16, 12, 8);
  text-decoration: none;
  white-space: nowrap;
  
  /* Better Safari touch handling */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
`;

// Create a 'bridge' element to maintain hover state between menu and dropdown
export const MenuBridge = styled.div`
  position: absolute;
  width: 100%;
  height: 30px;
  top: 100%;
  left: 0;
  z-index: 9;
`;

// Centralized dropdown container
export const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  margin-top: 22px;
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
  z-index: 95;
`;

export const Dropdown = styled(motion.div)`
  position: relative;
  background-color: rgb(16, 12, 8);
  border-radius: 10px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.35);
  padding: 0;
  width: 50vw;
  max-height: calc(100vh - 108px - 0px);
  transform-origin: center top;
  overflow: hidden;
  z-index: 101;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  will-change: transform, opacity;
  
  /* Top blur mask */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 24px;
    background: linear-gradient(to bottom, rgba(16, 12, 8, 0.85) 20%, rgba(16, 12, 8, 0.5) 70%, rgba(16, 12, 8, 0) 100%);
    z-index: 3;
    pointer-events: none;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    will-change: transform;
  }
  
  /* Bottom blur mask */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 24px;
    background: linear-gradient(to top, rgba(16, 12, 8, 0.85) 20%, rgba(16, 12, 8, 0.5) 70%, rgba(16, 12, 8, 0) 100%);
    z-index: 3;
    pointer-events: none;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    will-change: transform;
  }
`;

// Updated ScrollWrapper with no extra top/bottom padding
export const DropdownContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
  max-height: calc(100vh - 108px - 0px - 0px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 24px; /* Horizontal padding */
  padding-top: 24px; /* Top padding/margin for content */
  padding-bottom: 24px; /* Bottom padding/margin for content */
  pointer-events: auto;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  
  /* Add data-lenis-prevent attribute class name for Lenis */
  &.DropdownContent {
    /* This class name will be used to find and add data-lenis-prevent */
  }
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Add extra margin to first and last elements */
  & > *:first-child {
    margin-top: 0px; /* Space at the top */
  }
  
  & > *:last-child {
    margin-bottom: 0px; /* Space at the bottom */
  }
  
  a, span, p, div {
    color: white;
    text-decoration: none;
    transition: color 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
    font-size: 20px;
    line-height: 24px;
    letter-spacing: 0.8px;
    pointer-events: auto;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  
  div {
    color: inherit;
  }
`;

// Modify the ScrollWrapper to remove its padding since it's now handled by DropdownContent
export const ScrollWrapper = styled(motion.div)`
  padding: 0;
  width: 100%;
  height: 100%;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
`;

export const SectionTitle = styled(motion.span)`
  color: #39ff14;
  margin: 0px 0 0px 0;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  position: relative;
  margin-bottom: 0px;
  z-index: 2;
  display: block; // Ensures it behaves like a block element
  transition: color 0.3s ease;
  text-decoration: underline !important; /* Add underline to section titles with !important */
  text-decoration-color: #39ff14 !important; /* Make the underline the same color as text */
  text-decoration-thickness: 2px !important; /* Control thickness */
  text-underline-offset: 3px;

  &:first-child {
    margin-top: 0px;
  }
`;

// Add a specific style for the client section title that doesn't change on hover
export const ClientsTitle = styled(motion.p)`
  color: white;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  position: relative;
  z-index: 2;
   display: block;
  text-decoration: underline !important; /* Add underline to section titles with !important */
  text-decoration-color: #39ff14 !important; /* Make the underline the same color as text */
  text-decoration-thickness: 2px !important; /* Control thickness */
  text-underline-offset: 6px;

  &:first-child {
    margin-top: 0px;
  }
`;

// Newsletter styled components
export const NewsletterTitle = styled(motion.p)`
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
`;

export const NewsletterInput = styled.input`
  background-color: transparent;
  border: none;
  border-bottom: 2px solid white;
  color: white;
  font-size: max(16px, 20px);
  line-height: 24px;
  letter-spacing: 0.8px;
  padding: 0px 0;
  margin-bottom: 12px;
  width: 100%;
  max-width: 300px;
  outline: none;
  font-family: 'Jant', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-shadow: none;
  -webkit-box-shadow: none;
  border-radius: 0;
  
  /* Override autofill styles in WebKit browsers */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-text-fill-color: white !important;
    -webkit-box-shadow: 0 0 0 30px rgb(16, 12, 8) inset !important;
    transition: background-color 5000s ease-in-out 0s;
    font-family: 'Jant', sans-serif !important;
    caret-color: white;
  }
  
  /* Firefox and other browsers */
  &:autofill,
  &:autofill:hover,
  &:autofill:focus,
  &:autofill:active {
    -webkit-text-fill-color: white !important;
    box-shadow: 0 0 0 30px rgb(16, 12, 8) inset !important;
    caret-color: white;
    font-family: 'Jant', sans-serif !important;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Jant', sans-serif;
  }
  
  &:focus {
    border-bottom-color: #39ff14;
    caret-color: white;
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
  font-family: 'Jant', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-weight: normal;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: none;
  -webkit-box-shadow: none;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ClientsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0px;
  margin-top: 0px;
`;

export const ClientInfo = styled(motion.p)`
  margin: 0;
`;

export const ClientLocation = styled(motion.span)`
  opacity: 1;
`;

// Add these styled components to your existing styled components
export const ProjectList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0px; // Adjust this value to increase or decrease spacing
`;

export const ProjectItem = styled(motion.div)`
  &:first-child {
    margin-top: 12px;
  }
`;

// Modal backdrop for body lock
export const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  cursor: pointer;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  will-change: backdrop-filter, transform;

  @supports (backdrop-filter: blur(6px)) {
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    background-color: rgba(211, 211, 211, 0.3);
  }

  @supports not (backdrop-filter: blur(6px)) {
    background-color: rgba(211, 211, 211, 0.7);
  }

  /* Webkit-specific fallback */
  @supports (-webkit-backdrop-filter: blur(6px)) and (not (backdrop-filter: blur(6px))) {
    -webkit-backdrop-filter: blur(6px);
    background-color: rgba(211, 211, 211, 0.3);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
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
  
  a {
    text-decoration: none;
    position: relative;
    display: inline;
  }

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
  margin: 0 12px;
`;

// Add these styled components after the existing ones - COPIED FROM FIRST VERSION
export const StaggeredContent = styled.div`
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
  animation-delay: ${props => props.$delay}s;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;