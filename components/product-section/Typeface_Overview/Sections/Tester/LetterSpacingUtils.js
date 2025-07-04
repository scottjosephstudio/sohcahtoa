export const getLetterSpacingConstraints = (fontSize) => {
  // Adjust ratios based on font size
  let maxRatio, minRatio;
  
  if (fontSize <= 24) {
      maxRatio = 0.60
      minRatio = -0.30
  } else if (fontSize <= 30) {
      maxRatio = 0.60
      minRatio = -0.30
  } else {
      maxRatio = 0.10
      minRatio = -0.05
  }

  const actualMin = Math.ceil(fontSize * minRatio)
  const actualMax = Math.floor(fontSize * maxRatio)
  
  return {
      min: actualMin,
      max: actualMax,
      default: 0,
      displayMin: -100,
      displayMax: 100,
      convertDisplayToActual: (displayValue) => {
          const displayRange = 200
          const actualRange = actualMax - actualMin
          const normalizedPosition = (displayValue + 100) / displayRange
          return actualMin + (normalizedPosition * actualRange)
      },
      convertActualToDisplay: (actualValue) => {
          const displayRange = 200
          const actualRange = actualMax - actualMin
          const normalizedPosition = (actualValue - actualMin) / actualRange
          return (normalizedPosition * displayRange) - 100
      }
  }
}

export const calculateDefaultFontSize = (currentFontSize, currentText = '', baseSize = null) => {
  // If we have a manual font size from controls, respect it
  if (currentFontSize && currentFontSize >= 14 && currentFontSize <= 340) {
      return currentFontSize;
  }

  // Calculate viewport-based size if not provided
  if (!baseSize) {
      const height = window.innerHeight;
      const width = window.innerWidth;
      
      // Calculate optimal height-based size (using vh units internally)
      const viewportHeight = height;
      const targetHeightPercentage = 0.22; // Aim for text to take up about 15% of viewport height
      const heightBasedSize = viewportHeight * targetHeightPercentage;
      
      // Calculate width constraints
      const maxWidthBasedSize = width * 0.14; // Max 8% of viewport width
      
      // Use the smaller of height or width based calculations
      baseSize = Math.min(heightBasedSize, maxWidthBasedSize);
  }

  // Adjust for text length if we have text
  if (currentText) {
      const textLength = currentText.length;
      let scaleFactor;

      if (textLength <= 15) {
          scaleFactor = 1.2;  // Shorter text gets larger
      } else if (textLength <= 30) {
          scaleFactor = 1;    // Medium text stays at base size
      } else if (textLength <= 60) {
          scaleFactor = 0.8;  // Longer text gets smaller
      } else {
          scaleFactor = 0.6;  // Very long text gets much smaller
      }

      // Apply scale factor and enforce min/max bounds
      const scaledSize = baseSize * scaleFactor;
      return Math.min(Math.max(scaledSize, 16), 340);
  }

  // Return base size with bounds if no text length adjustment needed
  return Math.min(Math.max(baseSize, 16), 340);
}