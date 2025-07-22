import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LoginForm,
  LoginSubmitButton,
  ResetPasswordLink,
  SuccessMessage,
  FormGroup,
  Label,
  Input,
  PasswordContainer,
  TogglePasswordButton,
  formContentVariants,
  togglePasswordVariants,
  resetPasswordLinkVariants,
} from "../../Controller/ProductPage_Styles";

const ResetPassword = ({
  resetEmail,
  setResetEmail,
  newPassword,
  setNewPassword,
  showNewPassword,
  setShowNewPassword,
  showSuccessMessage,
  resetEmailError,
  newPasswordError,
  handleInputFocus,
  handleResetPassword,
  handleBackToLogin,
  handleSubmitNewPassword,
  isResetting,
  resetRateLimitCountdown,
  resetRateLimitMessage,
}) => {
  // Common success message component
  const SuccessMessageComponent = ({ message }) => (
              <SuccessMessage
                layoutId="success-message"
                initial={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  padding: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  marginTop: 14,
                  padding: "13px 24px",
                  transition: {
                    duration: 0.1,
                    ease: [0.32, 0.72, 0, 1],
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  padding: 0,
                  transition: {
                    duration: 0.2,
                    ease: [0.32, 0.72, 0, 1],
                  },
                }}
              >
      {message}
              </SuccessMessage>
  );

  // Common back to login link component
  const BackToLoginLink = () => (
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
  );

  if (!isResetting) {
    return (
      <motion.div
        key="reset-form"
        variants={formContentVariants}
        initial={{ opacity: 0, x: 0 }}
        animate="enter"
        exit="exit"
      >
        <LoginForm onSubmit={handleResetPassword} noValidate>
          <FormGroup className="reset-group">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder={resetEmailError ? "Invalid email" : ""}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              onFocus={() => handleInputFocus("resetEmail")}
              $hasError={resetEmailError}
              required
            />
          </FormGroup>
          <LoginSubmitButton 
            type="submit" 
            disabled={resetRateLimitCountdown > 0}
          >
            {resetRateLimitCountdown > 0 
              ? `Wait ${resetRateLimitCountdown}s` 
              : "Send Password Reset Email"
            }
          </LoginSubmitButton>
          
          {resetRateLimitMessage && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 107, 107, 0.2)'
            }}>
              {resetRateLimitMessage}
            </div>
          )}
          
          <AnimatePresence>
            {showSuccessMessage && (
              <SuccessMessageComponent message="Check your email for a password reset link. Click the link to set your new password." />
            )}
          </AnimatePresence>
          <BackToLoginLink />
        </LoginForm>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="new-password-form"
      variants={formContentVariants}
      initial={{ opacity: 0, x: 0 }}
      animate="enter"
      exit="exit"
    >
      <LoginForm onSubmit={handleSubmitNewPassword} noValidate>
        <FormGroup className="reset-group">
          <Label>New Password</Label>
          <PasswordContainer>
            <Input
              type={showNewPassword ? "text" : "password"}
              placeholder={newPasswordError ? "Minimum 8 characters" : ""}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => handleInputFocus("newPassword")}
              $hasError={newPasswordError}
              required
            />
            <TogglePasswordButton
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              variants={togglePasswordVariants}
              initial="initial"
              whileHover="hover"
            >
              <span>{showNewPassword ? "Hide" : "Show"}</span>
            </TogglePasswordButton>
          </PasswordContainer>
        </FormGroup>
        <LoginSubmitButton type="submit">Set New Password</LoginSubmitButton>
        <AnimatePresence>
          {showSuccessMessage && (
            <SuccessMessageComponent message="Password successfully reset" />
          )}
        </AnimatePresence>
        <BackToLoginLink />
      </LoginForm>
    </motion.div>
  );
};

export default ResetPassword;
