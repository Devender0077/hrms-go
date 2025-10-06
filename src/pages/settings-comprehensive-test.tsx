import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Switch, Select, SelectItem, Progress, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import HeroSection from '../components/common/HeroSection';
import { useSettings } from '../contexts/settings-context';
import { SETTINGS_FEATURES } from '../utils/settings-features';

const SettingsComprehensiveTest: React.FC = () => {
  const { settings, updateSetting, saveAllSettings, saving, loading } = useSettings();
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runComprehensiveTests = async () => {
    setIsRunningTests(true);
    const results: {[key: string]: boolean} = {};
    
    // Test each settings feature
    for (const feature of SETTINGS_FEATURES) {
      try {
        // Test setting update
        const testValue = feature.type === 'boolean' ? true : 
                         feature.type === 'number' ? 42 :
                         feature.type === 'color' ? '#ff0000' :
                         'test-value';
        
        await updateSetting(feature.category, feature.key, testValue);
        results[`${feature.key}_update`] = true;
        
        // Test setting retrieval
        const retrievedValue = settings[feature.category]?.[feature.key];
        results[`${feature.key}_retrieve`] = retrievedValue !== undefined;
        
        // Reset to default
        await updateSetting(feature.category, feature.key, feature.defaultValue);
        results[`${feature.key}_reset`] = true;
        
      } catch (error) {
        console.error(`Test failed for ${feature.key}:`, error);
        results[`${feature.key}_error`] = false;
      }
    }
    
    // Test save all functionality
    try {
      await saveAllSettings();
      results['save_all'] = true;
    } catch (error) {
      console.error('Save all test failed:', error);
      results['save_all'] = false;
    }
    
    setTestResults(results);
    setIsRunningTests(false);
  };

  const getTestStatus = (testName: string) => {
    const result = testResults[testName];
    if (result === undefined) return 'pending';
    return result ? 'success' : 'error';
  };

  const getTestColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'danger';
      default: return 'default';
    }
  };

  const completedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = SETTINGS_FEATURES.length * 3 + 1; // 3 tests per feature + save all
  const testProgress = (completedTests / totalTests) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <HeroSection
        title="Comprehensive Settings Test"
        subtitle="Full system testing and validation"
        description="This page runs comprehensive tests on all settings features to ensure they work correctly."
        icon="lucide:test-tube-2"
        illustration="settings"
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:play-circle" className="text-primary-500 text-xl" />
                <h2 className="text-xl font-semibold">Test Controls</h2>
              </div>
              <Button
                color="primary"
                variant="solid"
                size="lg"
                onPress={runComprehensiveTests}
                isLoading={isRunningTests}
                isDisabled={loading || saving}
                startContent={!isRunningTests ? <Icon icon="lucide:play" className="w-5 h-5" /> : null}
              >
                {isRunningTests ? 'Running Tests...' : 'Run Comprehensive Tests'}
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {isRunningTests && (
              <div className="space-y-4">
                <Progress 
                  value={testProgress} 
                  color="primary" 
                  className="max-w-md"
                  label="Test Progress"
                  valueLabel={`${completedTests}/${totalTests} tests completed`}
                />
                <p className="text-sm text-default-600">
                  Running comprehensive tests on all settings features...
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Test Results Summary */}
        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon icon="lucide:check-circle" className="text-success-500 text-xl" />
                <h2 className="text-xl font-semibold">Test Results Summary</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="lucide:check" className="text-success-600" />
                    <span className="font-medium">Passed</span>
                  </div>
                  <p className="text-2xl font-bold text-success-600">
                    {Object.values(testResults).filter(Boolean).length}
                  </p>
                </div>
                
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="lucide:x" className="text-danger-600" />
                    <span className="font-medium">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-danger-600">
                    {Object.values(testResults).filter(v => v === false).length}
                  </p>
                </div>
                
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="lucide:target" className="text-primary-600" />
                    <span className="font-medium">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round(testProgress)}%
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Individual Feature Tests */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:list-checks" className="text-secondary-500 text-xl" />
              <h2 className="text-xl font-semibold">Individual Feature Tests</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SETTINGS_FEATURES.map((feature) => (
                <div key={feature.key} className="p-4 border border-default-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">{feature.name}</h3>
                    <div className="flex gap-1">
                      <Chip
                        size="sm"
                        color={getTestColor(getTestStatus(`${feature.key}_update`))}
                        variant="flat"
                      >
                        Update
                      </Chip>
                      <Chip
                        size="sm"
                        color={getTestColor(getTestStatus(`${feature.key}_retrieve`))}
                        variant="flat"
                      >
                        Retrieve
                      </Chip>
                      <Chip
                        size="sm"
                        color={getTestColor(getTestStatus(`${feature.key}_reset`))}
                        variant="flat"
                      >
                        Reset
                      </Chip>
                    </div>
                  </div>
                  <p className="text-xs text-default-500 mb-2">{feature.description}</p>
                  <div className="text-xs text-default-400">
                    Type: <span className="font-mono">{feature.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Settings Quick Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:zap" className="text-warning-500 text-xl" />
              <h2 className="text-xl font-semibold">Quick Settings Test</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Test */}
              <div className="space-y-4">
                <h3 className="font-medium">Color Settings Test</h3>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.general?.primaryColor || '#3b82f6'}
                    onChange={(e) => updateSetting('general', 'primaryColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    type="color"
                    value={settings.general?.secondaryColor || '#1e40af'}
                    onChange={(e) => updateSetting('general', 'secondaryColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    type="color"
                    value={settings.general?.accentColor || '#60a5fa'}
                    onChange={(e) => updateSetting('general', 'accentColor', e.target.value)}
                    className="w-20"
                  />
                </div>
                <p className="text-xs text-default-500">
                  Change colors to see instant updates throughout the application
                </p>
              </div>

              {/* Boolean Test */}
              <div className="space-y-4">
                <h3 className="font-medium">Feature Toggle Test</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maintenance Mode</span>
                    <Switch
                      isSelected={settings.general?.maintenanceMode === true || settings.general?.maintenanceMode === 'true'}
                      onValueChange={(value) => updateSetting('general', 'maintenanceMode', value)}
                      color="primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Debug Mode</span>
                    <Switch
                      isSelected={settings.general?.debugMode === true || settings.general?.debugMode === 'true'}
                      onValueChange={(value) => updateSetting('general', 'debugMode', value)}
                      color="primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Backup</span>
                    <Switch
                      isSelected={settings.general?.autoBackup === true || settings.general?.autoBackup === 'true'}
                      onValueChange={(value) => updateSetting('general', 'autoBackup', value)}
                      color="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:book-open" className="text-accent-500 text-xl" />
              <h2 className="text-xl font-semibold">Testing Instructions</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">🧪 Comprehensive Testing:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-default-600">
                  <li>Click "Run Comprehensive Tests" to test all settings features automatically</li>
                  <li>Watch the progress bar and test results in real-time</li>
                  <li>All tests should pass for a fully functional settings system</li>
                  <li>Use the quick test section to manually verify specific features</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">🎨 Manual Testing:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-default-600">
                  <li>Change colors using the color pickers - see instant updates</li>
                  <li>Toggle maintenance mode - see full-screen overlay</li>
                  <li>Toggle debug mode - see debug indicators</li>
                  <li>All changes should be saved automatically and persist on page refresh</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">✅ Expected Results:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-default-600">
                  <li>All tests should pass with 100% success rate</li>
                  <li>Colors should update instantly throughout the application</li>
                  <li>Feature toggles should work immediately</li>
                  <li>Settings should persist across page reloads</li>
                  <li>No console errors should appear during testing</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SettingsComprehensiveTest;
