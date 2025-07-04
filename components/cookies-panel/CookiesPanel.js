"use client";

import React, { useState, useEffect } from "react";
import { useCookiesPanel } from "./CookiesPanelProvider";
import CookiesBanner from "./components/CookiesBanner";
import CookiesButtons from "./components/CookiesButtons";
import DebugButton from "./components/DebugButton";

export default function CookiesPanel({ testMode = false, showDebug = false }) {
  const {
    showCookiesPanel,
    acceptCookies,
    declineCookies,
    resetCookies,
    isLoading,
  } = useCookiesPanel();
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (showCookiesPanel && !isLoading) {
      setVisible(true);
    }
  }, [showCookiesPanel, isLoading]);

  useEffect(() => {
    const handleNavigation = () => {
      if (visible && !isExiting) {
        setIsExiting(true);
        setTimeout(() => {
          setVisible(false);
          setIsExiting(false);
        }, 400);
      }
    };
    const handleLinkClick = (e) => {
      const link = e.target.closest("a") || e.target.closest("[href]");
      if (link) {
        handleNavigation();
      }
    };
    document.addEventListener("click", handleLinkClick, true);
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [visible, isExiting]);

  const handleAccept = async () => {
    setIsExiting(true);
    setTimeout(async () => {
      await acceptCookies();
      setVisible(false);
      setIsExiting(false);
    }, 400);
  };

  const handleDecline = async () => {
    setIsExiting(true);
    setTimeout(async () => {
      await declineCookies();
      setVisible(false);
      setIsExiting(false);
    }, 400);
  };

  if (isLoading || !visible) return null;

  return (
    <>
      <CookiesBanner isExiting={isExiting}>
        <CookiesButtons onAccept={handleAccept} onDecline={handleDecline} />
      </CookiesBanner>
      {(showDebug || testMode) && <DebugButton onClick={resetCookies} />}
    </>
  );
}
