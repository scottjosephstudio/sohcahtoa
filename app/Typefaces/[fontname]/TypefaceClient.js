"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useFontSelection } from "../../../context/FontSelectionContext";

// Minimal dynamic import - optimized for speed
const TypefaceIndex = dynamic(
  () => import("../../../components/product-section/Controller/ProductPage"),
  { ssr: false },
);

export default function TypefaceClient({ currentUser, databaseDataLoaded, fontSlug }) {
  const { selectFontBySlug } = useFontSelection();

  // Select the font based on the slug when the component mounts
  useEffect(() => {
    if (fontSlug && selectFontBySlug) {
      selectFontBySlug(fontSlug);
    }
  }, [fontSlug, selectFontBySlug]);

  return (
    <main>
      <TypefaceIndex 
        currentUser={currentUser} 
        databaseDataLoaded={databaseDataLoaded} 
        initialFontSlug={fontSlug}
      />
    </main>
  );
} 