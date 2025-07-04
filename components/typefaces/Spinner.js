"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styled from "styled-components";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useNavigation } from "../../context/NavigationContext";
import useSpinnerAnimation from "./hooks/useSpinnerAnimation";

// Styled components for the Spinner
const ShapeContainerType = styled(motion.div)`
  position: fixed;
  top: 28px;
  right: 20px;
  z-index: 10;
  transition: all 0.2s ease;

  /* Mobile devices - consistent positioning */
  @media (max-width: 768px) {
    top: 28px;
    right: 20px;
    /* Ensure consistent positioning without conflicting left/right values */
  }

  /* Very small screens */
  @media (max-width: 480px) {
    top: 28px;
    right: 20px;
  }
`;

const Coin = styled(motion.div)`
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotateY(0deg) scale(1);
    }
    25% {
      transform: rotateY(90deg) scale(1);
    }
    50% {
      transform: rotateY(180deg) scale(1);
    }
    75% {
      transform: rotateY(270deg) scale(1);
    }
    100% {
      transform: rotateY(360deg) scale(1);
    }
  }

  /* Mobile devices only - 50% size + 20% bigger */
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    width: 85px;
    height: 85px;
  }
`;

const StyledLink = styled(motion.div)`
  background: none;
  border: none;
  padding: 20px; /* This creates the invisible padding zone for hover */
  margin: -20px; /* Counteract the padding to maintain original positioning */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  /* Mobile-specific adjustments for better touch targets */
  @media (max-width: 768px) {
    padding: 16px;
    margin: -16px;
  }
`;

const Tooltip = styled(motion.span)`
  position: absolute;
  bottom: -20px; /* Adjusted to account for the negative margin */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgb(16, 12, 8);
  color: white;
  padding: 10px 10px;
  border-radius: 8px;
  font-size: 12px;
  letter-spacing: 0.8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  text-align: center;
  pointer-events: none;

  /* Mobile devices only - adjust positioning to prevent off-screen tooltip */
  @media (max-width: 768px) {
    bottom: -24px; /* Adjusted for mobile: balanced spacing for smaller coin */
    left: auto;
    right: 15px;
    transform: translateX(0);
    /* Ensure it doesn't go off the right edge */
    max-width: calc(100vw - 40px);
  }
`;

// Motion variants for StyledLink hover effects
const linkVariants = {
  initial: {
    transition: { duration: 0.2 },
  },
  hover: {
    transition: { duration: 0.2 },
  },
};

const imageVariants = {
  initial: {
    filter: "invert(0)",
  },
  hover: {
    filter: "invert(1)",
    transition: { duration: 0.2 },
  },
};

const tooltipVariants = {
  initial: {
    opacity: 0,
    visibility: "hidden",
  },
  hover: {
    opacity: 1,
    visibility: "visible",
    transition: { duration: 0.2 },
  },
};

const Spinner = () => {
  const [animationState, setAnimationState] = useState("visible");
  const { handleSpinnerClick } = useSpinnerAnimation();
  const pathname = usePathname();
  const { $isNavigating, previousPath } = useNavigation();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.1 },
    },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.5 } },
  };

  const coinVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, delay: 0.05 },
    },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } },
  };

  // Using useCallback to memoize the handler and prevent recreation on renders
  const handleClick = useCallback(
    (e) => {
      // First set the animation state to exit
      setAnimationState("exit");

      // Call any additional click handler if provided
      if (handleSpinnerClick) {
        handleSpinnerClick(e);
      }

      // The actual navigation is handled by the Link component
      // This just handles the animation before navigation
    },
    [handleSpinnerClick],
  );

  // Listen for home icon click to trigger exit animation
  useEffect(() => {
    const handleSpinnerExit = () => {
      setAnimationState("exit");
    };

    document.addEventListener("spinnerExit", handleSpinnerExit);

    return () => {
      document.removeEventListener("spinnerExit", handleSpinnerExit);
    };
  }, []);

  return (
    <ShapeContainerType
      className="spinner-container"
      variants={containerVariants}
      initial="hidden"
      animate={animationState}
      data-component="spinner"
    >
      <Link href="/ID" passHref>
        <StyledLink
          aria-label="Keep In The Loop"
          onClick={handleClick}
          variants={linkVariants}
          initial="initial"
          whileHover="hover"
        >
          <Coin variants={coinVariants} animate={animationState}>
            <motion.div
              initial={{ filter: "invert(0)" }}
              whileHover={{
                filter: "invert(1)",
                transition: { duration: 0.2 },
              }}
            >
              <Image
                src="/assets/animations/Render.svg"
                alt="Coin animation"
                width={120}
                height={120}
                priority
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </motion.div>
          </Coin>
          <Tooltip className="tooltip" variants={tooltipVariants}>
            Keep In The Loop
          </Tooltip>
        </StyledLink>
      </Link>
    </ShapeContainerType>
  );
};

export default React.memo(Spinner);
