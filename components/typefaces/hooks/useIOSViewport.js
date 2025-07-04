import { useEffect, useState } from "react";

export default function useIOSViewport() {
  const [viewportInfo, setViewportInfo] = useState({
    height: 0,
    width: 0,
    isIOS: false,
    safeBannerHeight: 20,
  });

  useEffect(() => {
    const updateViewportInfo = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isMobile = window.innerWidth <= 768;

      const height = window.innerHeight;
      const width = window.innerWidth;

      // Calculate safe banner height for iOS
      let safeBannerHeight = 20;
      if (isIOS && isMobile) {
        // On iOS, add extra buffer to ensure visibility
        safeBannerHeight = 25;

        // Check if we're in a problematic iOS viewport situation
        const screenHeight = window.screen.height;
        const viewportHeight = window.innerHeight;

        if (screenHeight > viewportHeight + 100) {
          // Browser UI is taking significant space
          safeBannerHeight = 30;
        }
      }

      setViewportInfo({
        height,
        width,
        isIOS: isIOS && isMobile,
        safeBannerHeight,
      });
    };

    // Initial calculation
    updateViewportInfo();

    // Listen for changes
    window.addEventListener("resize", updateViewportInfo);
    window.addEventListener("orientationchange", () => {
      // Delay after orientation change for iOS
      setTimeout(updateViewportInfo, 500);
    });

    // iOS specific - listen for visual viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewportInfo);
    }

    return () => {
      window.removeEventListener("resize", updateViewportInfo);
      window.removeEventListener("orientationchange", updateViewportInfo);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateViewportInfo);
      }
    };
  }, []);

  return viewportInfo;
}
