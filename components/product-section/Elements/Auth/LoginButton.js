import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useNavigation } from "../../../../context/NavigationContext";
import {
  LoginContainer,
  LoginButtonStyled,
  loginButtonVariants,
} from "../../Controller/ProductPage_Styles";

const LoginButton = ({ isLoggedIn, handleLoginClick, isNavigatingHome, currentUser, databaseDataLoaded }) => {
  const pathname = usePathname();
  const { $isNavigating } = useNavigation();
  const isTypefaces = pathname === "/Typefaces";
  const [isHovered, setIsHovered] = useState(false);

  // Hide when navigating home, or when navigating away from any page (including Typefaces)
  const shouldHide = isNavigatingHome || $isNavigating;

  // Function to generate user initials
  const getUserInitials = () => {
    if (!currentUser && !isLoggedIn) return "Account";
    
    // If user is logged in but data is still loading, show loading state
    if (isLoggedIn && !databaseDataLoaded) {
      return "...";
    }
    
    const firstName = currentUser?.dbData?.first_name || "";
    const lastName = currentUser?.dbData?.last_name || "";
    
    if (!firstName && !lastName) {
      return "Account";
    }
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  };

  const buttonStyle = isTypefaces
    ? {
        color: "#39ff14",
        textShadow:
          "0 0 20px rgb(16, 12, 8), 0 0 30px rgb(16, 12, 8), 0 0 40px rgb(16, 12, 8)",
        textDecoration: "none",
        textDecorationColor: "#39ff14",
        transition: "background-color 0.2s, color 0.2s",
        "--underline-color": "#39ff14",
      }
    : {};

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
              ease: [0.25, 0.1, 0.25, 1],
            },
          }}
        >
          <LoginButtonStyled
            onClick={handleLoginClick}
            variants={loginButtonVariants}
            initial="initial"
            whileHover="hover"
            style={buttonStyle}
          >
            {!isLoggedIn ? (
              <span>Log In</span>
            ) : (
              <motion.div
                style={{
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <span>{getUserInitials()}</span>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.3,
                      }}
                      style={{
                        marginLeft: "12px",
                        color: "inherit",
                      }}
                    >
                      Account
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </LoginButtonStyled>
        </LoginContainer>
      )}
    </AnimatePresence>
  );
};

export default LoginButton;
