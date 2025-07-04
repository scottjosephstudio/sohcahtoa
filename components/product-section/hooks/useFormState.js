import { useState } from 'react';
import { useUIState } from './useUIState';

export const useFormState = () => {
  const { setters: { setIsLoginModalOpen } } = useUIState();

  // Password reset states
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSuccessTimeout, setIsSuccessTimeout] = useState(false);
  const [$isSaving, set$isSaving] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [resetEmailError, setResetEmailError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);

  const handleInputFocus = (inputType) => {
    switch (inputType) {
      case 'email':
        setEmailError(false);
        break;
      case 'password':
        setPasswordError(false);
        break;
      case 'resetEmail':
        setResetEmailError(false);
        break;
      case 'newPassword':
        setNewPasswordError(false);
        break;
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    const isResetEmailValid = resetEmail === 'info@scottpauljoseph.com';

    if (!isResetEmailValid) {
      setResetEmailError(true);
      setResetEmail('');
    } else {
      setIsResetting(true);
      setResetEmailError(false);
    }
  };

  const handleBackToLogin = () => {
    setIsResetPassword(false);
    setIsResetting(false);
    setResetEmail('');
    setNewPassword('');
  };

  const handleSubmitNewPassword = (e) => {
    e.preventDefault();
    const isNewPasswordValid = newPassword.length >= 8;
  
    if (!isNewPasswordValid) {
      setNewPasswordError(true);
      setNewPassword('');
    } else {
      setShowSuccessMessage(true);
      setNewPasswordError(false);
      setIsSuccessTimeout(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsResetting(false);
        setIsResetPassword(false);
        setResetEmail('');
        setNewPassword('');
        if (isSuccessTimeout) {
          setIsLoginModalOpen(false);
        }
        setIsSuccessTimeout(false);
      }, 10000);
    }
  };

  return {
    state: {
      isResetPassword,
      isResetting,
      resetEmail,
      newPassword,
      showNewPassword,
      showPassword,
      showSuccessMessage,
      isSuccessTimeout,
      emailError,
      passwordError,
      resetEmailError,
      newPasswordError,
      $isSaving
    },
    setters: {
      setIsResetPassword,
      setIsResetting,
      setResetEmail,
      setNewPassword,
      setShowNewPassword,
      setShowPassword,
      setShowSuccessMessage,
      setIsSuccessTimeout,
      setEmailError,
      setPasswordError,
      setResetEmailError,
      setNewPasswordError,
      set$isSaving
    },
    handlers: {
      handleResetPassword,
      handleBackToLogin,
      handleSubmitNewPassword,
      handleInputFocus
    }
  };
};

export default useFormState;