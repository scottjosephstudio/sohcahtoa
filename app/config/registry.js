'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

// Updated shouldForwardProp function with all custom props
const shouldForwardProp = (prop) => {
  // Return false for all custom props that shouldn't be forwarded to DOM
  return ![
    '$isOpen',
    '$isNavigating',
    '$isVisible',
    '$isExisting',
    'active',        // Added from new logs
    '$ShouldShow',   // Added from new logs
    // Add any other custom props you use
  ].includes(prop);
};

export default function StyledComponentsRegistry({ children }) {
  // Only create stylesheet once with lazy initial state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());
  
  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });
  
  if (typeof window !== 'undefined') return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      {children}
    </StyleSheetManager>
  );
  
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp} sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}