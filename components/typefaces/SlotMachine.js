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
} from "./styles/FlashStartSlotMachine";
import useSlotMachine from "./hooks/useSlotMachine";
import { motion, AnimatePresence } from "framer-motion";

const slotMachineVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 }
};

export default function SlotMachine() {
  const { currentLetter, slotMachineRef, letterRef, isLoaded, isAnimating } =
    useSlotMachine();

  return (
    <SlotMachineCursor>
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            variants={slotMachineVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <SlotMachinePage
              ref={slotMachineRef}
              className="slot-machine-page"
              style={{ visibility: isLoaded ? "visible" : "hidden", transform: "translateZ(0)", willChange: isAnimating ? "transform" : "auto" }}
            >
              <SlotMachineContainer className="slot-machine-container">
                <LetterContainer
                  className="letter-container"
                  style={{ transform: "translateZ(0)", willChange: isAnimating ? "contents" : "auto" }}
                >
                  <Letter
                    ref={letterRef}
                    suppressHydrationWarning
                    style={{ transform: "translateZ(0)", willChange: isAnimating ? "contents" : "auto" }}
                  >
                    {currentLetter}
                  </Letter>
                  <LetterOutline
                    suppressHydrationWarning
                    style={{ transform: "translateZ(0)", willChange: isAnimating ? "contents" : "auto" }}
                  >
                    {currentLetter}
                  </LetterOutline>
                  <LetterShadow
                    suppressHydrationWarning
                    style={{ transform: "translateZ(0)", willChange: isAnimating ? "contents" : "auto" }}
                  >
                    {currentLetter}
                  </LetterShadow>
                </LetterContainer>
              </SlotMachineContainer>
            </SlotMachinePage>
          </motion.div>
        )}
      </AnimatePresence>
    </SlotMachineCursor>
  );
}
