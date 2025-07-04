'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Default z-index values
const DEFAULT_Z_INDEX = {
  navigation: 40,
  backdrop: 50,
  modal: 1100  // Increased to be above hamburger menu (1000)
};

// Create a portal context with improved z-index management
const PortalContext = createContext({
  isModalOpen: false,
  setIsModalOpen: () => {},
  zIndex: DEFAULT_Z_INDEX,
  isTypefacesPath: false
});

export function PortalProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const isTypefacesPath = pathname === '/Typefaces';
  
  // Z-index values
  // When modal is open, navigation ALWAYS goes behind backdrop
  const zIndex = {
    navigation: isModalOpen ? 30 : 50,  // Lower when modal is open
    backdrop: 50,
    modal: 1100  // Increased to be above hamburger menu (1000)
  };
  
  // Handle body scroll locking and class
  useEffect(() => {
    if (isModalOpen) {
      // Don't set body overflow hidden - let modals handle their own scrolling
      // This allows proper scrolling within modals on mobile devices
      // document.body.style.overflow = 'hidden';
      
      // Add a class to the body that can be used for styling
      document.body.classList.add('modal-open');
    } else {
      // document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      // document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);
  
  return (
    <PortalContext.Provider
      value={{
        isModalOpen,
        setIsModalOpen,
        isTypefacesPath,
        zIndex
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

// Hook to use the portal context with default values for safety
export function usePortal() {
  const context = useContext(PortalContext);
  
  // Ensure we always have valid values even if context is somehow unavailable
  return {
    isModalOpen: context?.isModalOpen || false,
    setIsModalOpen: context?.setIsModalOpen || (() => {}),
    isTypefacesPath: context?.isTypefacesPath || false,
    zIndex: context?.zIndex || DEFAULT_Z_INDEX
  };
}

export { PortalContext };