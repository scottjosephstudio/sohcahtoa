import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  radioLabelVariants,
} from "../styles";
import { useFontSelection } from "../../../context/FontSelectionContext";
import { useCart } from "../Utils/CartContext";
import FontSelectionModal from "./FontSelectionModal";
import styled from "styled-components";

// Styled components for weight selection
const StylesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
  column-gap: 6px;
  margin-top: -6px;
  margin-bottom: 12px; /* Negative margin to pull pills closer to label */
  margin-left: 32px; /* Align with the radio button label */
`;

// Custom RadioGroup with reduced bottom margin for style selection
const StyleRadioGroup = styled(RadioGroup)`
  margin-top: 12px; /* Reduced from default 12px */
`;

const StyleChip = styled.button`
  background: ${props => props.selected ? 'rgb(16, 12, 8)' : 'transparent'};
  color: ${props => props.selected ? 'white' : 'rgb(16, 12, 8)'};
  border: 1px solid rgb(16, 12, 8);
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 12px;
  letter-spacing: 0.8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.selected ? 'rgb(16, 12, 8)' : 'rgba(16, 12, 8, 0.2)'};
  }
`;

export const StyleSelection = ({
  weightOption,
  onWeightSelect,
  isContinueClicked,
  isLicenceOpen,
  onContinue,
  selectedPackage,
  customizing,
  onNavigateHome,
  customLicenses,
  cartFont,
  selectedFonts = [],
  selectedStyles = {},
  onUpdateFonts,
  onUpdateStyles,
  onRemoveStyle,
}) => {
  const [hoveredFontId, setHoveredFontId] = useState(null);
  const [showFontModal, setShowFontModal] = useState(false);
  const { availableFonts } = useFontSelection();

  // Get selectedFontIds from context instead of local state
  const { selectedFontIds, setSelectedFontIds } = useCart();

  // Initialize selectedFontIds when component mounts with existing selectedFonts
  useEffect(() => {
    if (selectedFonts.length > 0) {
      const fontIds = selectedFonts.map(font => font.id);
      setSelectedFontIds(new Set(fontIds));
    } else if (cartFont && weightOption === "display") {
      // Handle case where cartFont exists but selectedFonts is empty
      setSelectedFontIds(new Set([cartFont.id]));
    }
  }, []); // Only run on mount

  // Sync selectedFonts with selectedFontIds - remove unchecked fonts
  useEffect(() => {
    if (selectedFonts.length > 0 && selectedFontIds.size > 0) {
      const checkedFonts = selectedFonts.filter(font => selectedFontIds.has(font.id));
      const uncheckedFonts = selectedFonts.filter(font => !selectedFontIds.has(font.id));
      
      // If there are unchecked fonts, remove them from selectedFonts and selectedStyles
      if (uncheckedFonts.length > 0) {
        const updatedStyles = { ...selectedStyles };
        uncheckedFonts.forEach(font => {
          delete updatedStyles[font.id];
        });
        
        onUpdateFonts(checkedFonts);
        onUpdateStyles(updatedStyles);
      }
    }
  }, [selectedFontIds]); // Run when selectedFontIds changes

  // Initialize cartFont in multi-font system when cart opens
  useEffect(() => {
    if (cartFont && weightOption === "display") {
      // Check if cartFont is already in selectedFonts
      const cartFontExists = selectedFonts.some(font => font.id === cartFont.id);
      
      if (!cartFontExists) {
      // Add cartFont to selectedFonts and selectedStyles
        const defaultStyle = cartFont.font_styles?.[0] || { name: 'Regular', id: 'default' };
        
        onUpdateFonts([...selectedFonts, cartFont]);
        onUpdateStyles({
          ...selectedStyles,
          [cartFont.id]: [defaultStyle]
        });
      }
      
      // Always ensure cartFont is checked when weightOption is display
      setSelectedFontIds(prev => new Set([...prev, cartFont.id]));
    }
  }, [cartFont, weightOption]);

  // Initialize cartFont styles when it's first added (for primary font scenario)
  useEffect(() => {
    if (cartFont && selectedFonts.length === 0 && !selectedStyles[cartFont.id]) {
      // Initialize primary font with first style
      const defaultStyle = cartFont.font_styles?.[0] || { name: 'Regular', id: 'default' };
      onUpdateStyles({
        ...selectedStyles,
        [cartFont.id]: [defaultStyle]
      });
    }
  }, [cartFont, selectedFonts.length, selectedStyles]);

  // Also ensure cartFont is checked when it's added (even if weightOption changes)
  useEffect(() => {
    if (cartFont) {
      setSelectedFontIds(prev => new Set([...prev, cartFont.id]));
    }
  }, [cartFont]);

  const getActiveLicenses = () => {
    if (!customLicenses) return [];
    const {
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
    } = customLicenses;
    return [
      { type: "print", value: customPrintLicense },
      { type: "web", value: customWebLicense },
      { type: "app", value: customAppLicense },
      { type: "social", value: customSocialLicense },
    ].filter((license) => license.value !== null);
  };

  const handleButtonClick = () => {
    if (isLicenceOpen) {
      // "Back to Typefaces" - use existing navigation flow which will trigger animations
      onContinue();
    } else {
      // "Continue" - normal flow
      onContinue();
    }
  };

  // Handle adding fonts via modal
  const handleAddTypefaces = () => {
    setShowFontModal(true);
  };

  // Handle adding a font from the modal
  const handleAddFont = (font, styles) => {
    const updatedFonts = [...selectedFonts, font];
    const updatedStyles = {
      ...selectedStyles,
      [font.id]: styles
    };
    
    // Add font to selectedFontIds so checkbox appears checked
    setSelectedFontIds(prev => new Set([...prev, font.id]));
    
    onUpdateFonts(updatedFonts);
    onUpdateStyles(updatedStyles);
    
    // Set weight option to display so the continue button becomes enabled
    if (!weightOption) {
      onWeightSelect("display");
    }
    
    // Auto-open license selection if it's not already open
    if (!isLicenceOpen) {
      onContinue();
    }
  };

  // Handle individual font selection/deselection for styling
  const handleFontToggle = (fontId) => {
    const newSelectedFontIds = new Set(selectedFontIds);
    
    if (newSelectedFontIds.has(fontId)) {
      // Deselecting font - remove it from cart entirely
      newSelectedFontIds.delete(fontId);
      
      // Remove font from selectedFonts and selectedStyles
      const updatedFonts = selectedFonts.filter(font => font.id !== fontId);
      const updatedStyles = { ...selectedStyles };
      delete updatedStyles[fontId];
      
      // If this was the last font and it's being deselected, clear the entire cart
      if (newSelectedFontIds.size === 0 && updatedFonts.length === 0) {
        onRemoveStyle();
        return;
      }
      
      onUpdateFonts(updatedFonts);
      onUpdateStyles(updatedStyles);
      
      // If this was the last font and it's being deselected, clear the weight option
      if (newSelectedFontIds.size === 0) {
        onWeightSelect("");
      }
    } else {
      // Selecting font - add it to selected set
      newSelectedFontIds.add(fontId);
    }
    
    setSelectedFontIds(newSelectedFontIds);
    
    // Update the weight option based on selection state
    if (newSelectedFontIds.size > 0 && !weightOption) {
      onWeightSelect("display");
    }
  };

  // Handle individual style selection within a font
  const handleStyleToggle = (fontId, style) => {
    const currentStyles = selectedStyles[fontId] || [];
    const isSelected = currentStyles.some(s => s.id === style.id);
    
    if (isSelected) {
      // Remove style (but keep at least one)
      const updatedStyles = currentStyles.filter(s => s.id !== style.id);
      if (updatedStyles.length === 0) return; // Keep at least one style
      
      onUpdateStyles({
        ...selectedStyles,
        [fontId]: updatedStyles
      });
    } else {
      // Add style
      onUpdateStyles({
        ...selectedStyles,
        [fontId]: [...currentStyles, style]
      });
    }
  };

  // Handle primary font selection (when no multi-fonts)
  const handlePrimaryFontToggle = () => {
    if (weightOption === "display") {
      onWeightSelect("");
    } else {
      onWeightSelect("display");
    }
  };

  // Get the font name for display (primary font)
  const getFontDisplayName = () => {
    if (cartFont?.name) {
      // Get the first font style (usually Regular) or default to Regular
      const firstStyle = cartFont.font_styles?.[0]?.name || "Regular";
      return `${cartFont.name} ${firstStyle}`;
    }
    return "Font Regular"; // Fallback
  };

  // Get all selected fonts summary
  const getSelectedFontsSummary = () => {
    if (selectedFonts.length === 0) return getFontDisplayName();
    
    if (selectedFonts.length === 1) {
      const font = selectedFonts[0];
      const styles = selectedStyles[font.id] || [];
      const styleNames = styles.map(s => s.name).join(", ");
      return `${font.name} ${styleNames}`;
    }
    
    return `${selectedFonts.length} Fonts Selected`;
  };

  // Get available fonts count
  const getAvailableFontsCount = () => {
    if (!availableFonts) return 0;
    const selectedFontIds = selectedFonts.map(f => f.id);
    return availableFonts.filter(font => !selectedFontIds.includes(font.id)).length;
  };

  // Check if any fonts are selected (for continue button state)
  const hasAnySelection = () => {
    // If there's a cartFont, the button should always be enabled
    if (cartFont) {
      return true;
    }
    
    if (selectedFonts.length > 0) {
      return selectedFontIds.size > 0;
    }
    return weightOption === "display";
  };

  return (
    <>
      <StepContainer
        isStylesForm
        hasSelections={
          weightOption || selectedPackage || (customizing && getActiveLicenses().length > 0)
        }
      >
        <OptionHeader>Select Styles</OptionHeader>
        
        {/* All Selected Fonts - Each with individual style selection */}
        {selectedFonts.map((font, index) => (
          <div key={font.id}>
            <StyleRadioGroup>
            <RadioLabel
              variants={radioLabelVariants}
              initial="initial"
              whileHover="hover"
              onHoverStart={() => setHoveredFontId(font.id)}
              onHoverEnd={() => setHoveredFontId(null)}
            >
              <RadioInput
                type="checkbox"
                name={`font-${font.id}`}
                value={`font-${font.id}`}
                checked={selectedFontIds.has(font.id)}
                onChange={() => handleFontToggle(font.id)}
                variants={radioInputVariants}
                initial="initial"
                whileHover={selectedFontIds.has(font.id) ? "checkedHover" : "hover"}
                animate={
                  selectedFontIds.has(font.id)
                    ? "checked"
                    : hoveredFontId === font.id
                      ? "hover"
                      : "initial"
                }
              />
              <UsageText>
                  {font.name}
              </UsageText>
            </RadioLabel>
            </StyleRadioGroup>
            
            {/* Style Pills - only show if font is selected */}
            {selectedFontIds.has(font.id) && font.font_styles && (
              <StylesContainer>
                {font.font_styles.map((style) => (
                  <StyleChip
                    key={style.id}
                    selected={(selectedStyles[font.id] || []).some(s => s.id === style.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStyleToggle(font.id, style);
                    }}
                  >
                    {style.name}
                  </StyleChip>
                ))}
              </StylesContainer>
            )}
          </div>
        ))}

        {/* Show primary font if no multi-fonts selected AND cartFont exists */}
        {selectedFonts.length === 0 && cartFont && (
          <div>
            <StyleRadioGroup>
            <RadioLabel
              variants={radioLabelVariants}
              initial="initial"
              whileHover="hover"
              onHoverStart={() => setHoveredFontId("primary")}
              onHoverEnd={() => setHoveredFontId(null)}
            >
              <RadioInput
                type="checkbox"
                name="primary-font"
                value="display"
                checked={weightOption === "display"}
                onChange={handlePrimaryFontToggle}
                variants={radioInputVariants}
                initial="initial"
                whileHover={weightOption === "display" ? "checkedHover" : "hover"}
                animate={
                  weightOption === "display"
                    ? "checked"
                    : hoveredFontId === "primary"
                      ? "hover"
                      : "initial"
                }
              />
                <UsageText>{cartFont.name}</UsageText>
            </RadioLabel>
            </StyleRadioGroup>
            
            {/* Style Pills for primary font - only show if selected */}
            {weightOption === "display" && cartFont.font_styles && (
              <StylesContainer>
                {cartFont.font_styles.map((style) => (
                  <StyleChip
                    key={style.id}
                    selected={(selectedStyles[cartFont.id] || []).some(s => s.id === style.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStyleToggle(cartFont.id, style);
                    }}
                  >
                    {style.name}
                  </StyleChip>
                ))}
              </StylesContainer>
            )}
          </div>
        )}

        {/* Add Typefaces Button */}
        <AddTypefacesButton 
          onClick={handleAddTypefaces}
          disabled={getAvailableFontsCount() === 0}
          style={{ marginTop: "20px" }}
        >
          <div>
            <span>+ Add Typeface</span>
          </div>
          <div>
            <span>
              {getAvailableFontsCount() === 0 
                ? "All typefaces added" 
                : `${getAvailableFontsCount()} available`
              }
            </span>
          </div>
        </AddTypefacesButton>

        <Button
          disabled={!hasAnySelection()}
          onClick={handleButtonClick}
          variants={buttonVariants}
          initial="initial"
          animate={!hasAnySelection() ? "disabled" : "enabled"}
          whileHover={!hasAnySelection() ? {} : "hover"}
          whileTap={!hasAnySelection() ? {} : "hover"}
          style={{ marginTop: "21px" }}
        >
          {isLicenceOpen ? "Back to Typefaces" : "Continue"}
        </Button>
      </StepContainer>

      {/* Font Selection Modal */}
      <FontSelectionModal
        isOpen={showFontModal}
        onClose={() => setShowFontModal(false)}
        selectedFonts={selectedFonts}
        selectedStyles={selectedStyles}
        onAddFont={handleAddFont}
        onUpdateStyles={onUpdateStyles}
      />
    </>
  );
};
