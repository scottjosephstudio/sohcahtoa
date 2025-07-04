import styled from 'styled-components';
import { motion } from 'framer-motion';

const IconLink = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.5s ease;
  -webkit-transition: all 0.5s ease;
  position: relative;
  cursor: pointer;
`;

export default IconLink; 