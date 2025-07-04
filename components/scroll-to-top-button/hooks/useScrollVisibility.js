import { useState, useEffect } from "react";

export const useScrollVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Show button when page is scrolled down 100px
  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setIsFading(false); // Reset fade state when button becomes invisible
    }
  };

  // Handle internal navigation link clicks for fade effect
  const handleLinkClick = (event) => {
    // Only fade on internal navigation links, avoid conflicts with TransitionWrapper
    const target = event.target.closest('a[href^="/"]');
    if (
      target &&
      isVisible &&
      !event.target.closest(".scroll-to-top") &&
      !event.target.closest("button")
    ) {
      setIsFading(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    // Use bubbling phase with passive listener to avoid conflicts
    document.addEventListener("click", handleLinkClick, {
      capture: false,
      passive: true,
    });

    // Clean up event listeners
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      document.removeEventListener("click", handleLinkClick);
    };
  }, [isVisible]);

  return {
    isVisible,
    isFading,
    setIsFading,
  };
};
