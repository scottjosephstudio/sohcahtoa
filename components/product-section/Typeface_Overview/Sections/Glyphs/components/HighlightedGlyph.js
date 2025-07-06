import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getCharacterName } from './CharacterNames';

const Container = styled(motion.div)`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 12px 12px 12px 0px;

`;

const Header = styled.div`
  margin-bottom: 12px;
  margin-right: 0px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgb(16, 12, 8);

  @media (max-width: 768px) {
  margin-right: -12px;
  }
`;

const Title = styled.span`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
`;

const GlyphContainer = styled.div`
  width: 100%;
  position: relative;
  aspect-ratio: 1.5;
  border: 0px solid rgb(16, 12, 8);
  flex: 1;
  min-height: 0px;
  overflow: hidden;


  }


`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;


`;

const MetricOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  right: -12px;


`;

const MetricLine = styled.div`
  position: absolute;
  width: 100%;
  height: 1px;
  background: rgb(16, 12, 8);
  left: 0;
`;

const MetricLabel = styled.span`
  position: absolute;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.8px;
  color: rgb(16, 12, 8);
  white-space: nowrap;
`;

const BearingLine = styled.div`
  position: absolute;
  width: 1px;
  height: 100%;
  background: rgb(16, 12, 8);
  top: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  row-gap: 0px;
  column-gap: 24px;
  padding: 12px 0;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.8px;
`;

const InfoLabel = styled.span`
  font-weight: 500;
`;

const InfoValue = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;



export const HighlightedGlyph = ({ glyph, font = {} }) => {
  const canvasRef = useRef(null);
  const [metrics, setMetrics] = useState({});

  const calculateMetrics = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !font?.opentype || !glyph) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Get OpenType.js glyph
    const opentypeGlyph = font.opentype.charToGlyph(glyph);
    if (!opentypeGlyph) return;

    // Font metrics from OpenType.js
    const { ascender, descender, unitsPerEm } = font.opentype;
    const xHeight = font.opentype.tables?.os2?.sxHeight || ascender * 0.5;
    const capHeight = font.opentype.tables?.os2?.sCapHeight || ascender * 0.5;

    // Use proper scale calculation like the official examples
    const head = font.opentype.tables.head;
    const maxHeight = head.yMax - head.yMin;
    const margin = 20;
    const w = rect.width - margin * 2;
    const h = rect.height - margin * 2;
    const glyphScale = Math.min(w / (head.xMax - head.xMin), h / maxHeight);
    const fontSize = glyphScale * font.opentype.unitsPerEm;

    // Center the ascender-descender range vertically in the container
    const ascDescRange = ascender - descender;
    const ascDescPixelHeight = ascDescRange * glyphScale;
    const verticalOffset = (rect.height - ascDescPixelHeight) / 2;
    const baseline = verticalOffset + ascender * glyphScale;

    // Calculate positions using the same scale and offset
    const ascenderY = baseline - ascender * glyphScale;
    const capHeightY = baseline - capHeight * glyphScale;
    const xHeightY = baseline - xHeight * glyphScale;
    const descenderY = baseline - descender * glyphScale;

    // Calculate glyph positioning for centering
    const glyphAdvanceWidth = opentypeGlyph.advanceWidth || 0;
    const glyphLeftBearing = opentypeGlyph.leftSideBearing || 0;
    const glyphRightBearing = glyphAdvanceWidth - (opentypeGlyph.xMax || 0);
    
    const glyphWidth = glyphAdvanceWidth * glyphScale;
    const glyphStartX = (rect.width - glyphWidth) / 2;
    const x0 = glyphStartX;
    
    // Use OpenType.js built-in draw method
    ctx.fillStyle = 'rgb(16, 12, 8)';
    
    try {
      // This is the official way to draw glyphs with OpenType.js
      opentypeGlyph.draw(ctx, x0, baseline, fontSize);
    } catch (error) {
      // Fallback: use system font rendering
      const fontSize = Math.min(rect.width * 0.3, rect.height * 0.3);
      ctx.font = `${fontSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, rect.width / 2, baseline);
    }

    // Bearing line positions
    const leftBearingX = glyphStartX;
    const rightBearingX = glyphStartX + glyphWidth;

    setMetrics({
      ascenderY,
      capHeightY, 
      xHeightY,
      baseline,
      descenderY,
      leftBearingX,
      rightBearingX,
      // Values for display
      ascenderValue: Math.round(ascender),
      capHeightValue: Math.round(capHeight),
      xHeightValue: Math.round(xHeight),
      baselineValue: 0,
      descenderValue: Math.round(descender),
      leftBearingValue: Math.round(glyphLeftBearing),
      rightBearingValue: Math.round(glyphRightBearing),
      widthValue: Math.round(glyphAdvanceWidth)
    });

  }, [glyph, font]);

  useEffect(() => {
    calculateMetrics();
    const resizeObserver = new ResizeObserver(calculateMetrics);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [calculateMetrics]);

  // Get glyph data directly from OpenType.js
  const opentypeGlyph = font?.opentype ? font.opentype.charToGlyph(glyph) : null;

  return (
    <Container>
      <Header>
        <Title>Glyph Metrics</Title>
      </Header>

      <GlyphContainer>
        <Canvas ref={canvasRef} />
        <MetricOverlay>
          {/* Horizontal metric lines */}
          {Number.isFinite(metrics.ascenderY) && (
            <MetricLine style={{ top: metrics.ascenderY }}>
              <MetricLabel style={{ right: 0, top: -15 }}>
                Ascender: {metrics.ascenderValue}
              </MetricLabel>
            </MetricLine>
          )}
          {Number.isFinite(metrics.capHeightY) && (
            <MetricLine style={{ top: metrics.capHeightY }}>
              <MetricLabel style={{ left: 0, top: 6 }}>
                Cap Height: {metrics.capHeightValue}
              </MetricLabel>
            </MetricLine>
          )}
          {Number.isFinite(metrics.xHeightY) && (
            <MetricLine style={{ top: metrics.xHeightY }}>
              <MetricLabel style={{ left: 0, top: 6 }}>
                x-Height: {metrics.xHeightValue}
              </MetricLabel>
            </MetricLine>
          )}
          {Number.isFinite(metrics.baseline) && (
            <MetricLine style={{ top: metrics.baseline, background: 'red' }}>
              <MetricLabel style={{ left: 0, top: -15, color: 'red' }}>
                Baseline: {metrics.baselineValue}
              </MetricLabel>
            </MetricLine>
          )}
          {Number.isFinite(metrics.descenderY) && (
            <MetricLine style={{ top: metrics.descenderY }}>
              <MetricLabel style={{ right: 0, top: -15 }}>
                Descender: {metrics.descenderValue}
              </MetricLabel>
            </MetricLine>
          )}

          {/* Vertical bearing lines */}
          {Number.isFinite(metrics.leftBearingX) && (
            <BearingLine style={{ left: metrics.leftBearingX }} />
          )}
          {Number.isFinite(metrics.rightBearingX) && (
            <BearingLine style={{ left: metrics.rightBearingX }} />
          )}

          {/* Bearing labels - positioned below descender line */}
          {Number.isFinite(metrics.leftBearingX) && Number.isFinite(metrics.descenderY) && (
            <MetricLabel style={{ 
              left: metrics.leftBearingX - 6,
              top: metrics.descenderY + 6,
              transform: 'translateX(-100%)'
            }}>
              {metrics.leftBearingValue}
            </MetricLabel>
          )}
          {Number.isFinite(metrics.leftBearingX) && Number.isFinite(metrics.rightBearingX) && Number.isFinite(metrics.descenderY) && (
            <MetricLabel style={{ 
              left: (metrics.leftBearingX + metrics.rightBearingX) / 2, 
              top: metrics.descenderY + 6,
              transform: 'translateX(-50%)'
            }}>
              {metrics.widthValue}
            </MetricLabel>
          )}
          {Number.isFinite(metrics.rightBearingX) && Number.isFinite(metrics.descenderY) && (
            <MetricLabel style={{ 
              left: metrics.rightBearingX + 6,
              top: metrics.descenderY + 6,
              transform: 'translateX(0%)'
            }}>
              {metrics.rightBearingValue}
            </MetricLabel>
          )}
        </MetricOverlay>
      </GlyphContainer>

      <InfoGrid>
        <InfoLabel>Glyph Name</InfoLabel>
        <InfoValue>{getCharacterName(glyph)}</InfoValue>
        
        
        <InfoLabel>Unicode Decimal</InfoLabel>
        <InfoValue>{glyph.charCodeAt(0)}</InfoValue>
        
        <InfoLabel>Unicode Hex</InfoLabel>
        <InfoValue>{glyph.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}</InfoValue>
        
        <InfoLabel>HTML Entity (Hex)</InfoLabel>
        <InfoValue>&#x{glyph.charCodeAt(0).toString(16).toUpperCase()};</InfoValue>
        
      </InfoGrid>
    </Container>
  );
};

export default HighlightedGlyph; 