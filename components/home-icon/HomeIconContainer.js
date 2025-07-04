import styled from 'styled-components';
import { motion } from 'framer-motion';

// Truly fixed to viewport with transition
const HomeIconContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: ${({ $isSpecialPage, $animatedSlide }) =>
     $isSpecialPage && $animatedSlide ? '14px' : '108px'
  };
  /* Lower z-index specifically on Typefaces page so it's behind backdrop */
  z-index: ${({ $isTypefacesPage }) => $isTypefacesPage ? 30 : 30};
  opacity: ${({ $isNavigating, $shouldHideForTransition, $ShouldShow, $isTypefacesPage, $isIDPath }) => {
    if ($isIDPath) return 0; // Hidden on ID path
    if ($isNavigating || $shouldHideForTransition || !$ShouldShow) return 0;
    // Let framer-motion handle opacity for Typefaces page
    return $isTypefacesPage ? undefined : 1;
  }};
  visibility: ${({ $isNavigating, $shouldHideForTransition, $ShouldShow, $isIDPath }) => {
    if ($isIDPath) return 'hidden'; // Hidden on ID path
    return ($isNavigating || $shouldHideForTransition || !$ShouldShow) ? 'hidden' : 'visible';
  }};
  transition: ${({ $isTypefacesPage }) => 
    $isTypefacesPage ? 'visibility 0.5s ease, left 0.8s ease' : 'opacity 0.5s ease, visibility 0.5s ease, left 0.8s ease'
  };
  -webkit-transition: ${({ $isTypefacesPage }) => 
    $isTypefacesPage ? 'visibility 0.5s ease, left 0.8s ease' : 'opacity 0.5s ease, visibility 0.5s ease, left 0.8s ease'
  };
  -webkit-transition-delay: ${({ $isSpecialPage, $animatedSlide }) =>
     $isSpecialPage && $animatedSlide ? '0.2s' : '0s'
  };
  mix-blend-mode: ${({ $isTypefacesPage, $isIDPath, $arrowAnimationComplete }) => {
    if ($isIDPath) return 'normal';
    if ($isTypefacesPage && $arrowAnimationComplete) return 'normal';
    if ($isTypefacesPage) return 'normal';
    return 'difference';
  }};
  display: block; /* Always block, use opacity/visibility for hide/show */
  
  @media (max-width: 768px) {
    bottom: 20px;
    left: ${({ $isSpecialPage, $animatedSlide }) =>
       $isSpecialPage && $animatedSlide ? '14px' : '108px'
    };
  }
`;

export default HomeIconContainer; 