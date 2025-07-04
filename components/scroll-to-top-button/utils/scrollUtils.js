// Scroll to top function
export const scrollToTop = () => {
  // Unified scroll to top function for Chrome mobile compatibility
  // Method 1: Standard scrollTo with smooth behavior for button clicks
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  
  // Method 2: Fallback for Chrome mobile - direct property setting
  setTimeout(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Method 3: Force scroll using requestAnimationFrame for Chrome mobile
    requestAnimationFrame(() => {
      if (window.scrollY > 10) { // Only if still not at top
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    });
  }, 100);
}; 