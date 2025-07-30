export const createSvgVariants = (isTypefacesPage, isTypefacePath) => ({
  initial: {
    color: isTypefacePath ? "var(--text-primary)" : "var(--accent-color)",
  },
  animate: {
    color: isTypefacePath ? "var(--text-primary)" : "var(--accent-color)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    color: isTypefacePath ? "var(--text-primary)" : "var(--accent-color)",
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
