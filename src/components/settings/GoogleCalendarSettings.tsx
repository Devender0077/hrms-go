import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Icon } from '@iconify/react';

interface GoogleCalendarSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function GoogleCalendarSettings({ settings, onSettingsChange }: GoogleCalendarSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:calendar" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Google Calendar</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <Icon icon="lucide:construction" className="w-16 h-16 text-default-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Google Calendar Integration</h3>
            <p className="text-default-600">Configure Google Calendar integration and sync settings</p>
            <p className="text-sm text-default-500 mt-2">Google Calendar integration and sync settings</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}