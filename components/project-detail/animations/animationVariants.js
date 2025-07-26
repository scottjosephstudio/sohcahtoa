export const getAnimationVariants = (getDescriptionDelay) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
        delay: getDescriptionDelay()
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      // Remove Y transforms to prevent conflict with TransitionWrapper
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return { containerVariants, itemVariants };
};

export const getDescriptionDelay = () => {
  if (typeof window === 'undefined') return 0;
  
  const isDesktopRange = window.innerWidth >= 1024 && window.innerWidth <= 1440;
  return isDesktopRange ? 0.1 : 0;
}; 