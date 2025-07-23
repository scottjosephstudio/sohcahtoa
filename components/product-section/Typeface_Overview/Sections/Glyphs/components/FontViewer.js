import React, { useEffect, useState, useRef, forwardRef } from "react";
import GlyphMapGrid from "./GlyphMapGrid";
import { motion } from "framer-motion";
import { styled } from "styled-components";
import opentype from "opentype.js";

// Animated loading components for font loading
const AnimatedLoading = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: inherit;
  color: inherit;
  margin-left: 2px;
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
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
`;

const Container = styled.div`
  width: 100vw;
  padding: 0 20px;
  height: auto;
  overflow: none;
  font-size: 16px;
  margin-top: 0;
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
  exit: { opacity: 0, transition: { duration: 0.3 } },
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
        setError(`Failed to load font: ${err.message || "Unknown error"}`);
        setLoading(false);
        return;
      }

      // Validate font loaded correctly
      if (!loadedFont || !loadedFont.glyphs || !loadedFont.unitsPerEm) {
        setError("Font loaded but is invalid or corrupted");
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
          xHeight:
            loadedFont.tables?.os2?.sxHeight ||
            Math.round(loadedFont.ascender * 0.5),
          capHeight:
            loadedFont.tables?.os2?.sCapHeight ||
            Math.round(loadedFont.ascender * 0.7),
          unitsPerEm: loadedFont.unitsPerEm,
          baseline: 0,
        },
        characterSets: {
          "Uppercase Letters": {
            start: 65, // A
            end: 90, // Z
          },
          "Lowercase Letters": {
            start: 97, // a
            end: 122, // z
          },
          Numbers: {
            start: 48, // 0
            end: 57, // 9
          },
          "Basic Punctuation": {
            ranges: [
              { start: 32, end: 47 }, // Space to /
              { start: 58, end: 64 }, // : to @
              { start: 91, end: 96 }, // [ to `
              { start: 123, end: 126 }, // { to ~
            ],
          },
          Currency: {
            ranges: [
              { start: 0x0024, end: 0x0024 }, // $
              { start: 0x00a3, end: 0x00a5 }, // £ ¤ ¥
              { start: 0x20ac, end: 0x20ac }, // €
            ],
          },
          "Mathematical Symbols": {
            ranges: [
              { start: 0x00d7, end: 0x00d7 }, // ×
              { start: 0x00f7, end: 0x00f7 }, // ÷
              { start: 0x2264, end: 0x2265 }, // ≤ ≥
            ],
          },
          "Latin-1 Supplement": {
            ranges: [
              { start: 0x00c0, end: 0x00d6 }, // À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ð Ñ Ò Ó Ô Õ Ö
              { start: 0x00d8, end: 0x00f6 }, // Ø Ù Ú Û Ü Ý Þ ß à á â ã ä å æ ç è é ê ë ì í î ï ð ñ ò ó ô õ ö
              { start: 0x00f8, end: 0x00ff }, // ø ù ú û ü ý þ ÿ
            ],
          },
          Fractions: {
            ranges: [
              { start: 0x00bc, end: 0x00be }, // ¼ ½ ¾
              { start: 0x2153, end: 0x2154 }, // ⅓ ⅔
              { start: 0x2155, end: 0x2158 }, // ⅕ ⅖ ⅗ ⅘
              { start: 0x215b, end: 0x215e }, // ⅛ ⅜ ⅝ ⅞
            ],
          },
          Arrows: {
            ranges: [
              { start: 0x2190, end: 0x2199 }, // ← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙
            ],
          },
          "Common Ligatures": {
            ranges: [
              { start: 0xfb00, end: 0xfb04 }, // ff fi fl ffi ffl
            ],
          },
          "Extended Punctuation": {
            ranges: [
              { start: 0x2010, end: 0x2015 }, // – — ‒ – ‖ ‗
              { start: 0x2018, end: 0x201f }, // ' ' " " ‚ ‛ „ ‟
              { start: 0x2020, end: 0x2022 }, // † ‡ •
            ],
          },
          "Copyright & Symbols": {
            ranges: [
              { start: 0x00a9, end: 0x00a9 }, // ©
              { start: 0x00ab, end: 0x00ab }, // «
              { start: 0x00bb, end: 0x00bb }, // »
              { start: 0x00ae, end: 0x00ae }, // ®
              { start: 0x00b0, end: 0x00b1 }, // ° ±
              { start: 0x00b6, end: 0x00b7 }, // ¶ ·
              { start: 0x25b6, end: 0x25b6 }, // ▶
              { start: 0x25fc, end: 0x25fc }, // ◼
              { start: 0x2122, end: 0x2122 }, // ™
            ],
          },
        },
      };

      setFont(fontData);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [fontPath]);

  return { font, loading, error };
};

const FontViewer = forwardRef(
  (
    {
      activeTab,
      isGlyphsExiting,
      isNavigatingHome,
      fontPath,
      selectedFont,
      onMetricsLoad,
      onError,
    },
    ref,
  ) => {
    const { font, loading, error } = useFontLoader(fontPath);
    const glyphMapGridRef = useRef(null);

    React.useImperativeHandle(ref, () => ({
      handleSearch: (query) => {
        if (glyphMapGridRef.current?.handleSearch) {
          glyphMapGridRef.current.handleSearch(query);
        }
      },
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
                <LoadingText>Loading {selectedFont?.name || 'font'}</LoadingText>
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
      );
    }

    if (error) {
      return (
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
              color: 'red',
              textAlign: 'center'
            }}>
              Error loading {selectedFont?.name || 'font'}: {error}
            </div>
          </Content>
        </Container>
      );
    }

    return (
      <Container>
        <Content
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {font && (
            <GlyphMapGrid
              ref={glyphMapGridRef}
              font={font}
              selectedFont={selectedFont}
              isGlyphsExiting={isGlyphsExiting}
              isNavigatingHome={isNavigatingHome}
            />
          )}
        </Content>
      </Container>
    );
  },
);

export default FontViewer;
