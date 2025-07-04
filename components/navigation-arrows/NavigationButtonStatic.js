import styled from 'styled-components';
import { motion } from 'framer-motion';

// Non-link version for special pages
const NavigationButtonStatic = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  -webkit-transition: all 0.5s ease;
  position: relative;
  
  &:first-child {
    margin-right: -16px;
  }
`;

export default NavigationButtonStatic; 