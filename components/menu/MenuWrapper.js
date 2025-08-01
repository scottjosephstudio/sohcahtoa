"use client";

import { useState, useEffect } from "react";
import Menu from "./Menu";

export default function MenuWrapper() {
  const [isErrorPage, setIsErrorPage] = useState(false);

  useEffect(() => {
    // Check at initial render
    checkForErrorPage();

    // Also set up a continuous check every 100ms for a short period
    const intervalId = setInterval(checkForErrorPage, 100);

    // Stop checking after 1 second
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 1000);

    function checkForErrorPage() {
      if (typeof window !== "undefined") {
        const hasErrorClass = document.body.classList.contains("error-page");
        const hasErrorTitle =
          document.title.includes("Error") ||
          document.title.includes("Not Found");

        // Error page check completed

        if (hasErrorClass || hasErrorTitle) {
          setIsErrorPage(true);
        }
      }
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Don't render the Menu on error pages
  if (isErrorPage) {
    return null;
  }

  // Otherwise, render the Menu
  return <Menu />;
}
