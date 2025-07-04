// Utility functions for hamburger functionality

// Manage body scroll behavior when menu toggles
export const handleBodyScroll = (isMenuOpen) => {
  if (isMenuOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
};

// Clean up body overflow on unmount
export const cleanupBodyScroll = () => {
  document.body.style.overflow = 'auto';
};

// Handle closing timeout for Typefaces path
export const handleTypefacesClosing = (isMenuOpen, isOnTypefaces, setIsClosingOnTypefaces) => {
  if (isMenuOpen && isOnTypefaces) {
    setIsClosingOnTypefaces(true);
    // Keep hamburger white for 800ms during closing animation
    setTimeout(() => {
      setIsClosingOnTypefaces(false);
    }, 800);
  }
}; 