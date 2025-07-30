// Motion variants for SVG icon - will be dynamically created in component
export const createSvgVariants = (isTypefacesPage, isTypefacePath) => ({
  initial: {
    scale: 1,
    filter: `drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))`,
    color: isTypefacePath
      ? "var(--text-primary)"
      : isTypefacesPage
      ? "var(--text-primary)"
      : "var(--accent-color)",
  },
  hover: {
    scale: 1,
    filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))",
    color: isTypefacePath
      ? "#006efe"
      : isTypefacesPage
      ? "#006efe"
      : "#006efe",
    transition: { duration: 0.2 },
  },
});

export default createSvgVariants;
