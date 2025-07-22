"use client";

import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

// Create a navigation context with menu state management
const NavigationContext = createContext({
  $isNavigating: false,
  set$isNavigating: () => {},
  currentPath: "",
  previousPath: "",
  $isMenuOpen: false,
  set$isMenuOpen: () => {},
  isPasswordResetMode: false,
  passwordResetUser: null,
});

// Create a provider component
export function NavigationProvider({ children }) {
  const [$isNavigating, set$isNavigating] = useState(false);
  const [$isMenuOpen, set$isMenuOpen] = useState(false);
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState(pathname);
  const [previousPath, setPreviousPath] = useState("");

  // Update current path when pathname changes
  useEffect(() => {
    if (pathname !== currentPath) {
      setPreviousPath(currentPath);
      setCurrentPath(pathname);

      // Reset navigating state after path change
      requestAnimationFrame(() => {
        set$isNavigating(false);
      });
    }
  }, [pathname, currentPath]);

  // Listen for password reset mode events
  useEffect(() => {
    const handlePasswordResetMode = (event) => {
      console.log('🔒 Password reset mode activated:', event.detail);
      setIsPasswordResetMode(event.detail.isActive);
      setPasswordResetUser(event.detail.user);
    };

    const handlePasswordResetComplete = (event) => {
      console.log('🔓 Password reset completed, clearing mode');
      setIsPasswordResetMode(false);
      setPasswordResetUser(null);
      
      // Clear any stored data
      if (typeof window !== 'undefined') {
        delete window.tempPasswordResetUser;
        delete window.isPasswordResetMode;
      }
    };

    window.addEventListener('passwordResetMode', handlePasswordResetMode);
    window.addEventListener('passwordResetComplete', handlePasswordResetComplete);

    return () => {
      window.removeEventListener('passwordResetMode', handlePasswordResetMode);
      window.removeEventListener('passwordResetComplete', handlePasswordResetComplete);
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      $isNavigating,
      set$isNavigating,
      currentPath,
      previousPath,
      $isMenuOpen,
      set$isMenuOpen,
      isPasswordResetMode,
      passwordResetUser,
    }),
    [$isNavigating, currentPath, previousPath, $isMenuOpen, isPasswordResetMode, passwordResetUser],
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// Create a hook to use the navigation context
export function useNavigation() {
  return useContext(NavigationContext);
}
