import React from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginModalOverlay from '../Elements/Auth/LoginModalOverlay';
import LoginModal from '../Elements/Auth/LoginModal';
import ResetPassword from '../Elements/Auth/ResetPassword';
import UserDashboard from '../Elements/Auth/UserDashboard';


const AuthenticationWrapper = ({ authState, formState, uiState }) => {
    const { 
      state: { 
        isLoginModalOpen,
        isLoggedIn,
        userEmail,
        userPassword,
        emailError,
        passwordError,
        billingDetails,
        newsletter,
        isEditMode
      },
      setters: authSetters,
      handlers: authHandlers
    } = authState;
  
    const { handlers: uiHandlers } = uiState;
  
    const { 
      state: { 
        isResetPassword,
        showPassword,
        $isSaving
      },
      setters: formSetters,
      handlers: formHandlers // Add this line to extract formHandlers
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
  
        {isLoggedIn && isLoginModalOpen && (
          <UserDashboard 
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
            setIsLoginModalOpen={authSetters.setIsLoginModalOpen}
            $isSaving={$isSaving}
            hasPurchases={false}
          />
        )}
      </>
    );
  };
  
  export default AuthenticationWrapper;