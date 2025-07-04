'use client';

import React from 'react';
import {
  SlotMachinePage,
  SlotMachineContainer,
  LetterContainer,
  Letter,
  LetterOutline,
  LetterShadow,
  SlotMachineCursor
} from './styles/FlashStartSlotMachine';
import useSlotMachine from './hooks/useSlotMachine';

export default function SlotMachine() {
  const { currentLetter, slotMachineRef, letterRef, isLoaded, isAnimating } = useSlotMachine();

  return (
    <SlotMachineCursor>
      <SlotMachinePage
        ref={slotMachineRef}
        className="slot-machine-page"
        style={{ 
          visibility: isLoaded ? 'visible' : 'hidden',
          // Add hardware acceleration styles
          transform: 'translateZ(0)',
          willChange: isAnimating ? 'transform' : 'auto'
        }}
      >
        <SlotMachineContainer className="slot-machine-container">
          <LetterContainer 
            className="letter-container"
            style={{
              // Optimize for animations
              transform: 'translateZ(0)',
              willChange: isAnimating ? 'contents' : 'auto'
            }}
          >
            <Letter 
              ref={letterRef} 
              suppressHydrationWarning
              style={{
                transform: 'translateZ(0)',
                willChange: isAnimating ? 'contents' : 'auto'
              }}
            >
              {currentLetter}
            </Letter>
            <LetterOutline 
              suppressHydrationWarning
              style={{
                transform: 'translateZ(0)',
                willChange: isAnimating ? 'contents' : 'auto'
              }}
            >
              {currentLetter}
            </LetterOutline>
            <LetterShadow 
              suppressHydrationWarning
              style={{
                transform: 'translateZ(0)',
                willChange: isAnimating ? 'contents' : 'auto'
              }}
            >
              {currentLetter}
            </LetterShadow>
          </LetterContainer>
        </SlotMachineContainer>
      </SlotMachinePage>
    </SlotMachineCursor>
  );
}