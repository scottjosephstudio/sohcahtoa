import React, { useState, useRef, useCallback, forwardRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { HighlightedGlyph } from "./HighlightedGlyph";
import { CharacterMap } from "./CharacterMap";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: none;

  @media (max-width: 768px) and (orientation: portrait) {
    height: 100dvh; /* Dynamic viewport height for mobile browsers */
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  flex: 1;
  position: relative;

  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) and (max-height: 1366px) {
    /* iPad portrait: stack vertically - only for actual tablet dimensions */
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;

    /* Add horizontal divider between rows */
    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1px;
      background-color: rgb(16, 12, 8);
      z-index: 1;
      margin-bottom: 12px;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GlyphPanel = styled(motion.div)`
  background: none;
  border-right: 1px solid rgb(16, 12, 8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;

  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) and (max-height: 1366px) {
    /* iPad portrait: remove right border, no bottom border needed here */
    border-right: none;
    grid-row: 2; /* Position glyph at bottom */
  }

  @media (max-width: 767px) {
    display: ${(props) => (props.showInMobile ? "flex" : "none")};
    border-right: none;
    grid-column: 1;
    cursor: pointer;
  }
`;

const MapPanel = styled(motion.div)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;

  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) and (max-height: 1366px) {
    /* iPad portrait: position map at top */
    grid-row: 1;
  }

  @media (max-width: 767px) {
    display: ${(props) => (props.showInMobile ? "flex" : "none")};
    grid-column: 1;
  }
`;

const SearchContainer = styled(motion.div)`
  background: none;
  border-top: 1px solid rgb(16, 12, 8);
  padding: 98px;
  pointer-events: none;

  .search-panel {
    pointer-events: auto;
  }

  @media (max-width: 767px) and (orientation: portrait) {
    /* Account for mobile browser chrome by adjusting position */
    position: relative;
    bottom: env(safe-area-inset-bottom, 0px);
    padding-bottom: calc(98px + env(safe-area-inset-bottom, 0px));
  }
`;

// Shared fade variants for consistent animations across all glyph components
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

// SearchContainer variants with consistent delay to match tab transition timing
const searchContainerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: 0.2, // Match the 200ms delay from tab transitions
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

export const GlyphMapGrid = forwardRef(
  (
    {
      font = null,
      specimenUrl = "#",
      onGlyphSelect: externalGlyphSelect,
      isNavigatingHome = false,
      activeTab,
      isGlyphsExiting = false,
    },
    ref,
  ) => {
    const [selectedGlyph, setSelectedGlyph] = useState("A");
    const [hoveredGlyph, setHoveredGlyph] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showGlyphView, setShowGlyphView] = useState(false);
    const characterMapRef = useRef(null);
    // iPad mini specific detection (768x1024 for newer iPad mini)
    const isIPadMini =
      (window.innerWidth === 768 && window.innerHeight === 1024) ||
      (window.innerWidth === 744 && window.innerHeight === 1133);

    // Regular iPad detection
    const isIPadRegular =
      window.innerWidth > 768 &&
      window.innerWidth <= 1024 &&
      window.innerHeight > window.innerWidth &&
      window.innerHeight <= 1366;

    const isIPadPortrait = isIPadMini || isIPadRegular;
    const isMobile = window.innerWidth < 768 && !isIPadPortrait;

    const handleGlyphSelect = useCallback(
      (glyph) => {
        setSelectedGlyph(glyph);
        setHoveredGlyph(null);
        setShowGlyphView(true);
        if (externalGlyphSelect) {
          externalGlyphSelect(glyph);
        }
      },
      [externalGlyphSelect],
    );

    const handleGlyphHover = useCallback((glyph) => {
      setHoveredGlyph(glyph);
    }, []);

    const handleSearch = useCallback((query) => {
      if (query.length === 1) {
        setSelectedGlyph(query);
        setHoveredGlyph(null);

        if (characterMapRef.current?.scrollToCharacter) {
          characterMapRef.current.scrollToCharacter(query);
        }
      }
    }, []);

    React.useEffect(() => {
      setIsLoading(!font?.opentype);
    }, [font?.opentype]);

    // Expose handleSearch function to parent components
    React.useImperativeHandle(ref, () => ({
      handleSearch,
    }));

    if (isLoading) {
      return <Container></Container>;
    }

    // iPad Portrait view - check this first before desktop
    if (isIPadPortrait) {
      return (
        <Container>
          <ContentArea>
            <MapPanel
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariants}
            >
              <CharacterMap
                ref={characterMapRef}
                font={font}
                onGlyphSelect={handleGlyphSelect}
                onGlyphHover={handleGlyphHover}
                selectedGlyph={selectedGlyph}
                hoveredGlyph={hoveredGlyph}
                activeTab={activeTab}
              />
            </MapPanel>

            <GlyphPanel
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariants}
            >
              <HighlightedGlyph
                glyph={hoveredGlyph || selectedGlyph}
                font={font}
              />
            </GlyphPanel>
          </ContentArea>

          <SearchContainer
            initial="initial"
            animate="animate"
            exit="exit"
            variants={searchContainerVariants}
          ></SearchContainer>
        </Container>
      );
    }

    // Desktop view
    if (!isMobile) {
      return (
        <Container>
          <ContentArea>
            <GlyphPanel
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariants}
            >
              <HighlightedGlyph
                glyph={hoveredGlyph || selectedGlyph}
                font={font}
              />
            </GlyphPanel>

            <MapPanel
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariants}
            >
              <CharacterMap
                ref={characterMapRef}
                font={font}
                onGlyphSelect={handleGlyphSelect}
                onGlyphHover={handleGlyphHover}
                selectedGlyph={selectedGlyph}
                hoveredGlyph={hoveredGlyph}
                activeTab={activeTab}
              />
            </MapPanel>
          </ContentArea>

          <SearchContainer
            initial="initial"
            animate="animate"
            exit="exit"
            variants={searchContainerVariants}
          ></SearchContainer>
        </Container>
      );
    }

    // Mobile view
    return (
      <Container>
        <ContentArea onClick={() => showGlyphView && setShowGlyphView(false)}>
          <AnimatePresence mode="wait">
            {showGlyphView ? (
              <GlyphPanel
                key="glyph"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeVariants}
                showInMobile={true}
              >
                <HighlightedGlyph
                  glyph={hoveredGlyph || selectedGlyph}
                  font={font}
                />
              </GlyphPanel>
            ) : (
              <MapPanel
                key="map"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeVariants}
                showInMobile={true}
              >
                <CharacterMap
                  ref={characterMapRef}
                  font={font}
                  onGlyphSelect={handleGlyphSelect}
                  onGlyphHover={handleGlyphHover}
                  selectedGlyph={selectedGlyph}
                  hoveredGlyph={hoveredGlyph}
                  activeTab={activeTab}
                />
              </MapPanel>
            )}
          </AnimatePresence>
        </ContentArea>

        <SearchContainer
          initial="initial"
          animate="animate"
          exit="exit"
          variants={searchContainerVariants}
        ></SearchContainer>
      </Container>
    );
  },
);

GlyphMapGrid.displayName = "GlyphMapGrid";

export default GlyphMapGrid;
