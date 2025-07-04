import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNavigation } from "../../../context/NavigationContext";
import {
  handleBodyScroll,
  cleanupBodyScroll,
  handleTypefacesClosing,
} from "../utils/hamburgerUtils";

export const useHamburgerState = () => {
  const { $isMenuOpen, set$isMenuOpen } = useNavigation();
  const pathname = usePathname();
  const isOnTypefaces = pathname === "/Typefaces";
  const [isClosingOnTypefaces, setIsClosingOnTypefaces] = useState(false);

  // Clean up body overflow on unmount
  useEffect(() => {
    return () => {
      cleanupBodyScroll();
    };
  }, []);

  const toggleMenu = () => {
    const newMenuState = !$isMenuOpen;
    set$isMenuOpen(newMenuState);

    // Handle closing timeout for Typefaces path
    handleTypefacesClosing($isMenuOpen, isOnTypefaces, setIsClosingOnTypefaces);

    // Prevent body scrolling when menu is open
    handleBodyScroll(newMenuState);
  };

  return {
    $isMenuOpen,
    isOnTypefaces,
    isClosingOnTypefaces,
    toggleMenu,
  };
};
