/**
 * Translation Dictionary - Modular Structure
 * Each language in its own file for better maintainability
 */

import { en } from './en';
import { hi } from './hi';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';

// Import other languages (create files as needed)
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
  es,
  fr,
  de,
  // Add more languages (fallback to English for now):
  zh: en,
  ar: en,
  pt: en,
  ru: en,
  ja: en,
};

export default translations;

