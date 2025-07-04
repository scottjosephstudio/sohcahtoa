import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useNavigation } from '../../../../context/NavigationContext';
import {
  LoginContainer,
  LoginButtonStyled,
  buttonVariants
} from '../../Controller/ProductPage_Styles';

const LoginButton = ({
  isLoggedIn,
  handleLoginClick,
  isNavigatingHome
}) => {
  const pathname = usePathname();
  const { $isNavigating } = useNavigation();
  const isTypefaces = pathname === '/Typefaces';
  
  // Hide when navigating home, or when navigating away from any page (including Typefaces)
  const shouldHide = isNavigatingHome || $isNavigating;

  const buttonStyle = isTypefaces ? {
    color: 'rgb(44, 255, 5)',
    textShadow: '0 0 20px rgb(16, 12, 8), 0 0 30px rgb(16, 12, 8), 0 0 40px rgb(16, 12, 8)',
    textDecoration: 'none',
    transition: 'background-color 0.2s, color 0.2s',
    '--underline-color': 'rgb(44, 255, 5)'
  } : {};

  return (
    <AnimatePresence mode="wait">
      {!shouldHide && (
        <LoginContainer
          $isTypefaces={isTypefaces}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={isTypefaces ? { delay: 0.2 } : undefined}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }}
        >
          <LoginButtonStyled
            onClick={handleLoginClick}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            style={buttonStyle}
          >
            <span>{!isLoggedIn ? 'Log In' : 'Account'}</span>
          </LoginButtonStyled>
        </LoginContainer>
      )}
    </AnimatePresence>
  );
};

export default LoginButton;