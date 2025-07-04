import styled from 'styled-components';
import { motion } from 'framer-motion';

// Base tooltip
const Tooltip = styled(motion.div)`
  position: absolute;
  top: -35px;
  background-color: ${({ $isTypefacesPage }) => $isTypefacesPage ? 'rgb(16, 12, 8)' : 'white'};
  color: ${({ $isTypefacesPage }) => $isTypefacesPage ? 'white' : 'rgb(16, 12, 8)'};
  padding: 10px 10px;
  border-radius: 8px;
  font-size: 12px;
  letter-spacing: 0.8px;
  white-space: nowrap;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  text-align: center;
  pointer-events: none;
  mix-blend-mode: normal; /* Override parent's blend mode for tooltip */
`;

export default Tooltip; 