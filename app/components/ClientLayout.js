"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import FontLoader from "../../components/providers/FontLoader";
import Menu from "../../components/menu";
import Hamburger from "../../components/hamburger";
import ScrollToTopButton from "../../components/scroll-to-top-button";
import TypefaceIcon from "../../components/mobile-typeface-icon";
import { NavigationProvider } from "../../context/NavigationContext";
import { PortalProvider } from "../../context/PortalContext";
import { MenuOverlayProvider } from "../../components/menu-overlay/MenuOverlayContext";
import { FontSelectionProvider } from "../../context/FontSelectionContext";

// Utility to clear invalid Supabase tokens
const clearInvalidSupabaseTokens = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    const { getSupabaseClient } = await import('../../lib/database/supabaseClient');
    const supabase = getSupabaseClient();
    
    // Try to get the current user - this will trigger the refresh token error if tokens are invalid
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message && error.message.includes('Invalid Refresh Token')) {
      // Clear the invalid session
      await supabase.auth.signOut();
      
      // Clear any remaining token data from localStorage and sessionStorage
      ['localStorage', 'sessionStorage'].forEach(storageType => {
        const storage = window[storageType];
        if (storage) {
        Object.keys(storage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
            storage.removeItem(key);
          }
        });
        }
      });
      
      console.log('🧹 Cleared invalid Supabase tokens');
    }
  } catch (error) {
    console.error('Error checking/clearing Supabase tokens:', error);
  }
};

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();


  // Clear invalid tokens on app initialization
  useEffect(() => {
    clearInvalidSupabaseTokens();
  }, []);

  // Check if current page is the payment confirmation page
  const isPaymentConfirmation =
    pathname === "/payment-confirmation" ||
    (pathname && pathname.startsWith("/payment-confirmation?"));

  // Check if current page is the typefaces page (only the main listing, not individual product pages)
  const isTypefacesPage = pathname === "/Typefaces";

  // Check if current page is the ID page or a font-specific page
  const isIDPage = pathname === "/ID";
  const isFontSpecificPage = pathname && pathname.startsWith("/Typefaces/") && pathname !== "/Typefaces";

  // Apply body classes based on current route
  useEffect(() => {
    const body = document.body;

    // Remove all route-specific classes immediately
    body.classList.remove("typefaces-page", "payment-confirmation-page");

    // Add payment confirmation class immediately (no visual impact)
    if (isPaymentConfirmation) {
      body.classList.add("payment-confirmation-page");
    }

    // Delay adding typefaces-page class to prevent layout shift during transition
    if (isTypefacesPage) {
      const timer = setTimeout(() => {
        body.classList.add("typefaces-page");
      }, 100); // Small delay to allow transition to settle

      return () => {
        clearTimeout(timer);
        body.classList.remove("typefaces-page", "payment-confirmation-page");
      };
    }

    // Cleanup function to remove classes when component unmounts
    return () => {
      body.classList.remove("typefaces-page", "payment-confirmation-page");
    };
  }, [pathname, isTypefacesPage, isPaymentConfirmation]);

  return (
    <FontSelectionProvider>
    <MenuOverlayProvider>
      <NavigationProvider>
        <PortalProvider>
          <FontLoader />
          {/* Portal placeholder for UI elements */}
          <div id="portal-root"></div>

          {/* Components rendered conditionally based on the current page */}
          {!isPaymentConfirmation && !isIDPage && !isFontSpecificPage && <Menu />}
          {!isPaymentConfirmation && <Hamburger />}
          {!isPaymentConfirmation && <TypefaceIcon />}
          {!isPaymentConfirmation && <ScrollToTopButton />}
          
          {/* Typefaces-specific navigation elements */}
          

          {/* Main Content */}
          <div className="test-alignment-wrapper">
            <main>{children}</main>
          </div>
        </PortalProvider>
      </NavigationProvider>
    </MenuOverlayProvider>
    </FontSelectionProvider>
  );
}
