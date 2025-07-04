export const TRANSITION_DURATION = 0.2;

export const captionVariants = {
  hidden: {
    opacity: 0,
    y: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TRANSITION_DURATION,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 0,
    transition: {
      duration: TRANSITION_DURATION,
      ease: "easeIn",
    },
  },
};
