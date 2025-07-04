import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypefaceFooter from '../../product-footer/TypefaceFooter';
import { FontTesterControls } from '../Typeface_Overview/Sections/Tester/FontTesterControls';
import AddToCart from '../Elements/Cart/AddtoCart';
import { SearchPanel } from '../Typeface_Overview/Sections/Glyphs/components/SearchPanel';
import { getLetterSpacingConstraints, calculateDefaultFontSize } from '../Typeface_Overview/Sections/Tester/LetterSpacingUtils';
import { 
  FooterWrapper, 
  ControlsContainer, 
  SearchContainer, 
  CartButtonWrapper,
  ToggleButton 
} from './ResponsiveFooterStyles';

const toggleVariants = {
  initial: {
    y: 100,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const contentVariants = {
  initial: {
    y: 0,
    opacity: 1
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const useMediaQuery = (width) => {
  const [matches, setMatches] = useState(typeof window !== 'undefined' ? window.innerWidth > width : true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handler = () => setMatches(window.innerWidth > width);
      window.addEventListener('resize', handler);
      handler();
      return () => window.removeEventListener('resize', handler);
    }
  }, [width]);

  return matches;
};

let hasInitialAnimationOccurred = false;

export const ResponsiveFooter = ({
  isTestExiting = false,
  isGlyphsExiting = false,
  showInitialAnimation: initialShowAnimation,
  hasInitialAnimationOccurred: initialAnimationState,
  handleTypefaceNavigation,
  homeLink,
  typefacesLink,
  isInCart,
  isFullCartOpen,
  handleAddToCart,
  handleViewCart,
  isNavigatingHome,
  windowWidth,
  fontSettings,
  setFontSettings,
  activeTab,
  currentText,
  onSearch,
  font,
  setIsNavigatingHome
}) => {
  const isDesktop = useMediaQuery(768);
  const isMobile = !isDesktop;
  const [expanded, setExpanded] = useState(false);
  const [showInitialAnimation, setShowInitialAnimation] = useState(!hasInitialAnimationOccurred);
  const [baseSize, setBaseSize] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isControlsOpen, setIsControlsOpen] = useState(isDesktop);
  const [isContentExiting, setIsContentExiting] = useState(false);

  const handleNavigationStart = () => {
    setIsContentExiting(true);
  };

  useEffect(() => {
    setIsControlsOpen(isDesktop);
  }, [isDesktop]);

  const toggleControls = () => {
    setIsControlsOpen(!isControlsOpen);
  };

  useEffect(() => {
    if (!hasInitialAnimationOccurred) {
      const timer = setTimeout(() => {
        hasInitialAnimationOccurred = true;
        setShowInitialAnimation(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSliderChange = (key, value) => {
    if (key === "letterSpacing") {
      const constraints = getLetterSpacingConstraints(fontSettings.fontSize);
      value = Math.max(constraints.min, Math.min(constraints.max, parseFloat(value)));
    }
    
    if (key === 'fontSize') {
      setBaseSize(parseFloat(value));
      setScaleFactor(1);
    }
    
    setFontSettings(prev => ({ 
      ...prev, 
      [key]: parseFloat(value),
      isManuallySet: key === 'fontSize' ? true : prev.isManuallySet
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      if (!fontSettings.isManuallySet) {
        const newFontSize = calculateDefaultFontSize(undefined, currentText);
        setFontSettings(prev => ({
          ...prev,
          fontSize: newFontSize
        }));
      } else if (baseSize) {
        const viewportWidth = window.innerWidth;
        const newScaleFactor = Math.max(0.5, Math.min(1.5, viewportWidth / 1440));
        setScaleFactor(newScaleFactor);
        
        setFontSettings(prev => ({
          ...prev,
          fontSize: baseSize * newScaleFactor
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setFontSettings, currentText, fontSettings.isManuallySet, baseSize]);

  const resetSetting = (key) => {
    if (key === 'fontSize') {
      setBaseSize(null);
      setScaleFactor(1);
      setFontSettings(prev => ({ 
        ...prev,
        fontSize: calculateDefaultFontSize(undefined, currentText),
        isManuallySet: false
      }));
    } else {
      const defaults = {
        lineHeight: 1,
        letterSpacing: 0
      };
      setFontSettings(prev => ({ 
        ...prev, 
        [key]: defaults[key] 
      }));
    }
  };

  const letterSpacingConstraints = getLetterSpacingConstraints(fontSettings.fontSize);
  const displayLetterSpacing = letterSpacingConstraints.convertActualToDisplay(fontSettings.letterSpacing);

  return (
    <FooterWrapper>
      <TypefaceFooter
  showInitialAnimation={showInitialAnimation}
  hasInitialAnimationOccurred={hasInitialAnimationOccurred}
  handleTypefaceNavigation={handleTypefaceNavigation}
  homeLink={homeLink}
  typefacesLink={typefacesLink}
  isNavigatingHome={isNavigatingHome}
  setIsNavigatingHome={setIsNavigatingHome}
  onNavigate={handleNavigationStart}
  activeTab={activeTab}  // Add this prop
/>

      <AnimatePresence mode="wait">
        {activeTab === 'test' && !isNavigatingHome && (
          <motion.div
            key="test-content"
            variants={contentVariants}
            initial="initial"
            exit="exit"
          >
            <AnimatePresence mode="wait">
              {!isTestExiting && !isContentExiting && (
                <motion.div
                  variants={toggleVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <ToggleButton 
                    onClick={toggleControls} 
                    $isOpen={isControlsOpen}
                    $isViewCart={isInCart}
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </ToggleButton>
                </motion.div>
              )}
            </AnimatePresence>

            <ControlsContainer 
              $isViewCart={isInCart} 
              $isOpen={isControlsOpen}
            >
              <FontTesterControls
                settings={fontSettings}
                handleSliderChange={handleSliderChange}
                resetSetting={resetSetting}
                expanded={expanded}
                letterSpacingConstraints={letterSpacingConstraints}
                displayLetterSpacing={displayLetterSpacing}
                isNavigatingHome={isNavigatingHome}
                isTestExiting={isTestExiting || isContentExiting}
                isMobile={isMobile}
              />
            </ControlsContainer>
          </motion.div>
        )}

        {activeTab === 'glyphs' && !isNavigatingHome && (
          <motion.div
            key="glyphs-content"
            variants={contentVariants}
            initial="initial"
            exit="exit"
          >
            <SearchContainer $isViewCart={isInCart}>
              <SearchPanel
                onSearch={onSearch}
                isNavigatingHome={isNavigatingHome}
                isGlyphsExiting={isGlyphsExiting || isContentExiting}
                font={font}
              />
            </SearchContainer>
          </motion.div>
        )}
      </AnimatePresence>

      <CartButtonWrapper $isViewCart={isInCart}>
        <AddToCart
          isInCart={isInCart}
          isFullCartOpen={isFullCartOpen}
          handleAddToCart={handleAddToCart}
          handleViewCart={handleViewCart}
          isNavigatingHome={isNavigatingHome}
          windowWidth={windowWidth}
        />
      </CartButtonWrapper>
    </FooterWrapper>
  );
};

export default ResponsiveFooter;