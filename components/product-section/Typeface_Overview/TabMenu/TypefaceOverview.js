"use client";

import React, { useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypefaceContent from "./TypefaceContent";
import { TypefaceOverviewContainer } from "./TypefaceStyledComponents";

const TypefaceOverview = forwardRef(
  (
    {
      isNavigatingHome,
      onClick,
      activeTab,
      fontSettings,
      isTestExiting,
      isGlyphsExiting,
      isSpecimenExiting,
      selectedFont,
    },
    ref,
  ) => {
    const typefaceContentRef = useRef(null);

    // Expose search function to parent components
    React.useImperativeHandle(ref, () => ({
      handleSearch: (query) => {
        if (typefaceContentRef.current?.handleSearch) {
          typefaceContentRef.current.handleSearch(query);
        }
      },
    }));

    const handleHomeClick = (e, href) => {
      e.preventDefault();
      onClick(e, href);
    };

    const contentVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    return (
      <AnimatePresence mode="wait">
        {!isNavigatingHome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1],
              },
            }}
          >
            <TypefaceOverviewContainer>
              <TypefaceContent
                variants={contentVariants}
                activeTab={activeTab}
                handleHomeClick={handleHomeClick}
                fontSettings={fontSettings}
                isTestExiting={isTestExiting}
                isGlyphsExiting={isGlyphsExiting}
                isSpecimenExiting={isSpecimenExiting}
                isNavigatingHome={isNavigatingHome}
                selectedFont={selectedFont}
                ref={typefaceContentRef}
              />
            </TypefaceOverviewContainer>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

export default TypefaceOverview;
