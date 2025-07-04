import styled from 'styled-components';
import { motion } from 'framer-motion';

const SvgIcon = styled(motion.svg)`
  width: 60px;
  height: 60px;
  color: ${({ $isTypefacePath }) => $isTypefacePath ? 'rgb(16, 12, 8)' : '#39ff14'};
  
  /* Performance optimizations */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;
`;

export default SvgIcon; 