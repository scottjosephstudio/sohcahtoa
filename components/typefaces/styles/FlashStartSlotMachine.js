// FlashStartSlotMachineStyles.js
import styled, { keyframes } from "styled-components";

const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const SlotMachinePage = styled.div`
  margin: 0;
  padding: 0;
  z-index: 5;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  /* Desktop - full viewport regardless of width */
  @media (hover: hover) and (pointer: fine) {
    height: 100vh;
    bottom: 0;
    top: 0;
  }

  /* Only apply mobile adjustments to actual touch devices */
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    /* Use dvh for better mobile viewport handling */
    height: 100dvh;
    max-height: 100dvh;

    /* iOS specific - use window height minus banner */
    @supports (-webkit-touch-callout: none) {
      height: 100dvh;
      max-height: 100dvh;
      /* Ensure it covers the full viewport */
      bottom: 0;
      top: 0;
    }

    /* Ensure full coverage without gaps */
    bottom: 0;
    top: 0;
    height: 100dvh;
  }

  /* Additional mobile viewport fixes - touch devices only */
  @media screen and (max-height: 600px) and (max-width: 768px) and (hover: none) and (pointer: coarse) {
    height: 100dvh;
    bottom: 0;
    top: 0;
  }

  /* iOS orientation specific - touch devices only */
  @media screen and (max-width: 768px) and (orientation: portrait) and (hover: none) and (pointer: coarse) {
    height: 100dvh;
    bottom: 0;
  }

  @media screen and (max-width: 768px) and (orientation: landscape) and (hover: none) and (pointer: coarse) {
    height: 100dvh;
    bottom: 0;
    /* Specific fix for landscape Safari white gap */
    min-height: 100dvh;
    /* Ensure no gaps in landscape mode */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100vw;
  }
`;

export const SlotMachineContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: #666666;
  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, 0.4) 40%, transparent 40%),
    linear-gradient(rgba(255, 255, 255, 0.4) 40%, transparent 40%);
  background-size: 6px 6px;

  /* Desktop (including narrow desktop windows) - ensure full height coverage */
  @media (hover: hover) and (pointer: fine) {
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  /* Only adjust for actual touch devices */
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    height: 100%;
    min-height: 100%;
    /* Ensure the radial background covers the full area */
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    /* Landscape mode specific adjustments for Safari */
    @media (orientation: landscape) {
      /* Force full coverage in landscape mode */
      height: 100dvh;
      min-height: 100dvh;
      width: 100vw;
      min-width: 100vw;
    }
  }
`;

export const LetterContainer = styled.div`
  position: relative;
  width: 80vmin; /* Responsive size */
  height: 80vmin; /* Responsive size */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const Letter = styled.div`
  font-size: 48vmin; /* Responsive font size */
  font-weight: bold;
  color: white;
  position: relative;
  transition: opacity 200ms;
  filter: blur(20px);
  text-shadow: 10px 15px 15px rgba(255, 255, 255, 0.3);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Font normalization for precise mobile rendering */
  font-family: "Jant", sans-serif;
  font-weight: normal; /* Prevent font weight variations on mobile */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: geometricPrecision;
  -webkit-text-rendering: geometricPrecision;
  font-feature-settings: "kern" 1;
  -webkit-font-feature-settings: "kern" 1;
  font-variant-ligatures: none; /* Prevent ligature rendering issues */

  /* Mobile-specific font rendering fixes */
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    -webkit-transform: translateZ(0); /* Force hardware acceleration */
    transform: translateZ(0);
    will-change: contents; /* Optimize for content changes */

    /* iOS specific font rendering */
    @supports (-webkit-touch-callout: none) {
      -webkit-font-smoothing: subpixel-antialiased;
      text-rendering: optimizeSpeed; /* Better for animated text on iOS */
    }
  }
`;

export const LetterOutline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48vmin; /* Responsive font size */
  font-weight: bold;
  transition: opacity 200ms;
  z-index: 1;
  -webkit-text-stroke: 10px transparent;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-image: linear-gradient(45deg, black, grey, black, grey);
  background-size: 400% 400%;
  animation: ${gradient} 12s ease infinite;

  /* Font normalization for precise mobile rendering */
  font-family: "Jant", sans-serif;
  font-weight: normal; /* Prevent font weight variations on mobile */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: geometricPrecision;
  -webkit-text-rendering: geometricPrecision;
  font-feature-settings: "kern" 1;
  -webkit-font-feature-settings: "kern" 1;
  font-variant-ligatures: none; /* Prevent ligature rendering issues */

  /* Mobile-specific font rendering fixes */
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    -webkit-transform: translateZ(0); /* Force hardware acceleration */
    transform: translateZ(0);
    will-change: contents; /* Optimize for content changes */

    /* iOS specific font rendering */
    @supports (-webkit-touch-callout: none) {
      -webkit-font-smoothing: subpixel-antialiased;
      text-rendering: optimizeSpeed; /* Better for animated text on iOS */
    }
  }
`;

export const LetterShadow = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  padding-left: 3px;
  padding-top: 3px;
  filter: blur(20px);
  opacity: 0.9;
  font-size: 48vmin;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;

  /* Font normalization for precise mobile rendering */
  font-family: "Jant", sans-serif;
  font-weight: normal; /* Prevent font weight variations on mobile */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: geometricPrecision;
  -webkit-text-rendering: geometricPrecision;
  font-feature-settings: "kern" 1;
  -webkit-font-feature-settings: "kern" 1;
  font-variant-ligatures: none; /* Prevent ligature rendering issues */

  /* Mobile-specific font rendering fixes */
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    -webkit-transform: translateZ(0); /* Force hardware acceleration */
    transform: translateZ(0);
    will-change: contents; /* Optimize for content changes */

    /* iOS specific font rendering */
    @supports (-webkit-touch-callout: none) {
      -webkit-font-smoothing: subpixel-antialiased;
      text-rendering: optimizeSpeed; /* Better for animated text on iOS */
    }
  }
`;

export const SlotMachineCursor = styled.div`
  cursor: pointer;
`;

// Font info styled components
export const FontInfoDisplay = styled.div`
  position: absolute;
  bottom: 29px;
  left: 50%;
  transform: translateX(-50%);
  text-align: left;
  color: rgba(255, 255, 255);
  opacity: 0.9;
  pointer-events: none;
  background: rgb(16, 12, 8, 0.95);
  padding: 16px 16px;
  border-radius: 10px;
  border: 1px solid rgba(16, 12, 8, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 12px;
  align-items: start;
  white-space: nowrap;
  width: max-content;

  /* Mobile: Switch to 3 rows, position right */
  @media (max-width: 768px) {
    right: 20px;
    left: auto;
    transform: none;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 8px;
    white-space: normal;
    width: auto;
  }
`;

export const FontName = styled.div`
  font-size: 12px;
  font-weight: normal;
  letter-spacing: 0.8px;
  line-height: 6px;
  grid-column: 1;
  margin-bottom: 0;
  
  /* Mobile: First row */
  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: 1;
  }
`;

export const FontDetails = styled.div`
  display: none;
`;

export const FontInstructions = styled.div`
  font-size: 12px;
  font-weight: normal;
  letter-spacing: 0.8px;
  line-height: 6px;
  grid-column: 2 / 4;
  white-space: pre-line;
  
  /* Split into separate columns on desktop */
  @media (min-width: 769px) {
    display: contents;
  }
`;

export const ScrollInstruction = styled.div`
  font-size: 12px;
  font-weight: normal;
  letter-spacing: 0.8px;
  line-height: 6px;
  grid-column: 2;
  
  /* Mobile: Second row */
  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: 2;
  }
`;

export const ClickInstruction = styled.div`
  font-size: 12px;
  font-weight: normal;
  letter-spacing: 0.8px;
  line-height: 6px;
  grid-column: 3;
  
  /* Mobile: Third row */
  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: 3;
  }
`;
