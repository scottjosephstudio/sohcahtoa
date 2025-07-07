"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { useMenuOverlay } from "../../menu-overlay/MenuOverlayContext";
import { fontSelectionService } from "../../../lib/database/fontService";
import { getFontFamilies } from "../../../lib/database/supabaseClient";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getRandomLetter() {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

export default function useSlotMachineIntegration() {
  // Original slot machine state
  const [currentLetter, setCurrentLetter] = useState("");
  const [scrollTimeout, setScrollTimeout] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // New integration state
  const [fontFamilies, setFontFamilies] = useState([]);
  const [selectedFontFamily, setSelectedFontFamily] = useState(null);
  const [selectedFontStyle, setSelectedFontStyle] = useState(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [selectionRecorded, setSelectionRecorded] = useState(false);
  
  const { isAnyMenuOpen } = useMenuOverlay();
  const slotMachineRef = useRef(null);
  const letterRef = useRef(null);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);

  // Initialize font data and session
  useEffect(() => {
    initializeFontData();
    initializeSession();
  }, []);

  const initializeFontData = async () => {
    try {
      const { data: families, error } = await getFontFamilies({ featured: true });
      
      if (error) {
        console.error('Error loading font families:', error);
        return;
      }

      setFontFamilies(families || []);
      
      // Set default font family (first available)
      if (families && families.length > 0) {
        const defaultFamily = families[0];
        setSelectedFontFamily(defaultFamily);
        
        // Set default style (first available style)
        if (defaultFamily.font_styles && defaultFamily.font_styles.length > 0) {
          setSelectedFontStyle(defaultFamily.font_styles[0]);
        }
      }
    } catch (error) {
      console.error('Error initializing font data:', error);
    }
  };

  const initializeSession = async () => {
    try {
      // Get auth user ID if available
      const authUserId = null; // This would come from auth context
      
      // Initialize font selection service
      await fontSelectionService.initializeSession(authUserId);
      setSessionInitialized(true);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const recordFontSelection = async (letter) => {
    if (!sessionInitialized || !selectedFontFamily || !selectedFontStyle || selectionRecorded) {
      return;
    }

    try {
      // Get client information
      const clientInfo = {
        ip_address: 'client', // This would be populated server-side
        user_agent: navigator.userAgent
      };

      const result = await fontSelectionService.recordSelection(
        selectedFontFamily.id,
        selectedFontStyle.id,
        letter,
        clientInfo
      );

      if (result.success) {
        setSelectionRecorded(true);
        
        // Store selection ID for cart integration
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastFontSelection', JSON.stringify({
            selectionId: result.data.id,
            fontFamilyId: selectedFontFamily.id,
            fontStyleId: selectedFontStyle.id,
            fontFamilyName: selectedFontFamily.name,
            fontStyleName: selectedFontStyle.name,
            selectedLetter: letter,
            timestamp: new Date().toISOString()
          }));
        }

        // Dispatch custom event for other components to listen
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('fontSelected', {
            detail: {
              selectionId: result.data.id,
              fontFamily: selectedFontFamily,
              fontStyle: selectedFontStyle,
              selectedLetter: letter
            }
          });
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Error recording font selection:', error);
    }
  };

  const handleLetterChange = useCallback(
    (deltaY) => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      if (timeSinceLastScroll < 50) return;

      lastScrollTime.current = now;
      setIsAnimating(true);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      const velocity = Math.abs(deltaY);
      const duration = Math.min(300, Math.max(50, velocity * 2));

      const slowDownLetterChange = (interval) => {
        if (interval >= duration) {
          setIsAnimating(false);
          
          // Record selection when animation stops
          const finalLetter = getRandomLetter();
          setCurrentLetter(finalLetter);
          recordFontSelection(finalLetter);
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
    [scrollTimeout, sessionInitialized, selectedFontFamily, selectedFontStyle],
  );

  const handleScroll = useCallback(
    (e) => {
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
      if (isAnyMenuOpen) return;

      e.preventDefault();
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      handleLetterChange(deltaY);
    },
    [handleLetterChange, isAnyMenuOpen],
  );

  // Manual font family selection
  const selectFontFamily = useCallback((familyId) => {
    const family = fontFamilies.find(f => f.id === familyId);
    if (family) {
      setSelectedFontFamily(family);
      
      // Reset to first style of new family
      if (family.font_styles && family.font_styles.length > 0) {
        setSelectedFontStyle(family.font_styles[0]);
      }
      
      // Reset selection state
      setSelectionRecorded(false);
    }
  }, [fontFamilies]);

  // Manual font style selection
  const selectFontStyle = useCallback((styleId) => {
    if (selectedFontFamily && selectedFontFamily.font_styles) {
      const style = selectedFontFamily.font_styles.find(s => s.id === styleId);
      if (style) {
        setSelectedFontStyle(style);
        setSelectionRecorded(false);
      }
    }
  }, [selectedFontFamily]);

  // Add to cart functionality
  const addToCart = useCallback(async () => {
    const lastSelection = localStorage.getItem('lastFontSelection');
    if (!lastSelection) {
      console.error('No font selection found');
      return { success: false, error: 'No font selection found' };
    }

    try {
      const selection = JSON.parse(lastSelection);
      const result = await fontSelectionService.addToCart(selection.selectionId);
      
      if (result.success) {
        // Dispatch event for cart to listen
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('fontAddedToCart', {
            detail: {
              selectionId: selection.selectionId,
              fontFamily: selectedFontFamily,
              fontStyle: selectedFontStyle
            }
          });
          window.dispatchEvent(event);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  }, [selectedFontFamily, selectedFontStyle]);

  // Initialize random letter only on client side
  useEffect(() => {
    setCurrentLetter(getRandomLetter());

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
    return () => clearTimeout(preloadTimeout);
  }, []);

  return {
    // Original slot machine properties
    currentLetter,
    slotMachineRef,
    letterRef,
    isLoaded,
    isAnimating,
    
    // New integration properties
    fontFamilies,
    selectedFontFamily,
    selectedFontStyle,
    sessionInitialized,
    selectionRecorded,
    
    // New integration methods
    selectFontFamily,
    selectFontStyle,
    addToCart,
    recordFontSelection: () => recordFontSelection(currentLetter),
  };
} 