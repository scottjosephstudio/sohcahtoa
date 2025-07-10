"use client";

import React from "react";
import { motion } from "framer-motion";
import { useNavigation } from "../../context/NavigationContext";
import {
  SlotMachinePage,
  SlotMachineContainer,
  LetterContainer,
  Letter,
  LetterOutline,
  LetterShadow,
  SlotMachineCursor,
  FontInfoDisplay,
  FontInfoDisplayMotion,
  FontName,
  FontDetails,
  FontInstructions,
  ScrollInstruction,
  ClickInstruction,
} from "./styles/FlashStartSlotMachine";
import useSlotMachineIntegration from "./hooks/useSlotMachineIntegration";

export default function SlotMachine() {
  const { $isNavigating } = useNavigation();
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
      </SlotMachinePage>
      
      {/* Font info moved outside SlotMachinePage to avoid scaling effects */}
      {fontInfo && totalFonts > 0 && (
        <FontInfoDisplayMotion
          initial={{ opacity: 1 }}
          animate={{
            opacity: $isNavigating ? 0 : 1,
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            },
          }}
          transition={{
            duration: $isNavigating ? 0.3 : 0.15,
            ease: "easeInOut",
          }}
        >
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
        </FontInfoDisplayMotion>
      )}
    </SlotMachineCursor>
  );
}
