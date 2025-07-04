'use client';

import { usePathname } from 'next/navigation';

/**
 * Custom hook to detect if we're on the Typefaces path
 * @returns {boolean} True if current path is /Typefaces
 */
export function useTypefacesPath() {
  const pathname = usePathname();
  return pathname === '/Typefaces';
}