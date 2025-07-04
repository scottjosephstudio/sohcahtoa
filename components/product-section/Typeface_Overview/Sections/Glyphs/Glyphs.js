import styled from 'styled-components'
import FontViewer from "./components/FontViewer"
import React, { useRef, forwardRef } from 'react'

const Section = styled.div`
  margin-top: 20px;
  width: 100%;
`

export default forwardRef(function TechnicalSection({
  activeTab,
  isGlyphsExiting,
  isNavigatingHome,
}, ref) {
  const fontViewerRef = useRef(null);

  // Expose search function to parent components
  React.useImperativeHandle(ref, () => ({
    handleSearch: (query) => {
      if (fontViewerRef.current?.handleSearch) {
        fontViewerRef.current.handleSearch(query);
      }
    }
  }));

  return (
    <Section>
      <div>
        <main>
        <FontViewer 
  activeTab={activeTab}
  isGlyphsExiting={isGlyphsExiting}
  isNavigatingHome={isNavigatingHome}
  fontPath="/fonts/JANTReg.ttf"
  ref={fontViewerRef}
/>
        </main>
      </div>
    </Section>
  )
})