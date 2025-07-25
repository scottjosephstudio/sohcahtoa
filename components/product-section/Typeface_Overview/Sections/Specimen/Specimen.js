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

const FontDetails = styled.div`
  font-size: 16px;
  letter-spacing: 0.8px;
  line-height: 20px;
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
    "theorists"
    "body"
    "lowercase"
    "numbers"
    "body2"
    "pangram"
    "ligatures";
  
  /* Tablet breakpoint - 768px */
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
      "display display"
      "theorists theorists"
      "body body"
      "lowercase numbers"
      "body2 body2"
      "pangram ligatures";
  }
  
  /* Desktop breakpoint - 1200px */
  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
      "display display"
      "theorists theorists"
      "body body"
      "lowercase numbers"
      "body2 body2"
      "pangram ligatures";
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
    &[style*="grid-area: display"],
    &[style*="grid-area: body"],
    &[style*="grid-area: numbers"],
    &[style*="grid-area: ligatures"],
    &[style*="grid-area: theorists"] {
      border-right: 2px solid rgb(16, 12, 8);
    }
    &[style*="grid-area: pangram"],
    &[style*="grid-area: lowercase"] {
      border-right: none;
    }
    &[style*="grid-area: display"] {
      padding-right: 6px;
    }
  }
  
  /* Tablet: 2 columns - show right border on 1st column and specific areas */
  @media (min-width: 768px) and (max-width: 1199px) {
    &:nth-child(2n-1),
    &[style*="grid-area: body"],
    &[style*="grid-area: numbers"],
    &[style*="grid-area: ligatures"],
    &[style*="grid-area: theorists"] {
      border-right: 2px solid rgb(16, 12, 8);
    }
    &[style*="grid-area: pangram"],
    &[style*="grid-area: lowercase"] {
      border-right: none;
    }
    &[style*="grid-area: display"] {
      padding-right: 6px;
    }
  }
  
  /* Mobile: single column - no right border needed */
  @media (max-width: 767px) {
    border-right: 2px solid rgb(16, 12, 8);
    &[style*="grid-area: display"] {
      padding-right: 6px;
    }
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
  margin-bottom: ${props => props.$twoColumns ? '0' : '12px'};
  word-wrap: break-word;
  hyphens: ${props => props.$noHyphens ? 'none' : 'auto'};
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  overflow: hidden;
  
  /* Single column layout with center alignment */
  ${props => props.$singleColumn && `
    text-align: center;
    width: 100%;
    margin-bottom: 0;
  `}
  
  /* Multi-column layout for body text */
  ${props => props.$twoColumns && `
    /* Mobile: single column with overflow control */
    @media (max-width: 600px) {

      overflow: hidden;
      margin-bottom: 0;
    }
    
    /* Tablet: single column with overflow control */
    @media (min-width: 601px) and (max-width: 768px) {

      overflow: hidden;
      margin-bottom: 0;
    }
    
    /* Tablet: 2 columns */
    @media (min-width: 768px) and (max-width: 1199px) {
      column-count: 2;
      column-gap: 40px;
      column-fill: balance;
      margin-bottom: 0;
    }
    
    /* Desktop: 3 columns */
    @media (min-width: 1200px) and (max-width: 1599px) {
      column-count: 3;
      column-gap: 40px;
      column-fill: balance;
      margin-bottom: 0;
    }
    
    /* Large screens: 4 columns */
    @media (min-width: 1600px) {
      column-count: 4;
      column-gap: 40px;
      column-fill: balance;
      margin-bottom: 0;
    }
  `}
  
  /* Extended multi-column layout for body text 2 */
  ${props => props.$multiColumn && `
    /* Mobile: single column with overflow control */
    @media (max-width: 767px) {
      max-height: 200px;
      overflow: hidden;
      margin-bottom: 0;
    }
    
    /* Tablet: 2 columns */
    @media (min-width: 768px) and (max-width: 1199px) {
      column-count: 2;
      column-gap: 40px;
      column-fill: balance;
      margin-bottom: 0;
    }
    
    /* Desktop: 3 columns */
    @media (min-width: 1200px) and (max-width: 1599px) {
      column-count: 3;
      column-gap: 40px;
      column-fill: balance;
      margin-bottom: 0;
    }
    
    /* Large screens: 4 columns */
    @media (min-width: 1600px) and (max-width: 1999px) {
      column-count: 4;
      column-gap: 40px;
      column-fill: balance;
      margin-bottom: 0;
    }
    
    /* Extra large screens: 5 columns */
    @media (min-width: 2000px) {
      column-count: 5;
      column-gap: 40px;
      column-fill: balance;
      margin-bottom: 0;
    }
  `}
  
  &:last-child {
    margin-bottom: 0;
  }
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

// Function to calculate actual font-size from clamp CSS
const calculateActualFontSize = (clampValue) => {
  // Parse clamp(min, preferred, max) format
  const match = clampValue.match(/clamp\(([^,]+),([^,]+),([^)]+)\)/);
  if (!match) return clampValue;
  
  const [, min, preferred, max] = match;
  const viewportWidth = window.innerWidth;
  
  // Convert viewport units to pixels
  const preferredValue = preferred.trim();
  let preferredPx;
  
  if (preferredValue.includes('vw')) {
    const vwValue = parseFloat(preferredValue.replace('vw', ''));
    preferredPx = (viewportWidth * vwValue) / 100;
  } else if (preferredValue.includes('px')) {
    preferredPx = parseFloat(preferredValue.replace('px', ''));
  } else {
    preferredPx = parseFloat(preferredValue);
  }
  
  // Parse min and max values
  const minPx = parseFloat(min.replace('px', ''));
  const maxPx = parseFloat(max.replace('px', ''));
  
  // Apply clamp logic
  const actualSize = Math.min(Math.max(minPx, preferredPx), maxPx);
  return `${Math.round(actualSize)}px`;
};



// Function to truncate text based on available height and font-size
const truncateTextByHeight = (text, fontSize, lineHeight, maxHeight) => {
  // Create a temporary element to measure text height
  const tempElement = document.createElement('div');
  tempElement.style.fontSize = fontSize;
  tempElement.style.lineHeight = lineHeight;
  tempElement.style.width = '100%';
  tempElement.style.position = 'absolute';
  tempElement.style.visibility = 'hidden';
  tempElement.style.whiteSpace = 'pre-wrap';
  tempElement.style.wordWrap = 'break-word';
  tempElement.style.overflow = 'hidden';
  
  document.body.appendChild(tempElement);
  
  // Binary search to find the right amount of text
  let start = 0;
  let end = text.length;
  let result = '';
  
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const testText = text.substring(0, mid);
    
    tempElement.textContent = testText;
    const height = tempElement.scrollHeight;
    
    if (height <= maxHeight) {
      result = testText;
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }
  
  document.body.removeChild(tempElement);
  
  // Add ellipsis if text was truncated
  if (result.length < text.length) {
    // Find the last complete word
    const lastSpace = result.lastIndexOf(' ');
    if (lastSpace > 0) {
      result = result.substring(0, lastSpace);
    }
    result += '...';
  }
  
  return result;
};

// Animated display headline component
const AnimatedDisplayHeadline = ({ fontFamily }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [fontSize, setFontSize] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  // Check if we're in mobile/tablet mode (768px and below)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Calculate font size to fill container width within height constraints
  useEffect(() => {
    const calculateFontSize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.offsetWidth - (isMobile ? 12 : 24); // Account for padding
      
      // Calculate font size to fit the full alphabet on one line
      const singleLineTest = document.createElement('div');
      singleLineTest.style.fontFamily = fontFamily;
      singleLineTest.style.fontSize = '100px';
      singleLineTest.style.visibility = 'hidden';
      singleLineTest.style.position = 'absolute';
      singleLineTest.style.whiteSpace = 'nowrap';
      singleLineTest.textContent = alphabet;
      document.body.appendChild(singleLineTest);
      
      const singleLineWidth = singleLineTest.offsetWidth;
      const scale = containerWidth / singleLineWidth;
      const optimalFontSize = (isMobile ? 196 : 98) * scale;
      
      document.body.removeChild(singleLineTest);
      
      // Apply different limits based on screen size
      let clampedSize;
      if (isMobile) {
        // For mobile/tablet (768px and below), allow smaller font size for 2-line wrapping
        clampedSize = Math.min(Math.max(30, optimalFontSize), 200);
      } else {
        // For desktop, maintain current limits
        clampedSize = Math.min(Math.max(40, optimalFontSize), 300);
      }
      
      setFontSize(`${Math.round(clampedSize)}px`);
    };
    
    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    return () => window.removeEventListener('resize', calculateFontSize);
  }, [fontFamily, isMobile]);
  
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
    <div ref={containerRef} style={{ 
      position: 'relative', 
      width: '100%',
      minHeight: fontSize ? `calc(${fontSize} * ${isMobile ? '2.8' : '1.4'})` : 'auto'
    }}>
      <SpecimenText
        $fontFamily={fontFamily}
        $fontSize={fontSize}
        $lineHeight={isMobile ? "1.1" : "1.1"}
        $letterSpacing="0.02em"
        $isAnimated={true}
        style={{ 
          width: '100%',
          position: 'relative',
          whiteSpace: isMobile ? 'normal' : 'nowrap'
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
        bottom: '-8px',
        left: '0',
        fontSize: '12px',
        color: 'rgba(16, 12, 8)',
        fontFamily: fontFamily,
        marginTop: '12px'
      }}>
        Font-size: {fontSize}
      </div>
    </div>
  );
};

// Animated lowercase alphabet component
const AnimatedLowercaseAlphabet = ({ fontFamily }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [fontSize, setFontSize] = useState("");
  const containerRef = useRef(null);
  
  const alphabet = "ONLY 1 IN 3";
  
  // Calculate font size to fill container width
  useEffect(() => {
    const calculateFontSize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.offsetWidth - 24; // Account for padding
      
      // Calculate font size to fit the full alphabet on one line
      const singleLineTest = document.createElement('div');
      singleLineTest.style.fontFamily = fontFamily;
      singleLineTest.style.fontSize = '100px';
      singleLineTest.style.visibility = 'hidden';
      singleLineTest.style.position = 'absolute';
      singleLineTest.style.whiteSpace = 'nowrap';
      singleLineTest.textContent = alphabet;
      document.body.appendChild(singleLineTest);
      
      const singleLineWidth = singleLineTest.offsetWidth;
      const scale = containerWidth / singleLineWidth;
      const optimalFontSize = 100 * scale;
      
      document.body.removeChild(singleLineTest);
      
      // Apply clamp limits
      const clampedSize = Math.min(Math.max(24, optimalFontSize), 36);
      setFontSize(`${Math.round(clampedSize)}px`);
    };
    
    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    return () => window.removeEventListener('resize', calculateFontSize);
  }, [fontFamily, alphabet]);
  
  useEffect(() => {
    let timeout;
    
    if (isTyping) {
      if (displayText.length < alphabet.length) {
        timeout = setTimeout(() => {
          setDisplayText(alphabet.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(true);
        }, 1000);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, alphabet]);
  
  return (
    <div ref={containerRef} style={{ 
      position: 'relative', 
      width: '100%'
    }}>
      <div style={{
        height: fontSize ? `calc(${fontSize} * 1)` : 'auto',
        marginBottom: '18px'
      }}>
        <SpecimenText
          $fontFamily={fontFamily}
          $fontSize={fontSize}
          $lineHeight="1"
          $letterSpacing="clamp(0.8px, 0.8vw, 0.6px)"
          style={{ 
            width: '100%',
            position: 'relative',
            whiteSpace: 'nowrap',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
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
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '-8px',
        left: '0',
        fontSize: '12px',
        color: 'rgba(16, 12, 8)',
        fontFamily: fontFamily,
        marginTop: '12px'
      }}>
        Font-size: {fontSize}
      </div>
    </div>
  );
};

// Animated numbers and symbols component
const AnimatedNumbersSymbols = ({ fontFamily }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [fontSize, setFontSize] = useState("");
  const containerRef = useRef(null);
  
  const symbols = "ARE PUPILS ";
  
  // Calculate font size to fill container width
  useEffect(() => {
    const calculateFontSize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.offsetWidth - 24; // Account for padding
      
      // Calculate font size to fit the full symbols on one line
      const singleLineTest = document.createElement('div');
      singleLineTest.style.fontFamily = fontFamily;
      singleLineTest.style.fontSize = '100px';
      singleLineTest.style.visibility = 'hidden';
      singleLineTest.style.position = 'absolute';
      singleLineTest.style.whiteSpace = 'nowrap';
      singleLineTest.textContent = symbols;
      document.body.appendChild(singleLineTest);
      
      const singleLineWidth = singleLineTest.offsetWidth;
      const scale = containerWidth / singleLineWidth;
      const optimalFontSize = 100 * scale;
      
      document.body.removeChild(singleLineTest);
      
      // Apply clamp limits
      const clampedSize = Math.min(Math.max(24, optimalFontSize), 36);
      setFontSize(`${Math.round(clampedSize)}px`);
    };
    
    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    return () => window.removeEventListener('resize', calculateFontSize);
  }, [fontFamily, symbols]);
  
  useEffect(() => {
    let timeout;
    
    if (isTyping) {
      if (displayText.length < symbols.length) {
        timeout = setTimeout(() => {
          setDisplayText(symbols.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(true);
        }, 1000);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, symbols]);
  
  return (
    <div ref={containerRef} style={{ 
      position: 'relative', 
      width: '100%'
    }}>
      <div style={{
        height: fontSize ? `calc(${fontSize} * 1)` : 'auto',
        marginBottom: '18px'
      }}>
        <SpecimenText
          $fontFamily={fontFamily}
          $fontSize={fontSize}
          $lineHeight="1"
          $letterSpacing="clamp(0.4px, 0.8vw, 0.8px)"
          style={{ 
            width: '100%',
            position: 'relative',
            whiteSpace: 'nowrap',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          {displayText}
          <span style={{ 
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none'
          }}>
            {symbols}
          </span>
        </SpecimenText>
      </div>
      
            <div style={{
        position: 'absolute',
        bottom: '-8px',
        left: '0',
        fontSize: '12px',
        color: 'rgba(16, 12, 8)',
        fontFamily: fontFamily,
        marginTop: '12px'
      }}>
        Font-size: {fontSize}
      </div>
    </div>
  );
};



// Natural flow body text component that shows only what fits
const NaturalFlowBodyText = ({ text, fontSize, lineHeight, fontFamily }) => {
  const [visibleText, setVisibleText] = useState(text);
  const containerRef = useRef(null);
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  
  // Check if we're in single column mode
  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      setIsSingleColumn(width <= 1199); // Single column for mobile and tablet
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);
  
  useEffect(() => {
    const updateVisibleText = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      
      // Create a temporary element to measure text
      const tempElement = document.createElement('div');
      tempElement.style.fontSize = fontSize;
      tempElement.style.lineHeight = lineHeight;
      tempElement.style.width = '100%';
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'pre-wrap';
      tempElement.style.wordWrap = 'break-word';
      tempElement.style.overflow = 'hidden';
      tempElement.style.fontFamily = fontFamily;
      
      document.body.appendChild(tempElement);
      
      // Calculate line height in pixels
      const actualFontSize = calculateActualFontSize(fontSize);
      const fontSizePx = parseInt(actualFontSize);
      const lineHeightPx = fontSizePx * parseFloat(lineHeight);
      
      // For single column, limit to a specific number of lines
      const maxLines = isSingleColumn ? 8 : 12; // Show more lines in single column
      const maxHeight = maxLines * lineHeightPx;
      
      // Find the right amount of text that fits
      let start = 0;
      let end = text.length;
      let result = '';
      
      while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        const testText = text.substring(0, mid);
        
        tempElement.textContent = testText;
        const height = tempElement.scrollHeight;
        
        if (height <= maxHeight) {
          result = testText;
          start = mid + 1;
        } else {
          end = mid - 1;
        }
      }
      
      document.body.removeChild(tempElement);
      
      // Find the last complete sentence
      if (result.length < text.length) {
        // Look for sentence endings: . ! ? followed by space or end of string
        const sentenceEndings = ['. ', '! ', '? ', '.', '!', '?'];
        let lastSentenceEnd = -1;
        
        for (const ending of sentenceEndings) {
          const index = result.lastIndexOf(ending);
          if (index > lastSentenceEnd) {
            lastSentenceEnd = index + ending.length;
          }
        }
        
        if (lastSentenceEnd > 0) {
          result = result.substring(0, lastSentenceEnd);
        } else {
          // Fallback to last complete word if no sentence ending found
          const lastSpace = result.lastIndexOf(' ');
          if (lastSpace > 0) {
            result = result.substring(0, lastSpace);
          }
        }
      }
      
      setVisibleText(result);
    };
    
    // Initial update
    updateVisibleText();
    
    // Update on resize
    window.addEventListener('resize', updateVisibleText);
    return () => window.removeEventListener('resize', updateVisibleText);
  }, [text, fontSize, lineHeight, fontFamily, isSingleColumn]);
  
  return (
    <div ref={containerRef} style={{ 
      position: 'relative', 
      width: '100%',
      marginBottom: '18px'
    }}>
      <SpecimenText
        $fontFamily={fontFamily}
        $fontSize={fontSize}
        $lineHeight={lineHeight}
        $twoColumns={true}
        $noHyphens={true}
        style={{ overflow: 'hidden' }}
      >
        {visibleText}
      </SpecimenText>
    </div>
  );
};

// Natural flow body text component without fixed height
const NaturalBodyText = ({ text, fontSize, lineHeight, fontFamily }) => {
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%',
      marginBottom: '18px'
    }}>
      <SpecimenText
        $fontFamily={fontFamily}
        $fontSize={fontSize}
        $lineHeight={lineHeight}
        $multiColumn={true}
        $noHyphens={true}
      >
        {text}
      </SpecimenText>
    </div>
  );
};

// Sample text specimens
const SPECIMEN_SAMPLES = [
  {
    title: "Uppercase",
    text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    description: "Uppercase alphabet",
    fontSize: "clamp(84px, 8vw, 144px)",
    lineHeight: "1",
    letterSpacing: "clamp(0.8px, 1vw, 0.8px)",
    isAnimated: true
  },
  {
    title: "Titles",
    text: "Shadow Work, The Power of Yet, The Element, No Contest, Tool and Symbol,  By Head, Hand and Heart,  Gifts and Occupations, Punished by Rewards,The Hole in the Wall, Help Me To Do It Myself, What Do I Do Monday?, Never Too Late",
    description: "Educational theorists and approaches",
    fontSize: "clamp(24px, 2vw, 36px)",
    lineHeight: "1.4",
    letterSpacing: "clamp(0.6px, 0.4vw, 0.6px)",
    isSingleColumn: true
  },
  {
    title: "Headline",
    description: "Headline",
    fontSize: "clamp(24px, 3.5vw, 48px)",
    lineHeight: "1.2",
    letterSpacing: "clamp(0.8px, 0.8vw, 0.6px)",
    isAnimated: true
  },
  {
    title: "Headline (part 2)",
    description: "Numerals and punctuation",
    fontSize: "clamp(24px, 3.5vw, 48px)",
    lineHeight: "1.2",
    letterSpacing: "clamp(0.8px, 0.8vw, 0.6px)",
    isAnimated: true
  },
  {
    title: "Character Pairs (Lowercase)",
    text: "fi fl ff ffi ffl th ch sh ph qu st ct rt lt nt dt pt ft vt at et it ot ut gt ht mt nt pt qt rt st tt ut vt wt xt yt zt av ev iv ov uv wv xv yv zv aw ew iw ow uw xw yw zw ax ex ix ox ux wx yx zx ay ey iy oy uy wy xy zy az ez iz oz uz wz xz yz zz",
    description: "Lowercase letter combinations and ligatures",
    fontSize: "clamp(14px, 3.5vw, 24px)",
    lineHeight: "1.2",
    letterSpacing: "clamp(0.8px, 0.6vw, 0.8px)"
  },
  {
    title: "Body Text Sample",
    text: "Acton Academy is an innovative school network that describes itself as \"one-room schoolhouses for the 21st century.\" Founded in 2009 with just 12 students, it has grown into a global network with multiple locations across the United States and internationally. The school operates on a fundamentally different educational model from traditional institutions. At Acton Academy, \"We have Guides, not teachers. We have Studios, not classrooms. We have Portfolios and Exhibitions, not grades.\" The approach emphasizes self-directed, learner-driven education where \"the adults step back and the students take on the roles of self-management and running the school.\" Central to Acton's philosophy is the Hero's Journey narrative framework. The Hero's Journey is \"the #1 element that defines an Acton learner driven community\" and equips students with tools to \"learn how to learn, learn how to do and learn how to be.\" The school believes \"there is a hero in every child\" and defines a hero as someone who doesn't quit when challenges arise, takes responsibility rather than making excuses, and works to solve problems that make the world better. The educational model features several distinctive elements. Guides are described as \"gamemakers who propose exciting challenges, set boundaries and invite Eagles to start a life changing journey.\" Rather than traditional teaching methods, \"teaching by lecturing or issuing instructions is not allowed at Acton.\" Instead, the model relies heavily on self-directed learning with peer feedback, where older students help younger ones set and monitor goals. The curriculum is designed to be student-centered, emphasizing critical thinking, creativity, and independence. The academy uses \"the latest technology in a self-paced learning environment that is designed to foster responsibility, goal-setting, and teamwork.\" Students work through real-world projects and apprenticeships, with high school students finding their own paid apprenticeships as part of their learning experience. Acton Academy serves students from kindergarten through 12th grade and has expanded through a franchise model, offering \"kits\" to entrepreneurs and parents interested in opening similar schools in their communities. The network represents part of a broader movement toward alternative education models that challenge traditional schooling approaches.",
    description: "Extended text for readability testing",
    fontSize: "clamp(14px, 2vw, 18px)",
    lineHeight: "1.2",
    letterSpacing: "clamp(0.8px, 0.4vw, 0.8px)"
  },
  {
    title: "Body Text Sample 2",
    text: "The franchise model that Acton Academy has adopted allows for rapid expansion while maintaining the core principles of the educational philosophy. By offering \"kits\" to entrepreneurs and parents interested in opening similar schools, Acton is creating a network of like-minded educational institutions that share a common vision for learner-driven education. This approach has the potential to transform education on a global scale, as more communities adopt and adapt the Acton model to their local contexts. The success of Acton Academy demonstrates that alternative educational models can not only exist alongside traditional schooling but can thrive and expand, offering families more choices in how their children are educated. As the network continues to grow, it serves as a powerful example of how innovative educational approaches can scale and impact students worldwide. The school's emphasis on real-world application extends beyond individual learning to community impact, with students encouraged to identify and solve problems that matter to them and their communities. This project-based approach not only makes learning more engaging but also helps students develop the skills and mindset needed to be active, contributing members of society. The combination of self-directed learning, peer collaboration, and real-world application creates a powerful educational experience that prepares students for the challenges and opportunities of the 21st century.",
    description: "Continuation of body text with smaller font-size",
    fontSize: "clamp(12px, 1.5vw, 16px)",
    lineHeight: "1.3",
    letterSpacing: "clamp(0.8px, 0.3vw, 0.8px)",
    isMultiColumn: true
  },
  {
    title: "Character Pairs",
    text: "Fi Fl Ff Ffi Ffl Th Ch Sh Ph Qu St Ct Rt Lt Nt Dt Pt Ft Vt At Et It Ot Ut Gt Ht Mt Nt Pt Qt Rt St Tt Ut Vt Wt Xt Yt Zt Av Ev Iv Ov Uv Wv Xv Yv Zv Aw Ew Iw Ow Uw Xw Yw Zw Ax Ex Ix Ox Ux Wx Yx Zx Ay Ey Iy Oy Uy Wy Xy Zy Az Ez Iz Oz Uz Wz Xz Yz Zz",
    description: "Mixed upper and lowercase kerning pairs",
    fontSize: "clamp(14px, 3.5vw, 24px)",
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
  const [bodyTextFontSize, setBodyTextFontSize] = useState("");
  const [bodyText2FontSize, setBodyText2FontSize] = useState("");
  const [theoristsFontSize, setTheoristsFontSize] = useState("");
  const [pangramFontSize, setPangramFontSize] = useState("");
  const [characterPairsFontSize, setCharacterPairsFontSize] = useState("");
  
  const { font, loading, error } = useFontLoader(fontPath);

  // Calculate actual font-size for body text sample
  useEffect(() => {
    const updateBodyTextFontSize = () => {
      const bodyTextSample = SPECIMEN_SAMPLES.find(sample => sample.title === "Body Text Sample");
      if (bodyTextSample) {
        setBodyTextFontSize(calculateActualFontSize(bodyTextSample.fontSize));
      }
    };
    
    updateBodyTextFontSize();
    window.addEventListener('resize', updateBodyTextFontSize);
    return () => window.removeEventListener('resize', updateBodyTextFontSize);
  }, []);

  // Calculate actual font-size for body text sample 2
  useEffect(() => {
    const updateBodyText2FontSize = () => {
      const bodyText2Sample = SPECIMEN_SAMPLES.find(sample => sample.title === "Body Text Sample 2");
      if (bodyText2Sample) {
        setBodyText2FontSize(calculateActualFontSize(bodyText2Sample.fontSize));
      }
    };
    
    updateBodyText2FontSize();
    window.addEventListener('resize', updateBodyText2FontSize);
    return () => window.removeEventListener('resize', updateBodyText2FontSize);
  }, []);

  // Calculate actual font-size for educational theorists sample
  useEffect(() => {
    const updateTheoristsFontSize = () => {
      const theoristsSample = SPECIMEN_SAMPLES.find(sample => sample.title === "Titles");
      if (theoristsSample) {
        setTheoristsFontSize(calculateActualFontSize(theoristsSample.fontSize));
      }
    };
    
    updateTheoristsFontSize();
    window.addEventListener('resize', updateTheoristsFontSize);
    return () => window.removeEventListener('resize', updateTheoristsFontSize);
  }, []);

  // Calculate actual font-size for pangram sample
  useEffect(() => {
    const updatePangramFontSize = () => {
      const pangramSample = SPECIMEN_SAMPLES.find(sample => sample.title === "Character Pairs (Lowercase)");
      if (pangramSample) {
        setPangramFontSize(calculateActualFontSize(pangramSample.fontSize));
      }
    };
    
    updatePangramFontSize();
    window.addEventListener('resize', updatePangramFontSize);
    return () => window.removeEventListener('resize', updatePangramFontSize);
  }, []);

  // Calculate actual font-size for character pairs sample
  useEffect(() => {
    const updateCharacterPairsFontSize = () => {
      const characterPairsSample = SPECIMEN_SAMPLES.find(sample => sample.title === "Character Pairs");
      if (characterPairsSample) {
        setCharacterPairsFontSize(calculateActualFontSize(characterPairsSample.fontSize));
      }
    };
    
    updateCharacterPairsFontSize();
    window.addEventListener('resize', updateCharacterPairsFontSize);
    return () => window.removeEventListener('resize', updateCharacterPairsFontSize);
  }, []);

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
                      "Uppercase": "display",
                      "Titles": "theorists", 
                      "Headline": "lowercase", 
                      "Headline (part 2)": "numbers",
                      "Character Pairs (Lowercase)": "pangram",
                      "Body Text Sample": "body",
                      "Body Text Sample 2": "body2",
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
                          sample.title === "Uppercase" ? (
                            <AnimatedDisplayHeadline fontFamily={fontFamily} />
                          ) : sample.title === "Headline" ? (
                            <AnimatedLowercaseAlphabet fontFamily={fontFamily} />
                                                      ) : sample.title === "Headline (part 2)" ? (
                              <AnimatedNumbersSymbols fontFamily={fontFamily} />
                          ) : (
                            <AnimatedDisplayHeadline fontFamily={fontFamily} />
                          )
                        ) : sample.title === "Body Text Sample" ? (
                          <div style={{ position: 'relative' }}>
                            <NaturalFlowBodyText
                              text={sample.text}
                              fontSize={sample.fontSize}
                              lineHeight={sample.lineHeight}
                              fontFamily={fontFamily}
                              style={{ marginBottom: '12px' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '-8px',
                              left: '0',
                              fontSize: '12px',
                              color: 'rgba(16, 12, 8)',
                              fontFamily: fontFamily,
                              marginTop: '12px'
                            }}>
                              Font-size: {bodyTextFontSize}
                            </div>
                          </div>
                        ) : sample.title === "Body Text Sample 2" ? (
                          <div style={{ position: 'relative' }}>
                            <NaturalFlowBodyText
                              text={sample.text}
                              fontSize={sample.fontSize}
                              lineHeight={sample.lineHeight}
                              fontFamily={fontFamily}
                              style={{ marginBottom: '12px' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '-8px',
                              left: '0',
                              fontSize: '12px',
                              color: 'rgba(16, 12, 8)',
                              fontFamily: fontFamily,
                              marginTop: '12px'
                            }}>
                              Font-size: {bodyText2FontSize}
                            </div>
                          </div>
                        ) : sample.title === "Titles" ? (
                          <div style={{ position: 'relative' }}>
                            <SpecimenText
                              $fontFamily={fontFamily}
                              $fontSize={sample.fontSize}
                              $lineHeight={sample.lineHeight}
                              $letterSpacing={sample.letterSpacing}
                              $singleColumn={sample.isSingleColumn}
                              style={{ marginBottom: '18px' }}
                            >
                              {sample.text}
                            </SpecimenText>
                            <div style={{
                              position: 'absolute',
                              bottom: '-8px',
                              left: '0',
                              fontSize: '12px',
                              color: 'rgba(16, 12, 8)',
                              fontFamily: fontFamily,
                              marginTop: '12px'
                            }}>
                              Font-size: {theoristsFontSize}
                            </div>
                          </div>
                        ) : sample.title === "Character Pairs (Lowercase)" ? (
                          <div style={{ position: 'relative', }}>
                            <SpecimenText
                              $fontFamily={fontFamily}
                              $fontSize={sample.fontSize}
                              $lineHeight={sample.lineHeight}
                              $letterSpacing={sample.letterSpacing}
                              style={{ marginBottom: '18px' }}
                            >
                              {sample.text}
                            </SpecimenText>
                            <div style={{
                              position: 'absolute',
                              bottom: '-8px',
                              left: '0',
                              fontSize: '12px',
                              color: 'rgba(16, 12, 8)',
                              fontFamily: fontFamily,
                              marginTop: '12px'
                            }}>
                              Font-size: {pangramFontSize}
                            </div>
                          </div>
                        ) : sample.title === "Character Pairs" ? (
                          <div style={{ position: 'relative' }}>
                            <SpecimenText
                              $fontFamily={fontFamily}
                              $fontSize={sample.fontSize}
                              $lineHeight={sample.lineHeight}
                              $letterSpacing={sample.letterSpacing}
                              style={{ marginBottom: '18px' }}
                            >
                              {sample.text}
                            </SpecimenText>
                            <div style={{
                              position: 'absolute',
                              bottom: '-8px',
                              left: '0',
                              fontSize: '12px',
                              color: 'rgba(16, 12, 8)',
                              fontFamily: fontFamily,
                              marginTop: '12px'
                            }}>
                              Font-size: {characterPairsFontSize}
                            </div>
                          </div>
                        ) : (
                          <SpecimenText
                            $fontFamily={fontFamily}
                            $fontSize={sample.fontSize}
                            $lineHeight={sample.lineHeight}
                            $letterSpacing={sample.letterSpacing}
                            $singleColumn={sample.isSingleColumn}
                            $multiColumn={sample.isMultiColumn}
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
                  <FontName>{selectedFont?.name || 'Font Name'}</FontName>
                  <div style={{ marginTop: '12px', marginBottom: '-2px' }}>
                    <div style={{ fontSize: '12px', marginBottom: '6px', color: 'rgb(16, 12, 8)' }}>
                      Specimen PDF
                    </div>
                    <svg 
                      width="120" 
                      height="85" 
                      viewBox="0 0 120 85" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ 
                        cursor: 'pointer', 
                        marginLeft: '-12px'
                      }}
                      onClick={() => {
                        // TODO: Add actual PDF download functionality
                        console.log('Download PDF for:', selectedFont?.name);
                      }}
                    >
                      <path 
                        d="M15 7.5C15 3.35786 18.3579 0 22.5 0H52.5L75 22.5V67.5C75 71.6421 71.6421 75 67.5 75H22.5C18.3579 75 15 71.6421 15 67.5V7.5Z" 
                        fill="currentColor"
                        fillOpacity="0.1"
                        style={{ transition: 'fill-opacity 0.2s ease' }}
                        onMouseEnter={(e) => e.target.style.fillOpacity = '0.2'}
                        onMouseLeave={(e) => e.target.style.fillOpacity = '0.1'}
                      />
                      <path 
                        d="M52.5 0L75 22.5H60C56.8579 22.5 52.5 19.1421 52.5 15V0Z" 
                        fill="currentColor"
                        fillOpacity="0.4"
                        style={{ transition: 'fill-opacity 0.2s ease' }}
                        onMouseEnter={(e) => e.target.style.fillOpacity = '0.3'}
                        onMouseLeave={(e) => e.target.style.fillOpacity = '0.2'}
                      />
                      <path 
                        d="M26.25 15H63.75M26.25 25H63.75M26.25 35H56.25M26.25 45H63.75M26.25 55H48.75" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeOpacity="0.6"
                        style={{ transition: 'stroke-opacity 0.2s ease' }}
                        onMouseEnter={(e) => e.target.style.strokeOpacity = '0.8'}
                        onMouseLeave={(e) => e.target.style.strokeOpacity = '0.6'}
                      />
                    </svg>
                  </div>
                  <FontDetails className="mobile-tablet-only">
                  {selectedFont.designer && `Designer: ${selectedFont.designer}`}
                  {selectedFont.foundry && ` • Foundry: ${selectedFont.foundry}`}
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