"use client";

import React from "react";
import dynamic from "next/dynamic";

// Optimized dynamic import with SSR enabled for faster loading
const TypefaceIndex = dynamic(
  () => import("../../components/product-section/Controller/ProductPage"),
  { 
    ssr: true,
    loading: () => <div style={{ minHeight: '100vh' }}></div>
  },
);

export default function TypefacesCart({ currentUser, databaseDataLoaded }) {
  return (
    <main>
      <TypefaceIndex currentUser={currentUser} databaseDataLoaded={databaseDataLoaded} />
    </main>
  );
}
