import styled from "styled-components";
import { motion } from "framer-motion";

// Container for the navigation arrows
const NavigationContainer = styled(motion.div)`
  position: fixed;
  bottom: 15px;
  left: 12px;
  z-index: 10;
  display: flex;
  opacity: ${({ $isNavigating, $ShouldShow, $isTypefacesPage }) => {
    if ($isNavigating || !$ShouldShow) return 0;
    // Let framer-motion handle opacity for Typefaces page
    return $isTypefacesPage ? undefined : 1;
  }};
  visibility: ${({ $isNavigating, $ShouldShow }) =>
    $isNavigating || !$ShouldShow ? "hidden" : "visible"};
  transform: translateX(
    ${({ $isSpecialPage, $animatedSlide }) =>
      $isSpecialPage && $animatedSlide ? "-150%" : "0"}
  );
  transition: ${({ $isTypefacesPage }) =>
    $isTypefacesPage
      ? "visibility 0.5s ease, transform 0.8s ease"
      : "opacity 0.5s ease, visibility 0.5s ease, transform 0.8s ease"};
  -webkit-transition: ${({ $isTypefacesPage }) =>
    $isTypefacesPage
      ? "visibility 0.5s ease, transform 0.8s ease"
      : "opacity 0.5s ease, visibility 0.5s ease, transform 0.8s ease"};
  mix-blend-mode: ${({ $isTypefacesPage }) =>
    $isTypefacesPage ? "normal" : "difference"};
  display: ${({ $isIDPath, $forceShowOnIDPath }) =>
    $isIDPath && !$forceShowOnIDPath ? "none" : "flex"};
  class-name: nav-arrows-component;

  /* Add a data attribute for CSS selection */
  &[data-force-show="true"] {
    display: flex !important;
  }
`;

export default NavigationContainer;
