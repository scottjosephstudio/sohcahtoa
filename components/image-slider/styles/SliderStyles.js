import styled from 'styled-components';
import { motion } from 'framer-motion';

export const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 12px 12px 12px rgba(16, 12, 8, 0.6);
  background-color: #666666;
  background-image: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.4) 40%, transparent 40%),
    linear-gradient(rgba(255, 255, 255, 0.4) 40%, transparent 40%);
  background-size: 6px 6px;
  transition: opacity 0.3s ease;
  contain: layout paint;
  cursor: ${props => props.$hasMultipleImages ? 'pointer' : 'default'};
`;

export const SlideImageContainer = styled.div`
  width: 100%;
  opacity: ${props => props.$isTransitioning ? 0 : 1};
  transition: opacity 0.3s ease;
`;

export const CaptionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 6px 0 6px 0;
  height: ${props => props.$height || 'auto'};
  position: relative;
  overflow: visible;
`;

export const AnimatedCaptionWrapper = styled(motion.div)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const SlideCaption = styled.figcaption`
  padding: 12px 0;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  color: #444;
  width: 80%;

`;

export const NumberIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: #39ff14; 
  color: rgba(16, 12, 8);
  font-size: 20px;
  padding: 0 8px;
  margin-top: 6px; /* Match the top padding of SlideCaption */
`;

export const LeftClickArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  cursor: ${props => props.$hasMultipleImages ? 'w-resize' : 'default'};
  z-index: 10;
`;

export const RightClickArea = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  cursor: ${props => props.$hasMultipleImages ? 'e-resize' : 'default'};
  z-index: 10;
`;