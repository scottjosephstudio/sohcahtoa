import { useState, useEffect } from "react";
import { useNavigation } from "../../../context/NavigationContext";

export const useScrollVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const { $isNavigating } = useNavigation();

  // Show button when page is scrolled down 100px
  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      // Only reset fade state when button becomes invisible and not navigating
      if (!$isNavigating) {
        setIsFading(false);
      }
    }
  };

  // Enhanced navigation detection
  const handleLinkClick = (event) => {
    // Prevent fade-out when clicking the scroll-to-top button itself
    if (event.target.closest(".scroll-to-top")) {
      return;
    }

    // Check for various navigation elements
    const navigationTarget = event.target.closest('a[href], button, [role="button"], [onclick]');
    
    if (navigationTarget && isVisible) {
      // Check if it's a navigation action
      const hasNavigation = 
        navigationTarget.href || 
        navigationTarget.onclick || 
        navigationTarget.getAttribute('role') === 'button' ||
        navigationTarget.closest('[data-navigation]') ||
        navigationTarget.closest('[data-link]');

      if (hasNavigation) {
        setIsFading(true);
      }
    }
  };

  // Handle navigation state changes from NavigationContext
  useEffect(() => {
    if ($isNavigating && isVisible) {
      setIsFading(true);
    } else if (!$isNavigating && isFading) {
      // Reset fade state when navigation completes
      const timer = setTimeout(() => {
        setIsFading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [$isNavigating, isVisible, isFading]);

  // Auto-reset fade state after animation completes
  useEffect(() => {
    if (isFading) {
      const timer = setTimeout(() => {
        // Only reset if we're not navigating
        if (!$isNavigating) {
          setIsFading(false);
        }
      }, 500); // Match the CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isFading, $isNavigating]);

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    
    // Use capture phase to catch all clicks before they bubble
    document.addEventListener("click", handleLinkClick, {
      capture: true,
      passive: true,
    });

    // Clean up event listeners
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      document.removeEventListener("click", handleLinkClick, {
        capture: true,
      });
    };
  }, [isVisible]);

  return {
    isVisible,
    isFading,
    setIsFading,
  };
};
