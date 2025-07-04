import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabase/Supabase';
import { generateSessionId, getBrowserInfo, getClientIP } from './utils';

const CookiesPanelContext = createContext({
  showCookiesPanel: false,
  setShowCookiesPanel: () => {},
  cookiesAccepted: null,
  acceptCookies: () => {},
  declineCookies: () => {},
  resetCookies: () => {},
});

export const useCookiesPanel = () => useContext(CookiesPanelContext);

export function CookiesPanelProvider({ children, testMode = false, forceShow = false }) {
  const [showCookiesPanel, setShowCookiesPanel] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const debugLog = (message, data = '') => {
    if (testMode || process.env.NODE_ENV === 'development') {
      // Debug logging disabled for production
    }
  };

  useEffect(() => {
    initializeCookiesPanel();
  }, [testMode, forceShow]);

  const initializeCookiesPanel = async () => {
    debugLog('Initializing cookies panel...', { testMode, forceShow });
    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
        if (storedSessionId) {
          currentSessionId = storedSessionId;
          setSessionId(storedSessionId);
          debugLog('Using stored session ID:', storedSessionId);
        } else {
          const newSessionId = generateSessionId();
          currentSessionId = newSessionId;
          setSessionId(newSessionId);
          if (typeof window !== 'undefined') {
            localStorage.setItem('sessionId', newSessionId);
          }
          debugLog('Generated new session ID:', newSessionId);
        }
      }
      if (forceShow) {
        debugLog('Force showing panel');
        setShowCookiesPanel(true);
        setIsLoading(false);
        return;
      }
      const storedPreference = typeof window !== 'undefined' ? localStorage.getItem('cookiesAccepted') : null;
      debugLog('Stored preference:', storedPreference);
      if (storedPreference !== null) {
        const accepted = storedPreference === 'true';
        setCookiesAccepted(accepted);
        setShowCookiesPanel(false);
        debugLog('Using stored preference:', accepted);
        setIsLoading(false);
        return;
      }
      if (!testMode && currentSessionId) {
        await checkDatabaseConsent(currentSessionId);
      } else {
        debugLog('Test mode - showing panel');
        setShowCookiesPanel(true);
      }
    } catch (error) {
      debugLog('Error initializing:', error);
      setShowCookiesPanel(true);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDatabaseConsent = async (currentSessionId) => {
    debugLog('Checking database consent for session:', currentSessionId);
    try {
      const { data, error } = await supabase
        .from('cookie_consent')
        .select('consent_given')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) {
        debugLog('Database error:', error);
        setShowCookiesPanel(true);
        return;
      }
      debugLog('Database response:', data);
      if (data && data.length > 0) {
        const consentGiven = data[0].consent_given;
        setCookiesAccepted(consentGiven);
        setShowCookiesPanel(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cookiesAccepted', consentGiven.toString());
        }
        debugLog('Found existing consent:', consentGiven);
      } else {
        debugLog('No existing consent found - showing panel');
        setShowCookiesPanel(true);
      }
    } catch (err) {
      debugLog('Database check failed:', err);
      setShowCookiesPanel(true);
    }
  };

  const saveConsentToDatabase = async (consentGiven) => {
    if (!sessionId) {
      debugLog('No session ID - skipping database save');
      return;
    }
    debugLog('Saving consent to database:', { consentGiven, sessionId });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        debugLog('User auth error (continuing as anonymous):', userError);
      }
      const userId = user?.id || null;
      const clientIP = await getClientIP();
      const insertData = {
        user_id: userId,
        session_id: sessionId,
        consent_given: consentGiven,
        user_agent: getBrowserInfo(),
        consent_version: '1.0',
        client_ip: clientIP,
      };
      debugLog('Insert data:', insertData);
      const { data, error } = await supabase
        .from('cookie_consent')
        .insert([insertData])
        .select();
      if (error) {
        debugLog('Database insert error:', error);
      } else {
        debugLog('Successfully saved consent:', data);
      }
    } catch (err) {
      debugLog('Failed to save consent to database:', err);
    }
  };

  const acceptCookies = async () => {
    debugLog('Accepting cookies');
    setCookiesAccepted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookiesAccepted', 'true');
    }
    if (!testMode) {
      await saveConsentToDatabase(true);
    }
    setShowCookiesPanel(false);
  };

  const declineCookies = async () => {
    debugLog('Declining cookies');
    setCookiesAccepted(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookiesAccepted', 'false');
    }
    if (!testMode) {
      await saveConsentToDatabase(false);
    }
    setShowCookiesPanel(false);
  };

  const resetCookies = () => {
    debugLog('Resetting cookies');
    setCookiesAccepted(null);
    setShowCookiesPanel(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cookiesAccepted');
    }
  };

  return (
    <CookiesPanelContext.Provider
      value={{
        showCookiesPanel,
        setShowCookiesPanel,
        cookiesAccepted,
        acceptCookies,
        declineCookies,
        resetCookies,
        isLoading,
      }}
    >
      {children}
    </CookiesPanelContext.Provider>
  );
} 