import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import styled from "styled-components";

const ThemeIconContainer = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  top: -30px;
  left: 86%;
  transform: translateX(-50%);
  background-color: ${props => props.isDarkMode ? 'white' : '#006efe'};
  color: ${props => props.isDarkMode ? 'rgb(16, 12, 8)' : 'white'};
  padding: 10px 10px;
  border-radius: 8px;
  font-size: 12px;
  letter-spacing: 0.8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  text-align: center;
  pointer-events: none;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  mix-blend-mode: normal;
`;

const SvgIcon = styled(motion.svg)`
  width: 60px;
  height: 60px;
  transform: translateZ(0) translateX(-2px);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;
  color: ${props => props.isDarkMode ? 'white' : 'rgb(16, 12, 8)'};
`;

const iconContainerVariants = {
  hover: {
    transition: { duration: 0.2 },
  },
};

const tooltipVariants = {
  initial: {
    opacity: 0,
    visibility: "hidden",
  },
  hover: {
    opacity: 1,
    visibility: "visible",
    transition: { duration: 0.2 },
  },
};

const svgGlowVariants = {
  initial: {
    filter: "drop-shadow(0 0 0px rgba(255, 255, 255, 0))",
  },
  hover: {
    filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))",
    transition: { duration: 0.2 },
  },
};

const iconVariants = {
  initial: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1,
    rotate: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const ThemeToggleIcon = ({ onClick, tooltipPosition = "50%" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleClick = (e) => {
    e.preventDefault();
    toggleTheme();
    if (onClick) onClick(e);
  };

  return (
    <ThemeIconContainer
      onClick={handleClick}
      variants={iconContainerVariants}
      initial="initial"
      whileHover="hover"
    >
      <Tooltip variants={tooltipVariants} isDarkMode={isDarkMode}>
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </Tooltip>
      <motion.div variants={svgGlowVariants}>
        <SvgIcon
          viewBox="0 0 25 25"
          isDarkMode={isDarkMode}
        >
          {/* Sun icon for both dark and light modes */}
    

         <circle
                    cx="12.5"
                    cy="13"
                    r="8.5"
                    fill="none"
                    stroke={isDarkMode ? 'white' : 'rgb(16, 12, 8)'}
                    strokeWidth="2"
                  />
        </SvgIcon>
      </motion.div>
    </ThemeIconContainer>
  );
};

export default ThemeToggleIcon; 