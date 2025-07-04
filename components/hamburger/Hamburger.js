"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useNavigation } from "../../context/NavigationContext";
import { HamburgerContainer, HamburgerButton } from "./styles/HamburgerStyles";
import { useHamburgerState } from "./hooks/useHamburgerState";
import HamburgerIcon from "./components/HamburgerIcon";
import MenuOverlay from "../menu-overlay";

export default function Hamburger() {
  const pathname = usePathname();
  const { previousPath, $isNavigating } = useNavigation();
  const { $isMenuOpen, isOnTypefaces, isClosingOnTypefaces, toggleMenu } =
    useHamburgerState();

  // Handle hamburger fade animations for /Typefaces ↔ /ID navigation
  const [shouldFadeIn, setShouldFadeIn] = useState(false);

  useEffect(() => {
    // Set fade in effect only when coming from /ID
    setShouldFadeIn(previousPath === "/ID");
  }, [pathname, previousPath]);

  // Don't render on ID page (after all hooks are called)
  if (pathname === "/ID") {
    return null;
  }

  // Check if we're on Typefaces page for conditional animation
  const isTypefacesPage = pathname === "/Typefaces";

  return (
    <>
      <motion.div
        // Only use framer-motion animations on Typefaces page, otherwise let CSS handle transitions
        {...(isTypefacesPage
          ? {
              initial: { opacity: shouldFadeIn ? 0 : 1 },
              animate: {
                opacity: $isNavigating ? 0 : 1,
              },
              exit: {
                opacity: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              },
              transition: {
                duration: shouldFadeIn ? 0.8 : $isNavigating ? 0.3 : 0.15,
                ease: shouldFadeIn ? [0.25, 0.1, 0.25, 1] : "easeInOut",
              },
            }
          : {
              style: {
                opacity: $isNavigating ? 0 : 1,
                transition: "opacity 0.15s ease",
              },
            })}
      >
        <HamburgerContainer $isOnTypefaces={isOnTypefaces}>
          <HamburgerButton
            onClick={toggleMenu}
            whileHover="hover"
            initial="initial"
          >
            <HamburgerIcon
              $isMenuOpen={$isMenuOpen}
              isOnTypefaces={isOnTypefaces}
              isClosingOnTypefaces={isClosingOnTypefaces}
            />
          </HamburgerButton>
        </HamburgerContainer>
      </motion.div>

      <MenuOverlay $isOpen={$isMenuOpen} onClose={toggleMenu} />
    </>
  );
}
