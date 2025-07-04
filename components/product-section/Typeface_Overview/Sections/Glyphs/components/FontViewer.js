import React, { useEffect, useState, useRef, forwardRef } from 'react';
import GlyphMapGrid from './GlyphMapGrid';
import { motion } from 'framer-motion';
import { styled } from 'styled-components';
import opentype from 'opentype.js';

const Container = styled.div`
  width: 100vw;
  padding-left: 20px;
  padding-right: 20px;
  height: auto;
  overflow: none;
  font-size: 16px;
  margin-top: 40px;
`;

const Content = styled(motion.div)`
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  width: 100%;
  height: 100%;
`;

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

const useFontLoader = (fontPath) => {
  const [font, setFont] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    opentype.load(fontPath, (err, loadedFont) => {
      if (!mounted) return;
      
      if (err) {
        setError(`Failed to load font: ${err.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      // Validate font loaded correctly
      if (!loadedFont || !loadedFont.glyphs || !loadedFont.unitsPerEm) {
        setError('Font loaded but is invalid or corrupted');
        setLoading(false);
        return;
      }

      // Create clean font object with OpenType.js data
      const fontData = {
        name: loadedFont.names.fontFamily.en,
        opentype: loadedFont,
        metrics: {
          ascender: loadedFont.ascender,
          descender: Math.abs(loadedFont.descender),
          xHeight: loadedFont.tables?.os2?.sxHeight || Math.round(loadedFont.ascender * 0.5),
          capHeight: loadedFont.tables?.os2?.sCapHeight || Math.round(loadedFont.ascender * 0.7),
          unitsPerEm: loadedFont.unitsPerEm,
          baseline: 0
        },
        characterSets: {
          'Uppercase Letters': {
            start: 65, // A
            end: 90    // Z
          },
          'Lowercase Letters': {
            start: 97,  // a
            end: 122    // z
          },
          'Numbers': {
            start: 48,  // 0
            end: 57     // 9
          },
          'Basic Punctuation': {
            ranges: [
              { start: 32, end: 47 },   // Space to /
              { start: 58, end: 64 },   // : to @
              { start: 91, end: 96 },   // [ to `
              { start: 123, end: 126 }  // { to ~
            ]
          },
          'Currency': {
            ranges: [
              { start: 0x0024, end: 0x0024 }, // $
              { start: 0x00A3, end: 0x00A5 }, // £ ¤ ¥
              { start: 0x20AC, end: 0x20AC }  // €
            ]
          },
          'Mathematical Symbols': {
            ranges: [
              { start: 0x00D7, end: 0x00D7 }, // ×
              { start: 0x00F7, end: 0x00F7 }, // ÷
              { start: 0x2264, end: 0x2265 }  // ≤ ≥
            ]
          },
          'Latin-1 Supplement': {
            ranges: [
              { start: 0x00C0, end: 0x00D6 }, // À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ð Ñ Ò Ó Ô Õ Ö
              { start: 0x00D8, end: 0x00F6 }, // Ø Ù Ú Û Ü Ý Þ ß à á â ã ä å æ ç è é ê ë ì í î ï ð ñ ò ó ô õ ö
              { start: 0x00F8, end: 0x00FF }  // ø ù ú û ü ý þ ÿ
            ]
          },
          'Fractions': {
            ranges: [
              { start: 0x00BC, end: 0x00BE }, // ¼ ½ ¾
              { start: 0x2153, end: 0x2154 }, // ⅓ ⅔
              { start: 0x2155, end: 0x2158 }, // ⅕ ⅖ ⅗ ⅘
              { start: 0x215B, end: 0x215E }  // ⅛ ⅜ ⅝ ⅞
            ]
          },
          'Arrows': {
            ranges: [
              { start: 0x2190, end: 0x2199 }  // ← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙
            ]
          },
          'Common Ligatures': {
            ranges: [
              { start: 0xFB00, end: 0xFB04 }  // ff fi fl ffi ffl
            ]
          },
          'Extended Punctuation': {
            ranges: [
              { start: 0x2010, end: 0x2015 }, // – — ‒ – ‖ ‗
              { start: 0x2018, end: 0x201F }, // ' ' " " ‚ ‛ „ ‟
              { start: 0x2020, end: 0x2022 }  // † ‡ • 
            ]
          },
          'Copyright & Symbols': {
            ranges: [
              { start: 0x00A9, end: 0x00A9 }, // ©
              { start: 0x00AB, end: 0x00AB }, // «
              { start: 0x00BB, end: 0x00BB }, // »
              { start: 0x00AE, end: 0x00AE }, // ®
              { start: 0x00B0, end: 0x00B1 }, // ° ±
              { start: 0x00B6, end: 0x00B7 }, // ¶ ·
              { start: 0x25B6, end: 0x25B6 }, // ▶
              { start: 0x25FC, end: 0x25FC }, // ◼
              { start: 0x2122, end: 0x2122 }  // ™
            ]
          }
        }
      };

      setFont(fontData);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [fontPath]);

  return { font, loading, error };
};

const FontViewer = forwardRef(({ 
  activeTab,
  isGlyphsExiting,
  isNavigatingHome,
  fontPath = '/fonts/JANTReg.ttf',
  onMetricsLoad,
  onError,
}, ref) => {
  const { font, loading, error } = useFontLoader(fontPath);
  const glyphMapGridRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    handleSearch: (query) => {
      if (glyphMapGridRef.current?.handleSearch) {
        glyphMapGridRef.current.handleSearch(query);
      }
    }
  }));

  useEffect(() => {
    if (font && onMetricsLoad) {
      onMetricsLoad(font.metrics);
    }
    if (error && onError) {
      onError(error);
    }
  }, [font, error, onMetricsLoad, onError]);

  if (loading) {
    return (
      <Container>
        <Content initial="initial" animate="animate" variants={fadeVariants}>
 
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Content initial="initial" animate="animate" variants={fadeVariants}>
       
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeVariants}
      >
        <GlyphMapGrid 
          font={font}
          activeTab={activeTab}
          isGlyphsExiting={isGlyphsExiting}
          isNavigatingHome={isNavigatingHome}
          ref={glyphMapGridRef}
        />
      </Content>
    </Container>
  );
});

export default FontViewer; 