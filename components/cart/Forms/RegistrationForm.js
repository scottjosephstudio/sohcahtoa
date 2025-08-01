import React from "react";
import { LoginForm } from "./LoginForm";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  StepContainer,
  SectionWrapper,
  OptionHeader,
  FormRow,
  FormGroup,
  FormLabel,
  FormInput,
  PasswordContainer,
  TogglePasswordButton,
  RegisterButton,
  FormDivider,
  buttonVariants,
  togglePasswordButtonVariants,
} from "../styles";

// Animated loading components for registration
const AnimatedLoading = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: inherit;
  color: inherit;
`;

const LoadingText = styled.span`
  font-size: inherit;
  letter-spacing: 0.8px;
  color: inherit;
  font-weight: normal;
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

// Error message component
const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #ffcdd2;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
`;

const countryCodeMap = {
  "united kingdom": "GB",
  uk: "GB",
  "united states": "US",
  usa: "US",
};

const validateCountry = (value) => {
  const trimmedCountry = value?.trim();
  if (!trimmedCountry) {
    return "Country Required";
  }
  return "";
};

const validatePostcode = (value, country) => {
  const trimmedPostcode = value?.trim();
  if (!trimmedPostcode) {
    return "Postal Code Required";
  }

  const countryCode = countryCodeMap[country?.toLowerCase().trim()];
  const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i;
  const usZipCodeRegex = /^\d{5}(-\d{4})?$/;
  // General postal code validation - allows letters, numbers, spaces, hyphens
  const generalPostcodeRegex = /^[A-Z0-9- ]{2,10}$/i;

  // If country is specified, do country-specific validation
  if (country?.trim() && countryCode) {
    // Special validation for UK/US
    if (countryCode === "GB" && !ukPostcodeRegex.test(trimmedPostcode)) {
      return "UK Format: AA9A 9AA";
    }
    if (countryCode === "US" && !usZipCodeRegex.test(trimmedPostcode)) {
      return "US Format: 12345 or 12345-1234";
    }
  }

  // For all cases (with or without country), ensure basic format validity
  if (!generalPostcodeRegex.test(trimmedPostcode)) {
    return "Invalid Postal Code";
  }

  return "";
};

export const Registration = ({
  registrationData,
  onRegistrationInput,
  onRegistrationFocus,
  onRegister,
  showLoginForm,
  onLoginToggle,
  formDividerRef,
  registerButtonRef,
  showPassword,
  onTogglePassword,
  isRegistrationFormValid,
  loginData,
  onLoginInput,
  onLoginFocus,
  onLogin,
  isLoginFormValid,
  emailError,
  passwordError,
  onResetPasswordClick,
  onBackToLogin,
  loginButtonRef,
  isResettingPassword,
  setIsResettingPassword,
  isLoggingIn,
  error,
  onErrorClear,
  isRegistering,
  onClearRegistrationErrors,
  clearLoginErrors,
}) => {
  const [fieldErrors, setFieldErrors] = React.useState({
    country: "",
    postcode: "",
    firstName: "",
    surname: "",
    email: "",
    password: "",
    street: "",
    city: "",
  });

  const [showFieldErrors, setShowFieldErrors] = React.useState({
    country: false,
    postcode: false,
    firstName: false,
    surname: false,
    email: false,
    password: false,
    street: false,
    city: false,
  });

  // Clear all field errors - same logic as handleInputChange but for all fields
  const clearAllFieldErrors = () => {
    setShowFieldErrors({
      country: false,
      postcode: false,
      firstName: false,
      surname: false,
      email: false,
      password: false,
      street: false,
      city: false,
    });
    setFieldErrors({
      country: "",
      postcode: "",
      firstName: "",
      surname: "",
      email: "",
      password: "",
      street: "",
      city: "",
    });
  };

  // Clear field errors when switching to login
  React.useEffect(() => {
    if (onClearRegistrationErrors) {
      clearAllFieldErrors();
    }
  }, [onClearRegistrationErrors]);

  const handleInputChange = (fieldName, value) => {
    // Clear error display when typing
    setShowFieldErrors((prev) => ({
      ...prev,
      [fieldName]: false,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    // Clear registration error when user starts typing
    if (error && error.message && onErrorClear) {
      onErrorClear();
    }

    onRegistrationInput(fieldName, value);
  };

  const handleBlur = (fieldName, value) => {
    let error = "";

    // Validate required fields
    if (!value?.trim()) {
      error =
        fieldName
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim() + " Required";
      onRegistrationInput(fieldName, "");
    } else {
      // Field-specific validation
      switch (fieldName) {
        case "country": {
          error = validateCountry(value);
          if (error) {
            // Clear the invalid country value
            onRegistrationInput(fieldName, "");
            // Also validate postcode with new country
            const postcodeError = validatePostcode(
              registrationData.postcode,
              value,
            );
            setFieldErrors((prev) => ({
              ...prev,
              postcode: postcodeError,
            }));
            setShowFieldErrors((prev) => ({
              ...prev,
              postcode: !!postcodeError,
            }));
            if (postcodeError) {
              onRegistrationInput("postcode", "");
            }
          }
          break;
        }

        case "postcode":
          error = validatePostcode(value, registrationData.country);
          if (error) {
            // Clear the invalid postcode value
            onRegistrationInput(fieldName, "");
          }
          break;

        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Invalid Email";
            // Clear the invalid email value
            onRegistrationInput(fieldName, "");
          }
          break;

        case "password":
          if (value.length < 8) {
            error = "Invalid Password";
            // Clear the invalid password value
            onRegistrationInput(fieldName, "");
          }
          break;

        default:
          if (!value.trim()) {
            error =
              fieldName
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .trim() + " Required";
            onRegistrationInput(fieldName, "");
          }
          break;
      }
    }

    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    setShowFieldErrors((prev) => ({
      ...prev,
      [fieldName]: !!error,
    }));
  };

  const fields = [
    {
      section: "Account Registration",
      fields: [
        { name: "firstName", label: "First Name", type: "text" },
        { name: "surname", label: "Surname", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "password", label: "Password", type: "password" },
      ],
    },
    {
      section: "Billing Address",
      fields: [
        { name: "street", label: "Street Address", type: "text" },
        { name: "city", label: "City", type: "text" },
        { name: "postcode", label: "Postal Code", type: "text" },
        { name: "country", label: "Country", type: "text" },
      ],
    },
  ];

  const chunk = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  React.useEffect(() => {
    // Scroll to top when registration form first appears
    const cartPanel = document.querySelector('[data-cart-panel]');
    if (cartPanel) {
      cartPanel.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []); // Empty dependency array - runs once on mount

  React.useEffect(() => {
    if (error && error.message) {
      // Scroll to top of the cart panel when error appears
      const cartPanel = document.querySelector('[data-cart-panel]');
      if (cartPanel) {
        cartPanel.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        // Fallback to window scroll if cart panel not found
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [error]);

  return (
    <StepContainer $isRegistration>
      {error && error.message && (
        <ErrorMessage>
          {error.message}
        </ErrorMessage>
      )}
      {fields.map((section, sectionIndex) => (
        <SectionWrapper
          key={section.section}
          $isBillingSection={section.section === "Billing Address"}
        >
          <OptionHeader
            $isBillingHeader={section.section === "Billing Address"}
          >
            {section.section}
          </OptionHeader>
          {chunk(section.fields, 2).map((rowFields, rowIndex) => (
            <FormRow key={rowIndex}>
              {rowFields.map((field) => (
                <FormGroup key={field.name} fieldName={field.name}>
                  <FormLabel>{field.label}</FormLabel>
                  {field.name === "password" ? (
                    <PasswordContainer>
                      <FormInput
                        type={showPassword ? "text" : "password"}
                        value={registrationData[field.name]}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        onFocus={() => onRegistrationFocus(field.name)}
                        onBlur={(e) => handleBlur(field.name, e.target.value)}
                        $hasError={showFieldErrors[field.name]}
                        placeholder={
                          showFieldErrors[field.name]
                            ? fieldErrors[field.name]
                            : ""
                        }
                        required
                      />
                      <TogglePasswordButton
                        type="button"
                        onClick={onTogglePassword}
                        variants={togglePasswordButtonVariants}
                        initial="initial"
                        whileHover="hover"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </TogglePasswordButton>
                    </PasswordContainer>
                  ) : (
                    <FormInput
                      type={field.type}
                      value={registrationData[field.name]}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      onFocus={() => onRegistrationFocus(field.name)}
                      onBlur={(e) => handleBlur(field.name, e.target.value)}
                      $hasError={showFieldErrors[field.name]}
                      placeholder={
                        showFieldErrors[field.name]
                          ? fieldErrors[field.name]
                          : ""
                      }
                      required
                    />
                  )}
                </FormGroup>
              ))}
            </FormRow>
          ))}
        </SectionWrapper>
      ))}

      <RegisterButton
        ref={registerButtonRef}
        onClick={onRegister}
        variants={buttonVariants}
        initial="initial"
        animate={
          !isRegistrationFormValid ||
          Object.values(fieldErrors).some((error) => error)
            ? "disabled"
            : "enabled"
        }
        whileHover={
          !isRegistrationFormValid ||
          Object.values(fieldErrors).some((error) => error)
            ? {}
            : "hover"
        }
        whileTap={
          !isRegistrationFormValid ||
          Object.values(fieldErrors).some((error) => error)
            ? {}
            : "hover"
        }
        disabled={
          !isRegistrationFormValid ||
          Object.values(fieldErrors).some((error) => error)
        }
      >
        {isRegistering ? (
          <AnimatedLoading>
            <LoadingText>Processing Registration</LoadingText>
            <LoadingDot 
              initial="initial"
              animate="animate"
              variants={{
                initial: { opacity: 0, scale: 0.5 },
                animate: { 
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.5],
                  transition: {
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0
                  }
                }
              }} 
            />
            <LoadingDot 
              initial="initial"
              animate="animate"
              variants={{
                initial: { opacity: 0, scale: 0.5 },
                animate: { 
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.5],
                  transition: {
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                  }
                }
              }} 
            />
            <LoadingDot 
              initial="initial"
              animate="animate"
              variants={{
                initial: { opacity: 0, scale: 0.5 },
                animate: { 
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.5],
                  transition: {
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4
                  }
                }
              }} 
            />
          </AnimatedLoading>
        ) : (
          "Register"
        )}
      </RegisterButton>

      <FormDivider ref={formDividerRef}>
        <LoginForm
          showLoginForm={showLoginForm}
          onLoginToggle={onLoginToggle}
          loginData={loginData}
          onLoginInput={onLoginInput}
          onLoginFocus={onLoginFocus}
          onLogin={onLogin}
          isLoginFormValid={isLoginFormValid}
          emailError={emailError}
          passwordError={passwordError}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
          onResetPasswordClick={onResetPasswordClick}
          loginButtonRef={loginButtonRef}
          onBackToLogin={onBackToLogin}
          isResettingPassword={isResettingPassword}
          setIsResettingPassword={setIsResettingPassword}
          isLoggingIn={isLoggingIn}
          clearLoginErrors={clearLoginErrors}
        />
      </FormDivider>
    </StepContainer>
  );
};

export default Registration;
