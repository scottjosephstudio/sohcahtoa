import styled from "styled-components";

// Positioned at top left with transition
const ShoppingBagContainer = styled.div`
  position: fixed;
  top: 14px;
  left: 58px;
  z-index: 10; /* Higher z-index to ensure visibility */
  mix-blend-mode: ${({ $isTypefacesPage }) =>
    $isTypefacesPage ? "normal" : "difference"};
  display: block;
  opacity: ${({ $isCurrentPage, $isIDPath, $shouldFadeIn, $isNavigating }) => {
    if ($isCurrentPage || $isIDPath) return 0; // Hidden on Typefaces or ID path
    if ($isNavigating) return 0; // Fade out during navigation
    if ($shouldFadeIn) return 1; // Fade in when navigating from ID/Typefaces to home
    return 1; // Visible otherwise
  }};
  visibility: ${({
    $isCurrentPage,
    $isIDPath,
    $shouldFadeIn,
    $isNavigating,
  }) => {
    if ($isCurrentPage || $isIDPath) return "hidden";
    if ($isNavigating) return "hidden"; // Hide during navigation
    return "visible";
  }};
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
  -webkit-transition:
    opacity 0.3s ease,
    visibility 0.3s ease;

  @media (min-width: 769px) {
    display: none;
  }
`;

export default ShoppingBagContainer;
