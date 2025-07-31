export const createSvgVariants = (isTypefacesPage, isTypefacePath) => ({
  initial: {
    color: isTypefacePath ? "var(--text-primary)" : "#39ff14",
  },
  animate: {
    color: isTypefacePath ? "var(--text-primary)" : "#39ff14",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    color: isTypefacePath ? "var(--text-primary)" : "#39ff14",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  hover: {
    color: "#006efe",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
});
