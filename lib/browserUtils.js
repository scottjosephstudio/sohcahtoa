/**
 * Centralized browser detection utilities
 * Ensures consistent detection across all components
 */

/**
 * Detects if the current browser is Safari (but not Chrome-based browsers)
 * Uses the most reliable detection method that works across all Safari versions
 * @returns {boolean} True if Safari, false otherwise
 */
export const isSafari = () => {
  if (typeof window === 'undefined') return false;
  
  // More comprehensive Safari detection that excludes Chrome, Edge, and other WebKit browsers
  const userAgent = navigator.userAgent;
  const isWebKit = /webkit/i.test(userAgent);
  const isChrome = /chrome|chromium|crios/i.test(userAgent);
  const isEdge = /edge|edg/i.test(userAgent);
  const isSafariUA = /safari/i.test(userAgent);
  
  // Safari must have WebKit and Safari in UA, but not Chrome or Edge
  return isWebKit && isSafariUA && !isChrome && !isEdge;
};

/**
 * Hook for Safari detection in React components
 * @returns {boolean} True if Safari, false otherwise
 */
export const useSafariDetection = () => {
  if (typeof window === 'undefined') return false;
  return isSafari();
};

/**
 * Gets Safari-optimized intersection observer options
 * @returns {Object} Observer options optimized for Safari
 */
export const getSafariObserverOptions = () => ({
  rootMargin: '200px', // Increased for Safari to load images earlier
  threshold: [0, 0.1, 0.25], // Multiple thresholds for better Safari detection
});

/**
 * Gets Safari-optimized image loading attributes
 * @returns {Object} Image attributes optimized for Safari
 */
export const getSafariImageProps = () => ({
  loading: 'eager', // Force immediate loading for Safari
  decoding: 'async', // Use async decoding for better performance
});

/**
 * Gets Safari-optimized inline styles for images
 * @param {boolean} isLoaded - Whether the image is loaded
 * @returns {Object} Inline styles optimized for Safari
 */
export const getSafariImageStyles = (isLoaded) => ({
  WebkitTransform: 'translateZ(0)',
  transform: 'translateZ(0)',
  willChange: isLoaded ? 'auto' : 'opacity, filter'
}); 