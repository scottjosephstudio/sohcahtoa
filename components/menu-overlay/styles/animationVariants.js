// Motion variants for subscribe button
export const buttonVariants = {
  initial: {
    backgroundColor: 'transparent',
    color: '#39ff14',
    scale: 1
  },
  hover: {
    backgroundColor: '#39ff14',
    color: 'rgb(16, 12, 8)',
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 1,
    transition: { duration: 0.2 }
  }
};

// Define animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 0 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1, // Staggered delay based on index
      ease: "easeOut"
    }
  }),
  exit: {
    opacity: 0,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export const overlayVariants = {
  hidden: { 
    opacity: 0,
    visibility: "hidden"
  },
  visible: { 
    opacity: 1,
    visibility: "visible",
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    visibility: "hidden",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// Motion variants for backdrop
export const backdropVariants = {
  hidden: {
    opacity: 0,
    visibility: "hidden"
  },
  visible: {
    opacity: 1,
    visibility: "visible",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  exit: {
    opacity: 0,
    visibility: "hidden",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}; 