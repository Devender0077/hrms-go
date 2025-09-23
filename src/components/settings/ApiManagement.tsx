import React from "react";
import { Button, Card, CardBody, CardHeader, Input, Switch } from "@heroui/react";
import { Icon } from "@iconify/react";

interface ApiKey {
  id: number;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

interface ApiManagementProps {
  settings: {
    apiEnabled: boolean;
    rateLimit: number;
    webhookUrl: string;
    webhookSecret: string;
    apiKeys: ApiKey[];
  };
  onSettingsChange: (field: string, value: any) => void;
  onCreateApiKey: () => void;
  onDeleteApiKey: (id: number) => void;
}

export default function ApiManagement({ settings, onSettingsChange, onCreateApiKey, onDeleteApiKey }: ApiManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Icon icon="lucide:code" className="text-primary-600 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">API Management</h2>
            <p className="text-gray-600">Manage API keys and webhook configuration</p>
          </div>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:key" />}
          onPress={onCreateApiKey}
        >
          Create API Key
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">API Configuration</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">API Access</p>
                <p className="text-sm text-gray-500">Enable API access for external applications</p>
              </div>
              <Switch
                isSelected={settings.apiEnabled}
                onValueChange={(value) => onSettingsChange("apiEnabled", value)}
              />
            </div>
            <Input
              label="Rate Limit (requests/hour)"
              type="number"
              value={settings.rateLimit.toString()}
              onValueChange={(value) => onSettingsChange("rateLimit", parseInt(value))}
            />
            <Input
              label="Webhook URL"
              placeholder="https://your-domain.com/webhook"
              value={settings.webhookUrl}
              onValueChange={(value) => onSettingsChange("webhookUrl", value)}
            />
            <Input
              label="Webhook Secret"
              type="password"
              placeholder="Enter webhook secret"
              value={settings.webhookSecret}
              onValueChange={(value) => onSettingsChange("webhookSecret", value)}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">API Keys</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {settings.apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-gray-500">{key.key}</p>
                    <p className="text-xs text-gray-400">Created: {key.created} | Last used: {key.lastUsed}</p>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => onDeleteApiKey(key.id)}
                  >
                    <Icon icon="lucide:trash-2" />
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
