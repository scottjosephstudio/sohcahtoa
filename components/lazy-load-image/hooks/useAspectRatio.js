import { useMemo } from "react";

export const useAspectRatio = (src, isInView, aspectRatio) => {
  // Convert aspect ratio to CSS padding percentage
  const imageAspectRatio = useMemo(() => {
    if (aspectRatio) {
      // If aspectRatio is a decimal (like 0.75), convert to percentage
      if (typeof aspectRatio === "number") {
        return `${(1 / aspectRatio) * 100}%`;
      }
      // If it's already a percentage string, return as-is
      return aspectRatio;
    }

    // Default aspect ratio (4:3)
    return "75%";
  }, [aspectRatio]);

  return imageAspectRatio;
};
