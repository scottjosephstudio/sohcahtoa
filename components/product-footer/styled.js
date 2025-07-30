import styled from "styled-components";
import { motion } from "framer-motion";

const fixedPositionStyles = `
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;
`;

export const ArrowLeft = styled.div`
  position: fixed;
  left: 20px;
  bottom: 0px;
  z-index: 10;
  cursor: pointer;
  ${fixedPositionStyles}

  @media (min-width: 1420px) {
    bottom: 0px; /* Maintain same position at larger screens */
  }
`;

export const ArrowRight = styled.div`
  position: fixed;
  left: 65px;
  bottom: 0px;
  z-index: 10;
  cursor: pointer;
  ${fixedPositionStyles}

  @media (min-width: 1420px) {
    bottom: 0px; /* Maintain same position at larger screens */
  }
`;

export const SquareFolioHomeTypefaceRoute = styled.div`
  position: fixed;
  left: 106px;
  bottom: 0px;
  z-index: 50;
  cursor: pointer;
  height: 80px;
  ${fixedPositionStyles}

  @media (min-width: 1420px) {
    bottom: 0px; /* Maintain same position at larger screens */
  }
`;

export const TypefacesIconTypefaceRoute = styled.div`
  position: fixed;
  left: 171px;
  bottom: 0px;
  z-index: 50;
  cursor: pointer;
  height: 80px;
  ${fixedPositionStyles}

  @media (min-width: 1420px) {
    bottom: 0px; /* Maintain same position at larger screens */
  }
`;

export const ThemeIconTypefaceRoute = styled.div`
  position: fixed;
  left: 236px;
  bottom: 0px;
  z-index: 50;
  cursor: pointer;
  height: 80px;
  ${fixedPositionStyles}

  @media (min-width: 1420px) {
    bottom: 0px; /* Maintain same position at larger screens */
  }
`;

export const SvgIcon = styled(motion.svg)`
  width: 60px;
  height: 60px;
  ${fixedPositionStyles}

  ${(props) =>
    !props.$isTypeface &&
    `
    fill: ${props.$isTypefacePath ? (props.$isDarkMode ? 'white' : 'rgb(16, 12, 8)') : "var(--accent-color)"};
  `}
  
  ${(props) =>
    props.$isTypeface &&
    `
    color: ${props.$isTypefacePath ? (props.$isDarkMode ? 'white' : 'rgb(16, 12, 8)') : "var(--accent-color)"};
  `}

  @media (min-width: 1420px) {
    width: 60px;
    height: 60px;
  }
`;

export const FooterWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  transition: filter 0.3s ease;
  ${fixedPositionStyles}
`;
