'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/database/supabaseClient';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthCallbackUrl, logEnvironmentInfo } from '../../../lib/authRedirectUtils';

// Page background container
const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 20px 20px;
  overflow-x: hidden;
  background-color: #f9f9f9;

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.2;
    mix-blend-mode: multiply;
    z-index: -1;
    pointer-events: none;
  }
`;

const LoginModalOverlay = styled(motion.div)`
  position: fixed;
  padding-left: 20px;
  padding-right: 20px;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  cursor: default;
`;

const SimpleLoginPanel = styled(motion.div)`
  background: rgb(16, 12, 8);
  color: white;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  max-height: 70.25vh;
  padding: 24px;
  padding-bottom: 32px;
  margin: 0px;
  box-shadow: 10px 10px 15px rgba(0, 0, 0, 0.8);
  pointer-events: auto;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  transition: height 0.3s ease;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ModalTitleLogin = styled.div`
  font-size: 16px;
  line-height: 20px !important;
  letter-spacing: 0.8px;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  color: white;
  margin-top: 0px;
  margin-bottom: 24px;
  display: block;
`;

const ContentWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusMessage = styled(motion.p)`
  font-size: 16px;
  line-height: 20px !important;
  letter-spacing: 0.8px;
  color: white;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  background: #006efe;
  color: white;
  border: none;
  padding: 10px 12px 8px 12px;
    border: 2px solid #006efe;
  border-radius: 10px;
  font-size: 20px;
  line-height: 24px !important;
  letter-spacing: 0.8px;
  font-weight: normal;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgb(16, 12, 8);
        border: 2px solid #006efe;
    color: white;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 10px 12px 8px 12px;
  border-radius: 10px;
  margin-bottom: 26px;
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

const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const TogglePasswordButton = styled(motion.button)`
  position: absolute;
  right: 12px;
  top: 35%;
  transform: translateY(-50%);
  background: none;
  border: none;
  outline: none;
  color: #006efe;
  cursor: pointer;
  font-size: 20px;
  letter-spacing: 0.8px;
  line-height: 24px;
  padding: 0;
  z-index: 501;
  pointer-events: auto;
  opacity: 1;

  
`;

// Toggle password button animation variants
const togglePasswordVariants = {
  initial: {
    color: "#006efe",
  },
  hover: {
    color: "rgb(16, 12, 8)",
    transition: { duration: 0.2 },
  },
};

// Enhanced button animation variants with subtle hover effects
const buttonVariants = {
  initial: { 
    scale: 1,
    opacity: 1
  },
  hover: { 
    scale: 1,
    opacity: 0.9,
    transition: { 
      duration: 0.2, 
      ease: "easeOut" 
    }
  },
  tap: { 
    scale: 1,
    opacity: 0.8,
    transition: { 
      duration: 0.1, 
      ease: "easeOut" 
    }
  }
};

// Enhanced content animation variants for smoother expansion/collapse
const contentVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.25,
      ease: "easeInOut",
      opacity: { duration: 0.15 }
    }
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.25,
      ease: "easeInOut",
      opacity: { duration: 0.15, delay: 0.1 }
    }
  }
};

// Status message animation variants
const statusMessageVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      delay: 0.1
    }
  }
};

// Animated Spinner component
const Spinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #006efe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const spinnerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3
    }
  }
};

const loginPanelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
    },
  hover: {
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export default function UnifiedVerification() {
  return (
    <PageContainer>
      <div className="fixed inset-0 flex items-center justify-center">
        <LoginModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SimpleLoginPanel
            variants={loginPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover="hover"
            layout
          >
            <ModalTitleLogin>Authentication</ModalTitleLogin>
            <Suspense
              fallback={
                <ContentWrapper>
                  <Spinner />
                  <StatusMessage>Processing...</StatusMessage>
                </ContentWrapper>
              }
            >
              <VerificationContent />
            </Suspense>
          </SimpleLoginPanel>
        </LoginModalOverlay>
      </div>
    </PageContainer>
  );
}

// Inner component that uses searchParams
function VerificationContent() {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Processing your request...");
  const [showSpinner, setShowSpinner] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Log environment info for debugging
  useEffect(() => {
    logEnvironmentInfo();
  }, []);

  // Get parameters for both verification methods
  const code = searchParams.get("code");  // OAuth callback
  const token = searchParams.get("token"); // Direct email verification
  const email = searchParams.get("email"); // Direct email verification
  const type = searchParams.get("type"); // Password reset type
  
  // Additional parameters that might be used for password reset
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const tokenHash = searchParams.get("token_hash");
  const tokenType = searchParams.get("token_type");
  
  // Check for error parameters from Supabase
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  // Also check hash fragment parameters (Supabase sometimes uses these)
  const [hashParams, setHashParams] = useState({});
  const verificationRunRef = useRef(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1); // Remove the #
      const params = new URLSearchParams(hash);
      const hashParamObj = Object.fromEntries(params.entries());
      setHashParams(hashParamObj);
      
      console.log('🔍 Hash fragment parameters:', hashParamObj);
      console.log('🔍 Raw hash:', hash);
      console.log('🔍 Access token from hash:', hashParamObj.access_token ? 'Present' : 'Missing');
    }
  }, []);

  // Combine query params and hash params, with query params taking precedence
  const finalCode = code || hashParams.code;
  const finalToken = token || hashParams.token;
  const finalEmail = email || hashParams.email;
  const finalType = type || hashParams.type;
  const finalAccessToken = accessToken || hashParams.access_token;
  const finalRefreshToken = refreshToken || hashParams.refresh_token;
  const finalTokenHash = tokenHash || hashParams.token_hash;
  const finalTokenType = tokenType || hashParams.token_type;
  const finalError = error || hashParams.error;
  const finalErrorCode = errorCode || hashParams.error_code;
  const finalErrorDescription = errorDescription || hashParams.error_description;

  // Debug: Log all URL parameters
  console.log('🔍 URL Parameters:', {
    code: finalCode,
    token: finalToken,
    email: finalEmail,
    type: finalType,
    accessToken: finalAccessToken,
    refreshToken: finalRefreshToken,
    tokenHash: finalTokenHash,
    tokenType: finalTokenType,
    error: finalError,
    errorCode: finalErrorCode,
    errorDescription: finalErrorDescription,
    allParams: Object.fromEntries(searchParams.entries())
  });

  // Also log the full URL for debugging
  if (typeof window !== 'undefined') {
    console.log('🔗 Full URL:', window.location.href);
  }

  useEffect(() => {
    const handleVerification = async () => {
      // Prevent multiple verification runs
      if (verificationRunRef.current) {
        console.log('🔄 Verification already run, skipping...');
        return;
      }
      
      try {
        verificationRunRef.current = true;
        
        console.log('🔍 Starting verification process with parameters:', {
          code: !!finalCode,
          token: !!finalToken,
          email: finalEmail,
          type: finalType,
          accessToken: !!finalAccessToken,
          refreshToken: !!finalRefreshToken,
          error: finalError,
          errorCode: finalErrorCode,
          errorDescription: finalErrorDescription
        });
        
        // Debug: Check the specific condition for signup with access token
        console.log('🔍 Signup with access token check:', {
          hasAccessToken: !!finalAccessToken,
          type: finalType,
          condition: finalAccessToken && finalType === 'signup',
          accessTokenLength: finalAccessToken?.length
        });
        
        // First check if there's an error in the URL parameters
        if (finalError) {
          console.error('❌ Auth callback error:', { error: finalError, errorCode: finalErrorCode, errorDescription: finalErrorDescription });
          setStatus("error");
          setShowSpinner(false);
          
          if (finalErrorCode === 'otp_expired' || finalError === 'access_denied') {
            setMessage("This link has expired. Please request a new one from the cart.");
          } else if (finalErrorCode === 'invalid_request') {
            setMessage("Invalid link. Please check your email and try again.");
          } else {
            setMessage(finalErrorDescription || "Authentication failed. Please try again or contact support.");
          }
          return;
        }
        
        // Determine which authentication method to use
        if (finalType === 'recovery') {
          console.log('🔄 Processing as password reset flow');
          // Password reset flow - try to handle with or without code
          await handlePasswordReset(finalCode, finalEmail);
        } else if (finalAccessToken && finalType === 'signup') {
          console.log('🔄 Processing as successful email verification with access token');
          // Successful email verification with access token in hash fragment
          await handleSuccessfulVerificationWithToken(finalAccessToken, finalRefreshToken);
        } else if (finalCode && !finalType) {
          console.log('🔄 Processing as OAuth callback verification (regular email verification)');
          // OAuth callback verification (regular email verification)
          await handleOAuthCallback(finalCode);
        } else if (finalToken && finalEmail && !finalType) {
          console.log('🔄 Processing as direct email verification (regular email verification)');
          // Direct email verification (regular email verification)
          await handleDirectEmailVerification(finalToken, finalEmail);
        } else if (finalCode) {
          console.log('🔄 Processing as fallback OAuth callback (any code without type)');
          // Fallback: any code without type might be OAuth
          await handleOAuthCallback(finalCode);
        } else {
          console.log('❌ No valid parameters found for any verification method');
          // No valid parameters found
          setStatus("error");
          setMessage("Invalid link. Please check your email and try again.");
          setShowSpinner(false);
        }
      } catch (error) {
        console.error('Authentication process error:', error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again or contact support.");
        setShowSpinner(false);
      }
    };

    // Only run verification if we have some parameters to work with
    if (finalCode || finalToken || finalEmail || finalType || finalAccessToken || finalRefreshToken || finalTokenHash || finalError) {
      handleVerification();
    }
  }, [hashParams]); // Only depend on hashParams to avoid dependency array issues

  const handlePasswordReset = async (code, email) => {
    console.log('🔄 Processing password reset for:', email);
    console.log('🔗 Password reset code:', code);
    console.log('🔗 Token hash:', finalTokenHash);
    
    try {
      const supabase = getSupabaseClient();
      
      // If we have a token hash, try to use verifyOtp first
      if (finalTokenHash) {
        console.log('🔄 Attempting verifyOtp with token hash...');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: finalTokenHash,
          type: 'recovery'
        });
        
        if (error) {
          console.error('❌ Token hash verification error:', error);
          setStatus("error");
          setMessage("This password reset link has expired. Please request a new one from the cart.");
          setShowSpinner(false);
          return;
        }
        
        if (data?.user) {
          console.log('✅ Token hash verification successful - user authenticated for password reset only');
          
          // IMMEDIATELY sign out to prevent session access
          await supabase.auth.signOut();
          console.log('🔒 Signed out immediately after token verification to prevent session access');
          
          // Notify the main app that user should be signed out
          if (typeof window !== 'undefined') {
            const signOutEvent = new CustomEvent("forceSignOut", {
              detail: { 
                reason: 'password_reset_verification',
                message: 'Signed out for password reset'
              },
            });
            window.dispatchEvent(signOutEvent);
          }
          
          // Store the user temporarily for password reset only (NO SESSION CREATED)
          if (typeof window !== 'undefined') {
            window.tempPasswordResetUser = data.user;
            window.isPasswordResetMode = true;
            
            // Notify the main app that we're in password reset mode
            const passwordResetModeEvent = new CustomEvent("passwordResetMode", {
              detail: { 
                isActive: true,
                user: data.user
              },
            });
            window.dispatchEvent(passwordResetModeEvent);
          }
          
          setIsPasswordReset(true);
          setStatus("password-reset");
          setMessage("Please enter your new password:");
          setShowSpinner(false);
          return;
        }
      }
      
      // If we have a code, try to verify it without creating a session
      if (code) {
        console.log('🔄 Attempting to verify recovery code without creating session...');
        
        // For password reset, we need to verify the code but not create a session
        // We'll use a different approach - verify the code and get user info
        const { data, error } = await supabase.auth.verifyOtp({
          email: email,
          token: code,
          type: 'recovery'
        });
        
        if (error) {
          console.error('❌ Recovery code verification error:', error);
          setStatus("error");
          setMessage("This password reset link has expired. Please request a new one from the cart.");
          setShowSpinner(false);
          return;
        }
        
        if (data?.user) {
          console.log('✅ Recovery code verification successful');
          
          // IMMEDIATELY sign out to prevent session access
          await supabase.auth.signOut();
          console.log('🔒 Signed out immediately after code verification to prevent session access');
          
          // Notify the main app that user should be signed out
          if (typeof window !== 'undefined') {
            const signOutEvent = new CustomEvent("forceSignOut", {
              detail: { 
                reason: 'password_reset_verification',
                message: 'Signed out for password reset'
              },
            });
            window.dispatchEvent(signOutEvent);
          }
          
          // Store the user temporarily for password reset only (NO SESSION CREATED)
          if (typeof window !== 'undefined') {
            window.tempPasswordResetUser = data.user;
            window.isPasswordResetMode = true;
            
            // Notify the main app that we're in password reset mode
            const passwordResetModeEvent = new CustomEvent("passwordResetMode", {
              detail: { 
                isActive: true,
                user: data.user
              },
            });
            window.dispatchEvent(passwordResetModeEvent);
          }
          
          setIsPasswordReset(true);
          setStatus("password-reset");
          setMessage("Please enter your new password:");
          setShowSpinner(false);
          return;
        }
      }
      
      // If we get here without successful authentication
      console.error('❌ No valid authentication for password reset');
      setStatus("error");
      setMessage("Unable to authenticate for password reset. Please request a new reset link.");
      setShowSpinner(false);
      
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setStatus("error");
      setMessage("Password reset failed. The link may have expired. Please try requesting a new one.");
      setShowSpinner(false);
    }
  };

  const handlePasswordResetWithTokens = async (accessToken, refreshToken) => {
    console.log('🔄 Processing password reset with tokens for:', email);
    console.log('🔗 Access Token:', accessToken);
    console.log('🔗 Refresh Token:', refreshToken);

    try {
      const supabase = getSupabaseClient();
      
      // For password reset, we need to verify without creating a session
      // We'll use a different approach - verify the token and get user info
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: accessToken,
        type: 'recovery'
      });

      if (error) {
        console.error('❌ Password reset with tokens error:', error);
        setStatus("error");
        setMessage("Password reset failed with tokens. Please try requesting a new one.");
        setShowSpinner(false);
        return;
      }

      if (data?.user) {
        console.log('✅ Password reset with tokens successful');
        
        // IMMEDIATELY sign out to prevent session access
        await supabase.auth.signOut();
        console.log('🔒 Signed out immediately after token verification to prevent session access');
        
        // Notify the main app that user should be signed out
        if (typeof window !== 'undefined') {
          const signOutEvent = new CustomEvent("forceSignOut", {
            detail: { 
              reason: 'password_reset_verification',
              message: 'Signed out for password reset'
            },
          });
          window.dispatchEvent(signOutEvent);
        }
        
        setIsPasswordReset(true);
        setStatus("password-reset");
        setMessage("Please enter your new password:");
        setShowSpinner(false);
        
        // Store the user temporarily for password update (NO SESSION CREATED)
        if (typeof window !== 'undefined') {
          window.tempPasswordResetUser = data.user;
          window.isPasswordResetMode = true;
        }
      } else {
        throw new Error('No user data returned from password reset with tokens');
      }
    } catch (error) {
      console.error('❌ Password reset with tokens error:', error);
      setStatus("error");
      setMessage("Password reset failed with tokens. Please try requesting a new one.");
      setShowSpinner(false);
    }
  };

  const handlePasswordResetWithTokenHash = async (tokenHash, email) => {
    console.log('🔄 Processing password reset with token hash for:', email);
    console.log('🔗 Token Hash:', tokenHash);

    try {
      const supabase = getSupabaseClient();
      
      // For password reset, we need to verify without creating a session
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      });

      if (error) {
        console.error('❌ Password reset with token hash error:', error);
        setStatus("error");
        setMessage("Password reset failed with token hash. Please try requesting a new one.");
        setShowSpinner(false);
        return;
      }

      if (data?.user) {
        console.log('✅ Password reset with token hash successful');
        
        // IMMEDIATELY sign out to prevent session access
        await supabase.auth.signOut();
        console.log('🔒 Signed out immediately after token hash verification to prevent session access');
        
        // Notify the main app that user should be signed out
        if (typeof window !== 'undefined') {
          const signOutEvent = new CustomEvent("forceSignOut", {
            detail: { 
              reason: 'password_reset_verification',
              message: 'Signed out for password reset'
            },
          });
          window.dispatchEvent(signOutEvent);
        }
        
        setIsPasswordReset(true);
        setStatus("password-reset");
        setMessage("Please enter your new password:");
        setShowSpinner(false);
        
        // Store the user temporarily for password update (NO SESSION CREATED)
        if (typeof window !== 'undefined') {
          window.tempPasswordResetUser = data.user;
          window.isPasswordResetMode = true;
        }
      } else {
        throw new Error('No user data returned from password reset with token hash');
      }
    } catch (error) {
      console.error('❌ Password reset with token hash error:', error);
      setStatus("error");
      setMessage("Password reset failed with token hash. Please try requesting a new one.");
      setShowSpinner(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setPasswordError(true);
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(false);

    try {
      const supabase = getSupabaseClient();
      
      // Check if we're in password reset mode
      const isPasswordResetMode = typeof window !== 'undefined' ? window.isPasswordResetMode : false;
      const tempUser = typeof window !== 'undefined' ? window.tempPasswordResetUser : null;
      
      console.log('🔍 Password update - Mode check:', {
        isPasswordResetMode,
        hasTempUser: !!tempUser,
        tempUserEmail: tempUser?.email
      });
      
      // For password reset, we should have a temp user but no session
      if (!tempUser) {
        console.error('❌ No temp user for password update');
        setStatus("error");
        setMessage("Session expired. Please request a new password reset link.");
        return;
      }
      
      // Update the password using the server-side API since we don't have a session
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tempUser.id,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Password update error:', errorData);
        setStatus("error");
        setMessage(errorData.error || "Failed to update password. Please try again.");
        return;
      }

      console.log('✅ Password updated successfully');
      
      // Clear temporary data
      if (typeof window !== 'undefined') {
        delete window.tempPasswordResetUser;
        delete window.isPasswordResetMode;
      }
      
      setStatus("success");
      setMessage("Password updated successfully! You can now log in with your new password.");
      
      // Set localStorage flag to communicate with original tab
      if (typeof window !== 'undefined') {
        localStorage.setItem('passwordResetCompleted', 'true');
      }
      
      // Trigger auth state change event to notify the modal
      if (typeof window !== 'undefined') {
        const authEvent = new CustomEvent("authStateChange", {
          detail: { 
            isAuthenticated: false, 
            passwordUpdated: true,
            message: "Password updated successfully"
          },
        });
        window.dispatchEvent(authEvent);
        
        // Also trigger a specific password reset completion event
        const passwordResetEvent = new CustomEvent("passwordResetComplete", {
          detail: { 
            success: true,
            message: "Password updated successfully"
          },
        });
        window.dispatchEvent(passwordResetEvent);
      }
      
      // No automatic redirect - let user click OK to close tab (same as email verification)
    } catch (error) {
      console.error('❌ Password update exception:', error);
      setStatus("error");
      setMessage("An error occurred while updating your password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleOAuthCallback = async (code) => {
    setMessage('Processing verification...');
    console.log('🔄 Processing auth callback with code:', code);
    
    try {
      const supabase = getSupabaseClient();
      // Try exchangeCodeForSession
      console.log('🔄 Attempting exchangeCodeForSession...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('📊 exchangeCodeForSession response:', { 
        hasUser: !!data?.user, 
        userEmail: data?.user?.email,
        hasSession: !!data?.session,
        errorMessage: error?.message 
      });
      
      if (error) {
        console.log('❌ exchangeCodeForSession failed:', error.message);
        
        // Don't fall back to existing session for email verification
        // If the code exchange fails, the verification should fail
        throw new Error(`Code exchange failed: ${error.message}`);
      }
      
      // If exchangeCodeForSession succeeded
      if (data?.user) {
        console.log('✅ exchangeCodeForSession succeeded');
        await handleSuccessfulVerification(data.user);
        return;
      }
      
      throw new Error('No user data returned from auth exchange');
      
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      setStatus('error');
      setMessage('Email verification failed. The link may have expired or been used already. Please try logging in directly.');
      setShowSpinner(false);
    }
  };

  const handleDirectEmailVerification = async (token, email) => {
    console.log('🔄 Processing direct email verification for:', email);
    
    try {
      const supabase = getSupabaseClient();
      // Verify the token with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'signup'
      });

      if (error) {
        console.error('❌ Direct verification error:', error);
        setStatus("error");
        setShowSpinner(false);
        
        if (error.message.includes('expired') || error.message.includes('OTP expired')) {
          setMessage("This verification link has expired. Please request a new verification email from the cart.");
          
          // Dispatch an event to notify the cart that verification failed
          if (typeof window !== 'undefined') {
            const verificationFailedEvent = new CustomEvent("verificationFailed", {
              detail: { 
                email: email,
                reason: 'expired',
                message: 'Verification link expired'
              },
            });
            window.dispatchEvent(verificationFailedEvent);
          }
        } else if (error.message.includes('invalid') || error.message.includes('Invalid OTP')) {
          setMessage("Invalid verification link. Please check your email and try again.");
          
          // Dispatch an event to notify the cart that verification failed
          if (typeof window !== 'undefined') {
            const verificationFailedEvent = new CustomEvent("verificationFailed", {
              detail: { 
                email: email,
                reason: 'invalid',
                message: 'Invalid verification link'
              },
            });
            window.dispatchEvent(verificationFailedEvent);
          }
        } else {
          setMessage(error.message || "Verification failed. Please try again or contact support.");
        }
        return;
      }

      if (data?.user) {
      console.log('✅ Direct email verification succeeded');
      await handleSuccessfulVerification(data.user);
      } else {
        throw new Error('No user data returned from direct verification');
      }

    } catch (error) {
      console.error('❌ Direct verification exception:', error);
      setStatus("error");
      setMessage("An unexpected error occurred during verification. Please try again or contact support.");
      setShowSpinner(false);
    }
  };

  const handleSuccessfulVerification = async (user) => {
    console.log('🎉 Handling successful verification for:', user.email);
    
    setStatus('success');
    setMessage('Email verified successfully! You can now access your account.');
    setShowSpinner(false);
    
    // Trigger auth state change event for the cart
    if (typeof window !== 'undefined') {
      const authEvent = new CustomEvent("authStateChange", {
        detail: { 
          isAuthenticated: true, 
          email: user.email,
          user: user,
          verified: true
        },
      });
      window.dispatchEvent(authEvent);
      
      // Also trigger usage type selection event
      const usageTypeEvent = new CustomEvent("proceedToUsageType", {
        detail: { 
          verified: true,
          fromEmailVerification: true
        },
      });
      window.dispatchEvent(usageTypeEvent);
    }
    
    // Update user in database
    await updateUserVerificationStatus(user.email);
    
    // No automatic redirect - let user click OK to close tab
  };

  const handleSuccessfulVerificationWithToken = async (accessToken, refreshToken) => {
    console.log('🎉 Handling successful email verification with access token');
    console.log('🔗 Access Token:', accessToken);
    console.log('🔗 Refresh Token:', refreshToken);

    try {
      const supabase = getSupabaseClient();
      
      // Set the session using the access token
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('❌ Error setting session:', error);
        throw error;
      }

      if (data?.user) {
        console.log('✅ Session set successfully for user:', data.user.email);
        
        setStatus('success');
        setMessage('Email verified successfully! You can now access your account.');
        setShowSpinner(false);
        
        // Trigger auth state change event for the cart
        if (typeof window !== 'undefined') {
          const authEvent = new CustomEvent("authStateChange", {
            detail: { 
              isAuthenticated: true, 
              email: data.user.email,
              user: data.user,
              verified: true
            },
          });
          window.dispatchEvent(authEvent);
          
          // Also trigger usage type selection event
          const usageTypeEvent = new CustomEvent("proceedToUsageType", {
            detail: { 
              verified: true,
              fromEmailVerification: true
            },
          });
          window.dispatchEvent(usageTypeEvent);
        }
        
        // Update user in database
        await updateUserVerificationStatus(data.user.email);
      } else {
        throw new Error('No user data returned from session setup');
      }
    } catch (error) {
      console.error('❌ Error handling successful verification with token:', error);
      setStatus('error');
      setMessage('Email verification completed but there was an issue setting up your session. Please try logging in directly.');
      setShowSpinner(false);
    }
  };

  const updateUserVerificationStatus = async (email) => {
    try {
      console.log('🔄 Updating user verification status for:', email);
      
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('users')
        .update({ 
          email_verified: true,
          email_verified_at: new Date().toISOString(),
          is_active: true
        })
        .eq('email', email);

      if (error) {
        console.error('❌ Database update error:', error);
        // Don't fail verification if database update fails
      } else {
        console.log('✅ User verification status updated');
      }
    } catch (error) {
      console.error('❌ Database update exception:', error);
    }
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleReturnToCart = () => {
    // Return to typeface page and trigger cart opening
    router.push('/ID?openCart=true');
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    try {
      console.log('🔄 AuthCallback: Attempting to resend verification email to:', email);
      setMessage("Sending new verification email...");
      
      const supabase = getSupabaseClient();
      // Check if user is already verified
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        console.log('✅ User is already verified, no need to resend');
        setMessage("Your email is already verified! You can proceed with your purchase.");
        return;
      }

      // Use the same redirect URL as registration
      const redirectTo = getAuthCallbackUrl();
      
      console.log('🔗 Using redirect URL:', redirectTo);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error('❌ Resend verification error:', error);
        
        // Handle specific error cases
        if (error.message.includes('rate limit') || error.message.includes('can only request this after')) {
          const secondsMatch = error.message.match(/(\d+) seconds/);
          const seconds = secondsMatch ? secondsMatch[1] : '60';
          setMessage(`Please wait ${seconds} seconds before requesting another verification email.`);
        } else if (error.message.includes('already confirmed')) {
          setMessage("Your email is already verified. Please try logging in.");
        } else if (error.message.includes('invalid')) {
          setMessage(`Invalid request: ${error.message}`);
        } else {
          setMessage(error.message || 'Failed to send verification email. Please try again.');
        }
      } else {
        console.log('✅ Verification email resent successfully');
        setMessage("A new verification email has been sent. Please check your inbox.");
      }
    } catch (error) {
      console.error('❌ Error resending verification email:', error);
      setMessage("An error occurred while sending the email. Please try again.");
    }
  };

  const handleCloseTab = () => {
    // Close the current browser tab
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  return (
    <ContentWrapper
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <AnimatePresence mode="wait">
        {showSpinner && (
          <Spinner 
            key="spinner"
            variants={spinnerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
        )}
      </AnimatePresence>
      
      <StatusMessage 
        variants={statusMessageVariants}
        initial="hidden"
        animate="visible"
      >
        {message}
      </StatusMessage>
      
      <AnimatePresence mode="wait">
        {status === "password-reset" && (
          <motion.div
            key="password-reset-form"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <PasswordContainer>
              <PasswordInput
                type={showPassword ? "text" : "password"}
                placeholder={passwordError ? "Minimum 8 characters" : "Enter new password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError(false);
                }}
                $hasError={passwordError}
                required
              />
              <TogglePasswordButton
                type="button"
                style={{ right: "16px" }}
                onClick={() => setShowPassword(!showPassword)}
                variants={togglePasswordVariants}
                initial="initial"
                whileHover="hover"
              >
                {showPassword ? "Hide" : "Show"}
              </TogglePasswordButton>
            </PasswordContainer>
            <ActionButton 
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </ActionButton>
          </motion.div>
        )}
        
        {status === "error" && (
          <motion.div
            key="error-buttons"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {email && !isPasswordReset && (
              <ActionButton 
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={handleResendVerification}
              >
                Resend Verification Email
              </ActionButton>
            )}
            {finalErrorCode === 'otp_expired' && (
              <ActionButton 
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={handleReturnToCart}
              >
                Return to Cart
              </ActionButton>
            )}
            <ActionButton 
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={handleReturnHome}
            >
              Return to Homepage
            </ActionButton>
          </motion.div>
        )}
        
        {status === "success" && (
          <ActionButton 
            key="success-button"
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={handleCloseTab}
          >
            OK
          </ActionButton>
        )}
      </AnimatePresence>
    </ContentWrapper>
  );
} 