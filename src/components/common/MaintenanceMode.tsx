import React from 'react';
import { useSettings } from '../../contexts/settings-context';

interface MaintenanceModeProps {
  children: React.ReactNode;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ children }) => {
  const { getSetting } = useSettings();
  
  const isMaintenanceMode = getSetting('general', 'maintenanceMode', false);
  
  if (isMaintenanceMode) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-md mx-4">
          <div className="text-6xl mb-6 opacity-80">🔧</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Site Under Maintenance
          </h1>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            We're currently performing scheduled maintenance to improve your experience. 
            Please check back shortly.
          </p>
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default MaintenanceMode;
