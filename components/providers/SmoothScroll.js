"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      wrapper: element,
      content: element,
      duration: 1.0, // Slightly faster for dropdown content
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      orientation: "vertical",
      gestureOrientation: "vertical",
    });

    lenisRef.current = lenis;

    // Make Lenis available globally for the TransitionWrapper component
    window.lenis = lenis;

    // Set up the animation frame loop
    function raf(time) {
      if (lenisRef.current) {
        lenisRef.current.raf(time);
        requestAnimationFrame(raf);
      }
    }
    requestAnimationFrame(raf);

    // Cleanup function for unmounting
    return () => {
      // Remove global reference
      if (window.lenis === lenis) {
        delete window.lenis;
      }

      // Destroy the main lenis instance
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
