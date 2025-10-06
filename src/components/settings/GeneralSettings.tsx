import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Input, Switch, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { validateField, settingsValidationRules } from '../../utils/validation';

interface GeneralSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleFieldChange = (field: string, value: any) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate the field
    const rules = settingsValidationRules.general[field as keyof typeof settingsValidationRules.general];
    if (rules) {
      const error = validateField(value, rules, field);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }

    onSettingsChange(field, value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon icon="lucide:settings" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">General Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <Input
            label="Site Name"
            value={settings.siteName || ''}
            onChange={(e) => handleFieldChange('siteName', e.target.value)}
            placeholder="Enter site name"
            startContent={<Icon icon="lucide:globe" className="text-default-400" />}
            isInvalid={!!errors.siteName}
            errorMessage={errors.siteName}
            description="The name of your HRMS application"
          />
          
          <Input
            label="Site Description"
            value={settings.siteDescription || ''}
            onChange={(e) => handleFieldChange('siteDescription', e.target.value)}
            placeholder="Enter site description"
            startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
            isInvalid={!!errors.siteDescription}
            errorMessage={errors.siteDescription}
            description="Brief description of your HRMS system"
          />
          
          <Input
            label="Site URL"
            value={settings.siteUrl || ''}
            onChange={(e) => handleFieldChange('siteUrl', e.target.value)}
            placeholder="https://your-hrms.com"
            startContent={<Icon icon="lucide:link" className="text-default-400" />}
            isInvalid={!!errors.siteUrl}
            errorMessage={errors.siteUrl}
            description="The public URL of your HRMS system"
          />
          
          <Input
            label="Admin Email"
            value={settings.adminEmail || ''}
            onChange={(e) => handleFieldChange('adminEmail', e.target.value)}
            placeholder="admin@yourcompany.com"
            startContent={<Icon icon="lucide:mail" className="text-default-400" />}
            isInvalid={!!errors.adminEmail}
            errorMessage={errors.adminEmail}
            description="Primary administrator email address"
          />
          
          <Input
            label="Primary Color"
            type="color"
            value={settings.primaryColor || '#3b82f6'}
            onChange={(e) => onSettingsChange('primaryColor', e.target.value)}
            startContent={<Icon icon="lucide:palette" className="text-default-400" />}
            description="Primary theme color for the application"
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
              <p className="text-xs text-default-500 dark:text-default-400">Enable maintenance mode to restrict access</p>
            </div>
            <Switch
              isSelected={settings.maintenanceMode === true || settings.maintenanceMode === 'true'}
              onValueChange={(value) => onSettingsChange('maintenanceMode', value)}
              color="primary"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Debug Mode</p>
              <p className="text-xs text-default-500 dark:text-default-400">Enable debug mode for development</p>
            </div>
            <Switch
              isSelected={settings.debugMode === true || settings.debugMode === 'true'}
              onValueChange={(value) => onSettingsChange('debugMode', value)}
              color="primary"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Auto Backup</p>
              <p className="text-xs text-default-500 dark:text-default-400">Enable automatic backups</p>
            </div>
            <Switch
              isSelected={settings.autoBackup === true || settings.autoBackup === 'true'}
              onValueChange={(value) => onSettingsChange('autoBackup', value)}
              color="primary"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}