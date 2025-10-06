import React from 'react';
import { Card, CardBody, CardHeader, Switch, Input, Textarea, Select, SelectItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface CookieConsentSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function CookieConsentSettings({ settings, onSettingsChange }: CookieConsentSettingsProps) {
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:cookie" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Cookie Consent Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Cookie Consent</p>
              <p className="text-xs text-default-500">Show cookie consent banner to users</p>
            </div>
            <Switch
              isSelected={settings.enabled === true || settings.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('enabled', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Banner Position"
              placeholder="Select position"
              selectedKeys={settings.position ? [settings.position] : ['bottom']}
              onSelectionChange={(keys) => onSettingsChange('position', Array.from(keys)[0])}
            >
              <SelectItem key="top">Top</SelectItem>
              <SelectItem key="bottom">Bottom</SelectItem>
              <SelectItem key="top-left">Top Left</SelectItem>
              <SelectItem key="top-right">Top Right</SelectItem>
              <SelectItem key="bottom-left">Bottom Left</SelectItem>
              <SelectItem key="bottom-right">Bottom Right</SelectItem>
            </Select>

            <Select
              label="Banner Theme"
              placeholder="Select theme"
              selectedKeys={settings.theme ? [settings.theme] : ['light']}
              onSelectionChange={(keys) => onSettingsChange('theme', Array.from(keys)[0])}
            >
              <SelectItem key="light">Light</SelectItem>
              <SelectItem key="dark">Dark</SelectItem>
              <SelectItem key="auto">Auto</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Banner Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:message-square" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Banner Content</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Textarea
            label="Consent Message"
            
            onChange={(e) => onSettingsChange('message', e.target.value)}
            placeholder="Enter cookie consent message"
            description="Main message displayed in the cookie banner"
            startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Accept Button Text"
              
              onChange={(e) => onSettingsChange('acceptButton', e.target.value)}
              placeholder="Accept"
              startContent={<Icon icon="lucide:check" className="text-default-400" />}
            />

            <Input
              label="Decline Button Text"
              
              onChange={(e) => onSettingsChange('declineButton', e.target.value)}
              placeholder="Decline"
              startContent={<Icon icon="lucide:x" className="text-default-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Policy Link Text"
              
              onChange={(e) => onSettingsChange('policyText', e.target.value)}
              placeholder="Learn more"
              startContent={<Icon icon="lucide:external-link" className="text-default-400" />}
            />

            <Input
              label="Policy Link URL"
              
              onChange={(e) => onSettingsChange('policyLink', e.target.value)}
              placeholder="/privacy-policy"
              startContent={<Icon icon="lucide:link" className="text-default-400" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* Cookie Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:layers" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Cookie Categories</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Necessary Cookies</p>
              <p className="text-xs text-default-500">Essential cookies for website functionality</p>
            </div>
            <Switch
              isSelected={settings.categories?.necessary?.enabled === true || settings.categories?.necessary?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('categories', {
                ...settings.categories,
                necessary: {
                  ...settings.categories?.necessary,
                  enabled: value
                }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Analytics Cookies</p>
              <p className="text-xs text-default-500">Help us understand website usage</p>
            </div>
            <Switch
              isSelected={settings.categories?.analytics?.enabled === true || settings.categories?.analytics?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('categories', {
                ...settings.categories,
                analytics: {
                  ...settings.categories?.analytics,
                  enabled: value
                }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Marketing Cookies</p>
              <p className="text-xs text-default-500">Used for advertising and tracking</p>
            </div>
            <Switch
              isSelected={settings.categories?.marketing?.enabled === true || settings.categories?.marketing?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('categories', {
                ...settings.categories,
                marketing: {
                  ...settings.categories?.marketing,
                  enabled: value
                }
              })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:eye" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Preview & Actions</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-3">
            <Button color="primary" variant="flat" startContent={<Icon icon="lucide:eye" />}>
              Preview Banner
            </Button>
            <Button color="secondary" variant="flat" startContent={<Icon icon="lucide:test-tube" />}>
              Test Banner
            </Button>
            <Button color="success" variant="flat" startContent={<Icon icon="lucide:save" />}>
              Save Settings
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}