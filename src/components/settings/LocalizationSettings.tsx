import React from "react";
import { Input, Select, SelectItem, CheckboxGroup, Checkbox, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface LocalizationSettingsProps {
  settings: {
    defaultLanguage: string;
    supportedLanguages: string[];
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
    currencySymbol: string;
    numberFormat: string;
    firstDayOfWeek: string;
    businessDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function LocalizationSettings({ settings, onSettingsChange }: LocalizationSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:globe" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Localization Settings</h2>
          <p className="text-gray-600">Configure language, timezone, and regional preferences</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Default Language"
          selectedKeys={[settings.defaultLanguage]}
          onSelectionChange={(keys) => onSettingsChange("defaultLanguage", Array.from(keys)[0])}
        >
          <SelectItem key="en" value="en">English</SelectItem>
          <SelectItem key="es" value="es">Spanish</SelectItem>
          <SelectItem key="fr" value="fr">French</SelectItem>
          <SelectItem key="de" value="de">German</SelectItem>
          <SelectItem key="zh" value="zh">Chinese</SelectItem>
        </Select>
        <Select
          label="Timezone"
          selectedKeys={[settings.timezone]}
          onSelectionChange={(keys) => onSettingsChange("timezone", Array.from(keys)[0])}
        >
          <SelectItem key="America/New_York" value="America/New_York">Eastern Time</SelectItem>
          <SelectItem key="America/Chicago" value="America/Chicago">Central Time</SelectItem>
          <SelectItem key="America/Denver" value="America/Denver">Mountain Time</SelectItem>
          <SelectItem key="America/Los_Angeles" value="America/Los_Angeles">Pacific Time</SelectItem>
          <SelectItem key="Europe/London" value="Europe/London">London</SelectItem>
          <SelectItem key="Europe/Paris" value="Europe/Paris">Paris</SelectItem>
          <SelectItem key="Asia/Tokyo" value="Asia/Tokyo">Tokyo</SelectItem>
        </Select>
        <Select
          label="Date Format"
          selectedKeys={[settings.dateFormat]}
          onSelectionChange={(keys) => onSettingsChange("dateFormat", Array.from(keys)[0])}
        >
          <SelectItem key="MM/DD/YYYY" value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
          <SelectItem key="DD/MM/YYYY" value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
          <SelectItem key="YYYY-MM-DD" value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
        </Select>
        <Select
          label="Time Format"
          selectedKeys={[settings.timeFormat]}
          onSelectionChange={(keys) => onSettingsChange("timeFormat", Array.from(keys)[0])}
        >
          <SelectItem key="12h" value="12h">12 Hour</SelectItem>
          <SelectItem key="24h" value="24h">24 Hour</SelectItem>
        </Select>
        <Select
          label="Currency"
          selectedKeys={[settings.currency]}
          onSelectionChange={(keys) => onSettingsChange("currency", Array.from(keys)[0])}
        >
          <SelectItem key="USD" value="USD">USD - US Dollar</SelectItem>
          <SelectItem key="EUR" value="EUR">EUR - Euro</SelectItem>
          <SelectItem key="GBP" value="GBP">GBP - British Pound</SelectItem>
          <SelectItem key="JPY" value="JPY">JPY - Japanese Yen</SelectItem>
          <SelectItem key="CAD" value="CAD">CAD - Canadian Dollar</SelectItem>
        </Select>
        <Input
          label="Currency Symbol"
          value={settings.currencySymbol}
          onValueChange={(value) => onSettingsChange("currencySymbol", value)}
        />
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Start Time"
            type="time"
            value={settings.workingHours.start}
            onValueChange={(value) => onSettingsChange("workingHours", { ...settings.workingHours, start: value })}
          />
          <Input
            label="End Time"
            type="time"
            value={settings.workingHours.end}
            onValueChange={(value) => onSettingsChange("workingHours", { ...settings.workingHours, end: value })}
          />
        </div>
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Days</h3>
        <CheckboxGroup
          value={settings.businessDays}
          onValueChange={(value) => onSettingsChange("businessDays", value)}
          orientation="horizontal"
        >
          <Checkbox value="monday">Monday</Checkbox>
          <Checkbox value="tuesday">Tuesday</Checkbox>
          <Checkbox value="wednesday">Wednesday</Checkbox>
          <Checkbox value="thursday">Thursday</Checkbox>
          <Checkbox value="friday">Friday</Checkbox>
          <Checkbox value="saturday">Saturday</Checkbox>
          <Checkbox value="sunday">Sunday</Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  );
}
