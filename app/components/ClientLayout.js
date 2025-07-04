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

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Check if current page is the payment confirmation page
  const isPaymentConfirmation =
    pathname === "/payment-confirmation" ||
    (pathname && pathname.startsWith("/payment-confirmation?"));

  // Check if current page is the typefaces page (only the main listing, not individual product pages)
  const isTypefacesPage = pathname === "/Typefaces";

  // Check if current page is the ID page
  const isIDPage = pathname === "/ID";

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
    <MenuOverlayProvider>
      <NavigationProvider>
        <PortalProvider>
          <FontLoader />
          {/* Portal placeholder for UI elements */}
          <div id="portal-root"></div>

          {/* Components rendered conditionally based on the current page */}
          {!isPaymentConfirmation && !isIDPage && <Menu />}
          {!isPaymentConfirmation && <Hamburger />}
          {!isPaymentConfirmation && <TypefaceIcon />}
          {!isPaymentConfirmation && <ScrollToTopButton />}

          {/* Main Content */}
          <main>{children}</main>
        </PortalProvider>
      </NavigationProvider>
    </MenuOverlayProvider>
  );
}
