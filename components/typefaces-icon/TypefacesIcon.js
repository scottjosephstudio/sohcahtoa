"use client";

"use client";

"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigation } from "../../context/NavigationContext";
import TypefacesIconContainer from "./TypefacesIconContainer";
import SvgIcon from "./SvgIcon";
import TooltipText from "./TooltipText";
import TooltipContainer from "./TooltipContainer";
import { tooltipVariants } from "./tooltipVariants";
import { createSvgVariants } from "./svgVariants";

const TypefacesIcon = ({
  hasInitialAnimationOccurred = true,
  handleTypefaceNavigation,
  typefacesLink = "/Typefaces",
}) => {
  const pathname = usePathname();
  const { set$isNavigating } = useNavigation();
  const isTypefacePath = pathname.includes("/ID") || (pathname && pathname.startsWith("/Typefaces/") && pathname !== "/Typefaces");
  const [fadeIn, setFadeIn] = useState(false);

  // Create dynamic SVG variants based on current page state
  const svgVariants = createSvgVariants(isTypefacePath);

  // Add fade-in effect
  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Reset navigation state when arriving at Typefaces page
  useEffect(() => {
    if (pathname === "/Typefaces") {
      const timer = setTimeout(() => {
        set$isNavigating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, set$isNavigating]);

  // Animation properties
  const initialAnimation = !hasInitialAnimationOccurred
    ? {
        initial: { left: "158px", opacity: 1 },
        animate: {
          left: "69px",
          opacity: 1,
          transition: {
            duration: 1,
            ease: [1, -0.05, 0.01, 0.99],
          },
        },
      }
    : {};

  const handleClick = (e) => {
    set$isNavigating(true);
    if (handleTypefaceNavigation) {
      handleTypefaceNavigation(e, typefacesLink);
    }
    setTimeout(() => {
      set$isNavigating(false);
    }, 300);
  };

  return (
    <TypefacesIconContainer
      $hasInitialAnimationOccurred={hasInitialAnimationOccurred}
      $fadeIn={fadeIn}
      {...initialAnimation}
      style={{
        left: hasInitialAnimationOccurred ? "69px" : "158px",
      }}
      data-typefaces="true"
    >
      <TooltipContainer
        className="custom-tooltip no-hover no-underline"
        onClick={handleClick}
        whileHover="hover"
        initial="initial"
      >
        <SvgIcon
          viewBox="0 0 25 25"
          $isTypefacePath={isTypefacePath}
          variants={svgVariants}
        >
          <circle
            cx="12.5"
            cy="13"
            r="8.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="13"
            y="11.5"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
            fontFamily="'Jant', sans-serif"
          >
            A
          </text>
          <text
            x="8.6"
            y="17.25"
            fontSize="7"
            fill="currentColor"
            fontFamily="'Jant', sans-serif"
          >
            B
          </text>
          <text
            x="12.6"
            y="17.25"
            fontSize="7"
            fill="currentColor"
            fontFamily="'Jant', sans-serif"
          >
            C
          </text>
        </SvgIcon>
        <TooltipText
          className="tooltip-text tooltip-tcs"
          variants={tooltipVariants}
        >
          Typefaces
        </TooltipText>
      </TooltipContainer>
    </TypefacesIconContainer>
  );
};

export default TypefacesIcon;
