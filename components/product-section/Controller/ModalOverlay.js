import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const OverlayContainer = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  -moz-backdrop-filter: blur(6px);
  -ms-backdrop-filter: blur(6px);
  -o-backdrop-filter: blur(6px);
  z-index: ${(props) => props.$zIndex || 60};
  pointer-events: ${(props) => props.$pointerEvents || "auto"};
`;

const overlayAnimationVariants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const ModalOverlay = ({
  onClick,
  zIndex = 60,
  pointerEvents = "auto",
  children,
  ...props
}) => {
  return (
    <OverlayContainer
      $zIndex={zIndex}
      $pointerEvents={pointerEvents}
      onClick={onClick}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayAnimationVariants}
      {...props}
    >
      {children}
    </OverlayContainer>
  );
};

export default ModalOverlay;
