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
} from '../css/FlashStartSlotMachine';
import useSlotMachine from '../../../../hooks/TypefaceSlotMachine/useSlotMachine';

export default function SlotMachine() {
  const { currentLetter, slotMachineRef, letterRef, isLoaded } = useSlotMachine();

  return (
    <SlotMachineCursor>
      <SlotMachinePage
        ref={slotMachineRef}
        className="slot-machine-page"
        style={{ visibility: isLoaded ? 'visible' : 'hidden' }}
      >
        <SlotMachineContainer className="slot-machine-container no-blur">
          <LetterContainer className="letter-container">
            <Letter ref={letterRef}>
              {currentLetter}
            </Letter>
            <LetterOutline ref={letterRef}>
              {currentLetter}
            </LetterOutline>
            <LetterShadow ref={letterRef}>
              {currentLetter}
            </LetterShadow>
          </LetterContainer>
        </SlotMachineContainer>
      </SlotMachinePage>
    </SlotMachineCursor>
  );
}