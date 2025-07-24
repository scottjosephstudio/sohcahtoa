import React, {
  useRef,
  forwardRef,
  useEffect,
  useCallback,
  useState,
} from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 12px;
  position: relative;

   @media (max-width: 768px) {
   position: sticky;
 padding-left: 0px;
 }
`;

const Header = styled.div`
  margin-bottom: 12px;
  margin-right: -12px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgb(16, 12, 8);
  
  @media (min-width: 768px) and (max-width: 1366px) and (orientation: portrait) {
    /* iPad portrait: Extend border to full width */
    margin-left: -12px;
    margin-right: -12px;
  }
`;

const Title = styled.span`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
`;

const SectionName = styled.div`
 font-size: 12px;
 line-height: 14px;
 letter-spacing: 0.6px;
 text-decoration: underline;
 text-underline-offset: 4px;
 text-decoration-thickness: 1px;
 color: rgb(16, 12, 8);
 margin-top: 0px;
 margin-bottom: 4px;
 font-weight: 500;
 grid-column: 1 / -1;

 &:first-child {
   margin-top: -12px;
 }

 @media (max-width: 768px) {
   &:first-child {
     margin-top: -6px;
   }
 }
`;

const GridWrapper = styled.div`
  position: absolute;
  top: 58px;
  left: 12px;
  right: 0px;
  bottom: 12px;
  overflow: hidden;

  @media (min-width: 768px) and (max-width: 1366px) and (orientation: portrait) {
    /* iPad portrait: Align grid with full-width border */
    left: 0px;
    right: 0px;
  }

  @media (max-width: 768px) {
    top: 58px;
    left: 0px;
    right: 0px;
    bottom: 12px;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 7px;
    pointer-events: none;
    z-index: 1;
  }

&::before {
  top: 0;
    background: linear-gradient(to bottom, #f3f3f3 0%, transparent 100%);
}

&::after {
  bottom: 0;
    background: linear-gradient(to top, #f3f3f3 0%, transparent 100%);
}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 8px;
  padding: 14px 0px 10px 0;
  height: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(54px, 1fr));
    gap: 8px;
    padding: 8px 0px 6px 0;
  }
`;

const GlyphCode = styled.span`
  font-size: 10px;
  line-height: 12px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  margin-top: 4px;
  margin-bottom: 0px;
  transition: color 0.1s ease;

  @media (max-width: 768px) {
    font-size: 10px;
    line-height: 12px;
    margin-top: -2px;
    margin-bottom: 4px;
  }
`;

const GlyphDisplay = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  line-height: 1;
  color: rgb(16, 12, 8);
  transition: color 0.1s ease;
  font-family: inherit;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 28px;
  }
`;

const GlyphCard = styled.button`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.selected ? "rgb(16, 12, 8)" : "none")};
  border: 1px solid rgb(16, 12, 8);
  border-radius: 10px;
  padding: 0px;
  position: relative;
  transition: all 0.1s ease;
  
  &:hover {
    cursor: pointer;
    background: rgb(16, 12, 8);
    border-color: rgb(16, 12, 8);
    z-index: 1;

    ${GlyphCode}, ${GlyphDisplay} {
      color: #f9f9f9;
    }
  }

  ${(props) =>
    props.selected &&
    `
    ${GlyphCode}, ${GlyphDisplay} {
      color: #f9f9f9;
    }
  `}

  @media (max-width: 768px) {
    padding: 6px;
    border-radius: 6px;
  }
`;

const generateCharacterRange = (start, end) => {
  const chars = [];
  for (let i = start; i <= end; i++) {
    chars.push(String.fromCodePoint(i));
  }
  return chars;
};

const getUnicodeValue = (char) => {
  return char.codePointAt(0);
};

const GlyphCardComponent = ({
  char,
  font,
  selected,
  hoveredGlyph,
  onSelect,
  onHover,
  onHoverEnd,
}) => {
  const unicode = getUnicodeValue(char);
  const fontFamily = font?.name ? `"${font.name}", sans-serif` : 'inherit';

  return (
    <GlyphCard
      selected={selected}
      onClick={() => onSelect(char)}
      onMouseEnter={() => onHover(char)}
      onMouseLeave={() => onHoverEnd(null)}
      type="button"
      data-char={char}
    >
      <GlyphCode>
        {unicode.toString(16).toUpperCase().padStart(4, "0")}
      </GlyphCode>
      <GlyphDisplay style={{ fontFamily }}>
        {char}
      </GlyphDisplay>
    </GlyphCard>
  );
};

export const CharacterMap = forwardRef(
  (
    { font = {}, onGlyphSelect, onGlyphHover, selectedGlyph, hoveredGlyph },
    ref,
  ) => {
  const gridRef = useRef(null);

  const fadeVariants = {
    initial: {
        opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
          duration: 0.05,
          ease: "easeOut",
        },
    },
    exit: {
      opacity: 0,
      transition: {
          duration: 0.05,
          ease: "easeIn",
        },
      },
  };

  const scrollToCharacter = (char) => {
    if (gridRef.current) {
      const element = gridRef.current.querySelector(`[data-char="${char}"]`);
      if (element) {
        const gridRect = gridRef.current.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
          const scrollTop =
            gridRef.current.scrollTop +
          (elementRect.top - gridRect.top) - 
            gridRect.height / 2 +
            elementRect.height / 2;
        
        gridRef.current.scrollTo({
          top: scrollTop,
            behavior: "smooth",
        });
      }
    }
  };

  React.useImperativeHandle(ref, () => ({
      scrollToCharacter,
  }));

  const renderCharacterSets = () => {
    if (!font.characterSets) return null;

    return Object.entries(font.characterSets).map(([setName, setInfo]) => {
      let glyphs = [];
      
      if (setInfo.ranges) {
        // Handle multiple ranges
          setInfo.ranges.forEach((range) => {
            glyphs = glyphs.concat(
              generateCharacterRange(range.start, range.end),
            );
        });
      } else {
        // Handle single range
        glyphs = generateCharacterRange(setInfo.start, setInfo.end);
      }

      return (
        <React.Fragment key={setName}>
          <SectionName>{setName}</SectionName>
          {glyphs.map((char, index) => (
            <GlyphCardComponent
              key={`${setName}-${index}`}
              char={char === " " ? " " : char}
              font={font}
              selected={char === selectedGlyph}
              hoveredGlyph={hoveredGlyph}
              onSelect={onGlyphSelect}
              onHover={onGlyphHover}
              onHoverEnd={onGlyphHover}
            />
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <Container
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeVariants}
    >
      <Header>
        <Title>Glyph Map</Title>
      </Header>

      <GridWrapper>
          <Grid ref={gridRef}>{renderCharacterSets()}</Grid>
      </GridWrapper>
    </Container>
  );
  },
);

export default CharacterMap;
