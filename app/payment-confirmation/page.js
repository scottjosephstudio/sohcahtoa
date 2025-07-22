"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this package
import { getSupabaseClient } from '../../lib/database/supabaseClient';

// Animated loading components for countdown
const AnimatedLoading = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  font-size: 20px;
  color: inherit;
  gap: 4px;
  margin-left: 2px;
`;


const LoadingDot = styled(motion.span)`
  display: inline-block;
  margin-top: 6px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
`;

// Page background container
const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-x: hidden;
  background-color: #f9f9f9;

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.2;
    mix-blend-mode: multiply;
    z-index: -1;
    pointer-events: none;
  }
`;

const LoginModalOverlay = styled(motion.div)`
  position: fixed;
  padding-left: 20px;
  padding-right: 20px;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  cursor: default;
`;

const SimpleLoginPanel = styled(motion.div)`
  background: rgb(16, 12, 8);
  color: white;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  max-height: 70.25vh;
  padding: 30px;
  margin: 0px;
  box-shadow: 10px 10px 15px rgba(0, 0, 0, 0.8);
  pointer-events: auto;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  transition: height 0.3s ease;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ModalTitleLogin = styled.div`
  font-size: 20px;
  line-height: 24px !important;
  letter-spacing: 0.8px;
  text-decoration: underline;
  text-underline-offset: 6px;
  color: white;
  margin-top: -6px;
  margin-bottom: 12px;
  display: block;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusMessage = styled.p`
  font-size: 20px;
  line-height: 24px !important;
  letter-spacing: 0.8px;
  color: white;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const CountdownMessage = styled.div`
  font-size: 20px;
  line-height: 24px !important;
  letter-spacing: 0.8px;
  color: white;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const CountdownNumber = styled.span`
  display: inline-block;
  width: 0.8em;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
`;

const OrderDetailsBox = styled.div`
  background-color: rgba(120, 120, 120, 0.2);
  padding: 12px 12px;
  border-radius: 10px;
  margin-top: 0px;
  text-align: left;
  font-size: 20px;
  letter-spacing: 0.8px;
  line-height: 24px;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const loginPanelVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      type: "tween",
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

// Main component wrapper that doesn't use searchParams directly
export default function PaymentConfirmation() {
  const [isExiting, setIsExiting] = useState(false);

  return (
    <PageContainer>
      <div className="fixed inset-0 flex items-center justify-center">
        <LoginModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SimpleLoginPanel
            variants={loginPanelVariants}
            initial="hidden"
            animate={isExiting ? "exit" : "visible"}
            exit="exit"
          >
            <ModalTitleLogin>Payment Confirmation</ModalTitleLogin>
            <Suspense
              fallback={
                <StatusMessage>Loading payment details...</StatusMessage>
              }
            >
              <PaymentContent setIsExiting={setIsExiting} />
            </Suspense>
          </SimpleLoginPanel>
        </LoginModalOverlay>
      </div>
    </PageContainer>
  );
}

// Inner component that uses searchParams
function PaymentContent({ setIsExiting }) {
  const [status, setStatus] = useState("processing");
  const [countdown, setCountdown] = useState(null);
  const [shouldExit, setShouldExit] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Loading animation variants
  const dotVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { 
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 1, 0.5],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const dot1Variants = {
    ...dotVariants,
    animate: {
      ...dotVariants.animate,
      transition: {
        ...dotVariants.animate.transition,
        delay: 0
      }
    }
  };

  const dot2Variants = {
    ...dotVariants,
    animate: {
      ...dotVariants.animate,
      transition: {
        ...dotVariants.animate.transition,
        delay: 0.2
      }
    }
  };

  const dot3Variants = {
    ...dotVariants,
    animate: {
      ...dotVariants.animate,
      transition: {
        ...dotVariants.animate.transition,
        delay: 0.4
      }
    }
  };

  // Loading component for countdown
  const LoadingIndicator = () => (
    <AnimatedLoading>
      <LoadingDot 
        initial="initial"
        animate="animate"
        variants={dot1Variants} 
      />
      <LoadingDot 
        initial="initial"
        animate="animate"
        variants={dot2Variants} 
      />
      <LoadingDot 
        initial="initial"
        animate="animate"
        variants={dot3Variants} 
      />
    </AnimatedLoading>
  );

  const paymentIntent = searchParams.get("payment_intent");
  const clientSecret = searchParams.get("payment_intent_client_secret");
  const amount = searchParams.get("amount");
  const id = searchParams.get("id");
  // Try to get security token from URL if it exists
  const urlToken = searchParams.get("security_token");

  // Handle exit animation trigger
  useEffect(() => {
    if (shouldExit) {
      setIsExiting(true);
      // Redirect after animation completes (200ms based on loginPanelVariants)
      const token = urlToken || sessionStorage.getItem("payment_security_token");
      setTimeout(() => {
        router.push(
          `/Typefaces?completed_payment=true&security_token=${token}`,
        );
      }, 300);
    }
  }, [shouldExit, setIsExiting, router, urlToken]);

  useEffect(() => {
    // Apply background style to body for consistent transitions
    document.body.style.backgroundColor = "#f9f9f9";

    // Add a custom style tag for the SVG noise background
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      body::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        opacity: 0.2;
        mix-blend-mode: multiply;
        z-index: -1;
        pointer-events: none;
      }
    `;
    document.head.appendChild(styleTag);

    let countdownInterval = null;

    const handlePaymentSuccess = async (paymentDetails) => {
      // Clear cart and user data immediately
      localStorage.removeItem("cartState");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      localStorage.removeItem("billingDetails");
      localStorage.removeItem("hasProceedBeenClicked");
      
      // Clear any other potential auth-related items
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("sb-mosddxlxkteqpnjubsja-auth-token");
      sessionStorage.removeItem("sb-mosddxlxkteqpnjubsja-auth-token");
      
      // Properly log out user from Supabase session
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out from Supabase:', error);
        } else {
          console.log('✅ User successfully logged out from Supabase');
        }
        
        // Additional cleanup to ensure complete logout
        await supabase.auth.refreshSession();
      } catch (error) {
        console.error('Error during Supabase logout:', error);
      }
      
      // Notify other components that cart was cleared and user logged out
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartCleared'));
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
      }

      // Generate UUID for this transaction if not already in URL
      const token = urlToken || uuidv4();

      // Store the token in sessionStorage for persistence during navigation
      sessionStorage.setItem("payment_security_token", token);

      // If the token is not in the URL, update the URL with the token
      if (!urlToken) {
        // Create URL with all existing params plus the security token
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("security_token", token);

        // Update browser history without reloading the page
        window.history.replaceState(
          { ...window.history.state, securityToken: token },
          "",
          newUrl.toString(),
        );
      }

      // Start countdown instead of immediate redirect
      setCountdown(9);

      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Trigger exit in separate effect to avoid setState during render
            setShouldExit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    if (!paymentIntent) {
      return;
    }

    if (clientSecret) {
      let checkCount = 0;
      const maxChecks = 5;

      const checkPaymentStatus = async () => {
        if (checkCount >= maxChecks) {
          setStatus("failed");
          setTimeout(() => router.push("/Typefaces"), 10000);
          return;
        }

        try {
          const stripe = await stripePromise;
          const { paymentIntent: paymentDetails } =
            await stripe.retrievePaymentIntent(clientSecret);

          switch (paymentDetails.status) {
            case "succeeded":
              setStatus("succeeded");
              
              // Payment processing is already handled by PaymentProcessor component
              // No need to process the purchase again here
              console.log('✅ Payment succeeded, purchase already processed by PaymentProcessor');
              
              await handlePaymentSuccess(paymentDetails);
              break;
            case "processing":
              checkCount++;
              setTimeout(checkPaymentStatus, 2000);
              break;
            case "requires_payment_method":
            default:
              setStatus("failed");
              setTimeout(() => router.push("/Typefaces"), 10000);
              break;
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
          checkCount++;
          if (checkCount < maxChecks) {
            setTimeout(checkPaymentStatus, 2000);
          } else {
            setStatus("failed");
            setTimeout(() => router.push("/Typefaces"), 10000);
          }
        }
      };

      checkPaymentStatus();
    }

    // Cleanup function
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      // Don't remove the style on unmount to maintain background during transition
      // The Typefaces page will override these styles when it loads
    };
  }, [paymentIntent, clientSecret, router, urlToken]);

  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <ContentWrapper>
            <StatusMessage>Processing Payment</StatusMessage>
          </ContentWrapper>
        );
      case "succeeded":
        return (
          <ContentWrapper>
            <StatusMessage>Payment Successful!</StatusMessage>
            {amount && (
              <OrderDetailsBox>
                <p>Amount: ${amount}.00</p>
              </OrderDetailsBox>
            )}
            <StatusMessage>
              Your typeface(s) will be available in your account.
            </StatusMessage>
            <StatusMessage>
              You have been logged out for security. Please log back in to download from your account dashboard.
            </StatusMessage>
            {countdown !== null && countdown > 0 && (
              <CountdownMessage>
                Redirecting in <CountdownNumber>{countdown}</CountdownNumber>{" "}
                seconds
                <LoadingIndicator />
              </CountdownMessage>
            )}
          </ContentWrapper>
        );
      case "failed":
        return (
          <ContentWrapper>
            <StatusMessage style={{ color: "#EF4444" }}>
              Payment Failed. Redirecting...
            </StatusMessage>
          </ContentWrapper>
        );
      default:
        return (
          <ContentWrapper>
            <StatusMessage>Checking Payment Status</StatusMessage>
          </ContentWrapper>
        );
    }
  };

  return renderContent();
}
