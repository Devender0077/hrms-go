import React, { useEffect } from 'react';
import { useSettings } from '../../contexts/settings-context';

interface DynamicPageTitleProps {
  pageName: string;
  suffix?: string;
}

const DynamicPageTitle: React.FC<DynamicPageTitleProps> = ({ 
  pageName, 
  suffix = "Human Resource Management System" 
}) => {
  const { getSiteName, loading } = useSettings();

  useEffect(() => {
    if (!loading) {
      const siteName = getSiteName();
      document.title = `${pageName} | ${siteName} - ${suffix}`;
    }
  }, [pageName, suffix, getSiteName, loading]);

  return null; // This component doesn't render anything
};

export default DynamicPageTitle;
