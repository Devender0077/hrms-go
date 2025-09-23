import React from "react";
import { Switch, Input, CheckboxGroup, Checkbox, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface NotificationSettingsProps {
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
    notificationChannels: {
      newEmployee: string[];
      leaveRequest: string[];
      attendanceAlert: string[];
      payrollProcessed: string[];
      systemMaintenance: string[];
    };
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function NotificationSettings({ settings, onSettingsChange }: NotificationSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:bell" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Notification Settings</h2>
          <p className="text-gray-600">Configure notification preferences and channels</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notification Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Email Notifications</span>
              <span className="text-xs text-gray-500">Receive notifications via email</span>
            </div>
            <Switch
              isSelected={settings.emailNotifications}
              onValueChange={(value) => onSettingsChange("emailNotifications", value)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
              <span className="text-xs text-gray-500">Receive notifications via SMS</span>
            </div>
            <Switch
              isSelected={settings.smsNotifications}
              onValueChange={(value) => onSettingsChange("smsNotifications", value)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Push Notifications</span>
              <span className="text-xs text-gray-500">Receive push notifications on mobile devices</span>
            </div>
            <Switch
              isSelected={settings.pushNotifications}
              onValueChange={(value) => onSettingsChange("pushNotifications", value)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">In-App Notifications</span>
              <span className="text-xs text-gray-500">Show notifications within the application</span>
            </div>
            <Switch
              isSelected={settings.inAppNotifications}
              onValueChange={(value) => onSettingsChange("inAppNotifications", value)}
            />
          </div>
        </div>
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notification Channels</h3>
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-3">New Employee</p>
            <CheckboxGroup
              value={settings.notificationChannels.newEmployee}
              onValueChange={(value) => onSettingsChange("notificationChannels", { 
                ...settings.notificationChannels, 
                newEmployee: value 
              })}
              orientation="horizontal"
            >
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
              <Checkbox value="in-app">In-App</Checkbox>
            </CheckboxGroup>
          </div>
          
          <div>
            <p className="font-medium mb-3">Leave Request</p>
            <CheckboxGroup
              value={settings.notificationChannels.leaveRequest}
              onValueChange={(value) => onSettingsChange("notificationChannels", { 
                ...settings.notificationChannels, 
                leaveRequest: value 
              })}
              orientation="horizontal"
            >
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
              <Checkbox value="in-app">In-App</Checkbox>
            </CheckboxGroup>
          </div>
          
          <div>
            <p className="font-medium mb-3">Attendance Alert</p>
            <CheckboxGroup
              value={settings.notificationChannels.attendanceAlert}
              onValueChange={(value) => onSettingsChange("notificationChannels", { 
                ...settings.notificationChannels, 
                attendanceAlert: value 
              })}
              orientation="horizontal"
            >
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
              <Checkbox value="in-app">In-App</Checkbox>
            </CheckboxGroup>
          </div>
          
          <div>
            <p className="font-medium mb-3">Payroll Processed</p>
            <CheckboxGroup
              value={settings.notificationChannels.payrollProcessed}
              onValueChange={(value) => onSettingsChange("notificationChannels", { 
                ...settings.notificationChannels, 
                payrollProcessed: value 
              })}
              orientation="horizontal"
            >
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
              <Checkbox value="in-app">In-App</Checkbox>
            </CheckboxGroup>
          </div>
          
          <div>
            <p className="font-medium mb-3">System Maintenance</p>
            <CheckboxGroup
              value={settings.notificationChannels.systemMaintenance}
              onValueChange={(value) => onSettingsChange("notificationChannels", { 
                ...settings.notificationChannels, 
                systemMaintenance: value 
              })}
              orientation="horizontal"
            >
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
              <Checkbox value="in-app">In-App</Checkbox>
            </CheckboxGroup>
          </div>
        </div>
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quiet Hours</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Enable Quiet Hours</span>
              <span className="text-xs text-gray-500">Disable notifications during specified hours</span>
            </div>
            <Switch
              isSelected={settings.quietHours.enabled}
              onValueChange={(value) => onSettingsChange("quietHours", { 
                ...settings.quietHours, 
                enabled: value 
              })}
            />
          </div>
          {settings.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="time"
                value={settings.quietHours.start}
                onValueChange={(value) => onSettingsChange("quietHours", { 
                  ...settings.quietHours, 
                  start: value 
                })}
              />
              <Input
                label="End Time"
                type="time"
                value={settings.quietHours.end}
                onValueChange={(value) => onSettingsChange("quietHours", { 
                  ...settings.quietHours, 
                  end: value 
                })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
