import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader, Input, Switch, Select, SelectItem, Button, Image } from '@heroui/react';
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
  const [logoPreview, setLogoPreview] = useState<string>(settings.logo || '');
  const [faviconPreview, setFaviconPreview] = useState<string>(settings.favicon || '');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (file: File, type: 'logo' | 'favicon') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'logo') {
        setLogoPreview(base64String);
        onSettingsChange('logo', base64String);
      } else {
        setFaviconPreview(base64String);
        onSettingsChange('favicon', base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors(prev => ({ ...prev, logo: 'Logo file size must be less than 2MB' }));
        return;
      }
      handleFileUpload(file, 'logo');
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 512 * 1024) { // 512KB limit
        setErrors(prev => ({ ...prev, favicon: 'Favicon file size must be less than 512KB' }));
        return;
      }
      handleFileUpload(file, 'favicon');
    }
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
          
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Company Logo</label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-24 h-24 object-contain border-2 border-default-200 rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-default-300 rounded-lg flex items-center justify-center bg-default-50">
                    <Icon icon="lucide:image" className="text-default-400 text-2xl" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => logoInputRef.current?.click()}
                  startContent={<Icon icon="lucide:upload" />}
                >
                  Upload Logo
                </Button>
                <p className="text-xs text-default-500">Recommended size: 200x200px, Max: 2MB</p>
                {errors.logo && <p className="text-xs text-danger">{errors.logo}</p>}
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Favicon</label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {faviconPreview ? (
                  <Image
                    src={faviconPreview}
                    alt="Favicon Preview"
                    className="w-16 h-16 object-contain border-2 border-default-200 rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-default-300 rounded-lg flex items-center justify-center bg-default-50">
                    <Icon icon="lucide:image" className="text-default-400 text-xl" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/x-icon,image/png"
                  onChange={handleFaviconChange}
                  className="hidden"
                />
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => faviconInputRef.current?.click()}
                  startContent={<Icon icon="lucide:upload" />}
                >
                  Upload Favicon
                </Button>
                <p className="text-xs text-default-500">Recommended size: 32x32px, Max: 512KB</p>
                {errors.favicon && <p className="text-xs text-danger">{errors.favicon}</p>}
              </div>
            </div>
          </div>
          
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
          
          {/* Primary Color Picker with Swatches */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Primary Color</label>
            <p className="text-xs text-default-500">Choose your brand's primary color</p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="color"
                  value={settings.primaryColor || '#3b82f6'}
                  onChange={(e) => onSettingsChange('primaryColor', e.target.value)}
                  className="w-full"
                />
              </div>
              <div 
                className="w-16 h-16 rounded-lg border-2 border-default-200 shadow-sm"
                style={{ backgroundColor: settings.primaryColor || '#3b82f6' }}
              />
            </div>
            
            {/* Color Swatches */}
            <div className="grid grid-cols-8 gap-2">
              {[
                { name: 'Blue', color: '#3b82f6' },
                { name: 'Purple', color: '#8b5cf6' },
                { name: 'Pink', color: '#ec4899' },
                { name: 'Red', color: '#ef4444' },
                { name: 'Orange', color: '#f97316' },
                { name: 'Yellow', color: '#eab308' },
                { name: 'Green', color: '#10b981' },
                { name: 'Teal', color: '#14b8a6' },
              ].map((swatch) => (
                <button
                  key={swatch.color}
                  type="button"
                  onClick={() => onSettingsChange('primaryColor', swatch.color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    settings.primaryColor === swatch.color 
                      ? 'border-foreground ring-2 ring-offset-2 ring-primary' 
                      : 'border-default-200'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.name}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Transparent Layout</p>
              <p className="text-xs text-default-500 dark:text-default-400">Enable transparent sidebar and navbar with blur effect</p>
            </div>
            <Switch
              isSelected={settings.transparentLayout === true || settings.transparentLayout === 'true'}
              onValueChange={(value) => onSettingsChange('transparentLayout', value)}
              color="primary"
            />
          </div>
          
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