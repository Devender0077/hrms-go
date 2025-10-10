import React, { useEffect } from 'react';
import { Card, CardBody, CardHeader, Input, Select, SelectItem, Switch } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from '../../contexts/translation-context';

interface LocalizationSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function LocalizationSettings({ settings, onSettingsChange }: LocalizationSettingsProps) {
  const { setLanguage, language: currentLanguage } = useTranslation();

  const languages = [
    { key: 'en', label: '🇺🇸 English', flag: '🇺🇸' },
    { key: 'hi', label: '🇮🇳 Hindi', flag: '🇮🇳' },
    { key: 'es', label: '🇪🇸 Spanish', flag: '🇪🇸' },
    { key: 'fr', label: '🇫🇷 French', flag: '🇫🇷' },
    { key: 'de', label: '🇩🇪 German', flag: '🇩🇪' },
    { key: 'zh', label: '🇨🇳 Chinese', flag: '🇨🇳' },
    { key: 'ar', label: '🇸🇦 Arabic', flag: '🇸🇦' },
    { key: 'pt', label: '🇵🇹 Portuguese', flag: '🇵🇹' },
    { key: 'ru', label: '🇷🇺 Russian', flag: '🇷🇺' },
    { key: 'ja', label: '🇯🇵 Japanese', flag: '🇯🇵' },
  ];

  // Sync i18next language with settings on mount
  useEffect(() => {
    if (settings.defaultLanguage && settings.defaultLanguage !== currentLanguage) {
      setLanguage(settings.defaultLanguage);
    }
  }, [settings.defaultLanguage]);

  const timezones = [
    { key: 'America/New_York', label: 'Eastern Time (ET)' },
    { key: 'America/Chicago', label: 'Central Time (CT)' },
    { key: 'America/Denver', label: 'Mountain Time (MT)' },
    { key: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { key: 'Europe/London', label: 'London (GMT)' },
    { key: 'Europe/Paris', label: 'Paris (CET)' },
    { key: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { key: 'Asia/Dubai', label: 'Dubai (GST)' },
    { key: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { key: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { key: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  ];

  const currencies = [
    { key: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { key: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
    { key: 'EUR', label: 'Euro (€)', symbol: '€' },
    { key: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { key: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
    { key: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
    { key: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
    { key: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
    { key: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
    { key: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon icon="lucide:globe" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Localization Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <Select
            label="Default Language"
            selectedKeys={settings.defaultLanguage ? [settings.defaultLanguage] : [currentLanguage || 'en']}
            onSelectionChange={(keys) => {
              const selectedLang = Array.from(keys)[0] as string;
              console.log('🔄 Language changed from settings:', selectedLang);
              // Change i18next language immediately
              setLanguage(selectedLang);
              // Also save to database
              onSettingsChange('defaultLanguage', selectedLang);
            }}
            placeholder="Select default language"
            startContent={<Icon icon="lucide:languages" className="text-default-400" />}
            description="Changes will apply immediately"
          >
            {languages.map((lang) => (
              <SelectItem key={lang.key}>
                {lang.label}
              </SelectItem>
            ))}
          </Select>
          
          <Select
            label="Timezone"
            selectedKeys={settings.timezone ? [settings.timezone] : ['America/New_York']}
            onSelectionChange={(keys) => onSettingsChange('timezone', Array.from(keys)[0])}
            placeholder="Select timezone"
            startContent={<Icon icon="lucide:clock" className="text-default-400" />}
          >
            {timezones.map((tz) => (
              <SelectItem key={tz.key} >
                {tz.label}
              </SelectItem>
            ))}
          </Select>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Date Format"
              selectedKeys={settings.dateFormat ? [settings.dateFormat] : ['MM/DD/YYYY']}
              onSelectionChange={(keys) => onSettingsChange('dateFormat', Array.from(keys)[0])}
              placeholder="Select date format"
            >
              <SelectItem key="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem key="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem key="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </Select>
            
            <Select
              label="Time Format"
              selectedKeys={settings.timeFormat ? [settings.timeFormat] : ['12h']}
              onSelectionChange={(keys) => onSettingsChange('timeFormat', Array.from(keys)[0])}
              placeholder="Select time format"
            >
              <SelectItem key="12h">12 Hour (AM/PM)</SelectItem>
              <SelectItem key="24h">24 Hour</SelectItem>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Currency"
              selectedKeys={settings.currency ? [settings.currency] : ['USD']}
              onSelectionChange={(keys) => {
                const selectedCurrency = Array.from(keys)[0] as string;
                const currencyData = currencies.find(c => c.key === selectedCurrency);
                onSettingsChange('currency', selectedCurrency);
                if (currencyData) {
                  onSettingsChange('currencySymbol', currencyData.symbol);
                }
              }}
              placeholder="Select currency"
              startContent={<Icon icon="lucide:dollar-sign" className="text-default-400" />}
            >
              {currencies.map((currency) => (
                <SelectItem key={currency.key} >
                  {currency.label}
                </SelectItem>
              ))}
            </Select>
            
            <Input
              label="Currency Symbol"
              value={settings.currencySymbol || '$'}
              onChange={(e) => onSettingsChange('currencySymbol', e.target.value)}
              placeholder="Enter currency symbol"
              startContent={<Icon icon="lucide:hash" className="text-default-400" />}
              description="Auto-populated based on currency selection"
            />
          </div>
          
          <Select
            label="First Day of Week"
            selectedKeys={settings.firstDayOfWeek ? [settings.firstDayOfWeek] : ['sunday']}
            onSelectionChange={(keys) => onSettingsChange('firstDayOfWeek', Array.from(keys)[0])}
            placeholder="Select first day of week"
          >
            <SelectItem key="sunday">Sunday</SelectItem>
            <SelectItem key="monday">Monday</SelectItem>
          </Select>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Working Hours Start"
              type="time"
              
              onChange={(e) => onSettingsChange('workingHours', { ...settings.workingHours, start: e.target.value })}
              startContent={<Icon icon="lucide:clock" className="text-default-400" />}
            />
            
            <Input
              label="Working Hours End"
              type="time"
              
              onChange={(e) => onSettingsChange('workingHours', { ...settings.workingHours, end: e.target.value })}
              startContent={<Icon icon="lucide:clock" className="text-default-400" />}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}