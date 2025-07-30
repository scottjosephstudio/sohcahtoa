import styled from "styled-components";
import { motion } from "framer-motion";

const Tooltip = styled(motion.div)`
  position: absolute;
  top: -30px;
  left: 54%;
  transform: translateX(-50%);
  background-color: ${({ $isTypefacesPage, $isIDPath }) => {
    if ($isIDPath) return "#006efe";
    if ($isTypefacesPage) return "rgb(16, 12, 8)";
    return "white";
  }};
  color: ${({ $isTypefacesPage, $isTypefacePath }) => {
    if ($isTypefacesPage) return "var(--text-primary)";
    if ($isTypefacePath) return "var(--text-primary)";
    return "var(--text-primary)";
  }};
  padding: 10px 10px;
  border-radius: 8px;
  font-size: 12px;
  letter-spacing: 0.8px;
  white-space: nowrap;
  text-align: center;
  pointer-events: none;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  mix-blend-mode: normal; /* Override parent's blend mode for tooltip */
`;

export default Tooltip;
