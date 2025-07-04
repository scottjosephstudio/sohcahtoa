import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import {
  ControlPanel,
  ControlsGrid,
  ControlGroup,
  Label,
  SliderContainer,
  Slider,
  Value,
  ResetButton,
  resetButtonVariants,
  resetButtonSpanVariants
} from './StyledComponents';

const slideVariants = {
  initial: ({ isMobile }) => ({
    [isMobile ? 'x' : 'y']: isMobile ? '100%' : '100vh',
    opacity: 0
  }),
  animate: ({ isMobile }) => ({
    [isMobile ? 'x' : 'y']: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }),
  exit: ({ isMobile }) => ({
    [isMobile ? 'x' : 'y']: isMobile ? '100%' : '100vh',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  })
};

const ControlsWrapper = styled.div`
  width: 100%;
`;

export const FontTesterControls = ({
  settings,
  handleSliderChange,
  resetSetting,
  expanded,
  letterSpacingConstraints,
  displayLetterSpacing,
  isNavigatingHome,
  isTestExiting,
  isMobile
}) => {
  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && !isTestExiting && (
        <motion.div
          custom={{ isMobile }}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <ControlsWrapper>
            <ControlPanel $expanded={expanded}>
              <ControlsGrid>
                {/* Font Size Control */}
                <ControlGroup>
                  <Label>Tt</Label>
                  <SliderContainer>
                    <Slider
                      type="range"
                      value={settings.fontSize}
                      min={14}
                      max={340}
                      step={1}
                      onChange={(e) => handleSliderChange("fontSize", e.target.value)}
                    />
                  </SliderContainer>
                  <Value type="fontSize">{Math.round(settings.fontSize)}px</Value>
                  <ResetButton 
                    onClick={() => resetSetting("fontSize")}
                    variants={resetButtonVariants}
                    whileHover="hover"
                  >
                    <motion.span variants={resetButtonSpanVariants}>R</motion.span>
                  </ResetButton>
                </ControlGroup>

                {/* Line Height Control */}
                <ControlGroup>
                  <Label $special>T|T</Label>
                  <SliderContainer>
                    <Slider
                      type="range"
                      value={settings.lineHeight}
                      min={0}
                      max={2}
                      step={0.1}
                      onChange={(e) => handleSliderChange("lineHeight", e.target.value)}
                    />
                  </SliderContainer>
                  <Value type="lineHeight">{settings.lineHeight.toFixed(1)}</Value>
                  <ResetButton 
                    onClick={() => resetSetting("lineHeight")}
                    variants={resetButtonVariants}
                    whileHover="hover"
                  >
                    <motion.span variants={resetButtonSpanVariants}>R</motion.span>
                  </ResetButton>
                </ControlGroup>

                {/* Letter Spacing Control */}
                <ControlGroup>
                  <Label>AV</Label>
                  <SliderContainer>
                    <Slider
                      type="range"
                      value={displayLetterSpacing}
                      min={letterSpacingConstraints.displayMin}
                      max={letterSpacingConstraints.displayMax}
                      step={1}
                      onChange={(e) => {
                        const displayValue = parseFloat(e.target.value);
                        const actualValue = letterSpacingConstraints.convertDisplayToActual(displayValue);
                        handleSliderChange("letterSpacing", actualValue);
                      }}
                    />
                  </SliderContainer>
                  <Value type="letterSpacing">{Math.round(displayLetterSpacing)}px</Value>
                  <ResetButton 
                    onClick={() => resetSetting("letterSpacing")}
                    variants={resetButtonVariants}
                    whileHover="hover"
                  >
                    <motion.span variants={resetButtonSpanVariants}>R</motion.span>
                  </ResetButton>
                </ControlGroup>
              </ControlsGrid>
            </ControlPanel>
          </ControlsWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FontTesterControls;