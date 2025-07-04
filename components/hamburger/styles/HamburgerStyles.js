import styled from "styled-components";
import { motion } from "framer-motion";

export const HamburgerContainer = styled.div`
  position: fixed;
  top: 30px;
  left: 20px;
  z-index: 1000;
  display: none;
  -webkit-mix-blend-mode: ${({ $isOnTypefaces }) =>
    $isOnTypefaces ? "normal" : "difference"};
  mix-blend-mode: ${({ $isOnTypefaces }) =>
    $isOnTypefaces ? "normal" : "difference"};
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const HamburgerButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  cursor: pointer;
  -webkit-transition: transform 0.3s ease;
  transition: transform 0.3s ease;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
`;

export const HamburgerIconWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform, filter;
`;

export const SvgIcon = styled(motion.svg)`
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
`;
