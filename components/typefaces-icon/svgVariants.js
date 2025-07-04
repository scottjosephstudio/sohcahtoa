export const createSvgVariants = (isTypefacePath) => ({
  initial: {
    scale: 1,
    filter: `drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))`,
    color: isTypefacePath ? "rgb(16, 12, 8)" : "#39ff14",
  },
  hover: {
    scale: 1,
    filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))",
    color: isTypefacePath ? "#006efe" : "rgb(169, 169, 169)",
    transition: { duration: 0.2 },
  },
});
