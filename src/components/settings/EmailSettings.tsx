import React from "react";
import { Input, Select, SelectItem, Switch, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface EmailSettingsProps {
  settings: {
    mailDriver: string;
    mailHost: string;
    mailPort: string;
    mailUsername: string;
    mailPassword: string;
    mailEncryption: string;
    mailFromAddress: string;
    mailFromName: string;
    mailQueueEnabled: boolean;
    mailRetryAttempts: number;
    mailTimeout: number;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function EmailSettings({ settings, onSettingsChange }: EmailSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:mail" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Email Configuration</h2>
          <p className="text-gray-600">Configure your email server settings for sending notifications</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Mail Driver"
          selectedKeys={[settings.mailDriver]}
          onSelectionChange={(keys) => onSettingsChange("mailDriver", Array.from(keys)[0])}
        >
          <SelectItem key="smtp" value="smtp">SMTP</SelectItem>
          <SelectItem key="sendmail" value="sendmail">Sendmail</SelectItem>
          <SelectItem key="mailgun" value="mailgun">Mailgun</SelectItem>
          <SelectItem key="ses" value="ses">Amazon SES</SelectItem>
          <SelectItem key="postmark" value="postmark">Postmark</SelectItem>
        </Select>
        <Input
          label="Mail Host"
          placeholder="smtp.example.com"
          value={settings.mailHost}
          onValueChange={(value) => onSettingsChange("mailHost", value)}
        />
        <Input
          label="Mail Port"
          placeholder="587"
          value={settings.mailPort}
          onValueChange={(value) => onSettingsChange("mailPort", value)}
        />
        <Select
          label="Mail Encryption"
          selectedKeys={[settings.mailEncryption]}
          onSelectionChange={(keys) => onSettingsChange("mailEncryption", Array.from(keys)[0])}
        >
          <SelectItem key="tls" value="tls">TLS</SelectItem>
          <SelectItem key="ssl" value="ssl">SSL</SelectItem>
          <SelectItem key="none" value="none">None</SelectItem>
        </Select>
        <Input
          label="Mail Username"
          placeholder="noreply@example.com"
          value={settings.mailUsername}
          onValueChange={(value) => onSettingsChange("mailUsername", value)}
        />
        <Input
          label="Mail Password"
          type="password"
          placeholder="Enter mail password"
          value={settings.mailPassword}
          onValueChange={(value) => onSettingsChange("mailPassword", value)}
        />
        <Input
          label="From Address"
          type="email"
          placeholder="noreply@example.com"
          value={settings.mailFromAddress}
          onValueChange={(value) => onSettingsChange("mailFromAddress", value)}
        />
        <Input
          label="From Name"
          placeholder="HRMGO"
          value={settings.mailFromName}
          onValueChange={(value) => onSettingsChange("mailFromName", value)}
        />
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Advanced Email Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mail Queue</p>
              <p className="text-sm text-gray-500">Enable mail queue for better performance</p>
            </div>
            <Switch
              isSelected={settings.mailQueueEnabled}
              onValueChange={(value) => onSettingsChange("mailQueueEnabled", value)}
            />
          </div>
          <Input
            label="Retry Attempts"
            type="number"
            placeholder="3"
            value={settings.mailRetryAttempts.toString()}
            onValueChange={(value) => onSettingsChange("mailRetryAttempts", parseInt(value))}
          />
          <Input
            label="Timeout (seconds)"
            type="number"
            placeholder="30"
            value={settings.mailTimeout.toString()}
            onValueChange={(value) => onSettingsChange("mailTimeout", parseInt(value))}
          />
        </div>
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Test Email Configuration</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Test your email configuration by sending a test email to verify the settings are working correctly.
          </p>
          <div className="flex items-center gap-4">
            <Input
              label="Test Email Address"
              type="email"
              placeholder="test@example.com"
              className="flex-1"
            />
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Send Test Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
