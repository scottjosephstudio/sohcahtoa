import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LoginForm,
  ModalHeader,
  ModalTitleLogin,
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
} from "../../Controller/ProductPage_Styles";

const ResetPassword = ({
  setIsLoginModalOpen,
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
}) => {
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
              hasError={resetEmailError}
              required
            />
          </FormGroup>
          <LoginSubmitButton type="submit">Reset Password</LoginSubmitButton>
          <ResetPasswordLink
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBackToLogin();
            }}
          >
            <span>Back to Login</span>
          </ResetPasswordLink>
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
              hasError={newPasswordError}
              required
            />
            <TogglePasswordButton
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              variants={togglePasswordVariants}
              initial="initial"
              whileHover="hover"
            >
              {showNewPassword ? "Hide" : "Show"}
            </TogglePasswordButton>
          </PasswordContainer>
        </FormGroup>
        <LoginSubmitButton type="submit">Set New Password</LoginSubmitButton>
        <AnimatePresence>
          {showSuccessMessage && (
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
                marginTop: 6,
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
              Password successfully reset
            </SuccessMessage>
          )}
        </AnimatePresence>
        <ResetPasswordLink
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBackToLogin();
          }}
        >
          <span>Back to Login</span>
        </ResetPasswordLink>
      </LoginForm>
    </motion.div>
  );
};

export default ResetPassword;
