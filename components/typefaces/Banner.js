"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

import useInfiniteBanner from "./hooks/useInfiniteBanner";
import useIOSViewport from "./hooks/useIOSViewport";
import { useNavigation } from "../../context/NavigationContext";

// Create motion components from styled-components
const MotionBannerContainer = styled(motion.div)`
  position: fixed;
  width: 100%;
  left: 0;
  right: 0;
  height: 20px;
  background-color: rgb(16, 12, 8);
  overflow: hidden;
  z-index: 1000;
  cursor: default;

  /* Default desktop positioning */
  bottom: 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      rgb(16, 12, 8) 0%,
      transparent 5%,
      transparent 95%,
      rgb(16, 12, 8) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  /* Desktop - simple bottom positioning */
  @media (min-width: 769px) {
    bottom: 0;
    position: fixed;
    z-index: 10;
  }

  @media (max-width: 768px) {
    /* Use transform instead of bottom positioning for better iOS support */
    bottom: 0;
    transform: translateY(0);
    z-index: 10;

    /* Force positioning at viewport bottom */
    position: fixed;
    top: auto;

    /* iOS Safari specific - use different approach */
    @supports (-webkit-touch-callout: none) {
      /* Force to very bottom of screen */
      bottom: 0;
      /* Account for safe areas but ensure visibility */
      padding-bottom: env(safe-area-inset-bottom, 0);
      /* Use transform to push into view if needed */
      transform: translateY(0);
      /* Ensure it's in viewport */
      max-height: 20px;
      min-height: 20px;
    }

    /* Alternative positioning for problematic iOS versions */
    @media screen and (-webkit-min-device-pixel-ratio: 2) {
      bottom: 0;
      position: fixed;
      transform: none;
    }
  }

  /* Force visibility on very small screens - mobile only */
  @media screen and (max-height: 600px) and (max-width: 768px) {
    bottom: 0;
    z-index: 1000;
    position: fixed;
  }

  /* Additional iOS specific fixes - mobile only */
  @media screen and (max-width: 768px) and (orientation: portrait) {
    bottom: 0;
    position: fixed;
  }

  @media screen and (max-width: 768px) and (orientation: landscape) {
    bottom: 0;
    position: fixed;
  }
`;

const MotionBannerContent = styled(motion.div)`
  display: flex;
  white-space: nowrap;
  height: 100%;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 0;
`;

const MotionBannerText = styled(motion.span)`
  display: inline-block;
  color: rgb(44, 255, 5);
  font-size: 12px;
  letter-spacing: 0.8px;
  padding-left: 12px;
  padding-right: 12px;
  margin-top: 3px;

  &.arc-browser {
    margin-top: 6px;
  }
`;

export default function InfiniteWidthBanner({
  bannerText = "// UNDER CONSTRUCTION //",
}) {
  const { containerRef, textRef, repetitions, controls } =
    useInfiniteBanner(bannerText);
  const bannerElementRef = useRef(null);
  const { height, isIOS, safeBannerHeight } = useIOSViewport();
  const { $isNavigating } = useNavigation();

  // Enhanced iOS-specific positioning fix - mobile only
  useEffect(() => {
    const handleIOSPositioning = () => {
      if (!bannerElementRef.current || !isIOS || window.innerWidth > 768)
        return;

      const banner = bannerElementRef.current;

      // Force positioning at the very bottom of the actual viewport
      banner.style.position = "fixed";
      banner.style.zIndex = "10";
      banner.style.left = "0";
      banner.style.right = "0";
      banner.style.width = "100%";
      banner.style.height = "20px";

      // Use the calculated viewport height minus banner height
      const topPosition = height - 20;
      banner.style.top = `${Math.max(0, topPosition)}px`;
      banner.style.bottom = "auto";
      banner.style.transform = "none";
    };

    // Only apply iOS positioning on mobile devices
    if (isIOS && height > 0 && window.innerWidth <= 768) {
      handleIOSPositioning();

      // Run again after a short delay for iOS rendering
      const timer = setTimeout(handleIOSPositioning, 100);
      return () => clearTimeout(timer);
    }
  }, [isIOS, height]);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <MotionBannerContainer
      ref={(el) => {
        containerRef.current = el;
        bannerElementRef.current = el;
      }}
      aria-label="Site status banner"
      initial={{ y: "100%" }}
      animate={{ 
        y: "0%",
        opacity: $isNavigating ? 0 : 1
      }}
      transition={{ 
        duration: $isNavigating ? 0.3 : 0.5, 
        ease: "easeOut" 
      }}
      className="banner-container"
      style={
        isIOS && isMobile
          ? {
              position: "fixed",
              top: Math.max(0, height - 20),
              bottom: "auto",
              zIndex: 1000,
            }
          : {}
      }
    >
      <MotionBannerContent animate={controls}>
        {[...Array(repetitions)].map((_, i) => (
          <MotionBannerText
            key={i}
            ref={i === 0 ? textRef : null}
            animate={{
              opacity: [1, 0, 1, 0, 1],
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            {bannerText}
          </MotionBannerText>
        ))}
      </MotionBannerContent>
    </MotionBannerContainer>
  );
}
