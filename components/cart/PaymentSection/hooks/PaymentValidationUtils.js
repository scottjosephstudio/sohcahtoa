export const countryCodeMap = {
  "united kingdom": "GB",
  uk: "GB",
  "united states": "US",
  usa: "US",
};

export const validateField = (type, value) => {
  switch (type) {
    case "country":
      const trimmedCountry = value.trim().toLowerCase();
      if (!trimmedCountry) {
        return "Country is required";
      }
      const countryCode = countryCodeMap[trimmedCountry];
      if (!countryCode) {
        return "Please enter a valid country (UK, United Kingdom, US, United States)";
      }
      if (trimmedCountry.length < 2) {
        return "Country name seems too short";
      }
      if (/\d/.test(trimmedCountry)) {
        return "Country name should not contain numbers";
      }
      return "";
    case "postcode":
      const trimmedPostcode = value.trim();
      if (!trimmedPostcode) {
        return "Postcode is required";
      }
      if (trimmedPostcode.length < 2) {
        return "Postcode seems too short";
      }
      const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i;
      const usZipCodeRegex = /^\d{5}(-\d{4})?$/;
      if (
        trimmedPostcode.toUpperCase().startsWith("UK") &&
        !ukPostcodeRegex.test(trimmedPostcode)
      ) {
        return "Invalid UK postcode format";
      }
      if (
        trimmedPostcode.toUpperCase().startsWith("US") &&
        !usZipCodeRegex.test(trimmedPostcode)
      ) {
        return "Invalid US ZIP code format";
      }
      return "";
    case "cardNumber":
    case "cardExpiry":
    case "cardCvc":
      return "";
    default:
      return "";
  }
};

export const getCustomStripeError = (error) => {
  if (!error) return "";

  const errorMessages = {
    "Your card's expiry year is in the past":
      "Your card's expiry year is in the past",
    "Your card's expiry month is in the past":
      "Your card's expiry month is in the past",
    invalid_number: "The card number is invalid",
    incomplete_number: "Please complete the card number",
    invalid_cvc: "The security code is invalid",
    incomplete_cvc: "Please complete the security code",
    invalid_expiry_month: "Invalid expiry month",
    invalid_expiry_year: "Invalid expiry year",
    incomplete_expiry: "Please complete the expiry date",
    partialMatches: [
      {
        match: "expiry year is in the past",
        message: "Your card's expiry year is in the past",
      },
      {
        match: "expiry month is in the past",
        message: "Your card's expiry month is in the past",
      },
      {
        match: "card number is invalid",
        message: "The card number is invalid",
      },
      {
        match: "security code is invalid",
        message: "The security code is invalid",
      },
      {
        match: "incomplete",
        message: "Please complete all card details",
      },
    ],
  };

  if (errorMessages[error.message]) {
    return errorMessages[error.message];
  }

  const partialMatch = errorMessages.partialMatches.find((item) =>
    error.message.toLowerCase().includes(item.match),
  );
  if (partialMatch) {
    return partialMatch.message;
  }

  console.warn("Unhandled Stripe error:", error);
  return error.message || "Invalid card details";
};
