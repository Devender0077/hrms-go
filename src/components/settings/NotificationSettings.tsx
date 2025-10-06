import React from 'react';
import { Card, CardBody, CardHeader, Switch, CheckboxGroup, Checkbox } from '@heroui/react';
import { Icon } from '@iconify/react';

interface NotificationSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function NotificationSettings({ settings, onSettingsChange }: NotificationSettingsProps) {
  const notificationChannels = [
    { key: 'email', label: 'Email' },
    { key: 'sms', label: 'SMS' },
    { key: 'push', label: 'Push Notification' },
    { key: 'in-app', label: 'In-App Notification' },
  ];

  const notificationTypes = [
    { key: 'newEmployee', label: 'New Employee' },
    { key: 'leaveRequest', label: 'Leave Request' },
    { key: 'attendanceAlert', label: 'Attendance Alert' },
    { key: 'payrollProcessed', label: 'Payroll Processed' },
    { key: 'systemMaintenance', label: 'System Maintenance' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon icon="lucide:bell" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Notification Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Notification Channels</h4>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-default-500 dark:text-default-400">Send notifications via email</p>
                </div>
                <Switch
                  isSelected={settings.emailNotifications === true || settings.emailNotifications === 'true'}
                  onValueChange={(value) => onSettingsChange('emailNotifications', value)}
                  color="primary"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">SMS Notifications</p>
                  <p className="text-xs text-default-500 dark:text-default-400">Send notifications via SMS</p>
                </div>
                <Switch
                  isSelected={settings.smsNotifications === true || settings.smsNotifications === 'true'}
                  onValueChange={(value) => onSettingsChange('smsNotifications', value)}
                  color="primary"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-default-500 dark:text-default-400">Send push notifications to mobile devices</p>
                </div>
                <Switch
                  isSelected={settings.pushNotifications === true || settings.pushNotifications === 'true'}
                  onValueChange={(value) => onSettingsChange('pushNotifications', value)}
                  color="primary"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">In-App Notifications</p>
                  <p className="text-xs text-default-500 dark:text-default-400">Show notifications within the application</p>
                </div>
                <Switch
                  isSelected={settings.inAppNotifications === true || settings.inAppNotifications === 'true'}
                  onValueChange={(value) => onSettingsChange('inAppNotifications', value)}
                  color="primary"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Notification Types</h4>
            
            {notificationTypes.map((type) => (
              <div key={type.key} className="space-y-2">
                <p className="text-sm font-medium text-foreground">{type.label}</p>
                <CheckboxGroup
                  
                  onValueChange={(value) => onSettingsChange('notificationChannels', {
                    ...settings.notificationChannels,
                    [type.key]: value
                  })}
                  className="flex flex-wrap gap-4"
                >
                  {notificationChannels.map((channel) => (
                    <Checkbox key={channel.key} >
                      {channel.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Quiet Hours</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Quiet Hours</p>
                <p className="text-xs text-default-500">Disable notifications during specified hours</p>
              </div>
              <Switch
                isSelected={settings.quietHours?.enabled === true || settings.quietHours?.enabled === 'true'}
                onValueChange={(value) => onSettingsChange('quietHours', {
                  ...settings.quietHours,
                  enabled: value
                })}
              />
            </div>
            
            {settings.quietHours?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Start Time</label>
                  <input
                    type="time"
                    
                    onChange={(e) => onSettingsChange('quietHours', {
                      ...settings.quietHours,
                      start: e.target.value
                    })}
                    className="w-full mt-1 px-3 py-2 border border-default-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">End Time</label>
                  <input
                    type="time"
                    
                    onChange={(e) => onSettingsChange('quietHours', {
                      ...settings.quietHours,
                      end: e.target.value
                    })}
                    className="w-full mt-1 px-3 py-2 border border-default-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}