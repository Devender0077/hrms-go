/**
 * i18next Configuration
 * Professional internationalization setup for HRMS
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import zhTranslations from './locales/zh.json';
import arTranslations from './locales/ar.json';
import ptTranslations from './locales/pt.json';
import ruTranslations from './locales/ru.json';
import jaTranslations from './locales/ja.json';

// Translation resources
const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  },
  es: {
    translation: esTranslations
  },
  fr: {
    translation: frTranslations
  },
  de: {
    translation: deTranslations
  },
  zh: {
    translation: zhTranslations
  },
  ar: {
    translation: arTranslations
  },
  pt: {
    translation: ptTranslations
  },
  ru: {
    translation: ruTranslations
  },
  ja: {
    translation: jaTranslations
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: false, // Disable suspense for better error handling
    },
  });

export default i18n;

