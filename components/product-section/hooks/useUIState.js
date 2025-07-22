"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter as useAppRouter, usePathname } from "next/navigation"; // App Router imports

export const useUIState = (props = {}) => {
  // Make props optional
  const { activeTab } = props; // Destructure with default empty object

  // Use App Router hooks
  const appRouter = useAppRouter();
  const pathname = usePathname();

  const [isNavigatingHome, setIsNavigatingHome] = useState(false);
  const [hasInitialAnimationOccurred, setHasInitialAnimationOccurred] =
    useState(false);
  const [windowWidth, setWindowWidth] = useState(0); // Initialize with 0 instead
  const [isClosing, setIsClosing] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFullCartOpen, setIsFullCartOpen] = useState(false);
  const [isTestExiting, setIsTestExiting] = useState(false);
  const [isGlyphsExiting, setIsGlyphsExiting] = useState(false);
  const [isSpecimenExiting, setIsSpecimenExiting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // Add navigation lock state

  // Set window width on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialAnimationOccurred) {
      const timer = setTimeout(() => {
        setHasInitialAnimationOccurred(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [hasInitialAnimationOccurred]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePageTransition = (event) => {
      // Prevent double navigation
      if (isNavigating) return;

      const { isNavigatingToHome, isNavigatingToTypefaces, isNavigatingToID } =
        event.detail;

      setIsNavigating(true); // Set navigation lock
      setIsFullCartOpen(false);
      setIsLoginModalOpen(false);
      setIsNavigatingHome(true);

      setTimeout(() => {
        if (isNavigatingToHome) {
          appRouter.push("/");
        } else if (isNavigatingToTypefaces) {
          appRouter.push("/Typefaces");
        } else if (isNavigatingToID) {
          appRouter.push("/ID");
        }

        // Reset navigation lock after navigation
        setTimeout(() => {
          setIsNavigating(false);
        }, 100);
      }, 200);
    };

    const handlePaymentTransition = (event) => {
      if (event.detail.isStarting) {
        setIsFullCartOpen(false);
        setIsNavigatingHome(true);
        setIsLoginModalOpen(false);

        // Don't redirect to '/' - let the PaymentProcessor handle the redirect to payment-confirmation
      }
    };

    window.addEventListener("pageTransitionStart", handlePageTransition);
    window.addEventListener("startPaymentTransition", handlePaymentTransition);

    return () => {
      window.removeEventListener("pageTransitionStart", handlePageTransition);
      window.removeEventListener(
        "startPaymentTransition",
        handlePaymentTransition,
      );
    };
  }, [appRouter]); // Changed from router to appRouter

  const handleHomeClick = useCallback(
    (e, href) => {
      e.preventDefault();

      // First trigger the exit animation based on current tab
      if (activeTab === "glyphs") {
        setIsGlyphsExiting(true);
      } else if (activeTab === "test") {
        setIsTestExiting(true);
      }

      // Then handle the navigation after a delay
      setTimeout(() => {
        if (typeof window !== "undefined") {
          const event = new CustomEvent("pageTransitionStart", {
            detail: {
              isNavigatingToHome: href === "/",
              isNavigatingToTypefaces: href === "/Typefaces",
            },
          });
          window.dispatchEvent(event);
        }
        setIsNavigatingHome(true);
      }, 150);
    },
    [activeTab],
  );

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleModalClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleTabExit = (currentTab, newTab, setTab) => {
    // All tabs should have consistent exit timing
    if (currentTab === "test") {
      setIsTestExiting(true);
      setTimeout(() => {
        setTab(newTab.toLowerCase());
        setTimeout(() => {
          setIsTestExiting(false);
        }, 300);
      }, 200);
    } else if (currentTab === "glyphs") {
      setIsGlyphsExiting(true);
      setTimeout(() => {
        setTab(newTab.toLowerCase());
        setTimeout(() => {
          setIsGlyphsExiting(false);
        }, 300);
      }, 200);
    } else if (currentTab === "specimen") {
      // Add exit animation for specimen tab to match other tabs
      setIsSpecimenExiting(true);
      setTimeout(() => {
        setTab(newTab.toLowerCase());
        setTimeout(() => {
          setIsSpecimenExiting(false);
        }, 300);
      }, 200); // Same 200ms delay as other tabs
    } else {
      // Fallback for any other tabs
      setTimeout(() => {
        setTab(newTab.toLowerCase());
      }, 200);
    }
  };

  return {
    state: {
      isNavigatingHome,
      hasInitialAnimationOccurred,
      windowWidth,
      isClosing,
      isFullCartOpen,
      isLoginModalOpen,
      isTestExiting,
      isGlyphsExiting,
      isSpecimenExiting,
    },
    setters: {
      setIsNavigatingHome,
      setHasInitialAnimationOccurred,
      setIsClosing,
      setIsFullCartOpen,
      setIsLoginModalOpen,
      setIsTestExiting,
      setIsGlyphsExiting,
      setIsSpecimenExiting,
    },
    handlers: {
      handleHomeClick,
      handleModalClick,
      handleModalClose,
      handleTabExit,
    },
  };
};

export default useUIState;
