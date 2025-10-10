import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  i18n?: any;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

/**
 * TranslationProvider - Now uses i18next under the hood
 * This provides backward compatibility for existing components
 * while leveraging the power of i18next
 */
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  // Use i18next hooks
  const { t: i18nT, i18n } = useI18nextTranslation();

  // Force re-render when language changes
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = i18n.language;
    setCurrentLanguage(i18n.language);
    console.log(`✅ Language changed to: ${i18n.language}`);
  }, [i18n.language]);

  // Language change listener
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
      document.documentElement.lang = lng;
      console.log(`✅ i18next language changed to: ${lng}`);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Translation function with backward compatibility
  const t = (key: string): string => {
    // Try i18next translation first
    const translated = i18nT(key);
    
    // If the translation returns the key itself (not found), return the key
    // This maintains backward compatibility with components using simple keys
    return translated;
  };

  // Language setter that uses i18next
  const setLanguage = (lang: string) => {
    console.log(`🔄 Changing language to: ${lang}`);
    i18n.changeLanguage(lang);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language: currentLanguage,
    setLanguage,
    t,
    i18n
  }), [currentLanguage, i18n]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * useTranslation hook - Now uses i18next
 * Maintains the same API for backward compatibility
 */
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
