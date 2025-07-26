import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";

// Animations
export const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

// Styled Components
export const CookiesContainer = styled.div`
  position: fixed;
  bottom: 26px;
  left: 20px;
  z-index: 80;
  background-color: rgb(16, 12, 8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  max-width: 380px;
  animation: ${(props) => (props.$isExiting ? slideOut : slideIn)} 0.5s ease
    forwards;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, opacity;

  @media (max-width: 600px) {
    bottom: 20px;
    left: 20px;
    right: 20px;
    max-width: none;
    width: auto;
  }
`;

export const CookiesTitle = styled.p`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  margin: 0 0 15px 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  text-decoration-color: #39ff14;
`;

export const CookiesText = styled.p`
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.8px;
  margin: 0 0 20px 0;
  color: rgba(255, 255, 255, 0.9);
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const AcceptButton = styled(motion.button)`
  border: none;
  padding: 10px 18px;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.8px;
  border-radius: 10px;
  cursor: pointer;
  transform: translateZ(0);
  transition: all 0.2s ease;
`;

export const DeclineButton = styled(motion.button)`
  border: 1px solid white;
  padding: 10px 18px;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.8px;
  border-radius: 10px;
  cursor: pointer;
  transform: translateZ(0);
  transition: all 0.2s ease;
`;

export const DebugButton = styled.button`
  position: fixed;
  top: 28px;
  right: 20px;
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 10px;
  cursor: pointer;
  z-index: 10000;
`;

// Motion variants for button interactions
export const acceptButtonVariants = {
  initial: {
    backgroundColor: "#39ff14",
    color: "rgb(16, 12, 8)",
    scale: 1,
  },
  hover: {
    backgroundColor: "white",
    color: "rgb(16, 12, 8)",
    scale: 1,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 1,
    transition: { duration: 0.2 },
  },
};

export const declineButtonVariants = {
  initial: {
    backgroundColor: "transparent",
    borderColor: "white",
    color: "white",
    scale: 1,
  },
  hover: {
    backgroundColor: "white",
    borderColor: "white",
    color: "rgb(16, 12, 8)",
    scale: 1,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 1,
    transition: { duration: 0.2 },
  },
};
