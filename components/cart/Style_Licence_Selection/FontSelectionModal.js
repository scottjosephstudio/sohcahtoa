import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { useFontSelection } from "../../../context/FontSelectionContext";

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
    cursor: pointer;
  z-index: 10000; /* Higher than cart container (9999) */
  padding: 20px;
    -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  will-change: backdrop-filter, transform;

  @supports (backdrop-filter: blur(6px)) {
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
      background: rgba(0, 0, 0, 0.5);
  }

  @supports not (backdrop-filter: blur(6px)) {
    background-color: rgba(211, 211, 211, 0.7);
  }

  /* Webkit-specific fallback */
  @supports (-webkit-backdrop-filter: blur(6px)) and
    (not (backdrop-filter: blur(6px))) {
    -webkit-backdrop-filter: blur(6px);
    background-color: rgba(211, 211, 211, 0.3);
  }
    
`;

const ModalContent = styled(motion.div)`
    background-color: #f9f9f9;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.35);
  border-radius: 16px;
  padding: 24px;
  max-width: 380px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  cursor: default;
  position: relative;
  transition: height 0.4s cubic-bezier(0.04, 0.62, 0.23, 0.98);
    -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  perspective: 1000;
  will-change: transform, opacity;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgb(16, 12, 8);
`;

const ModalTitle = styled.div`
  font-size: 20px;
  letter-spacing: 0.8px;
  margin: 0;
  color: rgb(16, 12, 8);
`;

const FontList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.04, 0.62, 0.23, 0.98);
`;

const FontItem = styled.div`
  border: 2px solid ${props => props.selected ? 'rgb(16, 12, 8)' : 'rgb(16, 12, 8)'};
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgb(16, 12, 8);
       background-color: rgba(16, 12, 8, 0.05);
  }


  &:active {
    background-color: rgba(16, 12, 8, 0.1);
  }
`;

const FontName = styled.h3`
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.8px;
  margin: 0 0 -4px 0;
  color: rgb(16, 12, 8);
`;

const StylesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 0px;
  column-gap: 6px;
  margin-top: 6px;
  padding-top: 6px;
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

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid rgb(16, 12, 8);
`;

const Button = styled.button`
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: rgb(16, 12, 8);
    color: white;
    border: 2px solid rgb(16, 12, 8);
    
    &:hover {
      background: #006efe;
      border: 2px solid #006efe;;
    }
    
    &:disabled {
      background: #ccc;
      border-color: #ccc;
      cursor: default;
    }
  ` : `
    background: transparent;
    color: rgb(16, 12, 8);
    border: 2px solid rgb(16, 12, 8);
    
    &:hover {
      background: rgba(16, 12, 8, 0.1);
    }
  `}
`;

const FontSelectionModal = ({ 
  isOpen, 
  onClose, 
  selectedFonts = [], 
  selectedStyles = {},
  onAddFont,
  onUpdateStyles 
}) => {
  const { availableFonts } = useFontSelection();
  const [tempSelectedFont, setTempSelectedFont] = useState(null);
  const [tempSelectedStyles, setTempSelectedStyles] = useState({});

  // Get fonts that aren't already selected - with safety checks
  const availableForSelection = (availableFonts || []).filter(
    font => !(selectedFonts || []).some(selected => selected.id === font.id)
  );

  const handleFontSelect = (font) => {
    if (tempSelectedFont?.id === font.id) {
      setTempSelectedFont(null);
      setTempSelectedStyles({});
    } else {
      setTempSelectedFont(font);
      // Default to first style
      setTempSelectedStyles({
        [font.id]: [font.font_styles?.[0] || { name: 'Regular', id: 'default' }]
      });
    }
  };

  const handleStyleToggle = (fontId, style) => {
    const currentStyles = tempSelectedStyles[fontId] || [];
    const isSelected = currentStyles.some(s => s.id === style.id);
    
    if (isSelected) {
      // Remove style (but keep at least one)
      const updatedStyles = currentStyles.filter(s => s.id !== style.id);
      if (updatedStyles.length === 0) return; // Keep at least one style
      
      setTempSelectedStyles({
        ...tempSelectedStyles,
        [fontId]: updatedStyles
      });
    } else {
      // Add style
      setTempSelectedStyles({
        ...tempSelectedStyles,
        [fontId]: [...currentStyles, style]
      });
    }
  };

  const handleAddFont = () => {
    if (tempSelectedFont) {
      onAddFont(tempSelectedFont, tempSelectedStyles[tempSelectedFont.id] || []);
      setTempSelectedFont(null);
      setTempSelectedStyles({});
      onClose();
    }
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { delay: 0.1 }
    },
    exit: { opacity: 0, scale: 0.95 }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <ModalContent
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>Add Typeface</ModalTitle>
            </ModalHeader>

            {availableForSelection.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 0', 
                color: 'rgba(16, 12, 8, 0.6)',
                fontSize: '20px',
                fontWeight: '500',
                letterSpacing: '0.8px'
              }}>
                All available fonts have been added to your selection.
              </div>
            ) : (
              <FontList>
                {availableForSelection.map((font) => (
                  <FontItem
                    key={font.id}
                    selected={tempSelectedFont?.id === font.id}
                    onClick={() => handleFontSelect(font)}
                  >
                    <FontName>{font.name}</FontName>
                    
                    {tempSelectedFont?.id === font.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                          opacity: 1, 
                          height: 'auto',
                          transition: {
                            height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.3, delay: 0.1, ease: "easeOut" }
                          }
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0,
                          transition: {
                            height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.2, ease: "easeIn" }
                          }
                        }}
                        style={{ overflow: 'hidden' }}
                      >
                        <StylesContainer>
                         
                          {font.font_styles?.map((style, index) => (
                            <motion.div
                              key={style.id}
                              initial={{ opacity: 0, y: 0 }}
                              animate={{ 
                                opacity: 1, 
                                y: 0,
                                transition: {
                                  delay: 0.3 + (index * 0.1),
                                  duration: 0.3,
                                  ease: [0.04, 0.62, 0.23, 0.98]
                                }
                              }}
                              exit={{ 
                                opacity: 0, 
                                y: -5,
                                transition: {
                                  duration: 0.2,
                                  ease: "easeIn"
                                }
                              }}
                            >
                              <StyleChip
                                selected={tempSelectedStyles[font.id]?.some(s => s.id === style.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStyleToggle(font.id, style);
                                }}
                              >
                                {style.name}
                              </StyleChip>
                            </motion.div>
                          ))}
                        </StylesContainer>
                      </motion.div>
                    )}
                  </FontItem>
                ))}
              </FontList>
            )}

            <ModalFooter>
              <Button 
                $primary 
                disabled={!tempSelectedFont || availableForSelection.length === 0}
                onClick={handleAddFont}
              >
                Add Typeface
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );

  // Portal the modal to document.body to escape cart's z-index context
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

export default FontSelectionModal; 