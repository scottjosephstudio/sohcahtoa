import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  togglePasswordVariants,
  loginToggleVariants,
  buttonVariants,
  resetPasswordLinkVariants,
} from "../styles";

export const LoginForm = ({
  showLoginForm,
  onLoginToggle,
  loginData,
  onLoginInput,
  onLogin,
  showPassword,
  onTogglePassword,
  onResetPasswordClick,
  onBackToLogin,
  loginButtonRef,
  isResettingPassword,
  setIsResettingPassword,
  isLoggingIn,
}) => {
  const [resetData, setResetData] = useState({ email: "" });
  const [showErrors, setShowErrors] = useState({
    email: false,
    password: false,
    resetEmail: false,
  });

  const handleInputChange = (field, value) => {
    // Clear error display when typing
    setShowErrors((prev) => ({
      ...prev,
      [field]: false,
    }));
    onLoginInput(field, value);
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
      onLogin();
    }
  };

  const handleResetClick = () => {
    setIsResettingPassword(true);
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
    if (onBackToLogin) {
      onBackToLogin();
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
                        placeholder={showErrors.email ? "Invalid Email" : ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        onBlur={() => handleBlur("email")}
                        $hasError={showErrors.email}
                        required
                      />
                    </FormGroup>
                    <FormGroup $noMargin>
                      <FormLabel>Password</FormLabel>
                      <PasswordContainer>
                        <FormInput
                          type={showPassword ? "text" : "password"}
                          value={loginData?.password || ""}
                          placeholder={
                            showErrors.password ? "Invalid Password" : ""
                          }
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          onBlur={() => handleBlur("password")}
                          $hasError={showErrors.password}
                          required
                        />
                        <TogglePasswordButton
                          type="button"
                          onClick={onTogglePassword}
                          variants={togglePasswordVariants}
                          initial="initial"
                          whileHover="hover"
                        >
                          {showPassword ? "Hide" : "Show"}
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
                    {isLoggingIn ? "Logging in..." : "Login"}
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
                    onClick={() => {
                      if (validateResetEmail(resetData.email)) {
                        handleBackToLogin();
                      }
                    }}
                    variants={buttonVariants}
                    initial="initial"
                    animate={!resetData.email ? "disabled" : "enabled"}
                    whileHover={!resetData.email ? {} : "hover"}
                    whileTap={!resetData.email ? {} : "hover"}
                    disabled={!resetData.email}
                  >
                    Reset Password
                  </Button>
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
