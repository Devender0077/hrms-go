import React from 'react';
import { Card, CardBody, CardHeader, Input, Switch, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';

interface SecuritySettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function SecuritySettings({ settings, onSettingsChange }: SecuritySettingsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon icon="lucide:shield" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Security & Privacy</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">reCAPTCHA Settings</h4>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Enable reCAPTCHA</p>
                <p className="text-xs text-default-500 dark:text-default-400">Protect forms from spam and abuse</p>
              </div>
              <Switch
                isSelected={settings.recaptchaEnabled === true || settings.recaptchaEnabled === 'true'}
                onValueChange={(value) => onSettingsChange('recaptchaEnabled', value)}
                color="primary"
              />
            </div>
            
            {settings.recaptchaEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Site Key"
                  
                  onChange={(e) => onSettingsChange('recaptchaSiteKey', e.target.value)}
                  placeholder="Enter reCAPTCHA site key"
                  startContent={<Icon icon="lucide:key" className="text-default-400" />}
                />
                
                <Input
                  label="Secret Key"
                  type="password"
                  
                  onChange={(e) => onSettingsChange('recaptchaSecretKey', e.target.value)}
                  placeholder="Enter reCAPTCHA secret key"
                  startContent={<Icon icon="lucide:lock" className="text-default-400" />}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">IP Restriction</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable IP Restriction</p>
                <p className="text-xs text-default-500">Restrict access to specific IP addresses</p>
              </div>
              <Switch
                isSelected={settings.ipRestrictionEnabled === true || settings.ipRestrictionEnabled === 'true'}
                onValueChange={(value) => onSettingsChange('ipRestrictionEnabled', value)}
              />
            </div>
            
            {settings.ipRestrictionEnabled && (
              <Input
                label="Allowed IP Addresses"
                
                onChange={(e) => onSettingsChange('allowedIps', e.target.value)}
                placeholder="192.168.1.1, 10.0.0.1"
                description="Comma-separated list of allowed IP addresses"
                startContent={<Icon icon="lucide:network" className="text-default-400" />}
              />
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Two-Factor Authentication</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable 2FA</p>
                <p className="text-xs text-default-500">Add an extra layer of security</p>
              </div>
              <Switch
                isSelected={settings.twoFactorEnabled === true || settings.twoFactorEnabled === 'true'}
                onValueChange={(value) => onSettingsChange('twoFactorEnabled', value)}
              />
            </div>
            
            {settings.twoFactorEnabled && (
              <Select
                label="2FA Method"
                selectedKeys={settings.twoFactorMethod ? [settings.twoFactorMethod] : ['email']}
                onSelectionChange={(keys) => onSettingsChange('twoFactorMethod', Array.from(keys)[0])}
                placeholder="Select 2FA method"
                startContent={<Icon icon="lucide:smartphone" className="text-default-400" />}
              >
                <SelectItem key="email">Email</SelectItem>
                <SelectItem key="sms">SMS</SelectItem>
                <SelectItem key="authenticator">Authenticator App</SelectItem>
              </Select>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}