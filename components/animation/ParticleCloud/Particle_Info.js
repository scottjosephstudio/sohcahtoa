import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Container, Content, MoreButton, ContentBlock } from "./Info_Tab.js";
import { useNavigation } from "../../../context/NavigationContext";

const ParticleInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Connect to navigation context for page transitions
  const { $isNavigating } = useNavigation();

  const descriptions = [
    {
      className: "title",
      content: "Particle Cloud",
    },
    {
      content:
        "An interactive visualisation featuring a cluster of 45,000 particles that respond to viewport changes and create patterns through synchronized motion and colour transitions.",
    },
    {
      className: "indent",
      content: "Format: WebGL",
    },
  ];

  useEffect(() => {
    setIsClient(true);
    const updateDimensions = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);

    const timeout = setTimeout(() => setIsVisible(true), 500);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsInitialRender(false);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setIsInitialRender(true);
    }
  }, [isOpen]);

  const getContainerHeight = () => (windowWidth >= 1420 ? 36 : 36);

  const containerVariants = {
    initial: {
      y: 100,
      height: getContainerHeight(),
      width: windowWidth >= 1420 ? 85 : 85,
      opacity: 0,
      borderRadius: "24px",
    },
    visible: {
      y: 0,
      height: getContainerHeight(),
      width: windowWidth >= 1420 ? 85 : 85,
      opacity: 1,
      borderRadius: "24px",
      transition: {
        duration: 0.25,
        ease: [0.23, 1, 0.32, 1],
        borderRadius: { type: "spring", stiffness: 300, damping: 30 },
      },
    },
    closed: {
      y: 0,
      height: getContainerHeight(),
      width: windowWidth >= 1420 ? 85 : 85,
      opacity: 1,
      borderRadius: "24px",
      transition: {
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1],
        // Delay the border radius change until AFTER content has faded out
        borderRadius: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          // This delay ensures content is gone before radius changes
          delay: 0.1,
        },
      },
    },
    open: {
      y: 0,
      height: isInitialRender ? getContainerHeight() : "auto",
      width: windowWidth <= 600 ? "calc(100vw - 40px)" : "300px",
      opacity: 1,
      borderRadius: "10px",
      transition: {
        height: {
          duration: 0.3,
          ease: [0.23, 1, 0.32, 1],
          delay: isInitialRender ? 0 : 0.1,
        },
        width: {
          duration: 0.2,
          ease: [0.23, 1, 0.32, 1],
        },
        borderRadius: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      },
    },
    exit: {
      y: windowHeight,
      transition: {
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.2,
        // Make sure content fades out before border-radius changes
        // This helps prevent the content from being visible during radius transition
        opacity: { duration: 0.1, ease: "easeInOut" },
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const blockVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const moreVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.1 },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.1,
        duration: 0.2,
      },
    },
  };

  if (!isClient) return null;

  return (
    <Container
      $isOpen={isOpen}
      variants={containerVariants}
      initial="initial"
      animate={
        $isNavigating
          ? "exit"
          : isVisible
            ? isOpen
              ? "open"
              : "closed"
            : "initial"
      }
      onClick={() => setIsOpen(!isOpen)}
    >
      <AnimatePresence initial={false} mode="wait">
        {isOpen ? (
          <Content
            key="content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            $isInitialRender={isInitialRender}
            $minHeight={getContainerHeight()}
            onAnimationComplete={(definition) => {
              // This ensures the border-radius transition happens in the right sequence
              if (definition === "hidden") {
                // When content animation completes to hidden, we can do additional actions if needed
              }
            }}
          >
            {descriptions.map((desc, index) => (
              <ContentBlock
                key={index}
                className={desc.className || "content"}
                variants={blockVariants}
                $isInitialRender={isInitialRender}
              >
                {desc.content}
              </ContentBlock>
            ))}
          </Content>
        ) : (
          <MoreButton
            key="more"
            variants={moreVariants}
            initial={isVisible ? "visible" : "hidden"}
            animate="visible"
            exit="hidden"
          >
            <span>More</span>
          </MoreButton>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ParticleInfo;
