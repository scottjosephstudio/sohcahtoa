"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const MenuOverlayContext = createContext();

export const useMenuOverlay = () => {
  const context = useContext(MenuOverlayContext);
  if (!context) {
    throw new Error("useMenuOverlay must be used within a MenuOverlayProvider");
  }
  return context;
};

export const MenuOverlayProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();

  // Use refs to track current state for event handlers
  const isMenuOpenRef = useRef(isMenuOpen);
  const openDropdownRef = useRef(openDropdown);
  const isLoginModalOpenRef = useRef(isLoginModalOpen);

  // Update refs when state changes
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  useEffect(() => {
    openDropdownRef.current = openDropdown;
  }, [openDropdown]);

  useEffect(() => {
    isLoginModalOpenRef.current = isLoginModalOpen;
  }, [isLoginModalOpen]);

  // Close menu on navigation to prevent overlay from flashing during transitions
  useEffect(() => {
    // Close menu whenever the route changes
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    // Also close any open dropdowns
    if (openDropdown) {
      setOpenDropdown(null);
    }
    // Also close login modal
    if (isLoginModalOpen) {
      setIsLoginModalOpen(false);
    }
  }, [pathname]); // Only depend on pathname, not state values

  // Handle beforeunload and popstate events - using refs to avoid dependencies
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isMenuOpenRef.current) {
        setIsMenuOpen(false);
      }
      if (openDropdownRef.current) {
        setOpenDropdown(null);
      }
      if (isLoginModalOpenRef.current) {
        setIsLoginModalOpen(false);
      }
    };

    const handlePopState = () => {
      if (isMenuOpenRef.current) {
        setIsMenuOpen(false);
      }
      if (openDropdownRef.current) {
        setOpenDropdown(null);
      }
      if (isLoginModalOpenRef.current) {
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []); // Empty dependencies array - event handlers are stable

  return (
    <MenuOverlayContext.Provider
      value={{
        isMenuOpen,
        setIsMenuOpen,
        openDropdown,
        setOpenDropdown,
        isLoginModalOpen,
        setIsLoginModalOpen,
        // Helper to check if any menu interface is open
        isAnyMenuOpen: isMenuOpen || !!openDropdown || isLoginModalOpen,
      }}
    >
      {children}
    </MenuOverlayContext.Provider>
  );
};
