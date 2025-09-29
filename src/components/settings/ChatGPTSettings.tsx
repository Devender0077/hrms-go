import React from "react";
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Button, Divider, Select, SelectItem } from "@heroui/react";

interface ChatGPTSettingsProps {
  settings: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    enabled: boolean;
    enableHRAssistant: boolean;
    enableRecruitmentAssistant: boolean;
    enablePerformanceAssistant: boolean;
    enableLeaveAssistant: boolean;
    enablePayrollAssistant: boolean;
    enableEmployeeSupport: boolean;
    enableManagerSupport: boolean;
    enableAdminSupport: boolean;
    autoRespond: boolean;
    responseDelay: number;
    contextWindow: number;
    enableLearning: boolean;
    enableFeedback: boolean;
    enableAnalytics: boolean;
    enableIntegration: boolean;
    webhookUrl: string;
    webhookSecret: string;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function ChatGPTSettings({ settings, onSettingsChange }: ChatGPTSettingsProps) {
  const modelOptions = [
    { label: "GPT-4", value: "gpt-4" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
    { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
    { label: "GPT-3.5 Turbo 16K", value: "gpt-3.5-turbo-16k" }
  ];

  const handleTestConnection = () => {
    // Implement test connection logic
    console.log("Testing ChatGPT connection...");
  };

  const handleClearCache = () => {
    // Implement clear cache logic
    console.log("Clearing ChatGPT cache...");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">ChatGPT API Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="API Key"
              placeholder="Enter your ChatGPT API key"
              value={settings.apiKey}
              onChange={(e) => onSettingsChange("apiKey", e.target.value)}
              type="password"
            />
            <Select
              label="Model"
              placeholder="Select model"
              selectedKeys={[settings.model]}
              onChange={(e) => onSettingsChange("model", e.target.value)}
            >
              {modelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Max Tokens"
              type="number"
              placeholder="1000"
              value={settings.maxTokens.toString()}
              onChange={(e) => onSettingsChange("maxTokens", parseInt(e.target.value))}
            />
            <Input
              label="Temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              placeholder="0.7"
              value={settings.temperature.toString()}
              onChange={(e) => onSettingsChange("temperature", parseFloat(e.target.value))}
            />
            <Input
              label="Response Delay (seconds)"
              type="number"
              placeholder="2"
              value={settings.responseDelay.toString()}
              onChange={(e) => onSettingsChange("responseDelay", parseInt(e.target.value))}
            />
            <Input
              label="Context Window"
              type="number"
              placeholder="4000"
              value={settings.contextWindow.toString()}
              onChange={(e) => onSettingsChange("contextWindow", parseInt(e.target.value))}
            />
          </div>
          
          <div className="flex gap-4">
            <Button color="primary" onClick={handleTestConnection}>
              Test Connection
            </Button>
            <Button color="secondary" onClick={handleClearCache}>
              Clear Cache
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">AI Assistant Features</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable ChatGPT integration</span>
                <span className="text-xs text-default-500">Enable AI assistant functionality</span>
              </div>
              <Switch
                isSelected={settings.enabled}
                onValueChange={(value) => onSettingsChange("enabled", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable HR Assistant</span>
                <span className="text-xs text-default-500">AI assistant for HR-related queries</span>
              </div>
              <Switch
                isSelected={settings.enableHRAssistant}
                onValueChange={(value) => onSettingsChange("enableHRAssistant", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable Recruitment Assistant</span>
                <span className="text-xs text-default-500">AI assistant for recruitment processes</span>
              </div>
              <Switch
                isSelected={settings.enableRecruitmentAssistant}
                onValueChange={(value) => onSettingsChange("enableRecruitmentAssistant", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable Performance Assistant</span>
                <span className="text-xs text-default-500">AI assistant for performance management</span>
              </div>
              <Switch
                isSelected={settings.enablePerformanceAssistant}
                onValueChange={(value) => onSettingsChange("enablePerformanceAssistant", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable Leave Assistant</span>
                <span className="text-xs text-default-500">AI assistant for leave management</span>
              </div>
              <Switch
                isSelected={settings.enableLeaveAssistant}
                onValueChange={(value) => onSettingsChange("enableLeaveAssistant", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable Payroll Assistant</span>
                <span className="text-xs text-default-500">AI assistant for payroll queries</span>
              </div>
              <Switch
                isSelected={settings.enablePayrollAssistant}
                onValueChange={(value) => onSettingsChange("enablePayrollAssistant", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable Employee Support</span>
                <span className="text-xs text-default-500">AI support for employee queries</span>
              </div>
              <Switch
                isSelected={settings.enableEmployeeSupport}
                onValueChange={(value) => onSettingsChange("enableEmployeeSupport", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable Manager Support</span>
                <span className="text-xs text-default-500">AI support for manager queries</span>
              </div>
              <Switch
                isSelected={settings.enableManagerSupport}
                onValueChange={(value) => onSettingsChange("enableManagerSupport", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable Admin Support</span>
                <span className="text-xs text-default-500">AI support for admin queries</span>
              </div>
              <Switch
                isSelected={settings.enableAdminSupport}
                onValueChange={(value) => onSettingsChange("enableAdminSupport", value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Advanced Settings</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable auto-response</span>
                <span className="text-xs text-default-500">Automatically respond to common queries</span>
              </div>
              <Switch
                isSelected={settings.autoRespond}
                onValueChange={(value) => onSettingsChange("autoRespond", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable learning from interactions</span>
                <span className="text-xs text-default-500">Learn and improve from user interactions</span>
              </div>
              <Switch
                isSelected={settings.enableLearning}
                onValueChange={(value) => onSettingsChange("enableLearning", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable feedback collection</span>
                <span className="text-xs text-default-500">Collect user feedback for improvements</span>
              </div>
              <Switch
                isSelected={settings.enableFeedback}
                onValueChange={(value) => onSettingsChange("enableFeedback", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable usage analytics</span>
                <span className="text-xs text-default-500">Track and analyze AI usage patterns</span>
              </div>
              <Switch
                isSelected={settings.enableAnalytics}
                onValueChange={(value) => onSettingsChange("enableAnalytics", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable third-party integrations</span>
                <span className="text-xs text-default-500">Integrate with external AI services</span>
              </div>
              <Switch
                isSelected={settings.enableIntegration}
                onValueChange={(value) => onSettingsChange("enableIntegration", value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Webhook Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Webhook URL"
              placeholder="https://yourdomain.com/webhook/chatgpt"
              value={settings.webhookUrl}
              onChange={(e) => onSettingsChange("webhookUrl", e.target.value)}
            />
            <Input
              label="Webhook Secret"
              placeholder="Enter webhook secret"
              value={settings.webhookSecret}
              onChange={(e) => onSettingsChange("webhookSecret", e.target.value)}
              type="password"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
