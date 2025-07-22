import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import {
  LoginHeader,
  LoginSectionHeader,
  LoginToggleButton,
  LoginFormContainer,
  FormRow,
  FormGroup,
  FormLabel,
  FormInput,
  PasswordContainer,
  TogglePasswordButton,
  LinkWrapper,
  ResetPasswordLink,
  Button,
  loginToggleVariants,
  buttonVariants,
  resetPasswordLinkVariants,
  togglePasswordButtonVariants,
} from "../styles";

// Success message component for reset password
const SuccessMessage = styled(motion.div)`
  background-color: rgba(0, 110, 254, 0.1);
  border: 1px solid rgba(0, 110, 254, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 32px;
  color: #006efe;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  text-align: center;
`;

// Animated loading components for login
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

export const LoginForm = ({
  showLoginForm,
  onLoginToggle,
  loginData,
  onLoginInput,
  onLoginFocus,
  onLogin,
  showPassword,
  onTogglePassword,
  onResetPasswordClick,
  onBackToLogin,
  loginButtonRef,
  isResettingPassword,
  setIsResettingPassword,
  isLoggingIn,
  emailError: externalEmailError,
  passwordError: externalPasswordError,
  clearLoginErrors,
}) => {
  const [resetData, setResetData] = useState({ email: "" });
  const [showErrors, setShowErrors] = useState({
    email: false,
    password: false,
    resetEmail: false,
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Add effect to detect when user returns from auth callback with completed password reset
  useEffect(() => {
    const handlePasswordResetComplete = () => {
      console.log('✅ Password reset completed, returning to login');
      // Trigger "Back to Login" behavior
      handleBackToLogin();
      // Clear the localStorage flag
      localStorage.removeItem('passwordResetCompleted');
    };
    
    // Check localStorage periodically for password reset completion
    const checkPasswordResetStatus = () => {
      const resetCompleted = localStorage.getItem('passwordResetCompleted');
      if (resetCompleted === 'true') {
        handlePasswordResetComplete();
      }
    };
    
    // Check immediately and then every 500ms
    const interval = setInterval(checkPasswordResetStatus, 500);
    checkPasswordResetStatus(); // Check immediately
    
    // Also listen for storage events (when localStorage changes in another tab)
    const handleStorageChange = (event) => {
      if (event.key === 'passwordResetCompleted' && event.newValue === 'true') {
        handlePasswordResetComplete();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Debug effect to monitor isLoggingIn changes
  useEffect(() => {
    console.log('🔄 LoginForm isLoggingIn changed:', isLoggingIn);
  }, [isLoggingIn]);

  // Clear login errors when switching to registration
  useEffect(() => {
    if (clearLoginErrors) {
      setShowErrors({
        email: false,
        password: false,
        resetEmail: false,
      });
    }
  }, [clearLoginErrors]);

  // Combine external errors with internal validation errors
  const hasEmailError = showErrors.email || externalEmailError;
  const hasPasswordError = showErrors.password || externalPasswordError;

  const handleInputChange = (field, value) => {
    // Clear error display when typing
    setShowErrors((prev) => ({
      ...prev,
      [field]: false,
    }));
    onLoginInput(field, value);
  };

  const handleInputFocus = (field) => {
    // Clear error display when clicking/focusing on input
    setShowErrors((prev) => ({
      ...prev,
      [field]: false,
    }));
    
    // Call the external focus handler to clear registration data
    if (onLoginFocus) {
      onLoginFocus(field);
    }
  };

  const handleBlur = (field) => {
    // Basic validation on blur
    if (field === "email" && loginData?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginData.email)) {
        setShowErrors((prev) => ({
          ...prev,
          email: true,
        }));
      }
    } else if (field === "password" && loginData?.password) {
      if (loginData.password.length < 1) { // Just check if password exists
        setShowErrors((prev) => ({
          ...prev,
          password: true,
        }));
      }
    }
  };

  const handleSubmit = () => {
    console.log('🔄 LoginForm handleSubmit called, isLoggingIn:', isLoggingIn);
    
    // Validate both fields on submit
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {
      email: !loginData?.email || !emailRegex.test(loginData.email),
      password: !loginData?.password || loginData.password.length < 1, // Just check if password exists
      resetEmail: false,
    };

    setShowErrors(newErrors);

    // Only proceed if both are valid
    if (!newErrors.email && !newErrors.password) {
      console.log('✅ LoginForm validation passed, calling onLogin');
      onLogin();
    } else {
      console.log('❌ LoginForm validation failed:', newErrors);
    }
  };

  const handleResetClick = () => {
    setIsResettingPassword(true);
    
    // Clear login form inputs when switching to reset password mode
    if (onLoginInput) {
      onLoginInput("email", "");
      onLoginInput("password", "");
    }
    
    // Trigger the focus handler to clear login data (same as clicking on reset form inputs)
    if (onLoginFocus) {
      onLoginFocus("email");
    }
    
    // Clear any existing errors
    setShowErrors((prev) => ({
      ...prev,
      email: false,
      password: false,
    }));
    
    // Scroll to bottom for desktop users (above 768px) to show the success message
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setTimeout(() => {
        const cartPanel = document.querySelector('[data-cart-panel]');
        if (cartPanel) {
          cartPanel.scrollTo({
            top: cartPanel.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100); // Small delay to ensure the reset form is rendered
    }
    
    if (onResetPasswordClick) {
      onResetPasswordClick();
    }
  };

  const handleBackToLogin = () => {
    setIsResettingPassword(false);
    setResetData({ email: "" });
    setShowErrors((prev) => ({
      ...prev,
      resetEmail: false,
    }));
    setShowSuccessMessage(false);
    setIsSubmittingReset(false);
    if (onBackToLogin) {
      onBackToLogin();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isResetEmailValid = emailRegex.test(resetData.email);

    if (!isResetEmailValid) {
      setShowErrors((prev) => ({
        ...prev,
        resetEmail: true,
      }));
      setResetData({ email: "" });
      return;
    }

    try {
      setIsSubmittingReset(true);
      setShowErrors((prev) => ({
        ...prev,
        resetEmail: false,
      }));
      
      console.log('🔄 Starting password reset for email:', resetData.email);
      
      // Use the API route for password reset
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetData.email })
      });

      if (response.ok) {
        console.log('✅ Password reset email sent via API route');
        setShowSuccessMessage(true);
        // Remove timeout - let success message stay until password reset is completed
      } else {
        const errorData = await response.json();
        console.error('❌ API route failed:', errorData);
        setShowErrors((prev) => ({
          ...prev,
          resetEmail: true,
        }));
        setResetData({ email: "" });
      }
    } catch (error) {
      console.error('❌ Password reset exception:', error);
      setShowErrors((prev) => ({
        ...prev,
        resetEmail: true,
      }));
      setResetData({ email: "" });
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const validateResetEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setShowErrors((prev) => ({
        ...prev,
        resetEmail: true,
      }));
      setResetData({ email: "" });
      return false;
    }
    return true;
  };

  // Clear internal errors when external errors change
  useEffect(() => {
    if (externalEmailError || externalPasswordError) {
      setShowErrors((prev) => ({
        ...prev,
        email: false,
        password: false,
      }));
    }
  }, [externalEmailError, externalPasswordError]);

  return (
    <>
      <LoginHeader $isExpanded={showLoginForm}>
        <LoginSectionHeader data-scroll="login-toggle">
          Already have an account?
        </LoginSectionHeader>
        <LoginToggleButton
          onClick={onLoginToggle}
          variants={loginToggleVariants}
          initial="initial"
          whileHover="hover"
        >
          <span>{showLoginForm ? "Hide Login" : "Login"}</span>
        </LoginToggleButton>
      </LoginHeader>

      <AnimatePresence>
        {showLoginForm && (
          <LoginFormContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!isResettingPassword ? (
                <motion.div
                  key="login"
                  data-scroll="login-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <FormRow>
                    <FormGroup $noMargin data-scroll="login-inputs">
                      <FormLabel>Email</FormLabel>
                      <FormInput
                        type="email"
                        value={loginData?.email || ""}
                        placeholder={hasEmailError ? "Invalid Email" : ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        onFocus={() => handleInputFocus("email")}
                        onBlur={() => handleBlur("email")}
                        $hasError={hasEmailError}
                        required
                      />
                    </FormGroup>
                    <FormGroup $noMargin>
                      <FormLabel>Password</FormLabel>
                      <PasswordContainer>
                        <FormInput
                          type={showPassword ? "text" : "password"}
                          value={loginData?.password || ""}
                          placeholder={hasPasswordError ? "Invalid Password" : ""}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          onFocus={() => handleInputFocus("password")}
                          onBlur={() => handleBlur("password")}
                          $hasError={hasPasswordError}
                          required
                        />
                        <TogglePasswordButton
                          type="button"
                          onClick={onTogglePassword}
                          variants={togglePasswordButtonVariants}
                          initial="initial"
                          whileHover="hover"
                        >
                          <span>{showPassword ? "Hide" : "Show"}</span>
                        </TogglePasswordButton>
                      </PasswordContainer>
                    </FormGroup>
                  </FormRow>

                  <LinkWrapper data-scroll="reset-link">
                    <ResetPasswordLink
                      onClick={handleResetClick}
                      variants={resetPasswordLinkVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      <span>Reset Password</span>
                    </ResetPasswordLink>
                  </LinkWrapper>

                  <Button
                    ref={loginButtonRef}
                    data-scroll="login-button"
                    onClick={handleSubmit}
                    variants={buttonVariants}
                    initial="initial"
                    animate={
                      !loginData?.email || !loginData?.password || isLoggingIn
                        ? "disabled"
                        : "enabled"
                    }
                    whileHover={
                      !loginData?.email || !loginData?.password || isLoggingIn ? {} : "hover"
                    }
                    whileTap={
                      !loginData?.email || !loginData?.password || isLoggingIn ? {} : "hover"
                    }
                    disabled={!loginData?.email || !loginData?.password || isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <AnimatedLoading>
                        <LoadingText>Logging in</LoadingText>
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
                      "Login"
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="reset"
                  data-scroll="reset-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <FormRow>
                    <FormGroup $noMargin data-scroll="reset-inputs">
                      <FormLabel>Email</FormLabel>
                      <FormInput
                        type="email"
                        value={resetData.email}
                        placeholder={
                          showErrors.resetEmail ? "Invalid Email" : ""
                        }
                        onChange={(e) => {
                          setResetData({ email: e.target.value });
                          setShowErrors((prev) => ({
                            ...prev,
                            resetEmail: false,
                          }));
                        }}
                        onFocus={() => {
                          setShowErrors((prev) => ({
                            ...prev,
                            resetEmail: false,
                          }));
                        }}
                        onBlur={() => {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (
                            !resetData.email ||
                            !emailRegex.test(resetData.email)
                          ) {
                            setShowErrors((prev) => ({
                              ...prev,
                              resetEmail: true,
                            }));
                            setResetData({ email: "" });
                          }
                        }}
                        $hasError={showErrors.resetEmail}
                        required
                      />
                    </FormGroup>
                  </FormRow>

                  <LinkWrapper data-scroll="back-to-login">
                    <ResetPasswordLink
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBackToLogin();
                      }}
                      variants={resetPasswordLinkVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      <span>Back to Login</span>
                    </ResetPasswordLink>
                  </LinkWrapper>

                  <Button
                    data-scroll="reset-button"
                    onClick={handleResetPassword}
                    variants={buttonVariants}
                    initial="initial"
                    animate={isSubmittingReset ? "disabled" : "enabled"}
                    whileHover={isSubmittingReset ? {} : "hover"}
                    whileTap={isSubmittingReset ? {} : "hover"}
                    disabled={isSubmittingReset}
                  >
                    {isSubmittingReset ? (
                      <AnimatedLoading>
                        <LoadingText>Sending</LoadingText>
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
                      "Reset Password"
                    )}
                  </Button>

                  {showSuccessMessage && (
                    <SuccessMessage
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>Password reset email sent! Please check your inbox.</p>
                    </SuccessMessage>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </LoginFormContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoginForm;
