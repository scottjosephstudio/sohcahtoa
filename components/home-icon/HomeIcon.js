"use client";

import Link from "next/link";
import { useNavigation } from "../../context/NavigationContext";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import HomeIconContainer from "./HomeIconContainer";
import IconLink from "./IconLink";
import Tooltip from "./Tooltip";
import SvgIcon from "./SvgIcon";
import tooltipVariants from "./tooltipVariants";
import createSvgVariants from "./createSvgVariants";

export default function HomeIcon({
  onClick,
  forceShow = false,
  customPosition = null,
  customIsTypefacesPath = undefined,
}) {
  const { $isNavigating, set$isNavigating, previousPath } = useNavigation();
  const pathname = usePathname();
  const [animatedSlide, setAnimatedSlide] = useState(false);
  const [isTypefacesFadingOut, setIsTypefacesFadingOut] = useState(false);
  const [arrowAnimationComplete, setArrowAnimationComplete] = useState(false);
  const router = useRouter();

  // Check if we're on a special page (terms or typefaces)
  const isSpecialPage =
    pathname === "/TermsAndConditions" || pathname === "/Typefaces";
  const isTypefacesPage =
    customIsTypefacesPath !== undefined
      ? customIsTypefacesPath
      : pathname === "/Typefaces";
  const isIDPath = pathname === "/ID";
  const isFontSpecificPath = pathname && pathname.startsWith("/Typefaces/") && pathname !== "/Typefaces";

  // Only hide during specific transitions: Typefaces → ID (same logic as hamburger)
  const shouldHideForTransition =
    (pathname === "/Typefaces" && $isNavigating) || // Hide when navigating FROM Typefaces
    (previousPath === "/Typefaces" && (pathname === "/ID" || isFontSpecificPath)); // Hide when arriving at ID or font-specific path from Typefaces

  useEffect(() => {
    // Trigger animation for special pages after a delay
    if (isSpecialPage) {
      const timer = setTimeout(() => {
        setAnimatedSlide(true);
      }, 500); // 500ms delay to follow the arrow animation

      // Set arrow animation complete state after navigation arrows finish
      const arrowTimer = setTimeout(() => {
        setArrowAnimationComplete(true);
      }, 800); // Additional delay to ensure navigation arrows animation is fully complete

      return () => {
        clearTimeout(timer);
        clearTimeout(arrowTimer);
      };
    } else {
      // Reset animation state when not on special page
      setAnimatedSlide(false);
      setArrowAnimationComplete(false);
    }
  }, [isSpecialPage]);

  // Only show home icon when not on the homepage
  const $ShouldShow = pathname !== "/";

  // Create dynamic SVG variants based on current page state
  const svgVariants = createSvgVariants(isTypefacesPage, isIDPath || isFontSpecificPath);

  // Enhanced click handler with proper transition timing and iOS scroll fix
  const handleClick = useCallback(
    (e) => {
      if (onClick) {
        e.preventDefault();
        onClick(e);
      } else {
        // If on Typefaces page, trigger animations and navigation state
        if (isTypefacesPage) {
          // Prevent default to handle custom navigation
          e.preventDefault();

          // Trigger fade-out effect for typefaces path
          setIsTypefacesFadingOut(true);

          // Coordinate slot machine exit animation
          gsap.to(".slot-machine-page", {
            x: "0vw",
            scale: 0,
            duration: 0.25,
            ease: "power3.in",
          });

          // Trigger spinner exit animation via custom event
          const spinnerExitEvent = new CustomEvent("spinnerExit");
          document.dispatchEvent(spinnerExitEvent);

          // Set navigation state to trigger fade out of other components
          set$isNavigating(true);

          // Wait for fade out to complete, then navigate
          setTimeout(() => {
            router.push("/");
          }, 400); // Match TransitionWrapper timing
        }
        // For non-Typefaces pages, let the Link handle navigation normally
      }
    },
    [onClick, isTypefacesPage, set$isNavigating, router],
  );

  // If a custom position is provided, use that instead of the defaults
  const style = customPosition
    ? { left: customPosition, position: "fixed" }
    : {};

  return (
    <HomeIconContainer
      $isNavigating={$isNavigating}
      $shouldHideForTransition={shouldHideForTransition}
      $ShouldShow={$ShouldShow}
      $isSpecialPage={isSpecialPage}
      $animatedSlide={animatedSlide}
      $isTypefacesPage={isTypefacesPage}
      $isIDPath={isIDPath || isFontSpecificPath}
      $forceShow={forceShow}
      $arrowAnimationComplete={arrowAnimationComplete}
      style={style}
      data-component="home-icon"
      // Only use framer-motion animations on Typefaces page, otherwise let CSS handle transitions
      {...(isTypefacesPage
        ? {
            initial: { opacity: 0 },
            animate: {
              opacity: isTypefacesFadingOut || shouldHideForTransition ? 0 : 1,
            },
            exit: {
              opacity: 0,
              transition: {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              },
            },
            transition: {
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            },
          }
        : {})}
    >
      <Link href="/" aria-label="Home">
        <IconLink
          $isTypefacesPage={isTypefacesPage}
          $isIDPath={isIDPath}
          onClick={handleClick}
          whileHover="hover"
          initial="initial"
        >
          <Tooltip
            className="tooltip"
            $isTypefacesPage={isTypefacesPage}
            $isIDPath={isIDPath}
            variants={tooltipVariants}
          >
            Home
          </Tooltip>
          <SvgIcon
            viewBox="0 0 25 25"
            $isTypefacesPage={isTypefacesPage}
            $isIDPath={isIDPath}
            $invert={false}
            variants={svgVariants}
            whileHover="hover"
            initial="initial"
          >
            <path
              fill="currentColor"
              d="M22.06,8.21L12.95,3.72c-.11-.05-.23-.09-.35-.1-.19-.02-.38.01-.55.1L2.94,8.21c-.34.17-.56.52-.56.9v11.27c0,.55.45,1,1,1h7.11c.55,0,1-.45,1-1v-4.23h2.02v4.23c0,.55.45,1,1,1h7.11c.55,0,1-.45,1-1v-11.27c0-.38-.22-.73-.56-.9ZM10.19,13.9c-.55,0-1,.45-1,1v4.23h-4.51v-9.26l7.82-3.85,7.82,3.85v9.26h-4.51v-4.23c0-.55-.45-1-1-1h-4.62Z"
            />
          </SvgIcon>
        </IconLink>
      </Link>
    </HomeIconContainer>
  );
}
