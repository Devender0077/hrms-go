import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Select, SelectItem, Switch } from '@heroui/react';
import { Icon } from '@iconify/react';
import { validateField, settingsValidationRules } from '../../utils/validation';

interface EmailSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function EmailSettings({ settings, onSettingsChange }: EmailSettingsProps) {
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
    const rules = settingsValidationRules.email[field as keyof typeof settingsValidationRules.email];
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
              <Icon icon="lucide:mail" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Email Configuration</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <Select
            label="Mail Driver"
            selectedKeys={settings.mailDriver ? [settings.mailDriver] : ['smtp']}
            onSelectionChange={(keys) => onSettingsChange('mailDriver', Array.from(keys)[0])}
            placeholder="Select mail driver"
            startContent={<Icon icon="lucide:server" className="text-default-400" />}
            description="Choose your email service provider"
          >
            <SelectItem key="smtp">SMTP</SelectItem>
            <SelectItem key="sendmail">Sendmail</SelectItem>
            <SelectItem key="mailgun">Mailgun</SelectItem>
            <SelectItem key="ses">Amazon SES</SelectItem>
          </Select>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              value={settings.smtpHost || ''}
              onChange={(e) => handleFieldChange('smtpHost', e.target.value)}
              placeholder="smtp.example.com"
              startContent={<Icon icon="lucide:server" className="text-default-400" />}
              isInvalid={!!errors.smtpHost}
              errorMessage={errors.smtpHost}
              description="SMTP server hostname"
            />
            
            <Input
              label="SMTP Port"
              value={settings.smtpPort || ''}
              onChange={(e) => handleFieldChange('smtpPort', e.target.value)}
              placeholder="587"
              startContent={<Icon icon="lucide:hash" className="text-default-400" />}
              isInvalid={!!errors.smtpPort}
              errorMessage={errors.smtpPort}
              description="SMTP server port (usually 587 or 465)"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SMTP Username"
              value={settings.smtpUsername || ''}
              onChange={(e) => handleFieldChange('smtpUsername', e.target.value)}
              placeholder="noreply@example.com"
              startContent={<Icon icon="lucide:user" className="text-default-400" />}
              isInvalid={!!errors.smtpUsername}
              errorMessage={errors.smtpUsername}
              description="SMTP authentication username"
            />
            
            <Input
              label="SMTP Password"
              type="password"
              value={settings.smtpPassword || ''}
              onChange={(e) => handleFieldChange('smtpPassword', e.target.value)}
              placeholder="Enter password"
              startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              isInvalid={!!errors.smtpPassword}
              errorMessage={errors.smtpPassword}
              description="SMTP authentication password"
            />
          </div>
          
          <Select
            label="Mail Encryption"
            selectedKeys={settings.mailEncryption ? [settings.mailEncryption] : ['tls']}
            onSelectionChange={(keys) => onSettingsChange('mailEncryption', Array.from(keys)[0])}
            placeholder="Select encryption"
            startContent={<Icon icon="lucide:shield" className="text-default-400" />}
            description="Choose encryption method for secure email transmission"
          >
            <SelectItem key="tls">TLS</SelectItem>
            <SelectItem key="ssl">SSL</SelectItem>
            <SelectItem key="none">None</SelectItem>
          </Select>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="From Email"
              type="email"
              value={settings.fromEmail || ''}
              onChange={(e) => handleFieldChange('fromEmail', e.target.value)}
              placeholder="noreply@example.com"
              startContent={<Icon icon="lucide:mail" className="text-default-400" />}
              isInvalid={!!errors.fromEmail}
              errorMessage={errors.fromEmail}
              description="Default sender email address"
            />
            
            <Input
              label="From Name"
              value={settings.fromName || ''}
              onChange={(e) => handleFieldChange('fromName', e.target.value)}
              placeholder="HRMGO"
              startContent={<Icon icon="lucide:user" className="text-default-400" />}
              isInvalid={!!errors.fromName}
              errorMessage={errors.fromName}
              description="Default sender name"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Mail Queue Enabled</p>
                <p className="text-xs text-default-500">Enable mail queue for better performance</p>
              </div>
              <Switch
                isSelected={settings.mailQueueEnabled === true || settings.mailQueueEnabled === 'true'}
                onValueChange={(value) => onSettingsChange('mailQueueEnabled', value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Retry Attempts"
                type="number"
                
                onChange={(e) => onSettingsChange('mailRetryAttempts', parseInt(e.target.value))}
                placeholder="3"
                startContent={<Icon icon="lucide:refresh-cw" className="text-default-400" />}
                description="Number of retry attempts for failed emails"
              />
              
              <Input
                label="Timeout (seconds)"
                type="number"
                
                onChange={(e) => onSettingsChange('mailTimeout', parseInt(e.target.value))}
                placeholder="30"
                startContent={<Icon icon="lucide:clock" className="text-default-400" />}
                description="Email sending timeout in seconds"
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}