// Utility function to get accurate document height across browsers
export const getDocumentHeight = () => {
  if (typeof window === 'undefined') return 0;
  
  const body = document.body;
  const html = document.documentElement;
  
  return Math.max(
    body.scrollHeight || 0,
    body.offsetHeight || 0,
    html.clientHeight || 0,
    html.scrollHeight || 0,  
    html.offsetHeight || 0
  );
};

// Utility function to get current scroll position
export const getCurrentScrollPosition = () => {
  if (typeof window === 'undefined') return 0;
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

// Utility function to get viewport height
export const getViewportHeight = () => {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
};

// Enhanced scroll to bottom with Lenis integration
export const scrollToBottom = (retryCount = 0, maxRetries = 8) => {
  if (typeof window === 'undefined') return;
  
  const performScroll = () => {
    const documentHeight = getDocumentHeight();
    const viewportHeight = getViewportHeight();
    const targetPosition = Math.max(0, documentHeight - viewportHeight);
    
    // Check if Lenis is available and properly initialized
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
      // Use Lenis for smooth scrolling
      window.lenis.scrollTo(targetPosition, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        immediate: false,
        force: true,
        onComplete: () => {
          // Callback when scroll completes
        }
      });
    } else {
      // Fallback to native smooth scroll if Lenis is not available
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Initial scroll attempt
  setTimeout(() => {
    const initialHeight = getDocumentHeight();
    const initialScroll = getCurrentScrollPosition();
    
    performScroll();
    
    // Verify scroll success and retry if needed
    setTimeout(() => {
      const newHeight = getDocumentHeight();
      const currentScroll = getCurrentScrollPosition();
      const viewportHeight = getViewportHeight();
      const distanceFromBottom = newHeight - (currentScroll + viewportHeight);
      
      // Check if we're close enough to the bottom (within 50px tolerance)
      const isNearBottom = distanceFromBottom <= 50;
      
      // Retry conditions:
      // 1. Not near bottom
      // 2. Document height has changed (images loaded)
      // 3. Haven't exceeded max retries
      if (!isNearBottom && retryCount < maxRetries) {
        scrollToBottom(retryCount + 1, maxRetries);
      }
    }, 600); // Increased delay to allow Lenis animation to complete
    
  }, 300); // Increased initial delay for better timing
}; 