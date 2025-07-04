import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const BlurOverlayStyles = styled(motion.div)`
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
`;

const BlurOverlay = ({ isOpen, onClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <BlurOverlayStyles
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClick}
        />
      )}
    </AnimatePresence>
  );
};

export default BlurOverlay;