import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Switch, Input, Button, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { apiRequest } from '../../services/api-service';

interface IntegrationSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function IntegrationSettings({ settings, onSettingsChange }: IntegrationSettingsProps) {
  const [testingPusher, setTestingPusher] = useState(false);
  const [pusherTestResult, setPusherTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [testingSlack, setTestingSlack] = useState(false);
  const [slackTestResult, setSlackTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [testingTeams, setTestingTeams] = useState(false);
  const [teamsTestResult, setTeamsTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [testingZoom, setTestingZoom] = useState(false);
  const [zoomTestResult, setZoomTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [testingGoogleCalendar, setTestingGoogleCalendar] = useState(false);
  const [googleCalendarTestResult, setGoogleCalendarTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [testingGoogleDrive, setTestingGoogleDrive] = useState(false);
  const [googleDriveTestResult, setGoogleDriveTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestPusher = async () => {
    if (!settings.pusher?.appId || !settings.pusher?.appKey || !settings.pusher?.appSecret || !settings.pusher?.cluster) {
      setPusherTestResult({
        success: false,
        message: 'Please fill in all Pusher credentials first'
      });
      return;
    }

    setTestingPusher(true);
    setPusherTestResult(null);

    try {
      const response = await apiRequest<{ success: boolean; message: string }>('/pusher/test', {
        method: 'POST',
        body: JSON.stringify({
          appId: settings.pusher.appId,
          appKey: settings.pusher.appKey,
          appSecret: settings.pusher.appSecret,
          cluster: settings.pusher.cluster
        })
      });

      setPusherTestResult(response);
    } catch (error: any) {
      setPusherTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTestingPusher(false);
    }
  };

  const handleTestSlack = async () => {
    if (!settings.slack?.webhookUrl) {
      setSlackTestResult({
        success: false,
        message: 'Please enter Webhook URL first'
      });
      return;
    }

    setTestingSlack(true);
    setSlackTestResult(null);

    try {
      const response = await apiRequest<{ success: boolean; message: string }>('/integrations/slack/test', {
        method: 'POST',
        body: JSON.stringify({
          webhookUrl: settings.slack.webhookUrl
        })
      });

      setSlackTestResult(response);
    } catch (error: any) {
      setSlackTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTestingSlack(false);
    }
  };

  const handleTestTeams = async () => {
    if (!settings.microsoftTeams?.webhookUrl) {
      setTeamsTestResult({
        success: false,
        message: 'Please enter Webhook URL first'
      });
      return;
    }

    setTestingTeams(true);
    setTeamsTestResult(null);

    try {
      const response = await apiRequest<{ success: boolean; message: string }>('/integrations/teams/test', {
        method: 'POST',
        body: JSON.stringify({
          webhookUrl: settings.microsoftTeams.webhookUrl
        })
      });

      setTeamsTestResult(response);
    } catch (error: any) {
      setTeamsTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTestingTeams(false);
    }
  };

  const handleTestZoom = async () => {
    if (!settings.zoom?.apiKey || !settings.zoom?.apiSecret) {
      setZoomTestResult({
        success: false,
        message: 'Please enter API Key and Secret first'
      });
      return;
    }

    setTestingZoom(true);
    setZoomTestResult(null);

    try {
      const response = await apiRequest<{ success: boolean; message: string }>('/integrations/zoom/test', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: settings.zoom.apiKey,
          apiSecret: settings.zoom.apiSecret
        })
      });

      setZoomTestResult(response);
    } catch (error: any) {
      setZoomTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTestingZoom(false);
    }
  };

  const handleTestGoogleCalendar = async () => {
    if (!settings.googleCalendar?.clientId || !settings.googleCalendar?.clientSecret) {
      setGoogleCalendarTestResult({
        success: false,
        message: 'Please enter Client ID and Secret first'
      });
      return;
    }

    setTestingGoogleCalendar(true);
    setGoogleCalendarTestResult(null);

    try {
      const response = await apiRequest<{ success: boolean; message: string }>('/integrations/google-calendar/test', {
        method: 'POST',
        body: JSON.stringify({
          clientId: settings.googleCalendar.clientId,
          clientSecret: settings.googleCalendar.clientSecret
        })
      });

      setGoogleCalendarTestResult(response);
    } catch (error: any) {
      setGoogleCalendarTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTestingGoogleCalendar(false);
    }
  };

  const handleTestGoogleDrive = async () => {
    if (!settings.googleDrive?.clientId || !settings.googleDrive?.clientSecret) {
      setGoogleDriveTestResult({
        success: false,
        message: 'Please enter Client ID and Secret first'
      });
      return;
    }

    setTestingGoogleDrive(true);
    setGoogleDriveTestResult(null);

    try {
      const response = await apiRequest<{ success: boolean; message: string }>('/integrations/google-drive/test', {
        method: 'POST',
        body: JSON.stringify({
          clientId: settings.googleDrive.clientId,
          clientSecret: settings.googleDrive.clientSecret
        })
      });

      setGoogleDriveTestResult(response);
    } catch (error: any) {
      setGoogleDriveTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTestingGoogleDrive(false);
    }
  };
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
              onValueChange={(value) => onSettingsChange('googleCalendar', {
                ...settings.googleCalendar,
                enabled: value
              })}
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
                  onValueChange={(value) => onSettingsChange('googleCalendar', {
                    ...settings.googleCalendar,
                    syncLeaveRequests: value
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sync Meetings</p>
                  <p className="text-xs text-default-500">Sync HR meetings and interviews</p>
                </div>
                <Switch
                  isSelected={settings.googleCalendar?.syncMeetings === true || settings.googleCalendar?.syncMeetings === 'true'}
                  onValueChange={(value) => onSettingsChange('googleCalendar', {
                    ...settings.googleCalendar,
                    syncMeetings: value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Button 
                  color="primary" 
                  variant="flat" 
                  className="w-full"
                  onPress={handleTestGoogleCalendar}
                  isLoading={testingGoogleCalendar}
                >
                  {testingGoogleCalendar ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:link" className="text-lg" />
                      Test Google Calendar Connection
                    </>
                  )}
                </Button>

                {googleCalendarTestResult && (
                  <div className={`p-3 rounded-lg ${googleCalendarTestResult.success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={googleCalendarTestResult.success ? 'lucide:check-circle' : 'lucide:x-circle'} 
                        className="text-lg" 
                      />
                      <span className="text-sm font-medium">{googleCalendarTestResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
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
              onValueChange={(value) => onSettingsChange('slack', {
                ...settings.slack,
                enabled: value
              })}
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
                  onValueChange={(value) => onSettingsChange('slack', {
                    ...settings.slack,
                    leaveNotifications: value
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Birthday Notifications</p>
                  <p className="text-xs text-default-500">Send birthday reminders</p>
                </div>
                <Switch
                  isSelected={settings.slack?.birthdayNotifications === true || settings.slack?.birthdayNotifications === 'true'}
                  onValueChange={(value) => onSettingsChange('slack', {
                    ...settings.slack,
                    birthdayNotifications: value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Button 
                  color="primary" 
                  variant="flat" 
                  className="w-full"
                  onPress={handleTestSlack}
                  isLoading={testingSlack}
                >
                  {testingSlack ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:message-square" className="text-lg" />
                      Test Slack Connection
                    </>
                  )}
                </Button>

                {slackTestResult && (
                  <div className={`p-3 rounded-lg ${slackTestResult.success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={slackTestResult.success ? 'lucide:check-circle' : 'lucide:x-circle'} 
                        className="text-lg" 
                      />
                      <span className="text-sm font-medium">{slackTestResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
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
              onValueChange={(value) => onSettingsChange('zoom', {
                ...settings.zoom,
                enabled: value
              })}
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
                  onValueChange={(value) => onSettingsChange('zoom', {
                    ...settings.zoom,
                    autoCreateMeetings: value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Button 
                  color="primary" 
                  variant="flat" 
                  className="w-full"
                  onPress={handleTestZoom}
                  isLoading={testingZoom}
                >
                  {testingZoom ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:video" className="text-lg" />
                      Test Zoom Connection
                    </>
                  )}
                </Button>

                {zoomTestResult && (
                  <div className={`p-3 rounded-lg ${zoomTestResult.success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={zoomTestResult.success ? 'lucide:check-circle' : 'lucide:x-circle'} 
                        className="text-lg" 
                      />
                      <span className="text-sm font-medium">{zoomTestResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
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
                onValueChange={(value) => onSettingsChange('paypal', {
                  ...settings.paypal,
                  enabled: value
                })}
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
                onValueChange={(value) => onSettingsChange('stripe', {
                  ...settings.stripe,
                  enabled: value
                })}
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
              onValueChange={(value) => onSettingsChange('quickbooks', {
                ...settings.quickbooks,
                enabled: value
              })}
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
                  onValueChange={(value) => onSettingsChange('quickbooks', {
                    ...settings.quickbooks,
                    syncPayroll: value
                  })}
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

      {/* Microsoft Teams Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:message-square" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Microsoft Teams</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Microsoft Teams</p>
              <p className="text-xs text-default-500">Send notifications and updates to Teams</p>
            </div>
            <Switch
              isSelected={settings.microsoftTeams?.enabled === true || settings.microsoftTeams?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('microsoftTeams', {
                ...settings.microsoftTeams,
                enabled: value
              })}
            />
          </div>

          {settings.microsoftTeams?.enabled && (
            <div className="space-y-4">
              <Input
                label="Webhook URL"
                value={settings.microsoftTeams?.webhookUrl || ''}
                onChange={(e) => onSettingsChange('microsoftTeams', {
                  ...settings.microsoftTeams,
                  webhookUrl: e.target.value
                })}
                placeholder="Enter Microsoft Teams Webhook URL"
                startContent={<Icon icon="lucide:link" className="text-default-400" />}
              />

              <Input
                label="Tenant ID"
                value={settings.microsoftTeams?.tenantId || ''}
                onChange={(e) => onSettingsChange('microsoftTeams', {
                  ...settings.microsoftTeams,
                  tenantId: e.target.value
                })}
                placeholder="Enter Tenant ID"
                startContent={<Icon icon="lucide:building" className="text-default-400" />}
              />

              <Input
                label="Client ID"
                value={settings.microsoftTeams?.clientId || ''}
                onChange={(e) => onSettingsChange('microsoftTeams', {
                  ...settings.microsoftTeams,
                  clientId: e.target.value
                })}
                placeholder="Enter Client ID"
                startContent={<Icon icon="lucide:key" className="text-default-400" />}
              />

              <Input
                label="Client Secret"
                type="password"
                value={settings.microsoftTeams?.clientSecret || ''}
                onChange={(e) => onSettingsChange('microsoftTeams', {
                  ...settings.microsoftTeams,
                  clientSecret: e.target.value
                })}
                placeholder="Enter Client Secret"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Notify on Leave Requests</p>
                  <p className="text-xs text-default-500">Send Teams notification for new leave requests</p>
                </div>
                <Switch
                  isSelected={settings.microsoftTeams?.notifyLeaveRequests === true || settings.microsoftTeams?.notifyLeaveRequests === 'true'}
                  onValueChange={(value) => onSettingsChange('microsoftTeams', {
                    ...settings.microsoftTeams,
                    notifyLeaveRequests: value
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Notify on Attendance</p>
                  <p className="text-xs text-default-500">Send Teams notification for attendance updates</p>
                </div>
                <Switch
                  isSelected={settings.microsoftTeams?.notifyAttendance === true || settings.microsoftTeams?.notifyAttendance === 'true'}
                  onValueChange={(value) => onSettingsChange('microsoftTeams', {
                    ...settings.microsoftTeams,
                    notifyAttendance: value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Button 
                  color="primary" 
                  variant="flat" 
                  className="w-full"
                  onPress={handleTestTeams}
                  isLoading={testingTeams}
                >
                  {testingTeams ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:message-square" className="text-lg" />
                      Test Teams Connection
                    </>
                  )}
                </Button>

                {teamsTestResult && (
                  <div className={`p-3 rounded-lg ${teamsTestResult.success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={teamsTestResult.success ? 'lucide:check-circle' : 'lucide:x-circle'} 
                        className="text-lg" 
                      />
                      <span className="text-sm font-medium">{teamsTestResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Twilio Integration (SMS) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:message-circle" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Twilio (SMS Notifications)</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Twilio</p>
              <p className="text-xs text-default-500">Send SMS notifications to employees</p>
            </div>
            <Switch
              isSelected={settings.twilio?.enabled === true || settings.twilio?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('twilio', {
                ...settings.twilio,
                enabled: value
              })}
            />
          </div>

          {settings.twilio?.enabled && (
            <div className="space-y-4">
              <Input
                label="Account SID"
                value={settings.twilio?.accountSid || ''}
                onChange={(e) => onSettingsChange('twilio', {
                  ...settings.twilio,
                  accountSid: e.target.value
                })}
                placeholder="Enter Twilio Account SID"
                startContent={<Icon icon="lucide:hash" className="text-default-400" />}
              />

              <Input
                label="Auth Token"
                type="password"
                value={settings.twilio?.authToken || ''}
                onChange={(e) => onSettingsChange('twilio', {
                  ...settings.twilio,
                  authToken: e.target.value
                })}
                placeholder="Enter Twilio Auth Token"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <Input
                label="Phone Number"
                value={settings.twilio?.phoneNumber || ''}
                onChange={(e) => onSettingsChange('twilio', {
                  ...settings.twilio,
                  phoneNumber: e.target.value
                })}
                placeholder="+1234567890"
                startContent={<Icon icon="lucide:phone" className="text-default-400" />}
              />

              <Button color="primary" variant="flat" className="w-full">
                <Icon icon="lucide:message-circle" className="text-lg" />
                Test Twilio Connection
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* AWS S3 Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:cloud" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">AWS S3 (Cloud Storage)</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable AWS S3</p>
              <p className="text-xs text-default-500">Store files and documents in AWS S3</p>
            </div>
            <Switch
              isSelected={settings.awsS3?.enabled === true || settings.awsS3?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('awsS3', {
                ...settings.awsS3,
                enabled: value
              })}
            />
          </div>

          {settings.awsS3?.enabled && (
            <div className="space-y-4">
              <Input
                label="Access Key ID"
                value={settings.awsS3?.accessKeyId || ''}
                onChange={(e) => onSettingsChange('awsS3', {
                  ...settings.awsS3,
                  accessKeyId: e.target.value
                })}
                placeholder="Enter AWS Access Key ID"
                startContent={<Icon icon="lucide:key" className="text-default-400" />}
              />

              <Input
                label="Secret Access Key"
                type="password"
                value={settings.awsS3?.secretAccessKey || ''}
                onChange={(e) => onSettingsChange('awsS3', {
                  ...settings.awsS3,
                  secretAccessKey: e.target.value
                })}
                placeholder="Enter AWS Secret Access Key"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <Input
                label="Bucket Name"
                value={settings.awsS3?.bucketName || ''}
                onChange={(e) => onSettingsChange('awsS3', {
                  ...settings.awsS3,
                  bucketName: e.target.value
                })}
                placeholder="your-bucket-name"
                startContent={<Icon icon="lucide:folder" className="text-default-400" />}
              />

              <Input
                label="Region"
                value={settings.awsS3?.region || 'us-east-1'}
                onChange={(e) => onSettingsChange('awsS3', {
                  ...settings.awsS3,
                  region: e.target.value
                })}
                placeholder="us-east-1"
                startContent={<Icon icon="lucide:globe" className="text-default-400" />}
              />

              <Button color="primary" variant="flat" className="w-full">
                <Icon icon="lucide:cloud" className="text-lg" />
                Test S3 Connection
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Google Drive Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:hard-drive" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Google Drive</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Google Drive</p>
              <p className="text-xs text-default-500">Store documents in Google Drive</p>
            </div>
            <Switch
              isSelected={settings.googleDrive?.enabled === true || settings.googleDrive?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('googleDrive', {
                ...settings.googleDrive,
                enabled: value
              })}
            />
          </div>

          {settings.googleDrive?.enabled && (
            <div className="space-y-4">
              <Input
                label="Client ID"
                value={settings.googleDrive?.clientId || ''}
                onChange={(e) => onSettingsChange('googleDrive', {
                  ...settings.googleDrive,
                  clientId: e.target.value
                })}
                placeholder="Enter Google Drive Client ID"
                startContent={<Icon icon="lucide:key" className="text-default-400" />}
              />

              <Input
                label="Client Secret"
                type="password"
                value={settings.googleDrive?.clientSecret || ''}
                onChange={(e) => onSettingsChange('googleDrive', {
                  ...settings.googleDrive,
                  clientSecret: e.target.value
                })}
                placeholder="Enter Client Secret"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <Input
                label="Folder ID"
                value={settings.googleDrive?.folderId || ''}
                onChange={(e) => onSettingsChange('googleDrive', {
                  ...settings.googleDrive,
                  folderId: e.target.value
                })}
                placeholder="Enter Google Drive Folder ID"
                startContent={<Icon icon="lucide:folder" className="text-default-400" />}
              />

              <div className="space-y-2">
                <Button 
                  color="primary" 
                  variant="flat" 
                  className="w-full"
                  onPress={handleTestGoogleDrive}
                  isLoading={testingGoogleDrive}
                >
                  {testingGoogleDrive ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:hard-drive" className="text-lg" />
                      Test Google Drive Connection
                    </>
                  )}
                </Button>

                {googleDriveTestResult && (
                  <div className={`p-3 rounded-lg ${googleDriveTestResult.success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={googleDriveTestResult.success ? 'lucide:check-circle' : 'lucide:x-circle'} 
                        className="text-lg" 
                      />
                      <span className="text-sm font-medium">{googleDriveTestResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pusher Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:radio" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Pusher (Real-time Notifications)</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Pusher</p>
              <p className="text-xs text-default-500">Real-time notifications and updates</p>
            </div>
            <Switch
              isSelected={settings.pusher?.enabled === true || settings.pusher?.enabled === 'true'}
              onValueChange={(value) => {
                console.log('Pusher toggle:', value);
                onSettingsChange('pusher', {
                  ...settings.pusher,
                  enabled: value
                });
              }}
            />
          </div>

          {settings.pusher?.enabled && (
            <div className="space-y-4">
              <Input
                label="App ID"
                value={settings.pusher?.appId || ''}
                onChange={(e) => {
                  console.log('Pusher appId:', e.target.value);
                  onSettingsChange('pusher', {
                    ...settings.pusher,
                    appId: e.target.value
                  });
                }}
                placeholder="Enter Pusher App ID"
                startContent={<Icon icon="lucide:hash" className="text-default-400" />}
              />

              <Input
                label="App Key"
                value={settings.pusher?.appKey || ''}
                onChange={(e) => {
                  console.log('Pusher appKey:', e.target.value);
                  onSettingsChange('pusher', {
                    ...settings.pusher,
                    appKey: e.target.value
                  });
                }}
                placeholder="Enter Pusher App Key"
                startContent={<Icon icon="lucide:key" className="text-default-400" />}
              />

              <Input
                label="App Secret"
                type="password"
                value={settings.pusher?.appSecret || ''}
                onChange={(e) => {
                  console.log('Pusher appSecret:', e.target.value);
                  onSettingsChange('pusher', {
                    ...settings.pusher,
                    appSecret: e.target.value
                  });
                }}
                placeholder="Enter Pusher App Secret"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <Input
                label="Cluster"
                value={settings.pusher?.cluster || ''}
                onChange={(e) => {
                  console.log('Pusher cluster:', e.target.value);
                  onSettingsChange('pusher', {
                    ...settings.pusher,
                    cluster: e.target.value
                  });
                }}
                placeholder="e.g., ap2, us2, eu"
                startContent={<Icon icon="lucide:globe" className="text-default-400" />}
              />

              <div className="space-y-2">
                <Button 
                  color="primary" 
                  variant="flat" 
                  className="w-full"
                  onPress={handleTestPusher}
                  isLoading={testingPusher}
                >
                  {testingPusher ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:zap" className="text-lg" />
                      Test Pusher Connection
                    </>
                  )}
                </Button>

                {pusherTestResult && (
                  <div className={`p-3 rounded-lg ${pusherTestResult.success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={pusherTestResult.success ? 'lucide:check-circle' : 'lucide:x-circle'} 
                        className="text-lg" 
                      />
                      <span className="text-sm font-medium">{pusherTestResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* QuickBooks Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:book-open" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">QuickBooks</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable QuickBooks</p>
              <p className="text-xs text-default-500">Sync payroll and financial data</p>
            </div>
            <Switch
              isSelected={settings.quickbooks?.enabled === true || settings.quickbooks?.enabled === 'true'}
              onValueChange={(value) => {
                console.log('QuickBooks toggle:', value);
                onSettingsChange('quickbooks', {
                  ...settings.quickbooks,
                  enabled: value
                });
              }}
            />
          </div>

          {settings.quickbooks?.enabled && (
            <div className="space-y-4">
              <Input
                label="Client ID"
                value={settings.quickbooks?.clientId || ''}
                onChange={(e) => {
                  console.log('QuickBooks clientId:', e.target.value);
                  onSettingsChange('quickbooks', {
                    ...settings.quickbooks,
                    clientId: e.target.value
                  });
                }}
                placeholder="Enter QuickBooks Client ID"
                startContent={<Icon icon="lucide:key" className="text-default-400" />}
              />

              <Input
                label="Client Secret"
                type="password"
                value={settings.quickbooks?.clientSecret || ''}
                onChange={(e) => {
                  console.log('QuickBooks clientSecret:', e.target.value);
                  onSettingsChange('quickbooks', {
                    ...settings.quickbooks,
                    clientSecret: e.target.value
                  });
                }}
                placeholder="Enter Client Secret"
                startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              />

              <Input
                label="Company ID"
                value={settings.quickbooks?.companyId || ''}
                onChange={(e) => {
                  console.log('QuickBooks companyId:', e.target.value);
                  onSettingsChange('quickbooks', {
                    ...settings.quickbooks,
                    companyId: e.target.value
                  });
                }}
                placeholder="Enter QuickBooks Company ID"
                startContent={<Icon icon="lucide:building" className="text-default-400" />}
              />

              <Button color="primary" variant="flat" className="w-full">
                <Icon icon="lucide:link" className="text-lg" />
                Connect QuickBooks
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

    </div>
  );
}