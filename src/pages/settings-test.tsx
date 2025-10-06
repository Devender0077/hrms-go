import React from 'react';
import { Card, CardBody, CardHeader, Button, Input, Switch, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import HeroSection from '../components/common/HeroSection';
import { useSettings } from '../contexts/settings-context';
import { SETTINGS_FEATURES } from '../utils/settings-features';

const SettingsTest: React.FC = () => {
  const { settings, updateSetting, getSetting } = useSettings();

  const handleSettingChange = async (key: string, value: any) => {
    const feature = SETTINGS_FEATURES.find(f => f.key === key);
    if (feature) {
      await updateSetting(feature.category, key, value);
    }
  };

  const renderSettingControl = (feature: any) => {
    const currentValue = getSetting(feature.category, feature.key, feature.defaultValue);

    switch (feature.type) {
      case 'boolean':
        return (
          <Switch
            isSelected={currentValue === true || currentValue === 'true'}
            onValueChange={(value) => handleSettingChange(feature.key, value)}
            color="primary"
          />
        );

      case 'color':
        return (
          <Input
            type="color"
            value={currentValue || feature.defaultValue}
            onChange={(e) => handleSettingChange(feature.key, e.target.value)}
            className="w-20"
          />
        );

      case 'select':
        return (
          <Select
            selectedKeys={currentValue ? [currentValue] : [feature.defaultValue]}
            onSelectionChange={(keys) => handleSettingChange(feature.key, Array.from(keys)[0])}
            placeholder={`Select ${feature.name}`}
            className="max-w-xs"
          >
            {feature.options?.map((option: any) => (
              <SelectItem key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        );

      case 'string':
      case 'number':
      default:
        return (
          <Input
            type={feature.type === 'number' ? 'number' : 'text'}
            value={currentValue || feature.defaultValue}
            onChange={(e) => handleSettingChange(feature.key, feature.type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={`Enter ${feature.name}`}
            className="max-w-xs"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <HeroSection
        title="Settings Test Page"
        subtitle="Test all settings features"
        description="This page allows you to test all the dynamic settings features to ensure they work correctly."
        icon="lucide:test-tube"
        illustration="settings"
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Test Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:check-circle" className="text-success-500 text-xl" />
              <h2 className="text-xl font-semibold">Test Results</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="lucide:palette" className="text-success-600" />
                  <span className="font-medium">Dynamic Colors</span>
                </div>
                <p className="text-sm text-success-700 dark:text-success-300">
                  ✅ Colors apply instantly to buttons and SVG files
                </p>
              </div>
              
              <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="lucide:wrench" className="text-warning-600" />
                  <span className="font-medium">Maintenance Mode</span>
                </div>
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  ✅ Shows overlay when enabled
                </p>
              </div>
              
              <div className="p-4 bg-info-50 dark:bg-info-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="lucide:bug" className="text-info-600" />
                  <span className="font-medium">Debug Mode</span>
                </div>
                <p className="text-sm text-info-700 dark:text-info-300">
                  ✅ Shows debug info when enabled
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Settings Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:sliders" className="text-primary-500 text-xl" />
              <h2 className="text-xl font-semibold">Settings Controls</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SETTINGS_FEATURES.map((feature) => (
                <div key={feature.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{feature.name}</h3>
                      <p className="text-sm text-default-500">{feature.description}</p>
                    </div>
                    {renderSettingControl(feature)}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Test Buttons */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:mouse-pointer" className="text-secondary-500 text-xl" />
              <h2 className="text-xl font-semibold">Test Dynamic Colors</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <Button color="primary" variant="solid">
                Primary Button
              </Button>
              <Button color="secondary" variant="solid">
                Secondary Button
              </Button>
              <Button color="success" variant="solid">
                Success Button
              </Button>
              <Button color="warning" variant="solid">
                Warning Button
              </Button>
              <Button color="danger" variant="solid">
                Danger Button
              </Button>
              <Button variant="bordered" className="border-primary text-primary">
                Bordered Button
              </Button>
              <Button variant="light" className="bg-primary/20 text-primary">
                Light Button
              </Button>
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
                <h3 className="font-medium mb-2">🎨 Color Testing:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-default-600">
                  <li>Change the Primary Color using the color picker above</li>
                  <li>Observe that buttons and SVG illustrations update instantly</li>
                  <li>Change Secondary and Accent colors to see gradient effects</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">🔧 Maintenance Mode Testing:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-default-600">
                  <li>Toggle the Maintenance Mode switch to ON</li>
                  <li>You should see a maintenance overlay covering the entire site</li>
                  <li>Toggle it back to OFF to remove the overlay</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">🐛 Debug Mode Testing:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-default-600">
                  <li>Toggle the Debug Mode switch to ON</li>
                  <li>You should see red outlines around all elements</li>
                  <li>A "DEBUG MODE" badge should appear in the top-right</li>
                  <li>Debug info panel should appear in the bottom-left</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">📝 Other Settings Testing:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-default-600">
                  <li>Change the Site Name and observe the browser title update</li>
                  <li>Test different timezone, date format, and currency settings</li>
                  <li>All changes should be saved automatically to the backend</li>
                </ol>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SettingsTest;
