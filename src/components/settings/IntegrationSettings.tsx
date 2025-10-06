import React from 'react';
import { Card, CardBody, CardHeader, Switch, Input, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface IntegrationSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function IntegrationSettings({ settings, onSettingsChange }: IntegrationSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Google Calendar Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:calendar" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Google Calendar</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Google Calendar</p>
              <p className="text-xs text-default-500">Sync HR events with Google Calendar</p>
            </div>
            <Switch
              isSelected={settings.googleCalendar?.enabled === true || settings.googleCalendar?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('googleCalendar', 'enabled', value)}
            />
          </div>

          {settings.googleCalendar?.enabled && (
            <div className="space-y-4">
              <Input
                label="Client ID"
                
                onChange={(e) => onSettingsChange('googleCalendar', {
                  ...settings.googleCalendar,
                  clientId: e.target.value
                })}
                placeholder="Enter Google Calendar Client ID"
                startContent={<Icon icon="lucide:key" className="text-default-400" />}
              />

              <Input
                label="Client Secret"
                type="password"
                
                onChange={(e) => onSettingsChange('googleCalendar', {
                  ...settings.googleCalendar,
                  clientSecret: e.target.value
                })}
                placeholder="Enter Google Calendar Client Secret"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <Input
                label="Calendar ID"
                
                onChange={(e) => onSettingsChange('googleCalendar', {
                  ...settings.googleCalendar,
                  calendarId: e.target.value
                })}
                placeholder="Enter Calendar ID"
                startContent={<Icon icon="lucide:calendar-days" className="text-default-400" />}
              />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sync Leave Requests</p>
                  <p className="text-xs text-default-500">Automatically sync leave requests to calendar</p>
                </div>
                <Switch
                  isSelected={settings.googleCalendar?.syncLeaveRequests === true || settings.googleCalendar?.syncLeaveRequests === 'true'}
                  onValueChange={(value) => onSettingsChange('googleCalendar', 'syncLeaveRequests', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sync Meetings</p>
                  <p className="text-xs text-default-500">Sync HR meetings and interviews</p>
                </div>
                <Switch
                  isSelected={settings.googleCalendar?.syncMeetings === true || settings.googleCalendar?.syncMeetings === 'true'}
                  onValueChange={(value) => onSettingsChange('googleCalendar', 'syncMeetings', value)}
                />
              </div>

              <Button color="primary" variant="flat" className="w-full">
                <Icon icon="lucide:link" className="text-lg" />
                Connect Google Calendar
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Slack Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:message-square" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Slack</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Slack</p>
              <p className="text-xs text-default-500">Send HR notifications to Slack channels</p>
            </div>
            <Switch
              isSelected={settings.slack?.enabled === true || settings.slack?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('slack', 'enabled', value)}
            />
          </div>

          {settings.slack?.enabled && (
            <div className="space-y-4">
              <Input
                label="Webhook URL"
                
                onChange={(e) => onSettingsChange('slack', {
                  ...settings.slack,
                  webhookUrl: e.target.value
                })}
                placeholder="https://hooks.slack.com/services/..."
                startContent={<Icon icon="lucide:link" className="text-default-400" />}
              />

              <Input
                label="Channel"
                
                onChange={(e) => onSettingsChange('slack', {
                  ...settings.slack,
                  channel: e.target.value
                })}
                placeholder="#hr-notifications"
                startContent={<Icon icon="lucide:hash" className="text-default-400" />}
              />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Leave Notifications</p>
                  <p className="text-xs text-default-500">Send leave request notifications</p>
                </div>
                <Switch
                  isSelected={settings.slack?.leaveNotifications === true || settings.slack?.leaveNotifications === 'true'}
                  onValueChange={(value) => onSettingsChange('slack', 'leaveNotifications', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Birthday Notifications</p>
                  <p className="text-xs text-default-500">Send birthday reminders</p>
                </div>
                <Switch
                  isSelected={settings.slack?.birthdayNotifications === true || settings.slack?.birthdayNotifications === 'true'}
                  onValueChange={(value) => onSettingsChange('slack', 'birthdayNotifications', value)}
                />
              </div>

              <Button color="primary" variant="flat" className="w-full">
                <Icon icon="lucide:message-square" className="text-lg" />
                Test Slack Connection
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Zoom Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:video" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Zoom</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Zoom</p>
              <p className="text-xs text-default-500">Create Zoom meetings for interviews and meetings</p>
            </div>
            <Switch
              isSelected={settings.zoom?.enabled === true || settings.zoom?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('zoom', 'enabled', value)}
            />
          </div>

          {settings.zoom?.enabled && (
            <div className="space-y-4">
              <Input
                label="API Key"
                
                onChange={(e) => onSettingsChange('zoom', {
                  ...settings.zoom,
                  apiKey: e.target.value
                })}
                placeholder="Enter Zoom API Key"
                startContent={<Icon icon="lucide:key" className="text-default-400" />}
              />

              <Input
                label="API Secret"
                type="password"
                
                onChange={(e) => onSettingsChange('zoom', {
                  ...settings.zoom,
                  apiSecret: e.target.value
                })}
                placeholder="Enter Zoom API Secret"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <Input
                label="Account ID"
                
                onChange={(e) => onSettingsChange('zoom', {
                  ...settings.zoom,
                  accountId: e.target.value
                })}
                placeholder="Enter Zoom Account ID"
                startContent={<Icon icon="lucide:user" className="text-default-400" />}
              />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto Create Meetings</p>
                  <p className="text-xs text-default-500">Automatically create Zoom meetings for interviews</p>
                </div>
                <Switch
                  isSelected={settings.zoom?.autoCreateMeetings === true || settings.zoom?.autoCreateMeetings === 'true'}
                  onValueChange={(value) => onSettingsChange('zoom', 'autoCreateMeetings', value)}
                />
              </div>

              <Button color="primary" variant="flat" className="w-full">
                <Icon icon="lucide:video" className="text-lg" />
                Test Zoom Connection
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:credit-card" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Payment Integrations</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* PayPal */}
          <div className="border border-default-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:wallet" className="text-blue-500 text-xl" />
                <h4 className="font-medium text-foreground">PayPal</h4>
              </div>
              <Switch
                isSelected={settings.paypal?.enabled === true || settings.paypal?.enabled === 'true'}
                onValueChange={(value) => onSettingsChange('paypal', 'enabled', value)}
              />
            </div>

            {settings.paypal?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Client ID"
                  
                  onChange={(e) => onSettingsChange('paypal', {
                    ...settings.paypal,
                    clientId: e.target.value
                  })}
                  placeholder="Enter PayPal Client ID"
                />
                <Input
                  label="Client Secret"
                  type="password"
                  
                  onChange={(e) => onSettingsChange('paypal', {
                    ...settings.paypal,
                    clientSecret: e.target.value
                  })}
                  placeholder="Enter PayPal Client Secret"
                />
              </div>
            )}
          </div>

          {/* Stripe */}
          <div className="border border-default-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:credit-card" className="text-purple-500 text-xl" />
                <h4 className="font-medium text-foreground">Stripe</h4>
              </div>
              <Switch
                isSelected={settings.stripe?.enabled === true || settings.stripe?.enabled === 'true'}
                onValueChange={(value) => onSettingsChange('stripe', 'enabled', value)}
              />
            </div>

            {settings.stripe?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Publishable Key"
                  
                  onChange={(e) => onSettingsChange('stripe', {
                    ...settings.stripe,
                    publishableKey: e.target.value
                  })}
                  placeholder="pk_test_..."
                />
                <Input
                  label="Secret Key"
                  type="password"
                  
                  onChange={(e) => onSettingsChange('stripe', {
                    ...settings.stripe,
                    secretKey: e.target.value
                  })}
                  placeholder="sk_test_..."
                />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* QuickBooks Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:calculator" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">QuickBooks</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable QuickBooks</p>
              <p className="text-xs text-default-500">Sync payroll data with QuickBooks</p>
            </div>
            <Switch
              isSelected={settings.quickbooks?.enabled === true || settings.quickbooks?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('quickbooks', 'enabled', value)}
            />
          </div>

          {settings.quickbooks?.enabled && (
            <div className="space-y-4">
              <Input
                label="Client ID"
                
                onChange={(e) => onSettingsChange('quickbooks', {
                  ...settings.quickbooks,
                  clientId: e.target.value
                })}
                placeholder="Enter QuickBooks Client ID"
                startContent={<Icon icon="lucide:key" className="text-default-400" />}
              />

              <Input
                label="Client Secret"
                type="password"
                
                onChange={(e) => onSettingsChange('quickbooks', {
                  ...settings.quickbooks,
                  clientSecret: e.target.value
                })}
                placeholder="Enter QuickBooks Client Secret"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <Input
                label="Company ID"
                
                onChange={(e) => onSettingsChange('quickbooks', {
                  ...settings.quickbooks,
                  companyId: e.target.value
                })}
                placeholder="Enter QuickBooks Company ID"
                startContent={<Icon icon="lucide:building" className="text-default-400" />}
              />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sync Payroll</p>
                  <p className="text-xs text-default-500">Automatically sync payroll data</p>
                </div>
                <Switch
                  isSelected={settings.quickbooks?.syncPayroll === true || settings.quickbooks?.syncPayroll === 'true'}
                  onValueChange={(value) => onSettingsChange('quickbooks', 'syncPayroll', value)}
                />
              </div>

              <Button color="primary" variant="flat" className="w-full">
                <Icon icon="lucide:calculator" className="text-lg" />
                Connect QuickBooks
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}