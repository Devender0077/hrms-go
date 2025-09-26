import React from "react";
import { Input, Select, SelectItem, Switch, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface GeneralSettingsProps {
  settings: {
    siteName: string;
    siteDescription: string;
    siteLogo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    rtlEnabled: boolean;
    maintenanceMode: boolean;
    debugMode: boolean;
    autoBackup: boolean;
    sessionTimeout: number;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:settings" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">General Settings</h2>
          <p className="text-gray-600">Basic system configuration and preferences</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Site Name"
          placeholder="Enter site name"
          value={settings.siteName}
          onValueChange={(value) => onSettingsChange("siteName", value)}
        />
        <Input
          label="Site Description"
          placeholder="Enter site description"
          value={settings.siteDescription}
          onValueChange={(value) => onSettingsChange("siteDescription", value)}
        />
        <Input
          label="Primary Color"
          type="color"
          value={settings.primaryColor}
          onValueChange={(value) => onSettingsChange("primaryColor", value)}
        />
        <Input
          label="Secondary Color"
          type="color"
          value={settings.secondaryColor}
          onValueChange={(value) => onSettingsChange("secondaryColor", value)}
        />
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={settings.sessionTimeout.toString()}
          onValueChange={(value) => onSettingsChange("sessionTimeout", parseInt(value))}
        />
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">System Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
            </div>
            <Switch
              isSelected={settings.maintenanceMode}
              onValueChange={(value) => onSettingsChange("maintenanceMode", value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Debug Mode</p>
              <p className="text-sm text-gray-500">Enable debug mode for development</p>
            </div>
            <Switch
              isSelected={settings.debugMode}
              onValueChange={(value) => onSettingsChange("debugMode", value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Backup</p>
              <p className="text-sm text-gray-500">Automatically backup system data</p>
            </div>
            <Switch
              isSelected={settings.autoBackup}
              onValueChange={(value) => onSettingsChange("autoBackup", value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">RTL Support</p>
              <p className="text-sm text-gray-500">Enable right-to-left language support</p>
            </div>
            <Switch
              isSelected={settings.rtlEnabled}
              onValueChange={(value) => onSettingsChange("rtlEnabled", value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
