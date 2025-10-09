import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations as modularTranslations } from '../locales/index';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Merge imported translations with existing ones
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.loading': 'Loading...',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.update': 'Update',
    'common.create': 'Create',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Employees',
    'nav.attendance': 'Attendance',
    'nav.leave': 'Leave',
    'nav.payroll': 'Payroll',
    'nav.recruitment': 'Recruitment',
    'nav.settings': 'Settings',
    'nav.reports': 'Reports',
    'nav.timekeeping': 'Timekeeping',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    
    // Employees
    'employees.title': 'Employees',
    'employees.add': 'Add Employee',
    'employees.total': 'Total Employees',
    'employees.active': 'Active Employees',
    'employees.onLeave': 'On Leave',
    
    // Attendance
    'attendance.title': 'Attendance',
    'attendance.checkIn': 'Check In',
    'attendance.checkOut': 'Check Out',
    'attendance.present': 'Present',
    'attendance.absent': 'Absent',
    'attendance.halfDay': 'Half Day',
    'attendance.late': 'Late',
    'attendance.holiday': 'Holiday',
    'attendance.weekend': 'Weekend',
    'attendance.muster': 'Attendance Muster',
    
    // Leave
    'leave.title': 'Leave',
    'leave.holidays': 'Holidays',
    'leave.apply': 'Apply Leave',
    'leave.requests': 'Leave Requests',
    
    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General Settings',
    'settings.integrations': 'Integrations',
    'settings.localization': 'Localization',
    'settings.saveSettings': 'Save Settings',
    
    // Holidays
    'holidays.title': 'Holidays',
    'holidays.add': 'Add Holiday',
    'holidays.total': 'Total Holidays',
    'holidays.india': 'India Holidays',
    'holidays.usa': 'USA Holidays',
    'holidays.national': 'National Holidays',
  },
  hi: {
    // Common
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.add': 'जोड़ें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.actions': 'कार्य',
    'common.status': 'स्थिति',
    'common.active': 'सक्रिय',
    'common.inactive': 'निष्क्रिय',
    'common.loading': 'लोड हो रहा है...',
    'common.yes': 'हाँ',
    'common.no': 'नहीं',
    'common.close': 'बंद करें',
    'common.submit': 'जमा करें',
    'common.update': 'अपडेट करें',
    'common.create': 'बनाएं',
    
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.employees': 'कर्मचारी',
    'nav.attendance': 'उपस्थिति',
    'nav.leave': 'अवकाश',
    'nav.payroll': 'वेतन',
    'nav.recruitment': 'भर्ती',
    'nav.settings': 'सेटिंग्स',
    'nav.reports': 'रिपोर्ट',
    'nav.timekeeping': 'समय प्रबंधन',
    
    // Dashboard
    'dashboard.title': 'डैशबोर्ड',
    'dashboard.welcome': 'स्वागत है',
    'dashboard.overview': 'अवलोकन',
    
    // Employees
    'employees.title': 'कर्मचारी',
    'employees.add': 'कर्मचारी जोड़ें',
    'employees.total': 'कुल कर्मचारी',
    'employees.active': 'सक्रिय कर्मचारी',
    'employees.onLeave': 'छुट्टी पर',
    
    // Attendance
    'attendance.title': 'उपस्थिति',
    'attendance.checkIn': 'चेक इन',
    'attendance.checkOut': 'चेक आउट',
    'attendance.present': 'उपस्थित',
    'attendance.absent': 'अनुपस्थित',
    'attendance.halfDay': 'आधा दिन',
    'attendance.late': 'देर से',
    'attendance.holiday': 'छुट्टी',
    'attendance.weekend': 'सप्ताहांत',
    'attendance.muster': 'उपस्थिति रजिस्टर',
    
    // Leave
    'leave.title': 'अवकाश',
    'leave.holidays': 'छुट्टियां',
    'leave.apply': 'अवकाश के लिए आवेदन करें',
    'leave.requests': 'अवकाश अनुरोध',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.general': 'सामान्य सेटिंग्स',
    'settings.integrations': 'एकीकरण',
    'settings.localization': 'स्थानीयकरण',
    'settings.saveSettings': 'सेटिंग्स सहेजें',
    
    // Holidays
    'holidays.title': 'छुट्टियां',
    'holidays.add': 'छुट्टी जोड़ें',
    'holidays.total': 'कुल छुट्टियां',
    'holidays.india': 'भारत की छुट्टियां',
    'holidays.usa': 'यूएसए की छुट्टियां',
    'holidays.national': 'राष्ट्रीय छुट्टियां',
  },
  // Add more languages as needed
};

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<string>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('hrms-language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
    setIsInitialized(true);
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (isInitialized && language) {
      localStorage.setItem('hrms-language', language);
      // Update HTML lang attribute
      document.documentElement.lang = language;
      console.log(`Language set to: ${language}`);
    }
  }, [language, isInitialized]);

  // Translation function
  const t = (key: string): string => {
    // First check modular translations (simple keys like "Dashboard")
    const modularDict = modularTranslations[language as keyof typeof modularTranslations] || modularTranslations.en;
    if (modularDict && modularDict[key as keyof typeof modularDict]) {
      return modularDict[key as keyof typeof modularDict];
    }
    
    // Then check namespaced translations (like "common.save")
    const languageDict = translations[language] || translations.en;
    return languageDict[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
