// Motion variants for container fade-in when coming into view
export const containerVariants = {
  hidden: {
    opacity: 0,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.1,
      ease: [0.25, 0.1, 0.25, 1] // Smooth cubic-bezier
    }
  }
};

// Motion variants for image transitions
export const imageVariants = {
  hidden: {
    opacity: 0,
    filter: 'blur(10px)',
    scale: 1,
  },
  loaded: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.2,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  sliding: {
    opacity: 0,
    filter: 'blur(8px)',
    scale: 1,
    transition: {
      duration: 0.25,
      ease: 'easeInOut'
    }
  }
};

// Motion variants for placeholder transitions
export const placeholderVariants = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.4,
      delay: 0.1,
      ease: 'easeInOut'
    }
  }
}; 