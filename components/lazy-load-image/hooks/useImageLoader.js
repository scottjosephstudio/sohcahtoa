import { useEffect, useState } from 'react';

export const useImageLoader = (src, isInView) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBlurCleared, setIsBlurCleared] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Handle image loading with proper complete check
  useEffect(() => {
    if (src !== currentSrc) {
      setIsLoaded(false);
      setIsBlurCleared(false);
      setCurrentSrc(src);
    }
    
    // Only start loading the main image when in viewport
    if (isInView) {
      const img = new Image();
      
      img.onload = () => {
        setIsLoaded(true);
        setIsBlurCleared(true);
      };
      
      // Handle loading errors
      img.onerror = () => {
        console.error('Failed to load image:', src);
      };
      
      // Start loading the image
      img.src = src;
      
      // Check if the image is already cached and complete
      if (img.complete) {
        setIsLoaded(true);
        setIsBlurCleared(true);
      }
    }
  }, [src, currentSrc, isInView]);

  return { isLoaded, isBlurCleared };
}; 