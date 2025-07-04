import { useState, useEffect } from 'react';
import { isSafari } from '../../../lib/browserUtils';

export const useTermsState = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    setIsReady(true);
    
    const safariCheck = isSafari();
    setIsSafariBrowser(safariCheck);
    
    if (safariCheck) {
        document.documentElement.classList.add('safari');
    }
    
    return () => {
      setIsExiting(true);
    };
  }, []);

  return {
    isVisible,
    isExiting,
    isSafari: isSafariBrowser,
    isReady,
    setIsVisible,
    setIsExiting
  };
}; 