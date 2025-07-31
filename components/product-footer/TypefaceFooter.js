import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FooterWrapper,
  SvgIcon,
  SquareFolioHomeTypefaceRoute,
  TypefacesIconTypefaceRoute,
  ThemeIconTypefaceRoute,
  ArrowLeft,
  ArrowRight,
} from "./styled";
import { svgIconVariants } from "../product-section/Controller/ProductPage_Styles";
import styled from "styled-components";
import ThemeToggleIcon from "./ThemeToggleIcon";
import { useTheme } from "../../context/ThemeContext";

// Add the Tooltip styled component based on the HomeIcon component
const Tooltip = styled(motion.div)`
  position: absolute;
  top: -30px;
  left: 50%; /* Positioning is handled by parent containers with specific overrides */
  transform: translateX(-50%);
  background-color: ${({ $customColor, $isDarkMode }) => 
    $isDarkMode ? 'white' : ($customColor || "#006efe")};
  color: ${({ $isDarkMode }) => $isDarkMode ? 'rgb(16, 12, 8)' : 'white'};
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

// Create styled containers for the icons with specific tooltip positions
const HomeIconContainer = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  ${Tooltip} {
    left: ${({ $tooltipLeftPos }) => $tooltipLeftPos};
  }
`;

const TypefacesIconContainer = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  ${Tooltip} {
    left: ${({ $tooltipLeftPos }) => $tooltipLeftPos};
  }
`;

// Motion variants for icon container hover effects
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

const TypefaceFooter = ({
  showInitialAnimation,
  hasInitialAnimationOccurred,
  handleTypefaceNavigation,
  homeLink,
  typefacesLink,
  isNavigatingHome,
  setIsNavigatingHome,
  onNavigate,
  activeTab,
  homeIconTooltipPosition = "54%",
  typefacesIconTooltipPosition = "80%",
}) => {
  const { isDarkMode } = useTheme();
  const handleNavigationClick = (e, link) => {
    e.preventDefault();

    // First notify parent about navigation start AND trigger exit animation
    if (onNavigate && activeTab === "test") {
      onNavigate();
    }

    // Small delay to let exit animation start
    setTimeout(() => {
      // Then dispatch page transition
      if (typeof window !== "undefined") {
        const event = new CustomEvent("pageTransitionStart", {
          detail: {
            isNavigatingToHome: link === "/",
            isNavigatingToTypefaces: link === "/Typefaces",
          },
        });
        window.dispatchEvent(event);
      }

      // Then handle navigation
      if (setIsNavigatingHome) {
        setIsNavigatingHome(true);
      }
      handleTypefaceNavigation(e, link);
    }, 400);
  };

  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && (
        <FooterWrapper
          as={motion.div}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            },
          }}
        >
          <AnimatePresence>
            {showInitialAnimation && (
              <motion.div
                key="initial-arrows"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowLeft
                  as={motion.div}
                  initial={{ left: "14px", opacity: 1 }}
                  animate={{
                    left: "-85px",
                    opacity: 0,
                    transition: {
                      left: { duration: 1, ease: [0.6, -0.05, 0.01, 0.99] },
                      opacity: { duration: 0.1, delay: 0.3 },
                    },
                  }}
                  style={{ position: "fixed", bottom: "11px" }}
                  data-arrowleft="true"
                >
                  <SvgIcon
                    viewBox="0 0 25 25"
                    $isTypefacePath={true}
                    variants={svgIconVariants}
                    initial="initial"
                    whileHover="hover"
                    custom={{ $isTypefacePath: true }}
                  >
                    <path d="M4.18,12.26l5.27,5.27c.44.44,1.15.44,1.59,0s.44-1.15,0-1.59l-3.35-3.35h10.79c.62,0,1.12-.5,1.12-1.12s-.5-1.12-1.12-1.12H7.69l3.35-3.35c.44-.44.44-1.15,0-1.59-.22-.22-.51-.33-.8-.33s-.58.11-.8.33l-5.27,5.27c-.44.44-.44-1.15,0,1.59Z" />
                  </SvgIcon>
                </ArrowLeft>

                <ArrowRight
                  as={motion.div}
                  initial={{ left: "61px", opacity: 1 }}
                  animate={{
                    left: "-50px",
                    opacity: 0,
                    transition: {
                      left: { duration: 1, ease: [0.6, -0.05, 0.01, 0.99] },
                      opacity: { duration: 0.2, delay: 0.4 },
                    },
                  }}
                  style={{ position: "fixed", bottom: "11px" }}
                  data-arrowright="true"
                >
                  <SvgIcon
                    viewBox="0 0 25 25"
                    $isTypefacePath={true}
                    variants={svgIconVariants}
                    initial="initial"
                    whileHover="hover"
                    custom={{ $isTypefacePath: true }}
                  >
                    <path d="M19.27,10.67l-5.27-5.27c-.44-.44-1.15-.44-1.59,0s.44,1.15,0,1.59l3.35,3.35H4.97c-.62,0-1.12.5-1.12,1.12s.5,1.12,1.12,1.12h10.79l-3.35,3.35c-.44.44-.44,1.15,0,1.59.22.22.51.33.8.33s.58-.11.8-.33l5.27-5.27c.44-.44.44-1.15,0-1.59Z" />
                  </SvgIcon>
                </ArrowRight>
              </motion.div>
            )}
          </AnimatePresence>

          <SquareFolioHomeTypefaceRoute
            key="home-icon"
            as={motion.div}
            {...(!hasInitialAnimationOccurred
              ? {
                  initial: { left: "108px", opacity: 1 },
                  animate: {
                    left: "14px",
                    opacity: 1,
                    transition: {
                      duration: 1,
                      ease: [0.6, -0.05, 0.01, 0.99],
                    },
                  },
                }
              : {})}
            style={{
              position: "fixed",
              left: hasInitialAnimationOccurred ? "14px" : undefined,
            }}
            data-squarefoliohome="true"
          >
            <HomeIconContainer
              onClick={(e) => handleNavigationClick(e, homeLink)}
              $tooltipLeftPos={homeIconTooltipPosition}
              variants={iconContainerVariants}
              initial="initial"
              whileHover="hover"
            >
              <Tooltip $customColor="#006efe" $isDarkMode={isDarkMode} variants={tooltipVariants}>
                Home
              </Tooltip>
              <motion.div variants={svgGlowVariants}>
                <SvgIcon
                  viewBox="0 0 25 25"
                  $isTypefacePath={true}
                  $isHomeIcon={true}
                  variants={svgIconVariants}
                  initial="initial"
                  whileHover="hover"
                  custom={{ $isTypefacePath: true }}
                  $isDarkMode={isDarkMode}
                >
                  <path 
                    d="M22.06,8.21L12.95,3.72c-.11-.05-.23-.09-.35-.1-.19-.02-.38.01-.55.1L2.94,8.21c-.34.17-.56.52-.56.9v11.27c0,.55.45,1,1,1h7.11c.55,0,1-.45,1-1v-4.23h2.02v4.23c0,.55.45,1,1,1h7.11c.55,0,1-.45,1-1v-11.27c0-.38-.22-.73-.56-.9ZM10.19,13.9c-.55,0-1,.45-1,1v4.23h-4.51v-9.26l7.82-3.85,7.82,3.85v9.26h-4.51v-4.23c0-.55-.45-1-1-1h-4.62Z" 
                    fill="currentColor"
                  />
                </SvgIcon>
              </motion.div>
            </HomeIconContainer>
          </SquareFolioHomeTypefaceRoute>

          <TypefacesIconTypefaceRoute
            key="typefaces-icon"
            as={motion.div}
            {...(!hasInitialAnimationOccurred
              ? {
                  initial: { left: "163px", opacity: 1 },
                  animate: {
                    left: "69px",
                    opacity: 1,
                    transition: {
                      duration: 1,
                      ease: [0.6, -0.05, 0.01, 0.99],
                    },
                  },
                }
              : {})}
            style={{
              position: "fixed",
              left: hasInitialAnimationOccurred ? "69px" : undefined,
            }}
            data-typefaces="true"
          >
            <TypefacesIconContainer
              onClick={(e) => handleNavigationClick(e, typefacesLink)}
              $tooltipLeftPos={typefacesIconTooltipPosition}
              variants={iconContainerVariants}
              initial="initial"
              whileHover="hover"
            >
              <Tooltip $customColor="#006efe" $isDarkMode={isDarkMode} variants={tooltipVariants}>
                Typefaces
              </Tooltip>
              <motion.div variants={svgGlowVariants}>
                <SvgIcon
                  viewBox="0 0 25 25"
                  $isTypefacePath={true}
                  $isTypeface={true}
                  variants={svgIconVariants}
                  initial="initial"
                  whileHover="hover"
                  custom={{ $isTypefacePath: true }}
                  $isDarkMode={isDarkMode}
                >
                  <circle
                    cx="12.5"
                    cy="13"
                    r="8.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <text
                    x="13"
                    y="11.5"
                    textAnchor="middle"
                    fontSize="7"
                    fill="currentColor"
                  >
                    A
                  </text>
                  <text x="8.6" y="17.25" fontSize="7" fill="currentColor">
                    B
                  </text>
                  <text x="12.6" y="17.25" fontSize="7" fill="currentColor">
                    C
                  </text>
                </SvgIcon>
              </motion.div>
            </TypefacesIconContainer>
          </TypefacesIconTypefaceRoute>

          <ThemeIconTypefaceRoute
            key="theme-icon"
            as={motion.div}
            {...(!hasInitialAnimationOccurred
              ? {
                  initial: { left: "218px", opacity: 1 },
                  animate: {
                    left: "123px",
                    opacity: 1,
                    transition: {
                      duration: 1,
                      ease: [0.6, -0.05, 0.01, 0.99],
                    },
                  },
                }
              : {})}
            style={{
              position: "fixed",
              left: hasInitialAnimationOccurred ? "124px" : undefined,
            }}
            data-theme="true"
          >
            <ThemeToggleIcon />
          </ThemeIconTypefaceRoute>
        </FooterWrapper>
      )}
    </AnimatePresence>
  );
};

export default TypefaceFooter;