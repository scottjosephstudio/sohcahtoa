import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StepContainer,
  OptionHeader,
  RadioGroup,
  RadioLabel,
  RadioInput,
  UsageText,
  AddTypefacesButton,
  Button,
  radioInputVariants,
  buttonVariants,
  radioLabelVariants
} from '../styles';

export const StyleSelection = ({
  weightOption,
  onWeightSelect,
  isContinueClicked,
  isLicenceOpen,
  onContinue,
  selectedPackage,
  customizing,
  onNavigateHome,
  customLicenses
}) => {
  const [isRadioHovered, setIsRadioHovered] = useState(false);

  const getActiveLicenses = () => {
    if (!customLicenses) return [];
    const { customPrintLicense, customWebLicense, customAppLicense, customSocialLicense } = customLicenses;
    return [
      { type: 'print', value: customPrintLicense },
      { type: 'web', value: customWebLicense },
      { type: 'app', value: customAppLicense },
      { type: 'social', value: customSocialLicense }
    ].filter(license => license.value !== null);
  };

  const handleButtonClick = () => {
    if (isContinueClicked && isLicenceOpen) {
      // First close the cart
      onContinue();
      
      // Wait for cart closing animation
      setTimeout(() => {
        // Once cart is closed, dispatch the page transition event
        // This matches the behavior in handleHomeClick
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('pageTransitionStart', {
            detail: {
              isNavigatingToHome: false,
              isNavigatingToTypefaces: true
            }
          });
          window.dispatchEvent(event);
        }
      }, 300); // Match cart closing duration
    } else {
      onContinue();
    }
  };

  return (
    <StepContainer
      isStylesForm
      hasSelections={weightOption && (selectedPackage || (customizing && getActiveLicenses().length > 0))}
    >
          <OptionHeader>Select Styles</OptionHeader>
          <RadioGroup>
            <RadioLabel
              variants={radioLabelVariants}
              initial="initial"
              whileHover="hover"
              onHoverStart={() => setIsRadioHovered(true)}
              onHoverEnd={() => setIsRadioHovered(false)}
            >
              <RadioInput
                type="radio"
                name="weight"
                value="display"
                checked={weightOption === 'display'}
                onChange={(e) => onWeightSelect(e.target.value)}
                variants={radioInputVariants}
                initial="initial"
                whileHover={weightOption === 'display' ? "checkedHover" : "hover"}
                animate={
                  weightOption === 'display' 
                    ? "checked"
                    : (isRadioHovered ? "hover" : "initial")
                }
              />
              <UsageText>Soh Cah Toa Display</UsageText>
            </RadioLabel>
          </RadioGroup>

          <AddTypefacesButton disabled style={{ marginTop: '18px' }}>
            <div>
              <span>+ Add Typefaces</span>
            </div>
            <div>
              <span>Coming Soon</span>
            </div>
          </AddTypefacesButton>

          <Button
            disabled={!weightOption}
            onClick={handleButtonClick}
            variants={buttonVariants}
            initial="initial"
            animate={!weightOption ? "disabled" : "enabled"}
            whileHover={!weightOption ? {} : "hover"}
            whileTap={!weightOption ? {} : "hover"}
            style={{ marginTop: '21px' }}
          >
            {isLicenceOpen ? 'Back to Typefaces' : 'Continue'}
          </Button>
    </StepContainer>
  );
};