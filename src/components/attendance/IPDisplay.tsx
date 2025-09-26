import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiRequest } from '../../services/api-service';

interface IPDisplayProps {
  onIPDetected?: (ip: string) => void;
}

const IPDisplay: React.FC<IPDisplayProps> = ({ onIPDetected }) => {
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectIP = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get IP from a public service first
      const publicIPResponse = await fetch('https://api.ipify.org?format=json');
      const publicIPData = await publicIPResponse.json();
      
      // Also get detailed info from our backend
      const backendResponse = await apiRequest('/test-ip');
      
      const ipData = {
        publicIP: publicIPData.ip,
        backendInfo: backendResponse,
        timestamp: new Date().toISOString()
      };
      
      setIpInfo(ipData);
      if (onIPDetected) {
        onIPDetected(publicIPData.ip);
      }
    } catch (error) {
      console.error('IP detection error:', error);
      setError('Failed to detect IP address');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    detectIP();
  }, []);

  return (
    <Card className="shadow-lg rounded-xl border-l-4 border-l-warning">
      <CardBody className="p-6">
        {/* Security Warning */}
        <div className="mb-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:shield-check" className="text-warning-600 text-sm" />
            <p className="text-sm text-warning-800 font-semibold">Admin Only</p>
          </div>
          <p className="text-xs text-warning-700 mt-1">
            This information is sensitive and should only be visible to system administrators.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary shadow-lg">
              <Icon icon="lucide:shield-check" className="text-lg text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-default-900">IP Address Detection</h3>
              <p className="text-sm text-default-500">Admin-only: Current IP address information</p>
            </div>
          </div>
          
          <Button
            color="primary"
            variant="flat"
            startContent={loading ? <Spinner size="sm" color="current" /> : <Icon icon="lucide:refresh-cw" />}
            onPress={detectIP}
            isLoading={loading}
            size="sm"
            className="rounded-lg"
          >
            {loading ? 'Detecting...' : 'Refresh'}
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:alert-circle" className="text-danger-500 text-sm" />
              <p className="text-sm text-danger-700 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {ipInfo && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardBody className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="lucide:globe" className="text-primary text-sm" />
                    <span className="text-sm font-semibold text-default-700">Public IP</span>
                  </div>
                  <p className="text-lg font-mono text-default-900 font-bold">{ipInfo.publicIP}</p>
                </CardBody>
              </Card>
              
              <Card className="shadow-sm">
                <CardBody className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="lucide:server" className="text-success text-sm" />
                    <span className="text-sm font-semibold text-default-700">Backend Detected</span>
                  </div>
                  <p className="text-lg font-mono text-default-900 font-bold">
                    {ipInfo.backendInfo['detected-ip'] || ipInfo.backendInfo['req.ip'] || 'Unknown'}
                  </p>
                </CardBody>
              </Card>
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-default-700 hover:text-default-900 flex items-center gap-2">
                <Icon icon="lucide:chevron-down" className="text-xs" />
                View Detailed Information
              </summary>
              <div className="mt-2 p-4 bg-default-50 rounded-lg">
                <pre className="text-xs text-default-600 overflow-auto font-mono">
                  {JSON.stringify(ipInfo, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default IPDisplay;
