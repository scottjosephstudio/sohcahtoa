"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import styled from "styled-components";
import { supabase } from "../../lib/database/supabaseClient";

// Page background container
const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
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
  padding: 30px;
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
  font-size: 20px;
  line-height: 24px !important;
  letter-spacing: 0.8px;
  text-decoration: underline;
  text-underline-offset: 6px;
  color: white;
  margin-top: -6px;
  margin-bottom: 12px;
  display: block;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusMessage = styled.p`
  font-size: 20px;
  line-height: 24px !important;
  letter-spacing: 0.8px;
  color: white;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const ActionButton = styled(motion.button)`
  background: #006efe;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    background: #0056cc;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const loginPanelVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      type: "tween",
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

// Main component wrapper
export default function EmailVerification() {
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
          >
            <ModalTitleLogin>Email Verification</ModalTitleLogin>
            <Suspense
              fallback={
                <StatusMessage>Verifying your email...</StatusMessage>
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
  const [message, setMessage] = useState("Verifying your email address...");
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email and try again.");
        return;
      }

      try {
        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          email: email,
          token: token,
          type: 'signup'
        });

        if (error) {
          console.error('Verification error:', error);
          setStatus("error");
          
          if (error.message.includes('expired')) {
            setMessage("This verification link has expired. Please request a new verification email.");
          } else if (error.message.includes('invalid')) {
            setMessage("Invalid verification link. Please check your email and try again.");
          } else {
            setMessage("Verification failed. Please try again or contact support.");
          }
          return;
        }

        // Update user as verified in our database
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            email_verified: true,
            email_verified_at: new Date().toISOString(),
            is_active: true
          })
          .eq('email', email);

        if (updateError) {
          console.error('Database update error:', updateError);
          // Don't fail verification if database update fails
        }

        setStatus("success");
        setMessage("Your email has been successfully verified! You can now access your account and download purchased typefaces.");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);

      } catch (error) {
        console.error('Verification process error:', error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again or contact support.");
      }
    };

    verifyEmail();
  }, [token, email, router]);

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    try {
      setMessage("Sending new verification email...");
      
      // Trigger resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        setMessage("Failed to resend verification email. Please try again.");
      } else {
        setMessage("A new verification email has been sent. Please check your inbox.");
      }
    } catch (error) {
      setMessage("Failed to resend verification email. Please try again.");
    }
  };

  return (
    <ContentWrapper>
      <StatusMessage>{message}</StatusMessage>
      
      {status === "success" && (
        <StatusMessage style={{ color: '#4CAF50', fontSize: '16px' }}>
          Redirecting to homepage in 3 seconds...
        </StatusMessage>
      )}
      
      {status === "error" && (
        <div>
          <ActionButton onClick={handleResendVerification}>
            Resend Verification Email
          </ActionButton>
          <ActionButton onClick={handleReturnHome}>
            Return to Homepage
          </ActionButton>
        </div>
      )}
      
      {status === "success" && (
        <ActionButton onClick={handleReturnHome}>
          Continue to Homepage
        </ActionButton>
      )}
    </ContentWrapper>
  );
} 