import styled from "styled-components";
import { motion } from "framer-motion";

const TypefacesIconContainer = styled(motion.div)`
  position: fixed;
  bottom: 10px;
  left: ${({ $hasInitialAnimationOccurred }) =>
    $hasInitialAnimationOccurred ? "67px" : "67px"};
  z-index: 9998;
  cursor: pointer;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $fadeIn }) => ($fadeIn ? 1 : 0)};
  visibility: ${({ $fadeIn }) => ($fadeIn ? "visible" : "hidden")};
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
  -webkit-transition:
    opacity 0.3s ease,
    visibility 0.3s ease;

  /* Performance optimizations */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;

  @media (min-width: 1420px) {
    bottom: 12px;
  }
`;

export default TypefacesIconContainer;
