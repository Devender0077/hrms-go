import React from "react";
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Switch, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface BackupSettingsProps {
  settings: {
    autoBackup: boolean;
    backupFrequency: string;
    backupRetention: number;
    backupLocation: string;
    backupEncryption: boolean;
    lastBackup: string;
    nextBackup: string;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function BackupSettings({ settings, onSettingsChange }: BackupSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:hard-drive" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Backup & Storage</h2>
          <p className="text-gray-600">Configure data backup and storage settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Backup Configuration</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Backup</p>
                <p className="text-sm text-gray-500">Automatically backup system data</p>
              </div>
              <Switch
                isSelected={settings.autoBackup}
                onValueChange={(value) => onSettingsChange("autoBackup", value)}
              />
            </div>
            <Select
              label="Backup Frequency"
              selectedKeys={[settings.backupFrequency]}
              onSelectionChange={(keys) => onSettingsChange("backupFrequency", Array.from(keys)[0])}
            >
              <SelectItem key="daily" value="daily">Daily</SelectItem>
              <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
              <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
            </Select>
            <Input
              label="Retention Period (days)"
              type="number"
              value={settings.backupRetention.toString()}
              onValueChange={(value) => onSettingsChange("backupRetention", parseInt(value))}
            />
            <Select
              label="Backup Location"
              selectedKeys={[settings.backupLocation]}
              onSelectionChange={(keys) => onSettingsChange("backupLocation", Array.from(keys)[0])}
            >
              <SelectItem key="local" value="local">Local Storage</SelectItem>
              <SelectItem key="cloud" value="cloud">Cloud Storage</SelectItem>
              <SelectItem key="ftp" value="ftp">FTP Server</SelectItem>
            </Select>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Encryption</p>
                <p className="text-sm text-gray-500">Encrypt backup files</p>
              </div>
              <Switch
                isSelected={settings.backupEncryption}
                onValueChange={(value) => onSettingsChange("backupEncryption", value)}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Backup Status</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Backup:</span>
                <span className="text-sm font-medium">{settings.lastBackup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Next Backup:</span>
                <span className="text-sm font-medium">{settings.nextBackup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Backup Size:</span>
                <span className="text-sm font-medium">2.4 GB</span>
              </div>
            </div>
            <Divider />
            <div className="space-y-3">
              <Button
                color="primary"
                variant="bordered"
                startContent={<Icon icon="lucide:download" />}
                className="w-full"
              >
                Download Latest Backup
              </Button>
              <Button
                color="secondary"
                variant="bordered"
                startContent={<Icon icon="lucide:play" />}
                className="w-full"
              >
                Create Manual Backup
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
