import { useState, useEffect } from "react";
import { getImageCaption } from "../../../lib/projectUtils";

/**
 * Custom hook for calculating maximum caption height to prevent layout shifts
 * @param {Array} images - Array of images
 * @param {boolean} isMounted - Whether component is mounted
 * @returns {string} - Caption height value
 */
export const useCaptionHeight = (images, isMounted) => {
  const [captionHeight, setCaptionHeight] = useState("auto");

  // Helper function to get breakpoint-specific max height
  const getMaxHeightForBreakpoint = () => {
    if (typeof window === "undefined") return 66;
    const width = window.innerWidth;

    if (width < 600) return 72; // Mobile: smaller max height
    if (width >= 600 && width <= 1023) return 72; // Tablet: medium max height
    if (width >= 1024 && width <= 1439) return 72; // Large tablet/small desktop: larger max height
    return 72; // Desktop (1440px+): largest max height
  };

  const calculateCaptionHeight = () => {
    if (!isMounted || !images || images.length === 0) return;

    // Create a temporary element to measure caption heights
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.visibility = "hidden";
    tempContainer.style.width = "80%"; // Match SlideCaption width
    tempContainer.style.fontSize = "20px";
    tempContainer.style.lineHeight = "24px";
    tempContainer.style.letterSpacing = "0.6px";
    tempContainer.style.padding = "12px 0";
    document.body.appendChild(tempContainer);

    let maxHeight = 0;

    // Measure each caption
    images.forEach((image, index) => {
      const caption = getImageCaption(image, `Image ${index + 1}`);
      tempContainer.textContent = caption;
      const height = tempContainer.offsetHeight;
      maxHeight = Math.max(maxHeight, height);
    });

    // Add some padding for the number indicator height (34px + 6px margin)
    // Use breakpoint-specific max height
    const breakpointMaxHeight = getMaxHeightForBreakpoint();
    const finalHeight = Math.max(maxHeight, breakpointMaxHeight);
    setCaptionHeight(`${finalHeight}px`);

    // Clean up
    document.body.removeChild(tempContainer);
  };

  useEffect(() => {
    calculateCaptionHeight();
  }, [images, isMounted]);

  // Add resize listener to recalculate on breakpoint changes
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      calculateCaptionHeight();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [images, isMounted]);

  return captionHeight;
};
