// Motion variants for SVG icon - will be dynamically created in component
const createSvgVariants = (isTypefacesPage, isIDPath) => ({
  initial: {
    scale: 1,
    filter: `drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))`,
    color: isIDPath ? 'rgb(16, 12, 8)' : isTypefacesPage ? 'rgb(16, 12, 8)' : 'white'
  },
  hover: {
    scale: 1,
    filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))',
    color: isIDPath ? '#006efe' : '#39ff14',
    transition: { duration: 0.2 }
  }
});

export default createSvgVariants; 