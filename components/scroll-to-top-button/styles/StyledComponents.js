import styled from "styled-components";
import { motion } from "framer-motion";

export const ScrollButtonContainer = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 18px;
  width: 54px;
  height: 54px;
  cursor: pointer;
  z-index: 10;
  mix-blend-mode: difference;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  
  /* Hardware acceleration and performance optimizations */
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: opacity, visibility;
  
  /* Cross-browser transition support */
  transition: 
    opacity 0.5s ease,
    visibility 0.5s ease;
  -webkit-transition: 
    opacity 0.5s ease,
    visibility 0.5s ease;
  -moz-transition: 
    opacity 0.5s ease,
    visibility 0.5s ease;
  -o-transition: 
    opacity 0.5s ease,
    visibility 0.5s ease;

  &.fade-out {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
`;

export const SvgIcon = styled(motion.svg)`
  width: 54px;
  height: 54px;
`;
