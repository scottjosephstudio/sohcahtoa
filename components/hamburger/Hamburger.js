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
  const [isSpinnerNavigating, setIsSpinnerNavigating] = useState(false);

  useEffect(() => {
    // Set fade in effect only when coming from /ID to typefaces
    setShouldFadeIn(previousPath === "/ID" && pathname === "/Typefaces");
  }, [pathname, previousPath]);

  // Listen for spinner click to trigger fade out
  useEffect(() => {
    const handleSpinnerClick = () => {
      setIsSpinnerNavigating(true);
    };

    // Listen for clicks on the spinner specifically
    const spinnerElement = document.querySelector('[data-component="spinner"]');
    if (spinnerElement) {
      spinnerElement.addEventListener('click', handleSpinnerClick);
      
      return () => {
        spinnerElement.removeEventListener('click', handleSpinnerClick);
      };
    }
  }, [pathname]);

  // Reset spinner navigation state when pathname changes
  useEffect(() => {
    setIsSpinnerNavigating(false);
  }, [pathname]);

  // Don't render on ID page (after all hooks are called)
  if (pathname === "/ID") {
    return null;
  }

  // Check if we're on Typefaces page for conditional animation
  const isTypefacesPage = pathname === "/Typefaces";
  
  // Only fade out when spinner is clicked (going to ID)
  const shouldFadeOut = isTypefacesPage && isSpinnerNavigating;

  return (
    <>
      <motion.div
        // Only use framer-motion animations on Typefaces page for the specific transitions
        {...(isTypefacesPage
          ? {
              initial: { opacity: shouldFadeIn ? 0 : 1 },
              animate: {
                opacity: shouldFadeOut ? 0 : 1,
              },
              exit: {
                opacity: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              },
              transition: {
                duration: shouldFadeIn ? 0.8 : shouldFadeOut ? 0.3 : 0.15,
                ease: shouldFadeIn ? [0.25, 0.1, 0.25, 1] : "easeInOut",
              },
            }
          : {
              // On other pages, no fade animations - just persist
              style: {
                opacity: 1,
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
