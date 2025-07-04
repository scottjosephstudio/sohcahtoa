// Fix potential URL issues with special characters
export const getSafeUrl = (url) => {
  // Replace ampersands and other potentially problematic characters
  return url.replace(/&/g, 'And');
}; 