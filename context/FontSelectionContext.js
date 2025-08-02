import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getFontFamilies, recordFontSelection } from '../lib/database/supabaseClient';

const FontSelectionContext = createContext();

export const useFontSelection = () => {
  const context = useContext(FontSelectionContext);
  if (!context) {
    throw new Error('useFontSelection must be used within a FontSelectionProvider');
  }
  return context;
};

export const FontSelectionProvider = ({ children }) => {
  const [availableFonts, setAvailableFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState(null);
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available fonts from database
  useEffect(() => {
    loadAvailableFonts();
  }, []);

  const loadAvailableFonts = async () => {
    try {
      setLoading(true);
      const { data: fonts, error } = await getFontFamilies({
        featured: true,
        orderBy: 'sort_order'
      });

      if (error) {
        console.error('Error loading fonts:', error);
        setError(error);
        setAvailableFonts([]);
      } else {
        setAvailableFonts(fonts || []);
      }

      // Set initial selected font
      if (fonts && fonts.length > 0) {
        setSelectedFont(fonts[0]);
        setCurrentFontIndex(0);
      }
    } catch (err) {
      console.error('Error loading fonts:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const selectFont = useCallback(async (fontIndex, userId = null, sessionId = null) => {
    if (fontIndex >= 0 && fontIndex < availableFonts.length) {
      const font = availableFonts[fontIndex];
      setSelectedFont(font);
      setCurrentFontIndex(fontIndex);

      // Record font selection in database
      try {
        await recordFontSelection({
          font_family_id: font.id,
          user_id: userId,
          session_id: sessionId,
          selection_method: 'slot_machine',
          selected_letter: font.name.charAt(0).toUpperCase()
        });
      } catch (err) {
        console.error('Error recording font selection:', err);
        // Don't throw error - selection still works without recording
      }
    }
  }, [availableFonts]);

  const selectFontBySlug = useCallback(async (slug, userId = null, sessionId = null) => {
    // Try exact match first
    let fontIndex = availableFonts.findIndex(font => font.slug === slug);
    
    // If not found, try case-insensitive match (for capitalized URLs)
    if (fontIndex === -1) {
      fontIndex = availableFonts.findIndex(font => 
        font.slug.toLowerCase() === slug.toLowerCase()
      );
    }
    
    if (fontIndex >= 0) {
      await selectFont(fontIndex, userId, sessionId);
    }
  }, [availableFonts, selectFont]);

  const getNextFont = () => {
    return availableFonts[(currentFontIndex + 1) % availableFonts.length];
  };

  const getPreviousFont = () => {
    return availableFonts[(currentFontIndex - 1 + availableFonts.length) % availableFonts.length];
  };

  const selectNextFont = async (userId = null, sessionId = null) => {
    const nextIndex = (currentFontIndex + 1) % availableFonts.length;
    await selectFont(nextIndex, userId, sessionId);
  };

  const selectPreviousFont = async (userId = null, sessionId = null) => {
    const prevIndex = (currentFontIndex - 1 + availableFonts.length) % availableFonts.length;
    await selectFont(prevIndex, userId, sessionId);
  };

  const getSelectedFontStyle = (styleName = 'Regular') => {
    if (!selectedFont || !selectedFont.font_styles) return null;
    return selectedFont.font_styles.find(style => 
      style.name.toLowerCase() === styleName.toLowerCase()
    ) || selectedFont.font_styles[0];
  };

  const getSelectedFontFiles = (styleName = 'Regular') => {
    const style = getSelectedFontStyle(styleName);
    return style ? style.font_files : null;
  };

  const getSelectedFontSlug = () => {
    return selectedFont ? selectedFont.slug : null;
  };

  const getSelectedFontSlugCapitalized = () => {
    if (!selectedFont || !selectedFont.slug) return null;
    return selectedFont.slug.charAt(0).toUpperCase() + selectedFont.slug.slice(1);
  };

  const value = {
    // State
    availableFonts,
    selectedFont,
    currentFontIndex,
    loading,
    error,
    
    // Actions
    selectFont,
    selectFontBySlug,
    selectNextFont,
    selectPreviousFont,
    loadAvailableFonts,
    
    // Getters
    getNextFont,
    getPreviousFont,
    getSelectedFontStyle,
    getSelectedFontFiles,
    getSelectedFontSlug,
    getSelectedFontSlugCapitalized,
    
    // Computed values
    hasMultipleFonts: availableFonts.length > 1,
    canLoadMore: availableFonts.length > 0, // For future "Load More" functionality
  };

  return (
    <FontSelectionContext.Provider value={value}>
      {children}
    </FontSelectionContext.Provider>
  );
};

export default FontSelectionContext; 