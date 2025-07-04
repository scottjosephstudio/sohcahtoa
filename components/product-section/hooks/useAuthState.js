// useAuthState.js
import { useState, useEffect, useCallback } from 'react';
import { isUserAuthenticated, loginUser, logoutUser } from '../../cart/Utils/authUtils';

export const useAuthState = () => {
  // Authentication states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Password Reset states
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [resetEmailError, setResetEmailError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [isSuccessTimeout, setIsSuccessTimeout] = useState(false);

  // Dashboard states
  const [$isSaving, set$isSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [hasPurchases, setHasPurchases] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    street: '',
    city: '',
    postcode: '',
    country: ''
  });

  // Centralized authentication check and setup
  const checkAndSetupAuthentication = useCallback(() => {
    const wasAuthenticated = isUserAuthenticated();
    setIsAuthenticated(wasAuthenticated);
    setIsLoggedIn(wasAuthenticated);

    if (wasAuthenticated && typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('userEmail');
      const savedPassword = localStorage.getItem('userPassword');
      
      if (savedEmail && savedPassword) {
        setUserEmail(savedEmail);
        setUserPassword(savedPassword);
      }
    }
  }, []);

  // Initial authentication check
  useEffect(() => {
    checkAndSetupAuthentication();
  }, [checkAndSetupAuthentication]);

  // Authentication state change listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAuthChange = (event) => {
      const { isAuthenticated, email, password } = event.detail;
      
      setIsAuthenticated(isAuthenticated);
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated) {
        setUserEmail(email);
        setUserPassword(password);
        setIsLoginModalOpen(false);
      } else {
        setUserEmail('');
        setUserPassword('');
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener('authStateChange', handleAuthChange);
    return () => window.removeEventListener('authStateChange', handleAuthChange);
  }, []);

  // Load saved billing and newsletter details
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedDetails = localStorage.getItem('billingDetails');
    const savedNewsletter = localStorage.getItem('newsletterPreference');
    
    if (savedDetails) {
      setBillingDetails(JSON.parse(savedDetails));
    }
    if (savedNewsletter) {
      setNewsletter(JSON.parse(savedNewsletter));
    }
  }, []);

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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const isEmailValid = userEmail === 'info@scottpauljoseph.com';
    const isPasswordValid = userPassword === 'Hybrid1983';
    
    if (!isEmailValid) {
      setEmailError(true);
      setUserEmail('');
    }
    if (!isPasswordValid) {
      setPasswordError(true);
      setUserPassword('');
    }
    
    if (isEmailValid && isPasswordValid && typeof window !== 'undefined') {
      loginUser({ email: userEmail });
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      setIsAuthenticated(true);
      setUserEmail('info@scottpauljoseph.com');
      setUserPassword('Hybrid1983');
      localStorage.setItem('userEmail', 'info@scottpauljoseph.com');
      localStorage.setItem('userPassword', 'Hybrid1983');
    }
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
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

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setIsLoginModalOpen(false);
    setUserPassword('');
    setIsAuthenticated(false);
    
    if (isEditMode && typeof window !== 'undefined') {
      const savedDetails = localStorage.getItem('billingDetails');
      const savedNewsletter = localStorage.getItem('newsletterPreference');
      
      if (savedDetails) {
        setBillingDetails(JSON.parse(savedDetails));
      }
      if (savedNewsletter) {
        setNewsletter(JSON.parse(savedNewsletter));
      }
    }
    setIsEditMode(false);
  };

  const handleSaveChanges = () => {
    if (isEditMode && typeof window !== 'undefined') {
      set$isSaving(true);
      localStorage.setItem('billingDetails', JSON.stringify(billingDetails));
      localStorage.setItem('newsletterPreference', JSON.stringify(newsletter));
      setIsEditMode(false);
      set$isSaving(false);
    } else {
      setIsEditMode(true);
    }
  };

  const handleUpdateBillingDetailsFromRegistration = (registrationData) => {
    const newBillingDetails = {
      street: registrationData.street,
      city: registrationData.city,
      postcode: registrationData.postcode,
      country: registrationData.country
    };
    setBillingDetails(newBillingDetails);
    if (typeof window !== 'undefined') {
      localStorage.setItem('billingDetails', JSON.stringify(newBillingDetails));
    }
  };

  return {
    state: {
      isLoginModalOpen,
      isLoggedIn,
      isAuthenticated,
      userEmail,
      userPassword,
      showPassword,
      emailError,
      passwordError,
      isResetPassword,
      isResetting,
      resetEmail,
      newPassword,
      showNewPassword,
      showSuccessMessage,
      resetEmailError,
      newPasswordError,
      isSuccessTimeout,
      $isSaving,
      isEditMode,
      newsletter,
      hasPurchases,
      billingDetails
    },
    setters: {
      setIsLoginModalOpen,
      setIsLoggedIn,
      setUserEmail,
      setUserPassword,
      setShowPassword,
      setEmailError,
      setPasswordError,
      setIsResetPassword,
      setIsResetting,
      setResetEmail,
      setNewPassword,
      setShowNewPassword,
      setShowSuccessMessage,
      setResetEmailError,
      setNewPasswordError,
      setIsSuccessTimeout,
      set$isSaving,
      setIsEditMode,
      setNewsletter,
      setHasPurchases,
      setBillingDetails
    },
    handlers: {
      handleInputFocus,
      handleLoginClick,
      handleLoginSubmit,
      handleResetPassword,
      handleBackToLogin,
      handleSubmitNewPassword,
      handleLogout,
      handleSaveChanges,
      handleUpdateBillingDetailsFromRegistration
    }
  };
};