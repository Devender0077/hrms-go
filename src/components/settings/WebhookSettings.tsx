import React from 'react';
import { Card, CardBody, CardHeader, Switch, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';

interface WebhookSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
  onAddWebhook: () => void;
  onEditWebhook: (webhook: any) => void;
  onDeleteWebhook: (id: string) => void;
  onTestWebhook: (id: string) => void;
}

export default function WebhookSettings({ 
  settings, 
  onSettingsChange, 
  onAddWebhook, 
  onEditWebhook, 
  onDeleteWebhook, 
  onTestWebhook 
}: WebhookSettingsProps) {
  const webhooks = settings.webhooks || [];

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:webhook" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Webhook Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Webhooks</p>
              <p className="text-xs text-default-500">Enable webhook system for external integrations</p>
            </div>
            <Switch
              isSelected={settings.enabled === true || settings.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('enabled', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default Timeout (seconds)"
              type="number"
              
              onChange={(e) => onSettingsChange('defaultTimeout', parseInt(e.target.value) || 30)}
              placeholder="30"
              startContent={<Icon icon="lucide:clock" className="text-default-400" />}
            />

            <Input
              label="Max Retries"
              type="number"
              
              onChange={(e) => onSettingsChange('maxRetries', parseInt(e.target.value) || 3)}
              placeholder="3"
              startContent={<Icon icon="lucide:refresh-cw" className="text-default-400" />}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Retry Logic</p>
              <p className="text-xs text-default-500">Automatically retry failed webhook calls</p>
            </div>
            <Switch
              isSelected={settings.enableRetry === true || settings.enableRetry === 'true'}
              onValueChange={(value) => onSettingsChange('enableRetry', value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Webhook Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:bell" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Webhook Events</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Employee Events</p>
                <p className="text-xs text-default-500">Trigger webhooks for employee actions</p>
              </div>
              <Switch
                isSelected={settings.events?.employee === true || settings.events?.employee === 'true'}
                onValueChange={(value) => onSettingsChange('events', {
                  ...settings.events,
                  employee: value
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Leave Events</p>
                <p className="text-xs text-default-500">Trigger webhooks for leave actions</p>
              </div>
              <Switch
                isSelected={settings.events?.leave === true || settings.events?.leave === 'true'}
                onValueChange={(value) => onSettingsChange('events', {
                  ...settings.events,
                  leave: value
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Attendance Events</p>
                <p className="text-xs text-default-500">Trigger webhooks for attendance actions</p>
              </div>
              <Switch
                isSelected={settings.events?.attendance === true || settings.events?.attendance === 'true'}
                onValueChange={(value) => onSettingsChange('events', {
                  ...settings.events,
                  attendance: value
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Payroll Events</p>
                <p className="text-xs text-default-500">Trigger webhooks for payroll actions</p>
              </div>
              <Switch
                isSelected={settings.events?.payroll === true || settings.events?.payroll === 'true'}
                onValueChange={(value) => onSettingsChange('events', {
                  ...settings.events,
                  payroll: value
                })}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Webhook Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:list" className="text-primary-500 text-xl" />
              <h3 className="text-lg font-semibold text-foreground">Webhook Endpoints</h3>
            </div>
            <Button 
              color="primary" 
              variant="flat" 
              startContent={<Icon icon="lucide:plus" />}
              onPress={onAddWebhook}
            >
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {webhooks.length > 0 ? (
            <Table aria-label="Webhooks table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>URL</TableColumn>
                <TableColumn>EVENTS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook: any) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:webhook" className="text-primary-500" />
                        <span className="font-medium">{webhook.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-default-600">{webhook.url}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {webhook.events?.map((event: string) => (
                          <Chip key={event} size="sm" variant="flat" color="primary">
                            {event}
                          </Chip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        color={webhook.active ? "success" : "default"}
                      >
                        {webhook.active ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => onEditWebhook(webhook)}
                        >
                          <Icon icon="lucide:edit" className="text-primary-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => onTestWebhook(webhook.id)}
                        >
                          <Icon icon="lucide:play" className="text-success-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => onDeleteWebhook(webhook.id)}
                        >
                          <Icon icon="lucide:trash-2" className="text-danger-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Icon icon="lucide:webhook" className="w-16 h-16 text-default-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Webhooks Configured</h3>
              <p className="text-default-600 mb-4">Add webhook endpoints to receive real-time notifications</p>
              <Button 
                color="primary" 
                variant="flat" 
                startContent={<Icon icon="lucide:plus" />}
                onPress={onAddWebhook}
              >
                Add Your First Webhook
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Webhook Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:file-text" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Webhook Logs</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Logging</p>
              <p className="text-xs text-default-500">Log all webhook requests and responses</p>
            </div>
            <Switch
              isSelected={settings.logging?.enabled === true || settings.logging?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('logging', {
                ...settings.logging,
                enabled: value
              })}
            />
          </div>

          {settings.logging?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Log Retention (Days)"
                type="number"
                
                onChange={(e) => onSettingsChange('logging', {
                  ...settings.logging,
                  retentionDays: parseInt(e.target.value) || 30
                })}
                placeholder="30"
                startContent={<Icon icon="lucide:calendar-days" className="text-default-400" />}
              />

              <Input
                label="Max Log Size (MB)"
                type="number"
                
                onChange={(e) => onSettingsChange('logging', {
                  ...settings.logging,
                  maxSize: parseInt(e.target.value) || 100
                })}
                placeholder="100"
                startContent={<Icon icon="lucide:hard-drive" className="text-default-400" />}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button color="secondary" variant="flat" startContent={<Icon icon="lucide:eye" />}>
              View Logs
            </Button>
            <Button color="warning" variant="flat" startContent={<Icon icon="lucide:trash-2" />}>
              Clear Logs
            </Button>
            <Button color="success" variant="flat" startContent={<Icon icon="lucide:download" />}>
              Export Logs
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:shield" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Require HTTPS</p>
              <p className="text-xs text-default-500">Only allow HTTPS webhook URLs</p>
            </div>
            <Switch
              isSelected={settings.security?.requireHttps === true || settings.security?.requireHttps === 'true'}
              onValueChange={(value) => onSettingsChange('security', {
                ...settings.security,
                requireHttps: value
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Signature Verification</p>
              <p className="text-xs text-default-500">Verify webhook signatures for security</p>
            </div>
            <Switch
              isSelected={settings.security?.enableSignature === true || settings.security?.enableSignature === 'true'}
              onValueChange={(value) => onSettingsChange('security', {
                ...settings.security,
                enableSignature: value
              })}
            />
          </div>

          {settings.security?.enableSignature && (
            <Input
              label="Secret Key"
              type="password"
              
              onChange={(e) => onSettingsChange('security', {
                ...settings.security,
                secretKey: e.target.value
              })}
              placeholder="Enter webhook secret key"
              startContent={<Icon icon="lucide:key" className="text-default-400" />}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}