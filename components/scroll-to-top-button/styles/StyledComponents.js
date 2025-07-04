import styled from 'styled-components';
import { motion } from 'framer-motion';

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
  transition: opacity 0.5s ease;
  
  &.fade-out {
    opacity: 0;
  }
`;

export const SvgIcon = styled(motion.svg)`
  width: 54px;
  height: 54px;
`; 