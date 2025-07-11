"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import FontLoader from "../../components/providers/FontLoader";
import Menu from "../../components/menu";
import Hamburger from "../../components/hamburger";
import ScrollToTopButton from "../../components/scroll-to-top-button";
import TypefaceIcon from "../../components/mobile-typeface-icon";
import { NavigationProvider } from "../../context/NavigationContext";
import { PortalProvider } from "../../context/PortalContext";
import { MenuOverlayProvider } from "../../components/menu-overlay/MenuOverlayContext";
import { FontSelectionProvider } from "../../context/FontSelectionContext";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

// Centered overlay - simple and reliable
const NotificationOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

// Email verification success notification
const VerificationNotification = styled(motion.div)`
  background: rgb(16, 12, 8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 320px;
  min-width: 320px;
  text-align: center;
`;

const NotificationTitle = styled.div`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  margin: 0 0 16px 0;
  text-decoration: underline;
  text-underline-offset: 3px;
`;

const NotificationMessage = styled.p`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.6px;
  margin: 0 0 20px 0;
`;

const NotificationButton = styled(motion.button)`
  background: #006efe;
  color: white;
  border: none;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 16px;
  line-height: 20px;
  font-weight: normal;
  cursor: pointer;
  
  &:hover {
    background: #0056cc;
  }
`;

const NotificationBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

// Test alignment wrapper
const TestAlignmentWrapper = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 109px;
    left: 0;
    right: 0;
    height: 0px;
    background-color: #000;
    z-index: 10001;
  }
`;

// Utility to clear invalid Supabase tokens
const clearInvalidSupabaseTokens = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    const { supabase } = await import('../../lib/database/supabaseClient');
    
    // Try to get the current user - this will trigger the refresh token error if tokens are invalid
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message && error.message.includes('Invalid Refresh Token')) {
      // Clear the invalid session
      await supabase.auth.signOut();
      
      // Clear any remaining token data from localStorage and sessionStorage
      ['localStorage', 'sessionStorage'].forEach(storageType => {
        const storage = window[storageType];
        Object.keys(storage).forEach(key => {
          if (key.startsWith('supabase.auth.token') || key.startsWith('sb-')) {
            storage.removeItem(key);
          }
        });
      });
    }
  } catch (error) {
    // If there's any error during token clearing, just continue
    console.warn('Error clearing invalid tokens on app initialization:', error);
  }
};

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [showVerificationExpired, setShowVerificationExpired] = useState(false);

  // Clear invalid tokens on app initialization
  useEffect(() => {
    clearInvalidSupabaseTokens();
  }, []);

  // Handle email verification success from Supabase redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleEmailVerification = async () => {
      const hash = window.location.hash;
      
      // Check if this is an email verification success redirect
      if (hash.includes('access_token=') && hash.includes('type=signup')) {
        try {
          const { supabase } = await import('../../lib/database/supabaseClient');
          
          // Get the current user to verify they're authenticated
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (user && user.email_verified) {
            // Update user verification status in our database
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                email_verified: true,
                email_verified_at: new Date().toISOString(),
                is_active: true
              })
              .eq('email', user.email);

            if (updateError) {
              console.warn('Database update error:', updateError);
            }

            // Show success notification
            setShowVerificationSuccess(true);
            
            // Clean up the URL hash
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        } catch (error) {
          console.error('Email verification handling error:', error);
        }
      }
      
      // Check if this is an expired verification link
      else if (hash.includes('error=access_denied') && hash.includes('error_code=otp_expired')) {
        // Show expired verification notification
        setShowVerificationExpired(true);
        
        // Clean up the URL hash
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleEmailVerification();
  }, [pathname]);

  const handleNotificationClose = () => {
    setShowVerificationSuccess(false);
  };

  const handleExpiredNotificationClose = () => {
    setShowVerificationExpired(false);
  };

  const handleResendVerification = async () => {
    try {
      // For now, just close the modal and direct user to register again
      // In a production app, you might want to implement a resend verification API
      setShowVerificationExpired(false);
      
      // Could add a toast notification here saying "Please register again to receive a new verification email"
      console.log('User needs to register again for new verification email');
    } catch (error) {
      console.error('Error handling verification resend:', error);
    }
  };

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
    <FontSelectionProvider>
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
          
          {/* Typefaces-specific navigation elements */}
          

          {/* Email Verification Success Notification */}
          <AnimatePresence>
            {showVerificationSuccess && (
              <>
                <NotificationBackdrop
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleNotificationClose}
                />
                <NotificationOverlay
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VerificationNotification
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <NotificationTitle>Email Verified!</NotificationTitle>
                    <NotificationMessage>
                      Your email has been successfully verified. You can now access your account and download purchased typefaces.
                    </NotificationMessage>
                    <NotificationButton
                      onClick={handleNotificationClose}
                      whileHover={{ scale: 1 }}
                      whileTap={{ scale: 1 }}
                    >
                      Continue
                    </NotificationButton>
                  </VerificationNotification>
                </NotificationOverlay>
              </>
            )}
            
            {showVerificationExpired && (
              <>
                <NotificationBackdrop
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleExpiredNotificationClose}
                />
                <NotificationOverlay
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VerificationNotification
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <NotificationTitle>Verification Link Expired</NotificationTitle>
                    <NotificationMessage>
                      Your email verification link has expired. Please try logging in - if that doesn't work, you may need to register again to receive a new verification email.
                    </NotificationMessage>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <NotificationButton
                        onClick={handleExpiredNotificationClose}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ background: '#666' }}
                      >
                        Try Login
                      </NotificationButton>
                      <NotificationButton
                        onClick={handleResendVerification}
                        whileHover={{ scale: 1 }}
                        whileTap={{ scale: 1 }}
                      >
                        OK
                      </NotificationButton>
                    </div>
                  </VerificationNotification>
                </NotificationOverlay>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <TestAlignmentWrapper>
            <main>{children}</main>
          </TestAlignmentWrapper>
        </PortalProvider>
      </NavigationProvider>
    </MenuOverlayProvider>
    </FontSelectionProvider>
  );
}
