import React from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
} from "@stripe/react-stripe-js";

const PaymentProcessor = ({
  onPaymentComplete,
  onError,
  setIsProcessing,
  savedRegistrationData,
  currentUser,
  clientSecret,
  addressData,
  children,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleTransitionToConfirmation = async (paymentDetails) => {
    // Apply the background styling for the transition
    const transitionStyle = document.createElement("style");
    transitionStyle.innerHTML = `
      body {
        position: relative;
        background-color: #f9f9f9 !important;
      }
      
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
    document.head.appendChild(transitionStyle);

    // Step 1: Close cart smoothly (800ms)
    const fadeOutEvent = new CustomEvent("startPaymentTransition", {
      detail: { isStarting: true },
    });
    window.dispatchEvent(fadeOutEvent);

    // Build query params for confirmation page
    const queryParams = new URLSearchParams({
      amount: paymentDetails.amount,
      id: paymentDetails.id,
      payment_intent: paymentDetails.payment_intent,
      payment_intent_client_secret: paymentDetails.client_secret,
    }).toString();

    // Step 2: After cart closes (800ms), trigger page element fadeout
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Trigger page element fadeout
    const pageTransitionEvent = new CustomEvent("pageTransitionStart", {
      detail: { isNavigatingToConfirmation: true },
    });
    window.dispatchEvent(pageTransitionEvent);

    // Step 3: After page elements fade out (800ms), redirect to confirmation
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Final redirect - directly go to payment confirmation without changing URL first
    window.location.href = `/payment-confirmation?${queryParams}`;
  };

  const processPayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      console.error("Stripe not initialized or missing client secret");
      return;
    }

    // REQUIRED: User must be authenticated to purchase fonts
    if (!currentUser) {
      onError(new Error("You must be logged in to purchase fonts"));
      setIsProcessing(false);
      return;
    }

    // REQUIRED: User must have verified their email address
    if (!currentUser.email_confirmed_at) {
      onError(new Error("Please verify your email address before completing your purchase. Check your inbox for a verification email."));
      setIsProcessing(false);
      return;
    }

    // REQUIRED: User must have a valid email
    const userEmail = currentUser?.email || currentUser?.dbData?.email || savedRegistrationData?.email;
    if (!userEmail) {
      onError(new Error("Valid user account required for font purchases"));
      setIsProcessing(false);
      return;
    }

    if (!addressData?.country?.trim() || !addressData?.postcode?.trim()) {
      onError(new Error("Please provide both country and postcode"));
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardNumberElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Get user data from the best available source
      const userEmail = currentUser?.email || currentUser?.dbData?.email || savedRegistrationData?.email;
      const firstName = currentUser?.dbData?.first_name || savedRegistrationData?.firstName || '';
      const lastName = currentUser?.dbData?.last_name || savedRegistrationData?.surname || '';
      const street = currentUser?.dbData?.street_address || savedRegistrationData?.street || '';
      const city = currentUser?.dbData?.city || savedRegistrationData?.city || '';

      console.log('💳 Processing payment with user data:', {
        email: userEmail,
        name: `${firstName} ${lastName}`.trim(),
        hasCurrentUser: !!currentUser,
        hasSavedData: !!savedRegistrationData
      });

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${firstName} ${lastName}`.trim(),
            email: userEmail,
            address: {
              line1: street,
              city: city,
              postal_code: addressData.postcode,
              country: addressData.country,
            },
          },
        },
        setup_future_usage: "on_session",
      });

      if (result.error) {
        console.error("Payment error:", result.error);
        onError(result.error);
        setIsProcessing(false);
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        // Call onPaymentComplete for cleanup
        onPaymentComplete(result.paymentIntent);

        // Prepare payment details
        const paymentDetails = {
          amount: result.paymentIntent.amount / 100,
          id: result.paymentIntent.id,
          payment_intent: result.paymentIntent.id,
          client_secret: result.paymentIntent.client_secret,
        };

        // Start the smooth transition sequence
        await handleTransitionToConfirmation(paymentDetails);
      } else {
        console.warn("Payment not succeeded:", result.paymentIntent.status);
        onError(new Error(`Payment status: ${result.paymentIntent.status}`));
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      onError(err);
      setIsProcessing(false);
    }
  };

  return typeof children === "function" ? children(processPayment) : null;
};

export default PaymentProcessor;
