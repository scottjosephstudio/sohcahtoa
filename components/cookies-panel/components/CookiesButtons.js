import React from 'react';
import { ButtonContainer, AcceptButton, DeclineButton, acceptButtonVariants, declineButtonVariants } from '../styles';

export default function CookiesButtons({ onAccept, onDecline }) {
  return (
    <ButtonContainer>
      <AcceptButton 
        onClick={onAccept}
        variants={acceptButtonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        Accept All
      </AcceptButton>
      <DeclineButton 
        onClick={onDecline}
        variants={declineButtonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        Decline
      </DeclineButton>
    </ButtonContainer>
  );
} 