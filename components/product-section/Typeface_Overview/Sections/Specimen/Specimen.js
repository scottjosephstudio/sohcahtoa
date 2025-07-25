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
    @media (min-width: 1600px) {
      column-count: 4;
      column-gap: 40px;
      column-fill: balance;
      margin-bottom: 0;
    }
  `}
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FontSizeLabel = styled.div`
  position: absolute;
  bottom: -7px;
  left: 0;
  font-size: 12px;
  color: rgba(16, 12, 8);
  font-family: ${props => props.$fontFamily || 'inherit'};
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

// Dynamic body text component that truncates based on available height
const DynamicBodyText = ({ text, fontSize, lineHeight, fontFamily }) => {
  const [truncatedText, setTruncatedText] = useState(text);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're in mobile mode
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  useEffect(() => {
    const updateTruncatedText = () => {
      if (!containerRef.current) return;
      
      // Use different heights for mobile vs desktop
      const fixedHeight = isMobile ? 200 : 300; // Much smaller height for mobile due to uppercase taking more space
      
      // Calculate available height (limit to 100% of fixed height)
      const availableHeight = fixedHeight * 1;
      
      // Parse font-size to get actual pixel value
      const actualFontSize = calculateActualFontSize(fontSize);
      const fontSizePx = parseInt(actualFontSize);
      
      // Calculate line height in pixels
      const lineHeightPx = fontSizePx * parseFloat(lineHeight);
      
      // Calculate max lines that can fit
      const maxLines = Math.floor(availableHeight / lineHeightPx);
      const maxHeight = maxLines * lineHeightPx;
      
      // Truncate text based on available height
      const truncated = truncateTextByHeight(text, actualFontSize, lineHeight, maxHeight);
      setTruncatedText(truncated);
    };
    
    updateTruncatedText();
    window.addEventListener('resize', updateTruncatedText);
    return () => window.removeEventListener('resize', updateTruncatedText);
  }, [text, fontSize, lineHeight, isMobile]);
  
  return (
    <div ref={containerRef} style={{ 
      position: 'relative', 
      width: '100%', 
      height: isMobile ? '200px' : '300px', 
      overflow: 'hidden',
      marginBottom: '12px'
    }}>
      <SpecimenText
        $fontFamily={fontFamily}
        $fontSize={fontSize}
        $lineHeight={lineHeight}
        $twoColumns={true}
        $noHyphens={true}
        style={{ overflow: 'hidden', maxHeight: '100%' }}
      >
        {truncatedText}
      </SpecimenText>
    </div>
  );
};

// Sample text specimens
const SPECIMEN_SAMPLES = [
  {
    title: "Uppercase",
    text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    description: "Uppercase alphabet showcase",
    fontSize: "clamp(84px, 8vw, 144px)",
    lineHeight: "1",
    letterSpacing: "clamp(0.8px, 1vw, 0.8px)",
    isAnimated: true
  },
  {
    title: "Educational Theorists",
    text: "Shadow Work, The Power of Yet, The Element, No Contest, Tool and Symbol,  By Head, Hand and Heart,  Gifts and Occupations, Punished by Rewards,The Hole in the Wall, Help Me To Do It Myself, What Do I Do Monday?, Never Too Late",
    description: "List of educational theorists and approaches",
    fontSize: "clamp(24px, 2vw, 36px)",
    lineHeight: "1.4",
    letterSpacing: "clamp(0.2px, 0.4vw, 0.4px)",
    isSingleColumn: true
  },
  {
    title: "Lowercase Alphabet",
    text: "abcdefghijklmnopqrstuvwxyz",
    description: "Lowercase character set",
    fontSize: "clamp(16px, 3.5vw, 24px)",
    lineHeight: "1.2",
    letterSpacing: "clamp(0.3px, 0.8vw, 0.6px)"
  },
  {
    title: "Numbers & Symbols",
    text: "0123456789 !@#$%^&*()",
    description: "Numerals and punctuation",
    fontSize: "clamp(16px, 3vw, 24px)",
    lineHeight: "1.4",
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
    text: "Acton Academy is an innovative school network that describes itself as \"one-room schoolhouses for the 21st century.\" Founded in 2009 with just 12 students, it has grown into a global network with multiple locations across the United States and internationally. The school operates on a fundamentally different educational model from traditional institutions. At Acton Academy, \"We have Guides, not teachers. We have Studios, not classrooms. We have Portfolios and Exhibitions, not grades.\" The approach emphasizes self-directed, learner-driven education where \"the adults step back and the students take on the roles of self-management and running the school.\" Central to Acton's philosophy is the Hero's Journey narrative framework. The Hero's Journey is \"the #1 element that defines an Acton learner driven community\" and equips students with tools to \"learn how to learn, learn how to do and learn how to be.\" The school believes \"there is a hero in every child\" and defines a hero as someone who doesn't quit when challenges arise, takes responsibility rather than making excuses, and works to solve problems that make the world better. The educational model features several distinctive elements. Guides are described as \"gamemakers who propose exciting challenges, set boundaries and invite Eagles to start a life changing journey.\" Rather than traditional teaching methods, \"teaching by lecturing or issuing instructions is not allowed at Acton.\" Instead, the model relies heavily on self-directed learning with peer feedback, where older students help younger ones set and monitor goals. The curriculum is designed to be student-centered, emphasizing critical thinking, creativity, and independence. The academy uses \"the latest technology in a self-paced learning environment that is designed to foster responsibility, goal-setting, and teamwork.\" Students work through real-world projects and apprenticeships, with high school students finding their own paid apprenticeships as part of their learning experience. Acton Academy serves students from kindergarten through 12th grade and has expanded through a franchise model, offering \"kits\" to entrepreneurs and parents interested in opening similar schools in their communities. The network represents part of a broader movement toward alternative education models that challenge traditional schooling approaches.",
    description: "Extended text for readability testing",
    fontSize: "clamp(14px, 2vw, 18px)",
    lineHeight: "1.4",
    letterSpacing: "clamp(0.2px, 0.4vw, 0.4px)"
  },
  {
    title: "Character Pairs",
    text: "fi fl ff ffi ffl th ch sh ph qu",
    description: "Common ligatures and letter combinations",
    fontSize: "clamp(18px, 3.5vw, 28px)",
    lineHeight: "1.4",
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
  const [theoristsFontSize, setTheoristsFontSize] = useState("");
  
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

  // Calculate actual font-size for educational theorists sample
  useEffect(() => {
    const updateTheoristsFontSize = () => {
      const theoristsSample = SPECIMEN_SAMPLES.find(sample => sample.title === "Educational Theorists");
      if (theoristsSample) {
        setTheoristsFontSize(calculateActualFontSize(theoristsSample.fontSize));
      }
    };
    
    updateTheoristsFontSize();
    window.addEventListener('resize', updateTheoristsFontSize);
    return () => window.removeEventListener('resize', updateTheoristsFontSize);
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
                      "Educational Theorists": "theorists", 
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
                        ) : sample.title === "Body Text Sample" ? (
                          <div style={{ position: 'relative' }}>
                            <DynamicBodyText
                              text={sample.text}
                              fontSize={sample.fontSize}
                              lineHeight={sample.lineHeight}
                              fontFamily={fontFamily}
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
                        ) : sample.title === "Educational Theorists" ? (
                          <div style={{ position: 'relative' }}>
                            <SpecimenText
                              $fontFamily={fontFamily}
                              $fontSize={sample.fontSize}
                              $lineHeight={sample.lineHeight}
                              $letterSpacing={sample.letterSpacing}
                              $singleColumn={sample.isSingleColumn}
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
                        ) : (
                          <SpecimenText
                            $fontFamily={fontFamily}
                            $fontSize={sample.fontSize}
                            $lineHeight={sample.lineHeight}
                            $letterSpacing={sample.letterSpacing}
                            $singleColumn={sample.isSingleColumn}
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
