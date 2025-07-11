import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "../../../providers/Portal";
import { usePortal } from "../../../../context/PortalContext";
import {
  LoginModal as LoginModalContainer,
  SimpleLoginPanel,
  ModalHeader,
  ModalTitleLogin,
  LoginSubmitButton,
  ResetPasswordLink,
  Label,
  TogglePasswordButton,
  loginPanelVariants,
  formContentVariants,
  togglePasswordVariants,
  resetPasswordLinkVariants,
} from "../../Controller/ProductPage_Styles";
import styled from "styled-components";

// Custom styled components with bespoke spacing
const CustomLoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CustomFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
  gap: 12px;

  &.email-group {
    margin-top: -8px;
    margin-bottom: -16px;

    @media (max-width: 1200px) {
      margin-top: -8px;
    }
  }

  &.password-group {
    margin-top: 6px;
    margin-bottom: -16px;

    @media (max-width: 1200px) {
      margin-top: 6px;
      margin-bottom: -16px;
    }
  }
`;

const CustomInput = styled.input`
  width: 100%;
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
  margin-bottom: 0px;
  color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  background-color: #f9f9f9;
  border: 2px solid ${(props) => (props.$hasError ? "#FF0000" : "#f9f9f9;")};
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
  position: relative;
  z-index: ${(props) => (props.$hasError ? "502" : "1")};
  font-family: "Jant", sans-serif;
  font-size: 20px;
  line-height: 24px !important;
  letter-spacing: 0.8px;

  @media (min-width: 1420px) {
    font-family: "Jant", sans-serif;
    font-size: 20px;
    line-height: 24px !important;
    letter-spacing: 0.8px;
  }

  &::placeholder {
    color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    transition: color 0.15s ease;
  }

  &:hover {
    color: #f9f9f9;
    background-color: rgb(16, 12, 8);
    border: 2px solid ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    cursor: pointer;
  }

  &:hover::placeholder {
    color: #f9f9f9;
  }

  &:-webkit-autofill {
    font-family: "Jant";
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: ${(props) =>
      props.$hasError ? "#FF0000" : "#006efe"};
    -webkit-box-shadow: 0 0 0px 1000px #f9f9f9 inset;
    transition:
      background-color 0s 600000s,
      color 0.15s ease;
  }

  &:-webkit-autofill:hover {
    -webkit-text-fill-color: #f9f9f9;
    -webkit-box-shadow: 0 0 0px 1000px rgb(16, 12, 8) inset;
  }

  &:focus {
    color: ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    border: 2px solid ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
  }
`;

const CustomPasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const CustomLabel = styled(Label)`
  margin-top: 0px;
  margin-bottom: 8px;
`;

const CustomLoginSubmitButton = styled(LoginSubmitButton)`
  margin-top: 12px;
  padding: 10px 12px 8px 12px;
`;

const CustomResetPasswordLink = styled(ResetPasswordLink)`
  margin-top: 0px;
`;

const ErrorMessage = styled.div`
  color: #FF0000;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.6px;
  margin-top: 0px;
  margin-bottom:0px;
  text-align: left;
`;

const ResendVerificationButton = styled(motion.button)`
  background: #006efe;
  color: white;
  border: none;

    padding: 12px 12px 12px 12px;
  border: 2px solid #006efe;
  border-radius: 10px;
  font-size: 20px;
  letter-spacing: 0.8px
  cursor: pointer;
  margin-top: 0px;
  margin-bottom: 0px;
  
  &:hover {
    background: #0056cc;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

// Backdrop overlay component
const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(211, 211, 211, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 900;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: auto !important;

  /* Prevent mobile layout shifts and scrolling issues */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  /* Ensure fixed positioning on mobile */
  @media (max-width: 768px) {
    position: fixed;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
  }

  .slot-machine-container {
    backdrop-filter: blur(0) !important;
    -webkit-backdrop-filter: blur(0) !important;
  }
`;

const LoginModal = ({
  userEmail,
  setUserEmail,
  userPassword,
  setUserPassword,
  emailError,
  passwordError,
  loginError,
  isLoggingIn,
  showResendVerification,
  isResendingVerification,
  handleResendVerification,
  handleLoginSubmit,
  handleInputFocus,
  handleModalClick,
  handleClose,
  formSetters,
  formState,
  children,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const { setIsModalOpen, zIndex } = usePortal();

  useEffect(() => {
    setIsModalOpen(true);
    return () => setIsModalOpen(false);
  }, [setIsModalOpen]);

  const handleBackdropClick = () => {
    setIsClosing(true);
    // Delay the actual close to allow exit animation
    setTimeout(() => {
      if (handleClose) {
        handleClose();
      }
      if (formSetters) {
        formSetters.setIsResetPassword(false);
        formSetters.setIsResetting(false);
      }
    }, 200);
  };

  const modalContent = (
    <>
      <Backdrop
        initial={{ opacity: 0 }}
        animate={isClosing ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onClick={handleBackdropClick}
      />

      <LoginModalContainer style={{ zIndex: zIndex?.modal || 920 }}>
        <AnimatePresence mode="wait">
          {children ? (
            <SimpleLoginPanel
              key="reset-panel"
              variants={loginPanelVariants}
              initial="hidden"
              animate={isClosing ? "exit" : "visible"}
              exit="exit"
              onClick={(e) => {
                e.stopPropagation();
                if (handleModalClick) handleModalClick(e);
              }}
            >
              <ModalHeader>
                <ModalTitleLogin style={{ marginBottom: "20px" }}>
                  {formState?.isResetPassword
                    ? formState?.isResetting
                      ? "Set New Password"
                      : "Reset Password"
                    : "Log In"}
                </ModalTitleLogin>
              </ModalHeader>
              {children}
            </SimpleLoginPanel>
          ) : (
            <SimpleLoginPanel
              key="login-panel"
              variants={loginPanelVariants}
              initial="hidden"
              animate={isClosing ? "exit" : "visible"}
              exit="exit"
              onClick={(e) => {
                e.stopPropagation();
                if (handleModalClick) handleModalClick(e);
              }}
            >
              <ModalHeader>
                <ModalTitleLogin style={{ marginBottom: "20px" }}>
                  Log In
                </ModalTitleLogin>
              </ModalHeader>
              <CustomLoginForm
                onSubmit={(e) => {
                  e.stopPropagation();
                  if (handleLoginSubmit) handleLoginSubmit(e);
                }}
                noValidate
              >
                <CustomFormGroup className="email-group">
                  <CustomLabel>Email</CustomLabel>
                  <CustomInput
                    type="email"
                    placeholder={emailError ? "Invalid email" : ""}
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    onFocus={() => handleInputFocus("email")}
                    $hasError={emailError}
                    required
                    onClick={(e) => e.stopPropagation()}
                  />
                </CustomFormGroup>
                <CustomFormGroup className="password-group">
                  <CustomLabel>Password</CustomLabel>
                  <CustomPasswordContainer>
                    <CustomInput
                      type={showPassword ? "text" : "password"}
                      placeholder={passwordError ? "Invalid password" : ""}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      onFocus={() => handleInputFocus("password")}
                      $hasError={passwordError}
                      required
                      onClick={(e) => e.stopPropagation()}
                    />
                    <TogglePasswordButton
                      type="button"
                      style={{ right: "16px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassword(!showPassword);
                      }}
                      variants={togglePasswordVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </TogglePasswordButton>
                  </CustomPasswordContainer>
                </CustomFormGroup>
                <CustomLoginSubmitButton
                  type="submit"
                  onClick={(e) => e.stopPropagation()}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Logging in..." : "Log In"}
                </CustomLoginSubmitButton>
                
                {loginError && (
                  <ErrorMessage>{loginError}</ErrorMessage>
                )}
                
                {showResendVerification && (
                  <ResendVerificationButton
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleResendVerification();
                    }}
                    disabled={isResendingVerification}
                    whileHover={{ scale: isResendingVerification ? 1 : 1.02 }}
                    whileTap={{ scale: isResendingVerification ? 1 : 0.98 }}
                  >
                    {isResendingVerification ? "Sending..." : "Resend Verification Email"}
                  </ResendVerificationButton>
                )}
                
                <CustomResetPasswordLink
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    formSetters.setIsResetPassword(true);
                  }}
                  variants={resetPasswordLinkVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  <span>Reset Password</span>
                </CustomResetPasswordLink>
              </CustomLoginForm>
            </SimpleLoginPanel>
          )}
        </AnimatePresence>
      </LoginModalContainer>
    </>
  );

  return <Portal>{modalContent}</Portal>;
};

export default LoginModal;
