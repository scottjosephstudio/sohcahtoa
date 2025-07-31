// StyledComponents.js
import styled from "styled-components";
import { motion } from "framer-motion";

export const Container = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0px;
  overflow: hidden;
  z-index: 10;
  pointer-events: none;
`;

export const TextContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  transform: translate(-50%, -50%);
  min-height: 30vh;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  pointer-events: auto;
  transition: all 0.2s ease;
  /* Safari-specific fixes for text rendering during animation */
  -webkit-transform: translate(-50%, -50%);
  -webkit-backface-visibility: hidden;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  will-change: transform;

  @media (max-width: 768px) {
    width: 90%;
    top: 50%;
    transition: all 0.2s ease;
  }

  /* Safari-specific fix for initial text rendering */
  @supports (-webkit-touch-callout: none) {
    -webkit-font-smoothing: antialiased;
    -webkit-text-size-adjust: 100%;
  }
`;

export const EditableText = styled.p`
  margin: 0;
  padding: 0;
  outline: none;
  text-align: center;
  transition: all 0.2s ease;
  min-width: 1px;
  min-height: 1em;
  white-space: pre-wrap;
  word-break: normal;
  overflow-wrap: break-word;
  cursor: text;
  font-kerning: none;
  font-feature-settings: "kern" 0;
  pointer-events: auto;
  caret-color: var(--text-primary);
  text-decoration-line: none;
  -webkit-text-decoration-line: none;
  vertical-align: baseline;
  -webkit-user-select: text;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  font-family: ${props => props.fontFamily || '"Jant", sans-serif'};
  /* Safari-specific fixes for text cut-off during typing animation */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* Ensure proper text rendering during animation in Safari */
  contain: layout style;

  /* Safari-specific text rendering optimization */
  @supports (-webkit-touch-callout: none) {
    -webkit-text-size-adjust: 100%;
    -webkit-font-feature-settings: "kern" 1;
    -webkit-text-rendering: optimizeLegibility;
  }
`;

export const ControlPanel = styled.div`
  background: var(--nav-bg);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  height: 46px;
  border-radius: 10px;
  border: 2px solid var(--border-color);
  box-shadow: 0 4px 8px var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 12px;
  width: 100%;

  @media (max-width: 768px) {
    height: auto;
    padding: 12px;
  }
`;

export const ControlsGrid = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
  }
`;

export const ControlGroup = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 0px 0;
  }
`;

export const Label = styled.label`
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.8px;
  white-space: nowrap;
  letter-spacing: ${(props) => (props.$special ? "-1px" : "0.6px")};
`;

export const SliderContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

export const Slider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--border-color);
    border-radius: 50%;
    cursor: pointer;
    margin-top: -7px;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--border-color);
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    background: var(--border-color);
    border-radius: 1px;
  }

  &::-moz-range-track {
    width: 100%;
    height: 2px;
    background: var(--border-color);
    border-radius: 1px;
  }
`;

export const Value = styled.span`
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.8px;
  color: var(--text-primary);
  white-space: nowrap;
  min-width: ${(props) => {
    if (props.type === "fontSize") return "36px";
    if (props.type === "lineHeight") return "19px";
    if (props.type === "letterSpacing") return "40px";
  }};
  display: inline-block;
  text-align: right;
`;

export const ResetButton = styled(motion.button)`
  padding: 4px;
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  span {
    display: inline-block;
    font-size: 16px;
    line-height: 14px;
    letter-spacing: 0.8px;
    font-weight: normal;
    transform: translate(0.3px, 0.2px);
    color: ${props => props.$isDarkMode ? 'white' : 'var(--text-primary)'};
  }
`;

// Motion variants for ResetButton
export const resetButtonVariants = {
  hover: {
    backgroundColor: "var(--text-primary)",
    transition: { duration: 0.2 },
  },
};

export const resetButtonSpanVariants = {
  hover: {
    color: "var(--bg-primary)",
    transition: { duration: 0.2 },
  },
};
