import React from "react";
import { Switch, Input, Select, SelectItem, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface SecuritySettingsProps {
  settings: {
    // reCAPTCHA settings
    recaptchaEnabled: boolean;
    recaptchaSiteKey: string;
    recaptchaSecretKey: string;
    
    // IP restriction settings
    ipRestrictionEnabled: boolean;
    allowedIps: string;
    
    // 2FA settings
    twoFactorEnabled: boolean;
    twoFactorMethod: string;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function SecuritySettings({ settings, onSettingsChange }: SecuritySettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:shield" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Security & Privacy</h2>
          <p className="text-gray-600">Configure security features and access restrictions</p>
        </div>
      </div>

      {/* reCAPTCHA Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:shield-check" className="text-green-600 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">reCAPTCHA</h3>
                <p className="text-sm text-gray-500">Protect forms from spam and abuse</p>
              </div>
            </div>
            <Switch
              isSelected={settings.recaptchaEnabled}
              onValueChange={(value) => onSettingsChange("recaptchaEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.recaptchaEnabled && (
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Site Key"
                placeholder="Enter reCAPTCHA Site Key"
                value={settings.recaptchaSiteKey}
                onValueChange={(value) => onSettingsChange("recaptchaSiteKey", value)}
              />
              <Input
                label="Secret Key"
                type="password"
                placeholder="Enter reCAPTCHA Secret Key"
                value={settings.recaptchaSecretKey}
                onValueChange={(value) => onSettingsChange("recaptchaSecretKey", value)}
              />
            </div>
          </CardBody>
        )}
      </Card>

      {/* IP Restriction Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:lock" className="text-red-600 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">IP Restriction</h3>
                <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
              </div>
            </div>
            <Switch
              isSelected={settings.ipRestrictionEnabled}
              onValueChange={(value) => onSettingsChange("ipRestrictionEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.ipRestrictionEnabled && (
          <CardBody className="space-y-4">
            <Input
              label="Allowed IP Addresses"
              placeholder="192.168.1.1, 10.0.0.1, 203.0.113.0/24"
              value={settings.allowedIps}
              onValueChange={(value) => onSettingsChange("allowedIps", value)}
              description="Enter IP addresses separated by commas. Supports CIDR notation."
            />
          </CardBody>
        )}
      </Card>

      {/* Two-Factor Authentication Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:smartphone" className="text-blue-600 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security to user accounts</p>
              </div>
            </div>
            <Switch
              isSelected={settings.twoFactorEnabled}
              onValueChange={(value) => onSettingsChange("twoFactorEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.twoFactorEnabled && (
          <CardBody className="space-y-4">
            <Select
              label="2FA Method"
              selectedKeys={[settings.twoFactorMethod]}
              onSelectionChange={(keys) => onSettingsChange("twoFactorMethod", Array.from(keys)[0])}
            >
              <SelectItem key="email" value="email">Email</SelectItem>
              <SelectItem key="sms" value="sms">SMS</SelectItem>
              <SelectItem key="authenticator" value="authenticator">Authenticator App</SelectItem>
            </Select>
          </CardBody>
        )}
      </Card>

      {/* Password Policy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:key" className="text-orange-600 text-lg" />
            <div>
              <h3 className="text-lg font-semibold">Password Policy</h3>
              <p className="text-sm text-gray-500">Configure password requirements and policies</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Length"
              type="number"
              placeholder="8"
              defaultValue="8"
            />
            <Input
              label="Maximum Length"
              type="number"
              placeholder="128"
              defaultValue="128"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Uppercase Letters</p>
                <p className="text-sm text-gray-500">Password must contain uppercase letters</p>
              </div>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Lowercase Letters</p>
                <p className="text-sm text-gray-500">Password must contain lowercase letters</p>
              </div>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Numbers</p>
                <p className="text-sm text-gray-500">Password must contain numbers</p>
              </div>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Special Characters</p>
                <p className="text-sm text-gray-500">Password must contain special characters</p>
              </div>
              <Switch defaultSelected />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Session Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:clock" className="text-purple-600 text-lg" />
            <div>
              <h3 className="text-lg font-semibold">Session Security</h3>
              <p className="text-sm text-gray-500">Configure session timeout and security</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Session Timeout (minutes)"
              type="number"
              placeholder="30"
              defaultValue="30"
            />
            <Input
              label="Max Login Attempts"
              type="number"
              placeholder="5"
              defaultValue="5"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Force Logout on Password Change</p>
                <p className="text-sm text-gray-500">Log out all sessions when password is changed</p>
              </div>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Remember Me</p>
                <p className="text-sm text-gray-500">Allow users to stay logged in</p>
              </div>
              <Switch defaultSelected />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
