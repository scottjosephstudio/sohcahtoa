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
  margin-top: 2rem;
  width: 100%;
  min-height: auto;
`;

const Container = styled.div`
  width: 100%;
  padding: 0 0px;
  height: auto;
  font-size: 16px;
`;

const Content = styled(motion.div)`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  width: 100%;
  height: 100%;
`;

const FontInfo = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(249, 249, 249, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const FontName = styled.div`
  font-size: 24px;
  letter-spacing: 0.8px;
  line-height: 28px;
  color: rgb(16, 12, 8);
  margin-bottom: 8px;
  font-weight: 500;
`;

const FontDetails = styled.p`
  font-size: 16px;
  letter-spacing: 0.8px;
  line-height: 20px;
  margin: 0;
  color: rgb(16, 12, 8);
  opacity: 0.8;
`;

const SpecimenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 60px;
`;

const SpecimenCard = styled(motion.div)`
  background: rgba(249, 249, 249, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const SpecimenTitle = styled.h3`
  font-size: 18px;
  letter-spacing: 0.8px;
  line-height: 22px;
  color: rgb(16, 12, 8);
  margin: 0 0 16px 0;
  font-weight: 500;
`;

const SpecimenText = styled.div`
  font-size: ${props => props.$fontSize || '20px'};
  line-height: ${props => props.$lineHeight || '1.4'};
  letter-spacing: ${props => props.$letterSpacing || '0.8px'};
  color: rgb(16, 12, 8);
  font-family: ${props => props.$fontFamily || 'inherit'};
  margin-bottom: 12px;
  word-wrap: break-word;
  hyphens: auto;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SpecimenDescription = styled.p`
  font-size: 14px;
  letter-spacing: 0.6px;
  line-height: 18px;
  color: rgb(16, 12, 8);
  opacity: 0.6;
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
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { opacity: 0, y: -20 }
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

// Sample text specimens
const SPECIMEN_SAMPLES = [
  {
    title: "Display Headline",
    text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    description: "Uppercase alphabet showcase",
    fontSize: "36px",
    lineHeight: "1.1",
    letterSpacing: "1.2px"
  },
  {
    title: "Lowercase Alphabet",
    text: "abcdefghijklmnopqrstuvwxyz",
    description: "Lowercase character set",
    fontSize: "28px",
    lineHeight: "1.2",
    letterSpacing: "0.6px"
  },
  {
    title: "Numbers & Symbols",
    text: "0123456789 !@#$%^&*()",
    description: "Numerals and punctuation",
    fontSize: "24px",
    lineHeight: "1.3",
    letterSpacing: "0.8px"
  },
  {
    title: "Pangram",
    text: "The quick brown fox jumps over the lazy dog",
    description: "Contains every letter of the alphabet",
    fontSize: "20px",
    lineHeight: "1.4",
    letterSpacing: "0.8px"
  },
  {
    title: "Body Text Sample",
    text: "Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.",
    description: "Extended text for readability testing",
    fontSize: "16px",
    lineHeight: "1.5",
    letterSpacing: "0.4px"
  },
  {
    title: "Character Pairs",
    text: "fi fl ff ffi ffl th ch sh ph qu",
    description: "Common ligatures and letter combinations",
    fontSize: "28px",
    lineHeight: "1.2",
    letterSpacing: "0.8px"
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
              height: '200px',
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
                {selectedFont && (
                  <FontInfo>
                    <FontName>{selectedFont.name}</FontName>
                    <FontDetails>
                      {selectedFont.designer && `Designer: ${selectedFont.designer}`}
                      {selectedFont.foundry && ` • Foundry: ${selectedFont.foundry}`}
                      {selectedFont.font_styles?.[0] && ` • Style: ${selectedFont.font_styles[0].name}`}
                    </FontDetails>
                  </FontInfo>
                )}

                <SpecimenGrid>
                  {SPECIMEN_SAMPLES.map((sample, index) => (
                    <SpecimenCard
                      key={index}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ delay: index * 0.1 }}
                    >
                      <SpecimenTitle>{sample.title}</SpecimenTitle>
                      <SpecimenText
                        $fontFamily={fontFamily}
                        $fontSize={sample.fontSize}
                        $lineHeight={sample.lineHeight}
                        $letterSpacing={sample.letterSpacing}
                      >
                        {sample.text}
                      </SpecimenText>
                      <SpecimenDescription>{sample.description}</SpecimenDescription>
                    </SpecimenCard>
                  ))}
                </SpecimenGrid>
              </Content>
            </Container>
          </Section>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
