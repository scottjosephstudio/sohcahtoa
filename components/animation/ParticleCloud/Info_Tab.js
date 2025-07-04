import styled from "styled-components";
import { motion } from "framer-motion";

export const Container = styled(motion.div)`
  position: fixed;
  bottom: 28px;
  right: 20px;
  background-color: #e0e0e0;
  /* Remove the static border-radius and we'll handle it with animation */
  box-shadow:
    0 4px 6px 0px rgb(0 0 0 / 0.1),
    0 4px 6px 0px rgb(0 0 0 / 0.1);
  overflow: hidden;
  cursor: pointer;
  max-height: calc(100vh - 80px);
  margin-top: 40px;
  z-index: 50;
  transform: translateZ(0);
`;

export const Content = styled(motion.div)`
  padding: 0;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  min-height: ${(props) => props.$minHeight}px;

  ${(props) =>
    !props.$isInitialRender &&
    `
    padding: 20px;
  `}

  &::-webkit-scrollbar {
    display: none;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 15px;
    z-index: 11;
    opacity: ${(props) => (props.$isInitialRender ? 0 : 1)};
    transition: opacity 0.2s ease;
  }

  &::before {
    top: 0;
    background: linear-gradient(to bottom, #e0e0e0 0%, transparent 100%);
  }

  &::after {
    bottom: 0;
    background: linear-gradient(to top, #e0e0e0 0%, transparent 100%);
  }
`;

export const MoreButton = styled(motion.div)`
  color: rgb(75 85 99);
  white-space: nowrap;
  min-width: max-content;
    font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;

  span {
    transform: translateY(8px);
  }
  
  }
`;

export const ContentBlock = styled(motion.div)`
  opacity: ${(props) => (props.$isInitialRender ? 0 : 1)};
  transition: opacity 0.2s ease;

  &.title {
    margin-bottom: 12px;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
    text-decoration-color: #39ff14 !important;
    break-inside: avoid;
  }

  &.indent {
    margin-left: 20px;
    break-inside: avoid;
  }

  &.content {
    margin-bottom: 12px;
    break-inside: avoid;
  }
`;
