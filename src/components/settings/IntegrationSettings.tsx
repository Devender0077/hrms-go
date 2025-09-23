import React from "react";
import { Switch, Input, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface IntegrationSettingsProps {
  settings: {
    // Pusher settings
    pusherEnabled: boolean;
    pusherAppId: string;
    pusherAppKey: string;
    pusherAppSecret: string;
    pusherCluster: string;
    
    // Zoom settings
    zoomEnabled: boolean;
    zoomClientId: string;
    zoomClientSecret: string;
    
    // Teams settings
    teamsEnabled: boolean;
    teamsClientId: string;
    teamsClientSecret: string;
    
    // Slack settings
    slackEnabled: boolean;
    slackClientId: string;
    slackClientSecret: string;
    
    // Telegram settings
    telegramEnabled: boolean;
    telegramBotToken: string;
    
    // Twilio settings
    twilioEnabled: boolean;
    twilioSid: string;
    twilioAuthToken: string;
    twilioFromNumber: string;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function IntegrationSettings({ settings, onSettingsChange }: IntegrationSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:plug" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Integration Settings</h2>
          <p className="text-gray-600">Configure third-party service integrations</p>
        </div>
      </div>

      {/* Pusher Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:zap" className="text-purple-600 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">Pusher</h3>
                <p className="text-sm text-gray-500">Real-time notifications and updates</p>
              </div>
            </div>
            <Switch
              isSelected={settings.pusherEnabled}
              onValueChange={(value) => onSettingsChange("pusherEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.pusherEnabled && (
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="App ID"
                placeholder="Enter Pusher App ID"
                value={settings.pusherAppId}
                onValueChange={(value) => onSettingsChange("pusherAppId", value)}
              />
              <Input
                label="App Key"
                placeholder="Enter Pusher App Key"
                value={settings.pusherAppKey}
                onValueChange={(value) => onSettingsChange("pusherAppKey", value)}
              />
              <Input
                label="App Secret"
                type="password"
                placeholder="Enter Pusher App Secret"
                value={settings.pusherAppSecret}
                onValueChange={(value) => onSettingsChange("pusherAppSecret", value)}
              />
              <Input
                label="Cluster"
                placeholder="us2"
                value={settings.pusherCluster}
                onValueChange={(value) => onSettingsChange("pusherCluster", value)}
              />
            </div>
          </CardBody>
        )}
      </Card>

      {/* Zoom Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:video" className="text-blue-600 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">Zoom</h3>
                <p className="text-sm text-gray-500">Video conferencing integration</p>
              </div>
            </div>
            <Switch
              isSelected={settings.zoomEnabled}
              onValueChange={(value) => onSettingsChange("zoomEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.zoomEnabled && (
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Client ID"
                placeholder="Enter Zoom Client ID"
                value={settings.zoomClientId}
                onValueChange={(value) => onSettingsChange("zoomClientId", value)}
              />
              <Input
                label="Client Secret"
                type="password"
                placeholder="Enter Zoom Client Secret"
                value={settings.zoomClientSecret}
                onValueChange={(value) => onSettingsChange("zoomClientSecret", value)}
              />
            </div>
          </CardBody>
        )}
      </Card>

      {/* Microsoft Teams Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:users" className="text-blue-500 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">Microsoft Teams</h3>
                <p className="text-sm text-gray-500">Team collaboration integration</p>
              </div>
            </div>
            <Switch
              isSelected={settings.teamsEnabled}
              onValueChange={(value) => onSettingsChange("teamsEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.teamsEnabled && (
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Client ID"
                placeholder="Enter Teams Client ID"
                value={settings.teamsClientId}
                onValueChange={(value) => onSettingsChange("teamsClientId", value)}
              />
              <Input
                label="Client Secret"
                type="password"
                placeholder="Enter Teams Client Secret"
                value={settings.teamsClientSecret}
                onValueChange={(value) => onSettingsChange("teamsClientSecret", value)}
              />
            </div>
          </CardBody>
        )}
      </Card>

      {/* Slack Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:message-square" className="text-purple-500 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">Slack</h3>
                <p className="text-sm text-gray-500">Team communication integration</p>
              </div>
            </div>
            <Switch
              isSelected={settings.slackEnabled}
              onValueChange={(value) => onSettingsChange("slackEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.slackEnabled && (
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Client ID"
                placeholder="Enter Slack Client ID"
                value={settings.slackClientId}
                onValueChange={(value) => onSettingsChange("slackClientId", value)}
              />
              <Input
                label="Client Secret"
                type="password"
                placeholder="Enter Slack Client Secret"
                value={settings.slackClientSecret}
                onValueChange={(value) => onSettingsChange("slackClientSecret", value)}
              />
            </div>
          </CardBody>
        )}
      </Card>

      {/* Telegram Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:send" className="text-blue-400 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">Telegram</h3>
                <p className="text-sm text-gray-500">Messaging bot integration</p>
              </div>
            </div>
            <Switch
              isSelected={settings.telegramEnabled}
              onValueChange={(value) => onSettingsChange("telegramEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.telegramEnabled && (
          <CardBody className="space-y-4">
            <Input
              label="Bot Token"
              type="password"
              placeholder="Enter Telegram Bot Token"
              value={settings.telegramBotToken}
              onValueChange={(value) => onSettingsChange("telegramBotToken", value)}
            />
          </CardBody>
        )}
      </Card>

      {/* Twilio Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:phone" className="text-red-500 text-lg" />
              <div>
                <h3 className="text-lg font-semibold">Twilio</h3>
                <p className="text-sm text-gray-500">SMS and voice communication</p>
              </div>
            </div>
            <Switch
              isSelected={settings.twilioEnabled}
              onValueChange={(value) => onSettingsChange("twilioEnabled", value)}
            />
          </div>
        </CardHeader>
        {settings.twilioEnabled && (
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Account SID"
                placeholder="Enter Twilio Account SID"
                value={settings.twilioSid}
                onValueChange={(value) => onSettingsChange("twilioSid", value)}
              />
              <Input
                label="Auth Token"
                type="password"
                placeholder="Enter Twilio Auth Token"
                value={settings.twilioAuthToken}
                onValueChange={(value) => onSettingsChange("twilioAuthToken", value)}
              />
              <Input
                label="From Number"
                placeholder="+1234567890"
                value={settings.twilioFromNumber}
                onValueChange={(value) => onSettingsChange("twilioFromNumber", value)}
              />
            </div>
          </CardBody>
        )}
      </Card>
    </div>
  );
}
