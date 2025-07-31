import styled from "styled-components";
import { motion } from "framer-motion";

const SvgIcon = styled(motion.svg)`
  width: 60px;
  height: 60px;
  color: ${props =>
    $isTypefacePath ? "rgb(16, 12, 8)" : "#39ff14"};
  
  &:hover {
    color: ${props => props.$isProductPage ? '#006efe !important' : 'inherit'};
  }

  /* Performance optimizations */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;
`;

export default SvgIcon;
