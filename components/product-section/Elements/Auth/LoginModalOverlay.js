// LoginModalOverlay.jsx
import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import { LoginModalOverlay as StyledOverlay } from "../../Controller/ProductPage_Styles";

// Force pointer-events to always be active
const ClickableOverlay = styled(StyledOverlay)`
  pointer-events: auto !important;
  cursor: pointer;
`;

const LoginModalOverlay = ({ onClick, children, ...props }) => {
  return (
    <ClickableOverlay
      as={motion.div}
      onClick={onClick} // Pass onClick directly through
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      {...props}
    >
      {children}
    </ClickableOverlay>
  );
};

export default LoginModalOverlay;
