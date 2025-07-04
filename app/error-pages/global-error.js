'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigation } from '../../context/NavigationContext';
import TransitionWrapper from '../../components/providers/TransitionWrapper';

// Motion variants for button interactions
const acceptButtonVariants = {
  initial: {
    backgroundColor: '#39ff14',
    color: 'rgb(16, 12, 8)',
    opacity: 1,
    scale: 1,
  },
  hover: {
    backgroundColor: 'white',
    color: 'rgb(16, 12, 8)',
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      opacity: { duration: 0.2, ease: 'easeInOut' },
      backgroundColor: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  },
  tap: {
    opacity: 0.8,
    scale: 1,
    transition: {
      duration: 0.1,
      ease: 'easeInOut'
    }
  }
};

export default function GlobalError({ error }) {
  const { set$isNavigating } = useNavigation();
  
  // Stop any redirects and log error
  if (typeof window !== 'undefined') {
    window.stop();
  }
  
  if (error) {
    console.error('Application error:', error);
  }

  const handleReset = () => {
    // Set navigation state to true to trigger transition
    set$isNavigating(true);
    
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 500);
  };

  return (
    <TransitionWrapper>
      <GlobalOverlay>
        <GlobalErrorContainer>
          <GlobalErrorTitle>Critical Error</GlobalErrorTitle>
          <GlobalErrorText>
            We apologize for the inconvenience. The application has encountered a critical error.
          </GlobalErrorText>
          <GlobalButtonContainer>
            <GlobalAcceptButton 
              onClick={handleReset}
              variants={acceptButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Reload Application
            </GlobalAcceptButton>
          </GlobalButtonContainer>
        </GlobalErrorContainer>
      </GlobalOverlay>
    </TransitionWrapper>
  );
}

// Centered overlay - modified to be centered in the window
const GlobalOverlay = styled.div`
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
const GlobalErrorContainer = styled.div`
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

const GlobalErrorTitle = styled.p`
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

const GlobalErrorText = styled.p`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  margin-bottom: 15px;
`;

const GlobalButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-start;
`;

const GlobalAcceptButton = styled(motion.button)`
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  text-align: center;
  transform: translateZ(0);
`; 