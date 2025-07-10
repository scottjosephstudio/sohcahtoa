"use client";

import React from "react";
import {
  SlotMachinePage,
  SlotMachineContainer,
  LetterContainer,
  Letter,
  LetterOutline,
  LetterShadow,
  SlotMachineCursor,
  FontInfoDisplay,
  FontName,
  FontDetails,
  FontInstructions,
  ScrollInstruction,
  ClickInstruction,
} from "./styles/FlashStartSlotMachine";
import useSlotMachineIntegration from "./hooks/useSlotMachineIntegration";

export default function SlotMachine() {
  const { 
    currentLetter, 
    selectedFont,
    availableFonts,
    slotMachineRef, 
    letterRef, 
    isLoaded, 
    isAnimating,
    fontsLoading,
    handleClick,
    fontInfo,
    hasMultipleFonts,
    currentFontIndex,
    totalFonts,
    canNavigate
  } = useSlotMachineIntegration();

  return (
    <SlotMachineCursor>
      <SlotMachinePage
        ref={slotMachineRef}
        className="slot-machine-page font-selection-slot-machine"
        onClick={handleClick}
        style={{
          visibility: isLoaded ? "visible" : "hidden",
          cursor: fontsLoading ? "wait" : "pointer",
          // Add hardware acceleration styles
          transform: "translateZ(0)",
          willChange: isAnimating ? "transform" : "auto",
        }}
      >
        <SlotMachineContainer className="slot-machine-container">
          <LetterContainer
            className="letter-container"
            style={{
              // Optimize for animations
              transform: "translateZ(0)",
              willChange: isAnimating ? "contents" : "auto",
            }}
          >
            <Letter
              ref={letterRef}
              suppressHydrationWarning
              style={{
                transform: "translateZ(0)",
                willChange: isAnimating ? "contents" : "auto",
                opacity: fontsLoading ? 0.5 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {currentLetter}
            </Letter>
            <LetterOutline
              suppressHydrationWarning
              style={{
                transform: "translateZ(0)",
                willChange: isAnimating ? "contents" : "auto",
                opacity: fontsLoading ? 0.5 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {currentLetter}
            </LetterOutline>
            <LetterShadow
              suppressHydrationWarning
              style={{
                transform: "translateZ(0)",
                willChange: isAnimating ? "contents" : "auto",
                opacity: fontsLoading ? 0.5 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {currentLetter}
            </LetterShadow>
          </LetterContainer>
        </SlotMachineContainer>
        
        {/* Font info with styled components */}
        {fontInfo && totalFonts > 0 && (
          <FontInfoDisplay>
            <FontName>
              Font Name: {fontInfo.name}
            </FontName>
            <ScrollInstruction>
              Scroll: Change letter
            </ScrollInstruction>
            <ClickInstruction>
              {hasMultipleFonts ? (
                `Click: Change Typeface`
              ) : (
                `Click: More Typefaces soon`
              )}
            </ClickInstruction>
          </FontInfoDisplay>
        )}
      </SlotMachinePage>
    </SlotMachineCursor>
  );
}
