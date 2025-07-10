import React from "react";
import { AnimatePresence } from "framer-motion";
import LoginModalOverlay from "../Elements/Auth/LoginModalOverlay";
import LoginModal from "../Elements/Auth/LoginModal";
import ResetPassword from "../Elements/Auth/ResetPassword";
import EnhancedUserDashboard from "../Elements/Auth/EnhancedUserDashboard";

const AuthenticationWrapper = ({ authState, formState, uiState }) => {
  // Basic null checks - the data should now be properly structured
  if (!authState?.state || !formState?.state || !uiState?.handlers) {
    return null;
  }

  const {
    state: {
      isLoginModalOpen,
      isDashboardOpen,
      isLoggedIn,
      userEmail,
      userPassword,
      emailError,
      passwordError,
      billingDetails,
      newsletter,
      isEditMode,
      currentUser,
    },
    setters: authSetters,
    handlers: authHandlers,
  } = authState;

  const { handlers: uiHandlers } = uiState;

  const {
    state: { 
      isResetPassword, 
      showPassword, 
      $isSaving 
    },
    setters: formSetters,
    handlers: formHandlers,
  } = formState;

  return (
    <>
      {isLoginModalOpen && !isLoggedIn && (
        <>
          {!isResetPassword ? (
            <LoginModal
              userEmail={userEmail}
              setUserEmail={authSetters.setUserEmail}
              userPassword={userPassword}
              setUserPassword={authSetters.setUserPassword}
              emailError={emailError}
              passwordError={passwordError}
              handleLoginSubmit={authHandlers.handleLoginSubmit}
              handleInputFocus={authHandlers.handleInputFocus}
              handleModalClick={uiHandlers.handleModalClick}
              handleClose={() => {
                authSetters.setIsLoginModalOpen(false);
                formSetters.setIsResetPassword(false);
                formSetters.setIsResetting(false);
              }}
              formSetters={formSetters}
              formState={formState.state}
            />
          ) : (
            <LoginModal
              handleModalClick={uiHandlers.handleModalClick}
              handleClose={() => {
                authSetters.setIsLoginModalOpen(false);
                formSetters.setIsResetPassword(false);
                formSetters.setIsResetting(false);
              }}
              formState={formState.state}
            >
              <ResetPassword
                setIsLoginModalOpen={authSetters.setIsLoginModalOpen}
                resetEmail={formState.state.resetEmail}
                setResetEmail={formSetters.setResetEmail}
                newPassword={formState.state.newPassword}
                setNewPassword={formSetters.setNewPassword}
                showNewPassword={formState.state.showNewPassword}
                setShowNewPassword={formSetters.setShowNewPassword}
                showSuccessMessage={formState.state.showSuccessMessage}
                resetEmailError={formState.state.resetEmailError}
                newPasswordError={formState.state.newPasswordError}
                handleInputFocus={authHandlers.handleInputFocus}
                handleResetPassword={formHandlers.handleResetPassword}
                handleBackToLogin={() => formSetters.setIsResetPassword(false)}
                handleSubmitNewPassword={formHandlers.handleSubmitNewPassword}
                isResetting={formState.state.isResetting}
              />
            </LoginModal>
          )}
        </>
      )}

      {isLoggedIn && isDashboardOpen && (
        <EnhancedUserDashboard
          userEmail={userEmail}
          setUserEmail={authSetters.setUserEmail}
          userPassword={userPassword}
          setUserPassword={authSetters.setUserPassword}
          showPassword={showPassword}
          setShowPassword={formSetters.setShowPassword}
          billingDetails={billingDetails}
          setBillingDetails={authSetters.setBillingDetails}
          newsletter={newsletter}
          setNewsletter={authSetters.setNewsletter}
          isEditMode={isEditMode}
          setIsEditMode={authSetters.setIsEditMode}
          handleSaveChanges={authHandlers.handleSaveChanges}
          handleLogout={authHandlers.handleLogout}
          handleModalClick={uiHandlers.handleModalClick}
          setIsLoginModalOpen={authSetters.setIsDashboardOpen}
          $isSaving={$isSaving}
          userId={currentUser?.id || currentUser?.dbData?.auth_user_id || null}
        />
      )}
    </>
  );
};

export default AuthenticationWrapper;
