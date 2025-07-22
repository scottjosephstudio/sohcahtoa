"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseClient } from "../../../lib/database/supabaseClient";
import {
  NewsletterTitle,
  NewsletterInput,
  SubscribeButton,
} from "../styles/MenuStyles";
import { buttonVariants } from "../styles/animationVariants";

// ContactNewsletter Component for Menu.js dropdown
export default function ContactNewsletter({ onClose }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
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

  // This is the same handling as in the MenuOverlay component
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

        // Close the dropdown after a 3-second delay (same as overlay)
        setTimeout(() => {
          if (isMountedRef.current) {
            onClose();
          }
        }, 3000);
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
        }, 3000);
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
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clicks to prevent them from bubbling and triggering dropdown close
  const handleClick = (e) => {
    e.stopPropagation();
  };

  const statusMessageVariants = {
    hidden: {
      opacity: 0,
      y: 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <div onClick={handleClick}>
      <NewsletterTitle>Newsletter</NewsletterTitle>
      {!isSupabaseConnected && (
        <p
          style={{
            color: "#ffaa00",
            fontSize: "14px",
            marginBottom: "8px",
            fontStyle: "italic",
          }}
        >
          Using offline mode (your subscription will be saved locally)
        </p>
      )}
      <form onSubmit={handleNewsletterSubmit} onClick={handleClick}>
        <NewsletterInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
          disabled={isSubmitting}
          onFocus={() => {
            setSubmitStatus(null);
            setErrorMessage("");
          }}
          onClick={handleClick}
        />
        <SubscribeButton
          type="submit"
          disabled={isSubmitting}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          {isSubmitting ? "Submitting..." : "Subscribe"}
        </SubscribeButton>

        <AnimatePresence mode="wait">
          {submitStatus === "success" && (
            <motion.p
              key="success-message"
              variants={statusMessageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                color: "#39ff14",
                marginTop: "12px",
                fontSize: "20px",
                lineHeight: "24px",
                letterSpacing: "0.6px",
              }}
            >
              Thank you for subscribing!
            </motion.p>
          )}

          {submitStatus === "already-subscribed" && (
            <motion.p
              key="already-subscribed-message"
              variants={statusMessageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                color: "#39ff14",
                marginTop: "12px",
                fontSize: "20px",
                lineHeight: "24px",
                letterSpacing: "0.6px",
              }}
            >
              You're already subscribed!
            </motion.p>
          )}

          {submitStatus === "error" && (
            <motion.p
              key="error-message"
              variants={statusMessageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                color: "#ff3939",
                marginTop: "12px",
                fontSize: "20px",
                lineHeight: "24px",
                letterSpacing: "0.6px",
              }}
            >
              {errorMessage || "Subscription failed. Please try again."}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
