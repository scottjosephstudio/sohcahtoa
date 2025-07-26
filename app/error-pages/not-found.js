"use client";

import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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

export default function NotFound() {
  const router = useRouter();
  const { set$isNavigating } = useNavigation();

  // Stop any redirects
  if (typeof window !== "undefined") {
    window.stop();
  }

  const handleGoHome = () => {
    // Set navigation state to true to trigger transition
    set$isNavigating(true);

    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  const handleGoBack = () => {
    // Set navigation state to true to trigger transition
    set$isNavigating(true);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.history.back();
      }
    }, 500);
  };

  return (
    <TransitionWrapper>
      <Overlay>
        <ErrorContainer>
          <ErrorTitle>Page Not Found</ErrorTitle>
          <ErrorText>
            We couldn't find the page you were looking for. The URL may be
            misspelled or the page may have been moved.
          </ErrorText>
          <ButtonContainer>
            <AcceptButton
              onClick={handleGoHome}
              variants={acceptButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Go to Home
            </AcceptButton>
            <DeclineButton
              onClick={handleGoBack}
              variants={declineButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Go Back
            </DeclineButton>
          </ButtonContainer>
        </ErrorContainer>
      </Overlay>
    </TransitionWrapper>
  );
}

// Centered overlay with proper transition coordination
const Overlay = styled.div`
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
const ErrorContainer = styled.div`
  background-color: rgb(16, 12, 8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  width: 320px; /* Fixed width to match the image */
  text-align: left;

  /* Ensure this width is maintained even on small screens */
  min-width: 320px;

  @media (max-width: 360px) {
    /* Just reduce padding slightly on very small screens, but maintain width */
    padding: 16px;
    width: 320px;
  }
`;

const ErrorTitle = styled.p`
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

const ErrorText = styled.p`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  margin-bottom: 15px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-start;
`;

const AcceptButton = styled(motion.button)`
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transform: translateZ(0);
`;

const DeclineButton = styled(motion.button)`
  border: 1px solid white;
  padding: 8px 16px;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transform: translateZ(0);
`;
