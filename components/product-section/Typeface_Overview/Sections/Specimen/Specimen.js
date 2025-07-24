import React, { useEffect, useState, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import opentype from "opentype.js";

// Animated loading components
const AnimatedLoading = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: inherit;
  color: inherit;
`;

const LoadingText = styled.span`
  font-size: inherit;
  letter-spacing: 0.8px;
  color: inherit;
  font-weight: normal;
`;

const LoadingDot = styled(motion.span)`
  display: inline-block;
  margin-top: 6px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
`;

const Section = styled.div`
  width: 100%;
  background-color: transparent;
`;

const Container = styled.div`
  width: 100%;
  padding: 0;
  height: auto;
  font-size: 16px;
  background-color: transparent;
`;

const Content = styled(motion.div)`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  width: 100%;
  height: 100%;
  background-color: transparent;
`;

const FontInfo = styled.div`
  margin-bottom: 116px;
  padding: 0px 0px;
  border-left: 2px solid rgb(16, 12, 8);
  border-right: 2px solid rgb(16, 12, 8);
  position: relative;
  
  /* Mobile: hide second div (author details only) */
  @media (max-width: 767px) {
    & > div:nth-child(2) {
      display: none;
    }
    
    & > div:nth-child(1) {
      margin-bottom: 12px;
    }
  }
  
  /* Tablet: 2 columns with vertical line */
  @media (min-width: 768px) and (max-width: 1199px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    align-items: start;
    
    & > div:nth-child(1) {
      grid-column: 1;
      grid-row: 1;
    }
    
    & > div:nth-child(2) {
      display: none;
    }
    
    & > div:nth-child(3) {
      grid-column: 2;
      grid-row: 1;
    }
    
    &::before {
      content: '';
      position: absolute;
      left: calc(50% - 1px);
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgb(16, 12, 8);
    }
  }
  
  /* Desktop: 3 columns with vertical lines */
  @media (min-width: 1200px) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    align-items: start;
    
    &::before {
      content: '';
      position: absolute;
      left: calc(33.33% - 1px);
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgb(16, 12, 8);
    }
    
    &::after {
      content: '';
      position: absolute;
      left: calc(66.66% - 1px);
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgb(16, 12, 8);
    }
  }
`;

const FontName = styled.div`
  background: #e0e0e0;
  padding: 1px 12px;
  border-radius: 30px;
  font-size: 12px;
  letter-spacing: 0.8px;
  color: rgb(16, 2, 8);
  margin: 0 0 0px 0;
  display: inline-block;
  width: fit-content;
  font-weight: normal;
`;

const FontDetails = styled.p`
  font-size: 12px;
  letter-spacing: 0.8px;
  line-height: 15px;
  margin: 0px;
  color: rgb(16, 12, 8);
  
  &.mobile-tablet-only {
    @media (min-width: 1200px) {
      display: none;
    }
  }
`;

const SpecimenGrid = styled.div`
  display: grid;
  row-gap: 20px;
  margin-bottom: 20px;
  
  /* Mobile first - single column */
  grid-template-columns: 1fr;
  grid-template-areas: 
    "display"
    "lowercase"
    "numbers"
    "pangram"
    "body"
    "ligatures";
  
  /* Tablet breakpoint - 768px */
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
      "display display"
      "lowercase numbers"
      "pangram ligatures"
      "body body";
  }
  
  /* Desktop breakpoint - 1200px */
  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas: 
      "display display display"
      "lowercase numbers ligatures"
      "pangram body body";
  }
`;

const SpecimenCard = styled(motion.div)`
  position: relative;
  padding: 0px 12px;
  height: auto;
  display: flex;
  flex-direction: column;
   border-left: 2px solid rgb(16, 12, 8);
  
  /* Desktop: 3 columns - specific border logic based on grid areas */
  @media (min-width: 1200px) {
    /* Display Headline, Body Text, and Character Pairs get right borders */
    &[style*="grid-area: display"],
    &[style*="grid-area: body"],
    &[style*="grid-area: ligatures"] {
      border-right: 2px solid rgb(16, 12, 8);
    }
  }
  
  /* Tablet: 2 columns - show right border on 1st column and Character Pairs */
  @media (min-width: 768px) and (max-width: 1199px) {
    &:nth-child(2n-1),
    &[style*="grid-area: ligatures"] {
      border-right: 2px solid rgb(16, 12, 8);
    }
  }
  
  /* Mobile: single column - no right border needed */
  @media (max-width: 767px) {
     border-right: 2px solid rgb(16, 12, 8);
  }
  

`;

const SpecimenTitle = styled.h3`
  background: #e0e0e0;
  padding: 1px 12px;
  border-radius: 30px;
  font-size: 12px;
  letter-spacing: 0.8px;
  color: rgb(16, 2, 8);
  margin: 0 0 12px 0;
  display: inline-block;
  width: fit-content;
  font-weight: normal;
`;

const SpecimenText = styled.div`
  font-size: ${props => props.$fontSize || '20px'};
  line-height: ${props => props.$lineHeight || '24ox'};
  letter-spacing: ${props => props.$letterSpacing || '0.8px'};
  color: rgb(16, 12, 8);
  font-family: ${props => props.$fontFamily || 'inherit'};
  margin-bottom: 12px;
  word-wrap: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  overflow: hidden;
  
  /* Fixed height for animated display headline */
  ${props => props.$isAnimated && `
    height: calc(1.1 * clamp(60px, 8vw, 120px) * 2);
    
    @media (max-width: 767px) {
      height: calc(1.1 * clamp(60px, 8vw, 120px) * 3);
    }
  `}
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SpecimenDescription = styled.p`
  font-size: 14px;
  letter-spacing: 0.6px;
  line-height: 18px;
  color: rgb(16, 12, 8);
  opacity: 1;
  margin: 12px 0 0 0;
`;

// Fade variants for consistent animations
const fadeVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 0 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { opacity: 0, y: -0 }
};

const useFontLoader = (fontPath) => {
  const [font, setFont] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fontPath) {
      setLoading(false);
      setError("No font path provided");
      return;
    }

    setLoading(true);
    setError(null);
    let mounted = true;

    opentype.load(fontPath, (err, loadedFont) => {
      if (!mounted) return;

      if (err) {
        setError(`Failed to load font: ${err.message || "Unknown error"}`);
        setLoading(false);
        return;
      }

      if (!loadedFont || !loadedFont.glyphs || !loadedFont.unitsPerEm) {
        setError("Font loaded but is invalid or corrupted");
        setLoading(false);
        return;
      }

      setFont(loadedFont);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [fontPath]);

  return { font, loading, error };
};

// Animated display headline component
const AnimatedDisplayHeadline = ({ fontFamily }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [fontSize, setFontSize] = useState("");
  
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  // Calculate current font size
  useEffect(() => {
    const calculateFontSize = () => {
      const vw = window.innerWidth / 100;
      const clampedSize = Math.min(Math.max(60, 8 * vw), 120);
      setFontSize(`${Math.round(clampedSize)}px`);
    };
    
    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    return () => window.removeEventListener('resize', calculateFontSize);
  }, []);
  
  useEffect(() => {
    let timeout;
    
    if (isTyping) {
      if (displayText.length < alphabet.length) {
        timeout = setTimeout(() => {
          setDisplayText(alphabet.slice(0, displayText.length + 1));
        }, 50);
      } else {
        // Finished typing alphabet, wait then start deleting
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 5000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 100);
      } else {
        // Finished deleting, wait before restarting cycle
        timeout = setTimeout(() => {
          setIsTyping(true);
        }, 1000);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, alphabet]);
  
  return (
    <div style={{ position: 'relative' }}>
      <SpecimenText
        $fontFamily={fontFamily}
        $fontSize="clamp(60px, 8vw, 120px)"
        $lineHeight="1.1"
        $letterSpacing="clamp(0.8px, 1vw, 0.8px)"
        $isAnimated={true}
        style={{ 
          minWidth: 'fit-content',
          position: 'relative'
        }}
      >
        {displayText}
        <span style={{ 
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none'
        }}>
          {alphabet}
        </span>
      </SpecimenText>
      <div style={{
        position: 'absolute',
        bottom: '-7px',
        left: '0',
        fontSize: '12px',
        color: 'rgba(16, 12, 8)',
        fontFamily: fontFamily
      }}>
        Font-size: {fontSize}
      </div>
    </div>
  );
};

// Sample text specimens
const SPECIMEN_SAMPLES = [
  {
    title: "Display Headline",
    text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    description: "Uppercase alphabet showcase",
    fontSize: "clamp(84px, 8vw, 144px)",
    lineHeight: "1.1",
    letterSpacing: "clamp(0.8px, 1vw, 0.8px)",
    isAnimated: true
  },
  {
    title: "Lowercase Alphabet",
    text: "abcdefghijklmnopqrstuvwxyz",
    description: "Lowercase character set",
    fontSize: "clamp(18px, 3.5vw, 28px)",
    lineHeight: "1.2",
    letterSpacing: "clamp(0.3px, 0.8vw, 0.6px)"
  },
  {
    title: "Numbers & Symbols",
    text: "0123456789 !@#$%^&*()",
    description: "Numerals and punctuation",
    fontSize: "clamp(16px, 3vw, 24px)",
    lineHeight: "1.3",
    letterSpacing: "clamp(0.4px, 0.8vw, 0.8px)"
  },
  {
    title: "Pangram",
    text: "The quick brown fox jumps over the lazy dog",
    description: "Contains every letter of the alphabet",
    fontSize: "clamp(14px, 2.5vw, 20px)",
    lineHeight: "1.4",
    letterSpacing: "clamp(0.3px, 0.6vw, 0.8px)"
  },
  {
    title: "Body Text Sample",
    text: "Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.",
    description: "Extended text for readability testing",
    fontSize: "clamp(12px, 2vw, 16px)",
    lineHeight: "1.5",
    letterSpacing: "clamp(0.2px, 0.4vw, 0.4px)"
  },
  {
    title: "Character Pairs",
    text: "fi fl ff ffi ffl th ch sh ph qu",
    description: "Common ligatures and letter combinations",
    fontSize: "clamp(18px, 3.5vw, 28px)",
    lineHeight: "1.2",
    letterSpacing: "clamp(0.4px, 0.8vw, 0.8px)"
  }
];

export default forwardRef(function SpecimenSection(
  { selectedFont, isSpecimenExiting, isNavigatingHome },
  ref
) {
  const [fontFamily, setFontFamily] = useState('inherit');
  const [fontPath, setFontPath] = useState("/fonts/JANTReg.ttf"); // Set initial fallback
  
  const { font, loading, error } = useFontLoader(fontPath);

  // Get font path from selected font
  useEffect(() => {
    if (!selectedFont) {
      setFontPath("/fonts/JANTReg.ttf");
      return;
    }
    
    if (!selectedFont.font_styles || selectedFont.font_styles.length === 0) {
      setFontPath("/fonts/JANTReg.ttf");
      return;
    }
    
    const firstStyle = selectedFont.font_styles[0];
    const fontFiles = firstStyle.font_files;
    
    // Prefer TTF, then OTF, then WOFF2, then WOFF
    if (fontFiles?.ttf) {
      setFontPath(fontFiles.ttf);
    } else if (fontFiles?.otf) {
      setFontPath(fontFiles.otf);
    } else if (fontFiles?.woff2) {
      setFontPath(fontFiles.woff2);
    } else if (fontFiles?.woff) {
      setFontPath(fontFiles.woff);
    } else {
      setFontPath("/fonts/JANTReg.ttf");
    }
  }, [selectedFont]);

  // Set font family when font loads
  useEffect(() => {
    if (font && font.names) {
      const familyName = font.names.fontFamily?.en || selectedFont?.name || 'inherit';
      setFontFamily(familyName);
    }
  }, [font, selectedFont]);

  if (loading) {
    return (
      <Section>
        <Container>
          <Content>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              fontSize: '16px',
              letterSpacing: '0.8px',
              color: 'rgb(16, 12, 8)'
            }}>
              <AnimatedLoading>
                <LoadingText>Loading {selectedFont?.name || 'font'} specimen</LoadingText>
                <LoadingDot 
                  initial="initial"
                  animate="animate"
                  variants={{
                    initial: { opacity: 0, scale: 0.5 },
                    animate: { 
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1, 1, 0.5],
                      transition: {
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0
                      }
                    }
                  }} 
                />
                <LoadingDot 
                  initial="initial"
                  animate="animate"
                  variants={{
                    initial: { opacity: 0, scale: 0.5 },
                    animate: { 
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1, 1, 0.5],
                      transition: {
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2
                      }
                    }
                  }} 
                />
                <LoadingDot 
                  initial="initial"
                  animate="animate"
                  variants={{
                    initial: { opacity: 0, scale: 0.5 },
                    animate: { 
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1, 1, 0.5],
                      transition: {
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4
                      }
                    }
                  }} 
                />
              </AnimatedLoading>
            </div>
          </Content>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Container>
          <Content>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              width: '100%',
              fontSize: '16px',
              letterSpacing: '0.8px',
              color: 'red',
              textAlign: 'center'
            }}>
              Error loading {selectedFont?.name || 'font'} specimen: {error}
            </div>
          </Content>
        </Container>
      </Section>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && !isSpecimenExiting && (
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Section>
            <Container>
                            <Content>
                <SpecimenGrid>
                  {SPECIMEN_SAMPLES.map((sample, index) => {
                    // Map sample titles to grid area names
                    const gridAreaMap = {
                      "Display Headline": "display",
                      "Lowercase Alphabet": "lowercase", 
                      "Numbers & Symbols": "numbers",
                      "Pangram": "pangram",
                      "Body Text Sample": "body",
                      "Character Pairs": "ligatures"
                    };
                    
                    const gridArea = gridAreaMap[sample.title];
                    
                    return (
                      <SpecimenCard
                        key={index}
                        style={{ gridArea }}
                        data-label={sample.title}
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ delay: index * 0.1 }}
                      >
                        <SpecimenTitle>{sample.title}</SpecimenTitle>
                        {sample.isAnimated ? (
                          <AnimatedDisplayHeadline fontFamily={fontFamily} />
                        ) : (
                          <SpecimenText
                            $fontFamily={fontFamily}
                            $fontSize={sample.fontSize}
                            $lineHeight={sample.lineHeight}
                            $letterSpacing={sample.letterSpacing}
                          >
                            {sample.text}
                          </SpecimenText>
                        )}
                      </SpecimenCard>
                    );
                  })}
                </SpecimenGrid>
                
            {selectedFont && (
              <FontInfo>
                    <div style={{ paddingLeft: '12px', paddingRight: '20px' }}>
                <FontName>{selectedFont.name}</FontName>
                      <FontDetails style={{ marginTop: '12px' }} className="mobile-tablet-only">
                        {selectedFont.designer && `Designer: ${selectedFont.designer}`}
                        {selectedFont.foundry && ` • Foundry: ${selectedFont.foundry}`}
                        {selectedFont.font_styles?.[0] && ` • Style: ${selectedFont.font_styles[0].name}`}
                      </FontDetails>
                    </div>
                    <div style={{ paddingLeft: '12px', paddingRight: '20px' }}>
                <FontDetails>
                  {selectedFont.designer && `Designer: ${selectedFont.designer}`}
                  {selectedFont.foundry && ` • Foundry: ${selectedFont.foundry}`}
                        {selectedFont.font_styles?.[0] && ` • Style: ${selectedFont.font_styles[0].name}`}
                      </FontDetails>
                    </div>
                    <div style={{ paddingLeft: '12px', paddingRight: '20px' }}>
                      <FontDetails style={{ marginBottom: '12px' }}>
                        Discovery of Jan Tschihold's roman letter skeletons made with a 2 nip, a pen for drawing equal stroke widths in all directions held provenance during a 'Type Design' class at the Gerrit Rietveld Academie during 2008 by Radim Pesko and Laurenz Brunner.
                      </FontDetails>
                      <FontDetails>
                        The forms hark of a universal case, with the use of a single story 'a' — no tail or hook on the lower-case 'i', coupled with non-lining figures as standard, offers a kind of medley of times and styles, while retaining both modular and humanist curves alongside proportional spacing within the same map.
                </FontDetails>
                    </div>
              </FontInfo>
            )}
              </Content>
            </Container>
          </Section>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
