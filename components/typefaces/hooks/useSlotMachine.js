"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { useMenuOverlay } from "../../menu-overlay/MenuOverlayContext";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getRandomLetter() {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

export default function useSlotMachine() {
  // Start with empty or fixed initial letter to avoid hydration mismatch
  const [currentLetter, setCurrentLetter] = useState("");
  const [scrollTimeout, setScrollTimeout] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAnyMenuOpen } = useMenuOverlay();
  const slotMachineRef = useRef(null);
  const letterRef = useRef(null);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);

  const handleLetterChange = useCallback(
    (deltaY) => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      if (timeSinceLastScroll < 50) return; // Throttle scroll events

      lastScrollTime.current = now;

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      const velocity = Math.abs(deltaY);
      const duration = Math.min(300, Math.max(50, velocity * 2)); // Increased sensitivity for smoother animation

      const slowDownLetterChange = (interval) => {
        if (interval >= duration) {
          return;
        }
        const newLetter = getRandomLetter();
        gsap.to(letterRef.current, {
          opacity: 0.75,
          duration: 0.25,
          onComplete: () => {
            setCurrentLetter(newLetter);
            gsap.to(letterRef.current, { opacity: 1, duration: 0.25 });
          },
        });
        const newTimeout = setTimeout(
          () => slowDownLetterChange(interval + 20),
          interval,
        );
        setScrollTimeout(newTimeout);
      };

      slowDownLetterChange(20);
    },
    [scrollTimeout],
  );

  const handleScroll = useCallback(
    (e) => {
      // Disable slot machine scrolling when any menu interface is open
      if (isAnyMenuOpen) return;

      if (
        e.target instanceof Node &&
        e.target.closest(
          ".slot-machine-page, .slot-machine-container, .letter-container",
        )
      ) {
        e.preventDefault();
        handleLetterChange(e.deltaY);
      }
    },
    [handleLetterChange, isAnyMenuOpen],
  );

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      // Disable slot machine touch scrolling when any menu interface is open
      if (isAnyMenuOpen) return;

      e.preventDefault(); // Prevent default scrolling behavior
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      handleLetterChange(deltaY);
    },
    [handleLetterChange, isAnyMenuOpen],
  );

  // Initialize random letter only on client side to prevent hydration mismatch
  useEffect(() => {
    // Set the initial random letter only on the client side
    setCurrentLetter(getRandomLetter());

    // Set up event listeners only on client side
    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleScroll, handleTouchStart, handleTouchMove]);

  useEffect(() => {
    const preload = () => {
      setIsLoaded(true);
      if (slotMachineRef.current) {
        gsap.fromTo(
          slotMachineRef.current,
          { x: "0vw", scale: 0 },
          { x: "0vw", scale: 1, duration: 1, ease: "power3.out" },
        );
      }
    };

    const preloadTimeout = setTimeout(preload, 50);

    return () => {
      clearTimeout(preloadTimeout);
    };
  }, []);

  return {
    currentLetter,
    slotMachineRef,
    letterRef,
    isLoaded,
  };
}
