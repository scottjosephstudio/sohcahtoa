// Motion variants for menu items
export const menuItemVariants = {
  initial: {
    color: 'rgb(16, 12, 8)',
    opacity: 1
  },
  hover: {
    color: 'white',
    opacity: 1,
    transition: { duration: 0.2 }
  },
  tap: {
    opacity: 0.8,
    transition: { duration: 0.1 }
  }
};

// Motion variants for direct links
export const directLinkVariants = {
  initial: {
    color: 'rgb(16, 12, 8)',
    opacity: 1
  },
  hover: {
    color: 'white',
    opacity: 0.9,
    transition: { duration: 0.2 }
  },
  tap: {
    opacity: 0.7,
    transition: { duration: 0.1 }
  }
};

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

// Backdrop variants
export const backdropVariants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Dropdown variants
export const dropdownVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.80,
    height: 'auto',
    transition: { 
      duration: 0.15,
      ease: "easeOut"
    }
  },
  visible: { 
    opacity: 1,
    scale: 1,
    height: 'auto',
    transition: { 
      duration: 0.2,
      ease: "easeOut",
      height: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.80,
    height: 'auto',
    transition: { 
      duration: 0.15,
      ease: "easeInOut"
    }
  }
};

// Content variants
export const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.15,
      ease: "easeIn"
    }
  }
}; 