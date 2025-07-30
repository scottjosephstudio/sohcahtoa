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
  fontNormalization,
  typographyBase,
  textDecorationMixin,
} from "../../Controller/ProductPage_Styles";
import styled from "styled-components";

// Animated loading components for login modal
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


  &.email-group {
    margin-top: -8px;
    margin-bottom: -16px;

    @media (max-width: 1200px) {
      margin-top: -8px;
    }
  }

  &.password-group {
    margin-top: 6px;
    margin-bottom: -6px;

    @media (max-width: 1200px) {
      margin-top: 6px;
      margin-bottom: -6px;
    }
  }
`;

const CustomInput = styled.input`
  width: 100%;
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
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
    color: var(--bg-primary);
    background-color: var(--text-primary);
    border: 2px solid ${(props) => (props.$hasError ? "#FF0000" : "#006efe")};
    cursor: pointer;
  }

  &:hover::placeholder {
    color: var(--bg-primary);
  }

  &:-webkit-autofill {
    font-family: "Jant";
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: ${(props) =>
      props.$hasError ? "#FF0000" : "#006efe"};
    -webkit-box-shadow: 0 0 0px 1000px var(--bg-primary) inset;
    transition:
      background-color 0s 600000s,
      color 0.15s ease;
  }

  &:-webkit-autofill:hover {
    -webkit-text-fill-color: var(--bg-primary);
    -webkit-box-shadow: 0 0 0px 1000px var(--text-primary) inset;
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

const CustomLabel = styled.label`
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.8px;
  ${textDecorationMixin}
  color: #f9f9f9;
  margin-top: 0px;
  margin-bottom: 18px;
`;

const CustomLoginSubmitButton = styled(LoginSubmitButton)`
  margin-top: 12px;
  padding: 10px 12px 8px 12px;
`;

const CustomResetPasswordLink = styled(ResetPasswordLink)`
  margin-top: 0px;
`;

const ErrorMessage = styled(motion.div)`
  color: #FF0000;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.6px;
  margin-top: -6px !important;
  margin-bottom: -6px !important;
  text-align: left;
  overflow: hidden;
  
  /* Override form gap spacing */
  position: relative;
  z-index: 1;
`;

const ResendVerificationButton = styled(motion.button)`
  ${fontNormalization}
  ${typographyBase}
  width: 100%;
  padding: 10px 12px 8px 12px;
  border: 2px solid #006efe;
  color: #f9f9f9;
  background-color: #006efe;
  border-radius: 10px;
  margin-top: 8px;
  margin-bottom: 0px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: var(--text-primary);
    border: 2px solid #006efe;
    color: var(--bg-primary);
    cursor: pointer;
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
              layout
              transition={{ 
                layout: { duration: 0.3, ease: "easeInOut" },
                ...loginPanelVariants.visible?.transition 
              }}
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
              layout
              transition={{ 
                layout: { duration: 0.3, ease: "easeInOut" },
                ...loginPanelVariants.visible?.transition 
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (handleModalClick) handleModalClick(e);
              }}
            >
              <ModalHeader>
                <ModalTitleLogin style={{ marginBottom: "24px" }}>
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
                    "Log In"
                  )}
                </CustomLoginSubmitButton>
                
                <AnimatePresence mode="wait">
                {loginError && (
                    <ErrorMessage
                      key="error-message"
                      initial={{ 
                        opacity: 0, 
                        height: 0, 
                        marginTop: 0,
                        marginBottom: 0 
                      }}
                      animate={{ 
                        opacity: 1, 
                        height: "auto", 
                        marginTop: 0,
                        marginBottom: 0
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0, 
                        marginTop: 0,
                        marginBottom: 0 
                      }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeInOut",
                        height: { duration: 0.3 },
                        opacity: { duration: 0.2 }
                      }}
                      layout
                    >
                      {loginError}
                    </ErrorMessage>
                )}
                </AnimatePresence>
                
                <AnimatePresence mode="wait">
                {showResendVerification && (
                  <ResendVerificationButton
                      key="resend-button"
                    type="button"
                      initial={{ 
                        opacity: 0, 
                        height: 0, 
                        marginTop: 0,
                        marginBottom: 0 
                      }}
                      animate={{ 
                        opacity: 1, 
                        height: "auto", 
                        marginTop: 0,
                        marginBottom: 0
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0, 
                        marginTop: 0,
                        marginBottom: 0 
                      }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeInOut",
                        height: { duration: 0.3 },
                        opacity: { duration: 0.2 }
                      }}
                      layout
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleResendVerification();
                    }}
                    disabled={isResendingVerification}
                    whileHover={{ scale: isResendingVerification ? 1 : 1 }}
                    whileTap={{ scale: isResendingVerification ? 1 : 1 }}
                  >
                    {isResendingVerification ? "Sending..." : "Resend Verification Email"}
                  </ResendVerificationButton>
                )}
                </AnimatePresence>
                
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
