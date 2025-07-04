"use client";

import { useRef, useEffect, useState } from "react";
import { useAnimationControls } from "framer-motion";

export default function useInfiniteBanner(bannerText) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const controls = useAnimationControls();

  useEffect(() => {
    const updateWidths = () => {
      if (textRef.current && containerRef.current) {
        const newTextWidth = textRef.current.offsetWidth;
        const newContainerWidth = containerRef.current.offsetWidth;
        setTextWidth(newTextWidth);
        setContainerWidth(newContainerWidth);
      }
    };

    updateWidths();
    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, []);

  useEffect(() => {
    if (textWidth > 0 && containerWidth > 0) {
      const animateBanner = async () => {
        await controls.start({
          x: [0, -textWidth],
          transition: {
            duration: (textWidth / containerWidth) * 6, // Adjust duration based on width
            ease: "linear",
            repeat: Infinity,
          },
        });
      };
      animateBanner();
    }
  }, [textWidth, containerWidth, controls]);

  return {
    containerRef,
    textRef,
    repetitions: 12, // Always repeat twice for seamless effect
    controls,
  };
}
