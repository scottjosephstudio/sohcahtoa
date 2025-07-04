import styled from "styled-components";
import { motion } from "framer-motion";

const TooltipText = styled(motion.span)`
  position: absolute;
  top: -30px;
  left: 84%;
  transform: translateX(-50%);
  background-color: #006efe;
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  letter-spacing: 0.8px;
  white-space: nowrap;
  text-align: center;
  pointer-events: none;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  z-index: 9999;
`;

export default TooltipText;
