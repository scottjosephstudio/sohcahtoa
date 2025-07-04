// Motion variants for SVG icon - will be dynamically created in component
const createSvgVariants = (isTypefacesPage) => ({
  initial: {
    scale: 1,
    filter: `drop-shadow(0 0 0px rgba(255, 255, 255, 0))`,
    color: isTypefacesPage ? '#39ff14' : 'white'
  },
  hover: {
    scale: 1,
    filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))',
    color: '#39ff14',
    transition: { duration: 0.2 }
  }
});

export default createSvgVariants; 