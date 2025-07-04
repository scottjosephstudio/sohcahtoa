import { useState, useEffect } from "react";
import { TRANSITION_DURATION } from "../styles/animationVariants";

/**
 * Custom hook for managing image slider state
 * @param {Array} images - Array of images
 * @returns {Object} - Slider state and handlers
 */
export const useSliderState = (images) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCaption, setShowCaption] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const hasMultipleImages = images && images.length > 1;

  // Handle client-side initialization
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Reset transition state when images change
  useEffect(() => {
    setShowCaption(true);
    setIsTransitioning(false);
  }, [images]);

  // Handler for previous slide with transition
  const prevSlide = () => {
    if (isTransitioning) return; // Prevent rapid clicking
    setIsTransitioning(true);
    setShowCaption(false);

    // Change slide and show caption after transition
    setTimeout(() => {
      setCurrentSlide(
        currentSlide === 0 ? images.length - 1 : currentSlide - 1,
      );
      setIsTransitioning(false);
      setShowCaption(true);
    }, TRANSITION_DURATION * 1500);
  };

  // Handler for next slide with transition
  const nextSlide = () => {
    if (isTransitioning) return; // Prevent rapid clicking
    setIsTransitioning(true);
    setShowCaption(false);

    // Change slide and show caption after transition
    setTimeout(() => {
      setCurrentSlide(
        currentSlide === images.length - 1 ? 0 : currentSlide + 1,
      );
      setIsTransitioning(false);
      setShowCaption(true);
    }, TRANSITION_DURATION * 1500);
  };

  return {
    currentSlide,
    isTransitioning,
    showCaption,
    isMounted,
    hasMultipleImages,
    prevSlide,
    nextSlide,
  };
};
