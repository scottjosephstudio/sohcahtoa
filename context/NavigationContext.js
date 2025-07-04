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
});

// Create a provider component
export function NavigationProvider({ children }) {
  const [$isNavigating, set$isNavigating] = useState(false);
  const [$isMenuOpen, set$isMenuOpen] = useState(false);
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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      $isNavigating,
      set$isNavigating,
      currentPath,
      previousPath,
      $isMenuOpen,
      set$isMenuOpen,
    }),
    [$isNavigating, currentPath, previousPath, $isMenuOpen],
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
