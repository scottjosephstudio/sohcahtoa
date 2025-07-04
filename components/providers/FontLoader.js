"use client";

import { useEffect } from "react";

export default function FontLoader() {
  useEffect(() => {
    // Check if the browser supports the Font Loading API
    if ("fonts" in document) {
      // Add a loading class
      document.documentElement.classList.add("fonts-loading");

      // Use the FontFace API to load the fonts
      Promise.all([document.fonts.load("1em Jant")])
        .then(() => {
          // Once fonts are loaded, update the class
          document.documentElement.classList.remove("fonts-loading");
          document.documentElement.classList.add("fonts-loaded");
        })
        .catch((error) => {
          console.error("Font loading failed:", error);
          // Remove loading class even if there's an error
          document.documentElement.classList.remove("fonts-loading");
        });
    }
  }, []);

  return null; // This component doesn't render anything
}
