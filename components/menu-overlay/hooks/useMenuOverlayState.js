import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addSubscriber, testSupabaseConnection } from "../../supabase/Supabase";

export const useMenuOverlayState = ($isOpen, onClose) => {
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const overlayRef = useRef(null);
  const isMountedRef = useRef(true);
  const router = useRouter();

  // Function to detect overflow in the overlay
  const checkForOverflow = () => {
    if (!overlayRef.current) return false;

    // Get the overlay element
    const overlay = overlayRef.current;

    // Check if content exceeds the visible area
    const hasOverflow = overlay.scrollHeight > overlay.clientHeight;

    return hasOverflow;
  };

  useEffect(() => {
    if ($isOpen && overlayRef.current) {
      // Reset scroll position when overlay opens
      overlayRef.current.scrollTop = 0;

      // Prevent body scrolling when overlay is open
      document.body.style.overflow = "hidden";

      // Add touch event listeners for iOS momentum scrolling
      const overlay = overlayRef.current;
      let startY = 0;

      const handleTouchStart = (e) => {
        startY = e.touches[0].clientY;
      };

      const handleTouchMove = (e) => {
        const currentY = e.touches[0].clientY;
        const scrollTop = overlay.scrollTop;
        const scrollHeight = overlay.scrollHeight;
        const clientHeight = overlay.clientHeight;

        // Prevent default only when scrolling would cause overscroll
        if (
          (scrollTop <= 0 && currentY > startY) ||
          (scrollTop + clientHeight >= scrollHeight && currentY < startY)
        ) {
          e.preventDefault();
        }
      };

      overlay.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      overlay.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });

      return () => {
        // Restore body scrolling when component unmounts
        document.body.style.overflow = "";

        // Clean up touch event listeners
        overlay.removeEventListener("touchstart", handleTouchStart);
        overlay.removeEventListener("touchmove", handleTouchMove);
      };
    } else {
      // Restore body scrolling when overlay closes
      document.body.style.overflow = "";
    }
  }, [$isOpen]);

  useEffect(() => {
    setIsMounted(true);

    // Test Supabase connection when component mounts
    testSupabaseConnection().then((isConnected) => {
      if (isMountedRef.current) {
        setIsSupabaseConnected(isConnected);
        if (!isConnected) {
          console.warn(
            "Supabase not connected - will use localStorage fallback",
          );
        }
      }
    });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle window resize to close menu and restore scrolling when resized beyond mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      // If menu is open and window is resized to desktop size (769px+), close the menu
      if ($isOpen && window.innerWidth >= 769) {
        // Restore body scrolling immediately
        document.body.style.overflow = "";
        // Close the menu
        onClose();
      }
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [$isOpen, onClose]);

  // Reset scroll position when overlay opens
  useEffect(() => {
    if ($isOpen && overlayRef.current) {
      overlayRef.current.scrollTop = 0;
    }

    // Clear status messages when menu closes
    if (!$isOpen) {
      setSubmitStatus(null);
      setErrorMessage("");
    }
  }, [$isOpen]);

  // Add effect to scroll to bottom after submission
  useEffect(() => {
    // Only run after a successful submission
    if (
      !submitStatus ||
      !overlayRef.current ||
      !["success", "already-subscribed", "error"].includes(submitStatus)
    )
      return;

    const overlay = overlayRef.current;

    // Short delay to let the status message render
    const timeout = setTimeout(() => {
      // Check if there's actually overflow content
      if (overlay.scrollHeight <= overlay.clientHeight) return;

      // Simply scroll to the bottom - no bounce, no indicators
      overlay.scrollTo({
        top: overlay.scrollHeight,
        behavior: "smooth",
      });
    }, 300); // Short delay to ensure the status message has rendered

    return () => clearTimeout(timeout);
  }, [submitStatus]);

  // Handle newsletter submission
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    // Validate the email before proceeding
    if (!email || !email.includes("@") || email.trim() === "") {
      setSubmitStatus("error");
      setErrorMessage("Please enter a valid email address.");
      setTimeout(() => {
        if (isMountedRef.current) {
          setSubmitStatus(null);
          setErrorMessage("");
        }
      }, 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the centralized addSubscriber function
      const result = await addSubscriber(email);

      // Set the appropriate status based on the result
      if (result.success) {
        // Handle successful subscription (both new and existing)

        // Set the appropriate status message
        if (result.source === "existingSubscription") {
          setSubmitStatus("already-subscribed");
        } else {
          setSubmitStatus("success");
          // Only clear form field on new subscriptions
          setEmail("");
        }

        // Simply ensure overlay is scrollable - scrolling will be handled by the useEffect
        if (overlayRef.current) {
          overlayRef.current.style.overflowY = "auto";
        }

        // Close the menu after a delay
        setTimeout(() => {
          if (isMountedRef.current) {
            onClose();
          }
        }, 5000); // 5 seconds to give time to see the full content
      } else {
        // Handle errors
        console.error("Subscription error:", result.message);
        setSubmitStatus("error");
        setErrorMessage(result.message);

        // Close after error display too
        setTimeout(() => {
          if (isMountedRef.current) {
            onClose();
          }
        }, 5000);
      }
    } catch (error) {
      console.error("Unexpected error in handleNewsletterSubmit:", error);
      setSubmitStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again.");

      // Close after error display too
      setTimeout(() => {
        if (isMountedRef.current) {
          onClose();
        }
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom link handler that clears status messages
  const handleLinkClick = (originalOnClick) => (e) => {
    // Clear status messages
    setSubmitStatus(null);
    setErrorMessage("");

    // Call the original onClick if provided (close menu)
    if (originalOnClick) {
      originalOnClick(e);
    }

    // Don't prevent default - let Next.js Link handle navigation
  };

  return {
    isMounted,
    email,
    setEmail,
    isSubmitting,
    submitStatus,
    setSubmitStatus,
    errorMessage,
    setErrorMessage,
    isSupabaseConnected,
    overlayRef,
    isMountedRef,
    checkForOverflow,
    handleNewsletterSubmit,
    handleLinkClick,
  };
};
