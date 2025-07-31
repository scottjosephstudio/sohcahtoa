// Motion variants for SVG icon - will be dynamically created in component
export const createSvgVariants = (isTypefacesPage, isTypefacePath) => ({
  initial: {
    scale: 1,
    filter: `drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))`,
    color: isTypefacesPage ? "rgb(16, 12, 8)" : "white",
  },
  hover: {
    scale: 1,
    filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))",
    color: "#39ff14",
    transition: { duration: 0.2 },
  },
});

export default createSvgVariants;
