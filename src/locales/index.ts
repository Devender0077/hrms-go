/**
 * Translation Dictionary - Modular Structure
 * Each language in its own file for better maintainability
 */

import { en } from './en';
import { hi } from './hi';

// Import other languages (create files as needed)
// import { es } from './es';
// import { fr } from './fr';
// import { de } from './de';
// import { zh } from './zh';
// import { ar } from './ar';
// import { pt } from './pt';
// import { ru } from './ru';
// import { ja } from './ja';

/**
 * Main translations object
 * Add new languages here as they're created
 */
export const translations = {
  en,
  hi,
  // Add more languages:
  es: en, // Fallback to English for now
  fr: en,
  de: en,
  zh: en,
  ar: en,
  pt: en,
  ru: en,
  ja: en,
};

export default translations;

