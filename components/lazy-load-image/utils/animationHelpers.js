// Helper function to determine image animation state
export const getImageAnimationState = (isSliding, isLoaded, isBlurCleared) => {
  if (isSliding) return "sliding";
  if (isLoaded && isBlurCleared) return "loaded";
  return "hidden";
};

// Helper function to determine placeholder animation state
export const getPlaceholderAnimationState = (isLoaded, isSliding) => {
  if (isLoaded && !isSliding) return "hidden";
  return "visible";
};
