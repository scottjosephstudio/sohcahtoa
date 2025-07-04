"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigation } from "../../context/NavigationContext";

// Simple styled container with motion variants instead of CSS transitions
const TransitionContainer = styled(motion.div)`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// Motion variants for page transitions
const pageVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

export default function TransitionWrapper({
  children,
  onTransitionComplete,
  disableTransition = false,
}) {
  const [$isVisible, set$isVisible] = useState(!disableTransition);
  const pathname = usePathname();
  const { set$isNavigating } = useNavigation();
  const router = useRouter();

  // Simple function to handle navigation
  const handleNavigation = (href) => {
    // Set states for animation
    set$isNavigating(true);
    set$isVisible(false);

    // Wait for animation to complete before navigation
    setTimeout(() => {
      // Scroll to top only during actual page navigation
      window.scrollTo(0, 0);
      router.push(href);
    }, 400);
  };

  // Handle page enter animation
  useEffect(() => {
    if (disableTransition) {
      set$isVisible(true);
      if (onTransitionComplete) onTransitionComplete();
      return;
    }
    set$isNavigating(false);
    setTimeout(() => {
      set$isVisible(true);
      if (onTransitionComplete) {
        setTimeout(onTransitionComplete, 400);
      }
    }, 50);
  }, [pathname, set$isNavigating, onTransitionComplete, disableTransition]);

  // Click handler for internal navigation
  useEffect(() => {
    let isAttached = false;

    const handleClick = (e) => {
      // Only handle clicks on internal links
      const link = e.target.closest('a[href^="/"]');

      // Early return if no link or modifier keys pressed
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey) {
        return;
      }

      // Ignore buttons and other non-link elements
      if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
        return;
      }

      // Skip if this is a component that handles its own navigation
      const homeIcon = e.target.closest('[data-component="home-icon"]');
      const navArrows = e.target.closest('[data-component="nav-arrows"]');
      const spinner = e.target.closest('[data-component="spinner"]');

      // Only exclude home icon on Typefaces page (for slot machine animation)
      const shouldExcludeHomeIcon = homeIcon && pathname === "/Typefaces";

      // Only exclude nav arrows on pages where they handle custom navigation
      const shouldExcludeNavArrows = navArrows && pathname === "/Typefaces";

      // Only exclude spinner on Typefaces page (for slot machine animation)
      const shouldExcludeSpinner = spinner && pathname === "/Typefaces";

      // If click is within these components, let them handle their own navigation
      if (
        shouldExcludeHomeIcon ||
        shouldExcludeNavArrows ||
        shouldExcludeSpinner
      ) {
        return;
      }

      // Skip menu links only when currently on typefaces page (they handle their own navigation)
      if (
        pathname === "/Typefaces" &&
        e.target.closest(
          "nav, .Overlay, .MenuContainer, .MenuPill, .DropdownContent",
        )
      ) {
        return;
      }

      // Additional checks to avoid conflicts
      if (
        e.target.closest(".scroll-to-top") ||
        e.target.closest("[data-no-transition]") ||
        e.target.closest("form") ||
        e.defaultPrevented
      ) {
        return;
      }

      // Prevent default and handle navigation
      e.preventDefault();
      e.stopPropagation();
      handleNavigation(link.href);
    };

    // Event listener attachment
    const attachListener = () => {
      if (isAttached) return;

      // Use standard bubbling event handling
      document.body.addEventListener("click", handleClick);
      isAttached = true;
    };

    // Listener attachment strategy
    const safeAttachListener = () => {
      // Remove any existing listener first
      if (isAttached) {
        document.body.removeEventListener("click", handleClick);
        isAttached = false;
      }

      // Attach listener
      attachListener();
    };

    // Handle different DOM readiness states
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", safeAttachListener);
    } else {
      // DOM is ready, attach listener
      safeAttachListener();
    }

    return () => {
      if (isAttached) {
        document.body.removeEventListener("click", handleClick);
      }
      document.removeEventListener("DOMContentLoaded", safeAttachListener);
      isAttached = false;
    };
  }, [pathname, router, set$isNavigating]); // Re-attach on pathname change

  return (
    <TransitionContainer
      variants={pageVariants}
      initial="hidden"
      animate={$isVisible ? "visible" : "hidden"}
      style={disableTransition ? { transition: "none" } : {}}
      data-component="transition-wrapper"
    >
      {children}
    </TransitionContainer>
  );
}
