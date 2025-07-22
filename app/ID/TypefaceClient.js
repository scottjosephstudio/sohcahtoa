"use client";

import React from "react";
import dynamic from "next/dynamic";

// Minimal dynamic import - optimized for speed
const TypefaceIndex = dynamic(
  () => import("../../components/product-section/Controller/ProductPage"),
  { ssr: false },
);

export default function TypefacesCart({ currentUser, databaseDataLoaded }) {
  return (
    <main>
      <TypefaceIndex currentUser={currentUser} databaseDataLoaded={databaseDataLoaded} />
    </main>
  );
}
