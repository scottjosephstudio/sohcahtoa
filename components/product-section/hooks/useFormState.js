import { useState, useEffect } from "react";
import { useUIState } from "./useUIState";
import { getSupabaseClient } from "../../../lib/database/supabaseClient";

export const useFormState = () => {
  const {
    setters: { setIsLoginModalOpen },
  } = useUIState();

  // Password reset states
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  // Add effect to detect when user returns from auth callback with completed password reset
  useEffect(() => {
    const handlePasswordResetComplete = () => {
      console.log('✅ Password reset completed, returning to login');
      // Trigger "Back to Login" behavior
      setIsResetPassword(false);
      setIsResetting(false);
      setResetEmail("");
      setNewPassword("");
      setShowSuccessMessage(false);
      // Reset all errors
      setResetEmailError(false);
      setNewPasswordError(false);
      
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

  const handleInputFocus = (inputType) => {
    switch (inputType) {
      case "email":
        setEmailError(false);
        break;
      case "password":
        setPasswordError(false);
        break;
      case "resetEmail":
        setResetEmailError(false);
        break;
      case "newPassword":
        setNewPasswordError(false);
        break;
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isResetEmailValid = emailRegex.test(resetEmail);

    if (!isResetEmailValid) {
      setResetEmailError(true);
      setResetEmail("");
      return;
    }

    try {
      // Don't set isResetting to true here - that should only happen when user clicks email link
      setResetEmailError(false);
      
      console.log('🔄 Starting password reset for email:', resetEmail);
      
      // Use Supabase's resetPasswordForEmail to send the reset email
      const supabase = getSupabaseClient();
      
      // Test Supabase connection first
      console.log('🔍 Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase.auth.getSession();
      console.log('📊 Supabase connection test:', { 
        hasSession: !!testData?.session, 
        hasError: !!testError,
        errorMessage: testError?.message 
      });
      
      const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/auth/callback`;
      console.log('🔗 Using redirect URL:', redirectTo);
      console.log('🔧 Environment check:', {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'undefined'
      });
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectTo
      });

      console.log('📊 Password reset response:', { 
        hasData: !!data, 
        hasError: !!error, 
        errorMessage: error?.message 
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        
        // Try fallback using API route
        console.log('🔄 Trying fallback with API route...');
        try {
          const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: resetEmail })
          });

          if (response.ok) {
            console.log('✅ Password reset email sent via API route');
            setShowSuccessMessage(true);
            // Remove timeout - let success message stay until password reset is completed
          } else {
            const errorData = await response.json();
            console.error('❌ API route also failed:', errorData);
            setResetEmailError(true);
            setResetEmail("");
          }
        } catch (apiError) {
          console.error('❌ API route exception:', apiError);
          setResetEmailError(true);
          setResetEmail("");
        }
      } else {
        console.log('✅ Password reset email sent successfully');
        // Show success message telling user to check their email
        setShowSuccessMessage(true);
        
        // Keep the modal open and show message to check email
        // The user will click the link in their email, which opens the auth callback
        // The auth callback will handle the password reset and return them to login
        // Success message will stay visible until password reset is completed
      }
    } catch (error) {
      console.error('❌ Password reset exception:', error);
      setResetEmailError(true);
      setResetEmail("");
    }
  };

  const handleBackToLogin = () => {
    setIsResetPassword(false);
    setIsResetting(false);
    setResetEmail("");
    setNewPassword("");
    setShowSuccessMessage(false);
    // Reset all errors
    setResetEmailError(false);
    setNewPasswordError(false);
  };

  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    const isNewPasswordValid = newPassword.length >= 8;

    if (!isNewPasswordValid) {
      setNewPasswordError(true);
      setNewPassword("");
      return;
    }

    try {
      setIsResetting(true);
      
      // Use the API route for updating the password
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        setNewPasswordError(false);
        setIsSuccessTimeout(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
          setIsResetting(false);
          setIsResetPassword(false);
          setResetEmail("");
          setNewPassword("");
          if (isSuccessTimeout) {
            setIsLoginModalOpen(false);
          }
          setIsSuccessTimeout(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Password update error:', errorData);
        setNewPasswordError(true);
        setNewPassword("");
      }
    } catch (error) {
      console.error('Password update exception:', error);
      setNewPasswordError(true);
      setNewPassword("");
    } finally {
      setIsResetting(false);
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
      $isSaving,
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
      set$isSaving,
    },
    handlers: {
      handleResetPassword,
      handleBackToLogin,
      handleSubmitNewPassword,
      handleInputFocus,
    },
  };
};

export default useFormState;
