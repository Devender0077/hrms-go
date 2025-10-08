/**
 * Higher Order Component for Translation
 * Automatically provides translation function to any component
 */

import React from 'react';
import { useTranslation } from '../../contexts/translation-context';

export interface WithTranslationProps {
  t: (key: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
}

export function withTranslation<P extends object>(
  Component: React.ComponentType<P & WithTranslationProps>
) {
  return function WithTranslationComponent(props: P) {
    const { t, language, setLanguage } = useTranslation();
    
    return <Component {...props} t={t} language={language} setLanguage={setLanguage} />;
  };
}

// Hook version (preferred)
export { useTranslation };
