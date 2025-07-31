import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getCharacterName } from './CharacterNames';
import { useTheme } from '../../../../../../context/ThemeContext';

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
  border-bottom: 2px solid var(--border-color);

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
  border: 0px solid var(--border-color);
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



`;

const MetricLine = styled.div`
  position: absolute;
  width: 100%;
  height: 1px;
  background: var(--border-color);
  left: 0;
`;

const MetricLabel = styled.span`
  position: absolute;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.8px;
  color: var(--text-primary);
  white-space: nowrap;
`;

const BearingLine = styled.div`
  position: absolute;
  width: 1px;
  height: 100%;
  background: var(--border-color);
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
  const { isDarkMode } = useTheme();

  const calculateMetrics = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !font?.opentype || !glyph) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas more thoroughly
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, rect.width, rect.height);

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
    const fillColor = isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(16, 12, 8)';
    console.log('Drawing glyph with color:', fillColor, 'isDarkMode:', isDarkMode);
    
    // Primary solution: Manual path drawing for better color control
    try {
      const path = opentypeGlyph.getPath(x0, baseline, fontSize);
      
      // Clear any existing paths and set fill color
      ctx.beginPath();
      ctx.fillStyle = fillColor;
      
      // Convert OpenType.js path to Canvas API path
      const commands = path.commands;
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        if (cmd.type === 'M') {
          ctx.moveTo(cmd.x, cmd.y);
        } else if (cmd.type === 'L') {
          ctx.lineTo(cmd.x, cmd.y);
        } else if (cmd.type === 'C') {
          ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        } else if (cmd.type === 'Q') {
          ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
        } else if (cmd.type === 'Z') {
          ctx.closePath();
        }
      }
      
      // Fill the path with your desired color
      ctx.fill();
      
    } catch (error) {
      console.log('Manual path drawing failed, trying context override method');
      
      // Fallback: Override canvas context methods temporarily
      const originalFill = ctx.fill;
      const originalStroke = ctx.stroke;
      
      ctx.fill = function() {
        const currentStyle = ctx.fillStyle;
        ctx.fillStyle = fillColor;
        const result = originalFill.apply(ctx, arguments);
        ctx.fillStyle = currentStyle;
        return result;
      };
      
      ctx.stroke = function() {
        const currentStyle = ctx.strokeStyle;
        ctx.strokeStyle = fillColor;
        const result = originalStroke.apply(ctx, arguments);
        ctx.strokeStyle = currentStyle;
        return result;
      };
      
      try {
        opentypeGlyph.draw(ctx, x0, baseline, fontSize);
      } catch (drawError) {
        console.log('OpenType draw method also failed, using fallback rendering');
        // Final fallback: use system font rendering
        const fallbackFontSize = Math.min(rect.width * 0.3, rect.height * 0.3);
        ctx.font = `${fallbackFontSize}px "${font.opentype?.names?.fontFamily?.en || 'serif'}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = fillColor;
        ctx.fillText(glyph, rect.width / 2, baseline);
      } finally {
        // Always restore original methods
        ctx.fill = originalFill;
        ctx.stroke = originalStroke;
      }
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

  }, [glyph, font, isDarkMode]);

  useEffect(() => {
    // Small delay to ensure proper redraw
    const timer = setTimeout(() => {
      calculateMetrics();
    }, 10);
    
    const resizeObserver = new ResizeObserver(calculateMetrics);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }
    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [calculateMetrics]);

  // Get glyph data directly from OpenType.js
  const opentypeGlyph = font?.opentype ? font.opentype.charToGlyph(glyph) : null;

  return (
    <Container>
      <Header>
        <Title>Glyph Metrics</Title>
      </Header>

      <GlyphContainer>
        <Canvas ref={canvasRef} key={`canvas-${isDarkMode}`} />
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