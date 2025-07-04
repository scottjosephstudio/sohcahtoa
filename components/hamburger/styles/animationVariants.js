// Motion variants for SVG icon - dynamically created based on state
export const createSvgVariants = (isOpen, isOnTypefaces, isClosingOnTypefaces) => {
  const getInitialColor = () => {
    if (isOpen) return '#39ff14';
    if (isClosingOnTypefaces) return 'white'; // Keep white during closing on Typefaces
    return isOnTypefaces ? 'rgb(16, 12, 8)' : 'white';
  };

  const getRotation = () => {
    return isOpen ? 45 : 0;
  };

  return {
    initial: {
      scale: 1,
      filter: `drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))`,
      color: getInitialColor(),
      rotate: getRotation(),
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1,
      filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))',
      color: '#39ff14',
      rotate: getRotation(),
      transition: { duration: 0.2 }
    },
    open: {
      scale: 1,
      filter: `drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))`,
      color: '#39ff14',
      rotate: 45,
      transition: { duration: 0.3 }
    },
    closed: {
      scale: 1,
      filter: `drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))`,
      color: getInitialColor(),
      rotate: 0,
      transition: { duration: 0.3 }
    }
  };
}; 