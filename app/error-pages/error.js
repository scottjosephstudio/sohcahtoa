"use client";

import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigation } from "../../context/NavigationContext";
import TransitionWrapper from "../../components/providers/TransitionWrapper";

// Motion variants for button interactions
const acceptButtonVariants = {
  initial: {
    backgroundColor: "#39ff14",
    color: "rgb(16, 12, 8)",
    opacity: 1,
    scale: 1,
  },
  hover: {
    backgroundColor: "white",
    color: "rgb(16, 12, 8)",
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      opacity: { duration: 0.2, ease: "easeInOut" },
      backgroundColor: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  },
  tap: {
    opacity: 0.8,
    scale: 1,
    transition: {
      duration: 0.1,
      ease: "easeInOut",
    },
  },
};

const declineButtonVariants = {
  initial: {
    backgroundColor: "transparent",
    borderColor: "white",
    color: "white",
    opacity: 1,
    scale: 1,
  },
  hover: {
    backgroundColor: "white",
    borderColor: "white",
    color: "rgb(16, 12, 8)",
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      opacity: { duration: 0.2, ease: "easeInOut" },
      backgroundColor: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      borderColor: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  },
  tap: {
    opacity: 0.8,
    scale: 1,
    transition: {
      duration: 0.1,
      ease: "easeInOut",
    },
  },
};

export default function Error({ error, reset }) {
  const { set$isNavigating } = useNavigation();

  // Log error if present
  if (error) {
    console.error("Page error:", error);
  }

  const handleReset = () => {
    // Set navigation state to true to trigger transition
    set$isNavigating(true);

    setTimeout(() => {
      if (typeof reset === "function") {
        reset();
      } else {
        // Fallback: refresh the current page
        window.location.reload();
      }
    }, 500);
  };

  const handleStay = () => {
    // Just hide the error modal without navigation
    document.body.classList.remove("error-page");
  };

  return (
    <TransitionWrapper>
      <ErrorOverlay>
        <PageErrorContainer>
          <PageErrorTitle>Something went wrong!</PageErrorTitle>
          <ErrorButtonContainer>
            <ErrorAcceptButton
              onClick={handleReset}
              variants={acceptButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Try Again
            </ErrorAcceptButton>
            <ErrorDeclineButton
              onClick={handleStay}
              variants={declineButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Stay on Current Page
            </ErrorDeclineButton>
          </ErrorButtonContainer>
        </PageErrorContainer>
      </ErrorOverlay>
    </TransitionWrapper>
  );
}

// Centered overlay
const ErrorOverlay = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Error panel styled like the cookies panel
const PageErrorContainer = styled.div`
  background-color: rgb(16, 12, 8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  width: 320px;
  min-width: 320px;
  text-align: left;

  @media (max-width: 360px) {
    padding: 16px;
    width: 320px;
  }
`;

const PageErrorTitle = styled.p`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  margin-bottom: 20px;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  text-decoration-color: #39ff14 !important;
  text-decoration-skip-ink: none;
`;

const ErrorButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

const ErrorAcceptButton = styled(motion.button)`
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transform: translateZ(0);
`;

const ErrorDeclineButton = styled(motion.button)`
  border: 1px solid white;
  padding: 8px 16px;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transform: translateZ(0);
`;
