import { useState, useRef, useEffect } from 'react';
import { FONT_TESTER_TEXTS } from './FontTesterTextConstants';

// Function to shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useFontTesterState = () => {
  // Keep track of used texts to avoid immediate repetition
  const usedTextsRef = useRef(new Set());
  const shuffledTextsRef = useRef(shuffleArray(FONT_TESTER_TEXTS));
  
  // Function to get a new random text
  const getRandomText = () => {
    // If we've used all texts or shuffled array is empty, reset and reshuffle
    if (usedTextsRef.current.size >= FONT_TESTER_TEXTS.length || shuffledTextsRef.current.length === 0) {
      usedTextsRef.current.clear();
      shuffledTextsRef.current = shuffleArray(FONT_TESTER_TEXTS);
    }
    
    // Get the next text from our shuffled array
    const nextText = shuffledTextsRef.current.pop();
    usedTextsRef.current.add(nextText);
    return nextText;
  };

  const randomText = useRef(getRandomText());

  const [text, setText] = useState(" ");
  const [isTyping, setIsTyping] = useState(true);
  const [isManuallySet, setIsManuallySet] = useState(false);
  
  const [settings, setSettings] = useState({
    lineHeight: 1,
    letterSpacing: 0
  });

  const textRef = useRef(null);
  const typeTimer = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    const fullText = randomText.current;
    
    const typeText = () => {
      if (currentIndex <= fullText.length) {
        // Start by clearing the initial space, then type the text
        const displayText = currentIndex === 0 ? "" : fullText.substring(0, currentIndex);
        setText(displayText);
        currentIndex++;
        
        if (currentIndex <= fullText.length) {
          typeTimer.current = setTimeout(typeText, 30);
        } else {
          setIsTyping(false);
          // Focus and position cursor at the end like a normal text editor
          setTimeout(() => {
            if (textRef.current) {
              textRef.current.focus();
              // Position cursor at the end
              const range = document.createRange();
              const selection = window.getSelection();
              range.selectNodeContents(textRef.current);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }, 100);
        }
      }
    };

    // Add a delay to ensure proper layout calculation before starting typing
    const startTyping = () => {
      // Force a layout calculation by accessing offsetHeight
      setTimeout(() => {
        // Ensure the text element is properly mounted
        if (textRef.current) {
          // Force multiple reflows to ensure proper center calculation
          textRef.current.getBoundingClientRect();
          // Force the parent container to recalculate as well
          const parent = textRef.current.parentElement;
          if (parent) {
            parent.getBoundingClientRect();
          }
          // Additional small delay to let the browser finish all layout calculations
          setTimeout(() => {
            setIsReady(true);
            typeText();
          }, 100);
        } else {
          setIsReady(true);
          typeText();
        }
      }, 300);
    };

    startTyping();
    return () => clearTimeout(typeTimer.current);
  }, []);

  const handleReset = () => {
    setIsManuallySet(false);
    setText(" ");
    // Get a new random text when resetting
    randomText.current = getRandomText();
    setIsTyping(true);
    setSettings({
      lineHeight: 1,
      letterSpacing: 0
    });
  };

  return {
    text,
    setText,
    settings,
    setSettings,
    isTyping,
    setIsTyping,
    textRef,
    handleReset,
    isManuallySet,
    isReady
  };
};