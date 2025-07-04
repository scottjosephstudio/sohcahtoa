"use client";

import React, { useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypefaceContentContainer } from "./TypefaceStyledComponents";
import SpecimenSection from "../Sections/Specimen/Specimen";
import TrialSection from "../Sections/Tester/Test";
import TechnicalSection from "../Sections/Glyphs/Glyphs";

export default forwardRef(function TypefaceContent(
  {
    activeTab,
    variants,
    handleHomeClick,
    fontSettings,
    isNavigatingHome,
    isTestExiting,
    isGlyphsExiting, // Add this prop
  },
  ref,
) {
  const currentTab = activeTab.toLowerCase();
  const technicalSectionRef = useRef(null);

  // Expose search function to parent components
  React.useImperativeHandle(ref, () => ({
    handleSearch: (query) => {
      if (
        currentTab === "glyphs" &&
        technicalSectionRef.current?.handleSearch
      ) {
        technicalSectionRef.current.handleSearch(query);
      }
    },
  }));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ position: "relative" }}
      >
        <TypefaceContentContainer>
          {currentTab === "specimen" && (
            <SpecimenSection
              variants={variants}
              handleHomeClick={handleHomeClick}
            />
          )}
          {currentTab === "test" && (
            <TrialSection
              variants={variants}
              activeTab={currentTab}
              isTestExiting={isTestExiting}
              handleHomeClick={handleHomeClick}
              fontSettings={fontSettings}
              isNavigatingHome={isNavigatingHome}
            />
          )}
          {currentTab === "glyphs" && (
            <TechnicalSection
              variants={variants}
              activeTab={currentTab}
              isNavigatingHome={isNavigatingHome}
              isGlyphsExiting={isGlyphsExiting}
              handleHomeClick={handleHomeClick}
              ref={technicalSectionRef}
            />
          )}
        </TypefaceContentContainer>
      </motion.div>
    </AnimatePresence>
  );
});
