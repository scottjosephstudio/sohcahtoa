import {
  NewsletterForm,
  NewsletterTitle,
  NewsletterInput,
  SubscribeButton,
} from "../styles/MenuOverlayStyles";
import { fadeInUp, buttonVariants } from "../styles/animationVariants";

const NewsletterSection = ({
  email,
  setEmail,
  isSubmitting,
  submitStatus,
  setSubmitStatus,
  errorMessage,
  setErrorMessage,
  isSupabaseConnected,
  handleNewsletterSubmit,
}) => {
  return (
    <NewsletterForm
      onSubmit={handleNewsletterSubmit}
      onClick={() => {
        setSubmitStatus(null);
        setErrorMessage("");
      }}
      variants={fadeInUp}
      custom={2}
    >
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
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

        {submitStatus === "success" && (
          <p
            style={{
              color: "#39ff14",
              marginTop: "8px",
              fontSize: "20px",
              lineHeight: "24px",
              letterSpacing: "0.6px",
            }}
          >
            Thank you for subscribing!
          </p>
        )}

        {submitStatus === "already-subscribed" && (
          <p
            style={{
              color: "#39ff14",
              marginTop: "8px",
              fontSize: "20px",
              lineHeight: "24px",
              letterSpacing: "0.6px",
            }}
          >
            You're already subscribed!
          </p>
        )}

        {submitStatus === "error" && (
          <p
            style={{
              color: "#ff3939",
              marginTop: "8px",
              fontSize: "20px",
              lineHeight: "24px",
              letterSpacing: "0.6px",
            }}
          >
            {errorMessage || "Subscription failed. Please try again."}
          </p>
        )}
      </div>
    </NewsletterForm>
  );
};

export default NewsletterSection;
