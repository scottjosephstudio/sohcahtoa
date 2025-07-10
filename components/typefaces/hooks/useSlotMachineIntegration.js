"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { useMenuOverlay } from "../../menu-overlay/MenuOverlayContext";
import { useFontSelection } from "../../../context/FontSelectionContext";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getRandomLetter() {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function getNextLetter(currentLetter) {
  const currentIndex = alphabet.indexOf(currentLetter);
  return alphabet[(currentIndex + 1) % alphabet.length];
}

function getPreviousLetter(currentLetter) {
  const currentIndex = alphabet.indexOf(currentLetter);
  return alphabet[(currentIndex - 1 + alphabet.length) % alphabet.length];
}

export default function useSlotMachineIntegration() {
  const [currentLetter, setCurrentLetter] = useState("");
  const [scrollTimeout, setScrollTimeout] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isAnyMenuOpen } = useMenuOverlay();
  const { 
    selectedFont, 
    availableFonts, 
    selectNextFont, 
    selectPreviousFont, 
    selectFont,
    loading: fontsLoading,
    currentFontIndex
  } = useFontSelection();
  
  const slotMachineRef = useRef(null);
  const letterRef = useRef(null);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);
  const animationFrameRef = useRef(null);

  // Set current letter to random A-Z letter initially
  useEffect(() => {
    if (!currentLetter) {
      setCurrentLetter(getRandomLetter());
    }
  }, [currentLetter]);

  const handleLetterChange = useCallback(
    (deltaY) => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      if (timeSinceLastScroll < 100) return; // Throttle for better performance

      lastScrollTime.current = now;
      setIsAnimating(true);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Determine direction for letter cycling
      const direction = deltaY > 0 ? 'next' : 'previous';

      // Create spinning animation through letters
      const spinLetters = () => {
        let spinCount = 0;
        const maxSpins = 3; // Shorter spin for letter changes
        
        const spinInterval = setInterval(() => {
          if (spinCount >= maxSpins) {
            clearInterval(spinInterval);
            
            // Final letter selection
            const newLetter = direction === 'next' 
              ? getNextLetter(currentLetter) 
              : getPreviousLetter(currentLetter);
            
            gsap.to(letterRef.current, {
              opacity: 0.6,
              scale: 0.9,
              duration: 0.1,
              onComplete: () => {
                setCurrentLetter(newLetter);
                gsap.to(letterRef.current, { 
                  opacity: 1, 
                  scale: 1, 
                  duration: 0.1,
                  onComplete: () => {
                    setIsAnimating(false);
                  }
                });
              },
            });
            
            return;
          }
          
          // Show random letter during spin
          const randomLetter = getRandomLetter();
          gsap.to(letterRef.current, {
            opacity: 0.6,
            scale: 0.9,
            duration: 0.05,
            onComplete: () => {
              setCurrentLetter(randomLetter);
              gsap.to(letterRef.current, { 
                opacity: 1, 
                scale: 1, 
                duration: 0.05 
              });
            },
          });
          
          spinCount++;
        }, 60);
      };

      spinLetters();
    },
    [scrollTimeout, currentLetter]
  );

  const handleFontChange = useCallback(() => {
    // Only proceed if we have fonts available
    if (!availableFonts || availableFonts.length <= 1) return;

    setIsAnimating(true);

    // Create spinning animation for font change
    const spinLetters = () => {
      let spinCount = 0;
      const maxSpins = 8; // Longer spin for font changes
      
      const spinInterval = setInterval(() => {
        if (spinCount >= maxSpins) {
          clearInterval(spinInterval);
          
          // Change to next font
          selectNextFont();
          
          // End animation
          setTimeout(() => {
            setIsAnimating(false);
          }, 200);
          
          return;
        }
        
        // Show random letter during spin
        const randomLetter = getRandomLetter();
        gsap.to(letterRef.current, {
          opacity: 0.6,
          scale: 0.9,
          duration: 0.05,
          onComplete: () => {
            setCurrentLetter(randomLetter);
            gsap.to(letterRef.current, { 
              opacity: 1, 
              scale: 1, 
              duration: 0.05 
            });
          },
        });
        
        spinCount++;
      }, 80);
    };

    spinLetters();
  }, [selectNextFont, availableFonts]);

  const handleScroll = useCallback(
    (e) => {
      // Disable slot machine scrolling when any menu interface is open or fonts are loading
      if (isAnyMenuOpen || fontsLoading || isAnimating) return;

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
    [handleLetterChange, isAnyMenuOpen, fontsLoading, isAnimating],
  );

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      // Disable slot machine touch scrolling when any menu interface is open or fonts are loading
      if (isAnyMenuOpen || fontsLoading || isAnimating) return;

      e.preventDefault();
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      
      if (Math.abs(deltaY) > 10) { // Minimum swipe distance
        handleLetterChange(deltaY);
      }
    },
    [handleLetterChange, isAnyMenuOpen, fontsLoading, isAnimating],
  );

  const handleClick = useCallback(() => {
    // Disable click when any menu interface is open or fonts are loading
    if (isAnyMenuOpen || fontsLoading || isAnimating) return;
    
    // Click changes font
    handleFontChange();
  }, [handleFontChange, isAnyMenuOpen, fontsLoading, isAnimating]);

  // Set up event listeners with stable dependencies
  useEffect(() => {
    // Set up event listeners only on client side
    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleScroll, handleTouchStart, handleTouchMove]);

  // Initialize slot machine animation
  useEffect(() => {
    const preload = () => {
      setIsLoaded(true);
      if (slotMachineRef.current) {
        gsap.fromTo(
          slotMachineRef.current,
          { x: "0vw", scale: 0, opacity: 0 },
          { 
            x: "0vw", 
            scale: 1, 
            opacity: 1,
            duration: 1.2, 
            ease: "power3.out"
          },
        );
      }
    };

    const preloadTimeout = setTimeout(preload, 100);

    return () => {
      clearTimeout(preloadTimeout);
    };
  }, []);

  return {
    currentLetter,
    selectedFont,
    availableFonts,
    slotMachineRef,
    letterRef,
    isLoaded,
    isAnimating,
    fontsLoading,
    handleClick,
    
    // Additional data for enhanced functionality
    fontInfo: selectedFont ? {
      name: selectedFont.name,
      designer: selectedFont.designer,
      foundry: selectedFont.foundry,
      description: selectedFont.description,
      styles: selectedFont.font_styles || []
    } : null,
    
    // Navigation helpers - scalable for any number of fonts
    hasMultipleFonts: availableFonts.length > 1,
    currentFontIndex: currentFontIndex >= 0 ? currentFontIndex : 0,
    totalFonts: availableFonts.length,
    
    // Scalability info
    canNavigate: availableFonts.length > 1,
    isFirstFont: currentFontIndex === 0,
    isLastFont: currentFontIndex === availableFonts.length - 1,
  };
} 