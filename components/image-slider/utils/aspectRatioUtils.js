/**
 * Calculate aspect ratio percentage from fraction format
 * @param {string} ratio - Aspect ratio in format like '3/4' or '16/9'
 * @returns {string|null} - Percentage string or null
 */
export const getAspectRatioPercentage = (ratio) => {
  if (!ratio) return null;
  
  // If it's already a percentage, return it
  if (ratio.endsWith('%')) return ratio;
  
  // Handle fraction format like '3/4' or '16/9'
  if (ratio.includes('/')) {
    const [width, height] = ratio.split('/').map(Number);
    if (width && height) {
      return `${(height / width) * 100}%`;
    }
  }
  
  // Default to null (will use the dynamic calculation in LazyLoadImage)
  return null;
}; 