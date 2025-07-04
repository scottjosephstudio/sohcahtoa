"use client";

import React from "react";
import { ScrollButtonContainer } from "./styles/StyledComponents";
import { useScrollVisibility } from "./hooks/useScrollVisibility";
import { ScrollIcon } from "./components/ScrollIcon";
import { scrollToTop } from "./utils/scrollUtils";

const ScrollToTopButton = () => {
  const { isVisible, isFading } = useScrollVisibility();

  return (
    <>
      {isVisible && (
        <ScrollButtonContainer
          onClick={scrollToTop}
          className={`scroll-to-top ${isFading ? "fade-out" : ""}`}
          aria-label="Scroll to top"
          whileHover="hover"
          initial="initial"
        >
          <ScrollIcon />
        </ScrollButtonContainer>
      )}
    </>
  );
};

export default ScrollToTopButton;
