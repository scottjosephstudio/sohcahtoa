import styled from "styled-components";
import { motion } from "framer-motion";

const Tooltip = styled(motion.div)`
  position: absolute;
  top: 64%;
  left: 82%;
  transform: translateY(-50%);
  background-color: ${({ $isTypefacesPage }) =>
    $isTypefacesPage ? "rgb(16, 12, 8)" : "white"};
  color: ${({ $isTypefacesPage }) =>
    $isTypefacesPage ? "white" : "rgb(16, 12, 8)"};
  padding: 10px 10px;
  border-radius: 8px;
  font-size: 12px;
  letter-spacing: 0.8px;
  white-space: nowrap;
  text-align: center;
  pointer-events: none;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  margin-left: 10px; /* Add some spacing between icon and tooltip */
  mix-blend-mode: normal; /* Override parent's blend mode for tooltip */
`;

export default Tooltip;
