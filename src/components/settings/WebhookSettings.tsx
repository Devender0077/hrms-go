import React from "react";
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Button, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@heroui/react";

interface WebhookSettingsProps {
  settings: {
    enabled: boolean;
    secret: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    webhooks: Array<{
      id: string;
      name: string;
      url: string;
      events: string[];
      enabled: boolean;
      lastTriggered: string;
      status: string;
    }>;
  };
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
  const webhookEvents = [
    "user.created",
    "user.updated",
    "user.deleted",
    "employee.created",
    "employee.updated",
    "employee.deleted",
    "attendance.created",
    "attendance.updated",
    "leave.created",
    "leave.approved",
    "leave.rejected",
    "payroll.generated",
    "payroll.paid",
    "department.created",
    "department.updated",
    "department.deleted"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "default";
      case "error": return "danger";
      case "pending": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Webhook Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Webhook Secret"
              placeholder="Enter webhook secret"
              value={settings.secret}
              onChange={(e) => onSettingsChange("secret", e.target.value)}
              type="password"
            />
            <Input
              label="Timeout (seconds)"
              type="number"
              placeholder="30"
              value={settings.timeout.toString()}
              onChange={(e) => onSettingsChange("timeout", parseInt(e.target.value))}
            />
            <Input
              label="Retry Attempts"
              type="number"
              placeholder="3"
              value={settings.retryAttempts.toString()}
              onChange={(e) => onSettingsChange("retryAttempts", parseInt(e.target.value))}
            />
            <Input
              label="Retry Delay (seconds)"
              type="number"
              placeholder="5"
              value={settings.retryDelay.toString()}
              onChange={(e) => onSettingsChange("retryDelay", parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Enable webhook system</span>
              <span className="text-xs text-default-500">Enable webhook functionality for real-time notifications</span>
            </div>
            <Switch
              isSelected={settings.enabled}
              onValueChange={(value) => onSettingsChange("enabled", value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Webhook Endpoints</h3>
          <Button color="primary" onClick={onAddWebhook}>
            Add Webhook
          </Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Webhooks table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>URL</TableColumn>
              <TableColumn>EVENTS</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>LAST TRIGGERED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {settings.webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>{webhook.name}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {webhook.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 2).map((event) => (
                        <Chip key={event} size="sm" variant="flat">
                          {event}
                        </Chip>
                      ))}
                      {webhook.events.length > 2 && (
                        <Chip size="sm" variant="flat" color="default">
                          +{webhook.events.length - 2}
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={getStatusColor(webhook.status)}
                      variant="flat"
                    >
                      {webhook.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {webhook.lastTriggered || "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onClick={() => onTestWebhook(webhook.id)}
                      >
                        Test
                      </Button>
                      <Button
                        size="sm"
                        color="secondary"
                        variant="flat"
                        onClick={() => onEditWebhook(webhook)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onClick={() => onDeleteWebhook(webhook.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Available Events</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {webhookEvents.map((event) => (
              <Chip key={event} size="sm" variant="flat" color="default">
                {event}
              </Chip>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
