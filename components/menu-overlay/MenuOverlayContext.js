'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MenuOverlayContext = createContext();

export const useMenuOverlay = () => {
  const context = useContext(MenuOverlayContext);
  if (!context) {
    throw new Error('useMenuOverlay must be used within a MenuOverlayProvider');
  }
  return context;
};

export const MenuOverlayProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();

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
  }, [pathname]); // Only depend on pathname, not isMenuOpen to avoid infinite loops

  // Handle beforeunload as a backup
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (openDropdown) {
        setOpenDropdown(null);
      }
      if (isLoginModalOpen) {
        setIsLoginModalOpen(false);
      }
    };

    const handlePopState = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (openDropdown) {
        setOpenDropdown(null);
      }
      if (isLoginModalOpen) {
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMenuOpen, openDropdown, isLoginModalOpen]);

  return (
    <MenuOverlayContext.Provider value={{ 
      isMenuOpen, 
      setIsMenuOpen, 
      openDropdown, 
      setOpenDropdown,
      isLoginModalOpen,
      setIsLoginModalOpen,
      // Helper to check if any menu interface is open
      isAnyMenuOpen: isMenuOpen || !!openDropdown || isLoginModalOpen
    }}>
      {children}
    </MenuOverlayContext.Provider>
  );
}; 