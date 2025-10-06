import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/settings-context';

interface DebugModeProps {
  children: React.ReactNode;
}

const DebugMode: React.FC<DebugModeProps> = ({ children }) => {
  const { getSetting } = useSettings();
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const isDebugMode = getSetting('general', 'debugMode', false);
  
  useEffect(() => {
    if (isDebugMode) {
      const updateDebugInfo = () => {
        setDebugInfo({
          timestamp: new Date().toLocaleTimeString(),
          userAgent: navigator.userAgent.substring(0, 50) + '...',
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          url: window.location.href,
          memory: (performance as any).memory ? {
            used: Math.round((performance as any).memory.usedJSHeapSize / 1048576) + ' MB',
            total: Math.round((performance as any).memory.totalJSHeapSize / 1048576) + ' MB'
          } : null
        });
      };
      
      updateDebugInfo();
      const interval = setInterval(updateDebugInfo, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isDebugMode]);
  
  if (isDebugMode) {
    return (
      <div className="debug-mode">
        <div className="fixed top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm font-bold z-50">
          DEBUG MODE
        </div>
        
        <div className="fixed bottom-2 left-2 bg-black/80 text-white p-3 rounded text-xs max-w-xs z-50">
          <div className="font-bold mb-2">Debug Info</div>
          <div>Time: {debugInfo.timestamp}</div>
          <div>Viewport: {debugInfo.viewport}</div>
          <div>URL: {debugInfo.url}</div>
          {debugInfo.memory && (
            <>
              <div>Memory Used: {debugInfo.memory.used}</div>
              <div>Memory Total: {debugInfo.memory.total}</div>
            </>
          )}
        </div>
        
        <style dangerouslySetInnerHTML={{
          __html: `
            .debug-mode * {
              outline: 1px solid rgba(255, 0, 0, 0.2) !important;
            }
          `
        }} />
        
        {children}
      </div>
    );
  }
  
  return <>{children}</>;
};

export default DebugMode;
