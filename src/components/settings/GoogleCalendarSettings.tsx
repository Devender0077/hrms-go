import React from "react";
import { Card, CardBody, CardHeader, Input, Switch, Button, Divider } from "@heroui/react";

interface GoogleCalendarSettingsProps {
  settings: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    enabled: boolean;
    syncEmployees: boolean;
    syncLeaveRequests: boolean;
    syncMeetings: boolean;
    syncInterviews: boolean;
    syncEvents: boolean;
    autoAccept: boolean;
    reminderMinutes: number;
    timezone: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: string[];
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function GoogleCalendarSettings({ settings, onSettingsChange }: GoogleCalendarSettingsProps) {
  const workingDaysOptions = [
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
    { label: "Sunday", value: "sunday" }
  ];

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    const updatedDays = checked 
      ? [...settings.workingDays, day]
      : settings.workingDays.filter(d => d !== day);
    onSettingsChange("workingDays", updatedDays);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Google Calendar API Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Client ID"
              placeholder="Enter Google Calendar Client ID"
              value={settings.clientId}
              onChange={(e) => onSettingsChange("clientId", e.target.value)}
              type="password"
            />
            <Input
              label="Client Secret"
              placeholder="Enter Google Calendar Client Secret"
              value={settings.clientSecret}
              onChange={(e) => onSettingsChange("clientSecret", e.target.value)}
              type="password"
            />
            <Input
              label="Redirect URI"
              placeholder="https://yourdomain.com/auth/google/callback"
              value={settings.redirectUri}
              onChange={(e) => onSettingsChange("redirectUri", e.target.value)}
            />
            <Input
              label="Timezone"
              placeholder="America/New_York"
              value={settings.timezone}
              onChange={(e) => onSettingsChange("timezone", e.target.value)}
            />
          </div>
          <Button color="primary" className="w-full">
            Connect Google Calendar
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Sync Settings</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable Google Calendar integration</span>
                <span className="text-xs text-default-500">Connect and sync with Google Calendar</span>
              </div>
              <Switch
                isSelected={settings.enabled}
                onValueChange={(value) => onSettingsChange("enabled", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Sync employee calendars</span>
                <span className="text-xs text-default-500">Synchronize individual employee calendars</span>
              </div>
              <Switch
                isSelected={settings.syncEmployees}
                onValueChange={(value) => onSettingsChange("syncEmployees", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Sync leave requests</span>
                <span className="text-xs text-default-500">Automatically sync leave requests to calendar</span>
              </div>
              <Switch
                isSelected={settings.syncLeaveRequests}
                onValueChange={(value) => onSettingsChange("syncLeaveRequests", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Sync meetings and appointments</span>
                <span className="text-xs text-default-500">Synchronize meeting schedules</span>
              </div>
              <Switch
                isSelected={settings.syncMeetings}
                onValueChange={(value) => onSettingsChange("syncMeetings", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Sync interview schedules</span>
                <span className="text-xs text-default-500">Automatically sync interview appointments</span>
              </div>
              <Switch
                isSelected={settings.syncInterviews}
                onValueChange={(value) => onSettingsChange("syncInterviews", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Sync company events</span>
                <span className="text-xs text-default-500">Synchronize company-wide events</span>
              </div>
              <Switch
                isSelected={settings.syncEvents}
                onValueChange={(value) => onSettingsChange("syncEvents", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Auto-accept calendar invitations</span>
                <span className="text-xs text-default-500">Automatically accept calendar invitations</span>
              </div>
              <Switch
                isSelected={settings.autoAccept}
                onValueChange={(value) => onSettingsChange("autoAccept", value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Working Hours & Reminders</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Working Hours Start"
              type="time"
              value={settings.workingHoursStart}
              onChange={(e) => onSettingsChange("workingHoursStart", e.target.value)}
            />
            <Input
              label="Working Hours End"
              type="time"
              value={settings.workingHoursEnd}
              onChange={(e) => onSettingsChange("workingHoursEnd", e.target.value)}
            />
            <Input
              label="Reminder Minutes"
              type="number"
              placeholder="15"
              value={settings.reminderMinutes.toString()}
              onChange={(e) => onSettingsChange("reminderMinutes", parseInt(e.target.value))}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-4 block">Working Days</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workingDaysOptions.map((day) => (
                <div key={day.value} className="flex items-center justify-between p-3 bg-content1 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{day.label}</span>
                    <span className="text-xs text-default-500">Include {day.label.toLowerCase()} as a working day</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.workingDays.includes(day.value)}
                    onChange={(e) => handleWorkingDayChange(day.value, e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-content2 border-divider rounded focus:ring-primary-500 focus:ring-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
