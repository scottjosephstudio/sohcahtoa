import { useEffect, useRef, useState } from "react";

export const useEqualHeight = (dependencies = []) => {
  const containerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeights = () => {
      // Get ALL option cards across all license groups
      const allCards =
        containerRef.current.querySelectorAll("[data-option-card]");
      if (allCards.length === 0) return;

      // Reset heights to auto to get natural heights
      allCards.forEach((card) => {
        card.style.height = "auto";
      });

      // Get the maximum height across ALL cards
      let globalMax = 0;
      allCards.forEach((card) => {
        const height = card.offsetHeight;
        if (height > globalMax) {
          globalMax = height;
        }
      });

      // Apply the maximum height to ALL cards across all groups
      setMaxHeight(globalMax);
      allCards.forEach((card) => {
        card.style.height = `${globalMax}px`;
      });
    };

    // Initial height calculation with a slight delay to ensure DOM is ready
    const timeoutId = setTimeout(updateHeights, 50);

    // Recalculate on window resize
    const handleResize = () => {
      setTimeout(updateHeights, 100); // Small delay to allow for reflow
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, dependencies);

  return { containerRef, maxHeight };
};
