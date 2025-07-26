"use client";

import { useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useNavigation } from "../../../context/NavigationContext";
import { useFontSelection } from "../../../context/FontSelectionContext";

export default function useSpinnerAnimation() {
  const router = useRouter();
  const pathname = usePathname();
  const { set$isNavigating } = useNavigation();
  const { selectedFont, getSelectedFontSlug, getSelectedFontSlugCapitalized } = useFontSelection();

  // Prefetch the font-specific route when on Typefaces page for faster navigation
  useEffect(() => {
    if (pathname === "/Typefaces" && selectedFont) {
      const fontSlug = getSelectedFontSlugCapitalized();
      if (fontSlug) {
        router.prefetch(`/Typefaces/${fontSlug}`);
      }
    }
  }, [pathname, router, selectedFont, getSelectedFontSlugCapitalized]);

  const handleSpinnerClick = useCallback(
    (event) => {
      event.preventDefault();

      // Trigger navigation state for fade out transition
      set$isNavigating(true);

      // Create a timeline for coordinated animations
      const tl = gsap.timeline({
        onComplete: () => {
          // Navigate to font-specific route after animation
          if (pathname === "/Typefaces") {
            const fontSlug = getSelectedFontSlugCapitalized();
            if (fontSlug) {
              router.push(`/Typefaces/${fontSlug}`);
            } else {
              // Fallback to ID route if no font slug available
              router.push("/ID");
            }
          }
        },
      });

      // Only fade out menu when on Typefaces page and spinner is clicked
      if (pathname === "/Typefaces") {
        tl.to(
          ".menu-items-container",
          {
            opacity: 0,
            duration: 0.3,
            ease: "power3.in",
          },
          0,
        );

        // Only fade out menu pill during spinner click (navigation away from Typefaces)
        tl.to(
          ".menu-pill",
          {
            opacity: 0,
            duration: 0.3,
            ease: "power3.in",
          },
          0,
        );
      }

      // Animate the slot machine out when navigating (use more specific selector)
      // This should only happen when the spinner (coin) is clicked, not when slot machine is used for font selection
      tl.to(
        ".font-selection-slot-machine",
        {
          x: "0vw",
          scale: 0,
          duration: 0.25,
          ease: "power3.in",
        },
        0,
      );

      tl.to(
        ".banner-container",
        {
          y: "100%",
          duration: 0.3,
          ease: "power3.in",
        },
        0,
      );
    },
    [router, pathname, set$isNavigating, getSelectedFontSlugCapitalized],
  );

  return {
    handleSpinnerClick,
  };
}
