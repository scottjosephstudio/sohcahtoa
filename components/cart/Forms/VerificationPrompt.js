import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const VerificationOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
    backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  -moz-backdrop-filter: blur(6px);
  -ms-backdrop-filter: blur(6px);
  -o-backdrop-filter: blur(6px);
`;

const VerificationModal = styled(motion.div)`
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 10px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: rgb(16, 12, 8);
  padding: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #006efe;
  }
`;

const Title = styled.div`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  font-weight: normal;
  margin: 0 0 16px 0;
  color: rgb(16, 12, 8);
`;

const Message = styled.p`
  font-size: 16px;
  letter-spacing: 0.8px;
  line-height: 20px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  margin: 0 0 12px 0;
`;

const EmailHighlight = styled.span`
  font-weight: normal;
  color: #006efe;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: left;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(motion.button)`
  background: rgb(16, 12, 8);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  letter-spacing: 0.8px;
  font-weight: normal;
  cursor: pointer;
  transition: all 0.2s ease;

   &:hover {
 background: #006efe;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: rgb(16, 12, 8);
  border: 2px solid rgb(16, 12, 8);
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  font-weight: normal;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #006efe;
    color: rgb(16, 12, 8);
  }
`;

const StatusMessage = styled(motion.div)`
  margin-top: 16px;
  padding: 12px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 0.8px;
  line-height: 20px;
  
  &.success {
    background: #e8f5e8;
    color: #2d5a2d;
    border: 1px solid #a8d5a8;
  }
  
  &.error {
    background: #fdf2f2;
    color: #c53030;
    border: 1px solid #feb2b2;
  }
`;

// Animation variants
const modalVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 }
};

const buttonHoverVariants = {
  hover: { 
    scale: 1,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 1,
    transition: { duration: 0.1 }
  }
};

const statusMessageVariants = {
  initial: { 
    opacity: 0, 
    height: 0, 
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  animate: { 
    opacity: 1, 
    height: 'auto', 
    marginTop: 16,
    paddingTop: 12,
    paddingBottom: 12,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

const VerificationPrompt = ({ isVisible, onClose, email, onResendEmail, onContinue }) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  const handleResendEmail = async () => {
    try {
      console.log('🔄 VerificationPrompt: Resend button clicked');
      setStatusMessage('');
      setStatusType('');
      
      console.log('🔄 VerificationPrompt: Calling onResendEmail function');
      const result = await onResendEmail();
      console.log('📊 VerificationPrompt: Resend result:', result);
      
      if (result.success) {
        setStatusMessage('Verification email sent successfully! Please check your inbox.');
        setStatusType('success');
        console.log('✅ VerificationPrompt: Success message set');
      } else {
        setStatusMessage(result.error || 'Failed to send verification email. Please try again.');
        setStatusType('error');
        console.log('❌ VerificationPrompt: Error message set:', result.error);
      }
    } catch (error) {
      console.error('❌ VerificationPrompt: Exception in handleResendEmail:', error);
      setStatusMessage('An error occurred while sending the email. Please try again.');
      setStatusType('error');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <VerificationOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VerificationModal
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            layout
          >
            <CloseButton 
              onClick={onClose}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              ×
            </CloseButton>
            
            <Title>Email Verification Required</Title>
            
            <Message>
              We've sent a verification email to{' '}
              <EmailHighlight>{email}</EmailHighlight>.
            </Message>
            <Message>
              Please check your inbox and click the verification link to complete your registration.
            </Message>
            <Message>
              You'll need to verify your email before you can complete your purchase and download typefaces.
            </Message>
            
            <ButtonContainer>
              <PrimaryButton
                onClick={handleResendEmail}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Resend Email
              </PrimaryButton>
              
              <SecondaryButton
                onClick={onContinue}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Continue (Limited Access)
              </SecondaryButton>
            </ButtonContainer>
            
            <AnimatePresence>
              {statusMessage && (
                <StatusMessage
                  className={statusType}
                  variants={statusMessageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                >
                  {statusMessage}
                </StatusMessage>
              )}
            </AnimatePresence>
          </VerificationModal>
        </VerificationOverlay>
      )}
    </AnimatePresence>
  );
};

export default VerificationPrompt; 