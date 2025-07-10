import styled from "styled-components";
import FontViewer from "./components/FontViewer";
import React, { useRef, forwardRef } from "react";

const Section = styled.div`
  margin-top: 20px;
  width: 100%;
`;

export default forwardRef(function TechnicalSection(
  { activeTab, isGlyphsExiting, isNavigatingHome, selectedFont },
  ref,
) {
  const fontViewerRef = useRef(null);

  // Expose search function to parent components
  React.useImperativeHandle(ref, () => ({
    handleSearch: (query) => {
      if (fontViewerRef.current?.handleSearch) {
        fontViewerRef.current.handleSearch(query);
      }
    },
  }));

  // Get font path from selected font
  const getFontPath = () => {
    if (!selectedFont || !selectedFont.font_styles || selectedFont.font_styles.length === 0) {
      return "/fonts/JANTReg.ttf"; // Fallback
    }
    
    const firstStyle = selectedFont.font_styles[0];
    const fontFiles = firstStyle.font_files;
    
    // Prefer TTF, then OTF, then WOFF2, then WOFF
    if (fontFiles?.ttf) return fontFiles.ttf;
    if (fontFiles?.otf) return fontFiles.otf;
    if (fontFiles?.woff2) return fontFiles.woff2;
    if (fontFiles?.woff) return fontFiles.woff;
    
    return "/fonts/JANTReg.ttf"; // Final fallback
  };

  return (
    <Section>
      <div>
        <main>
          <FontViewer
            activeTab={activeTab}
            isGlyphsExiting={isGlyphsExiting}
            isNavigatingHome={isNavigatingHome}
            fontPath={getFontPath()}
            selectedFont={selectedFont}
            ref={fontViewerRef}
          />
        </main>
      </div>
    </Section>
  );
});
