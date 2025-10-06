import React from 'react';
import { Card, CardBody, CardHeader, Switch, Select, SelectItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface BackupSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function BackupSettings({ settings, onSettingsChange }: BackupSettingsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon icon="lucide:hard-drive" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Backup & Storage</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Auto Backup</p>
                <p className="text-xs text-default-500 dark:text-default-400">Enable automatic backups</p>
              </div>
              <Switch
                isSelected={settings.autoBackup === true || settings.autoBackup === 'true'}
                onValueChange={(value) => onSettingsChange('autoBackup', value)}
                color="primary"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Backup Frequency"
                selectedKeys={settings.backupFrequency ? [settings.backupFrequency] : ['daily']}
                onSelectionChange={(keys) => onSettingsChange('backupFrequency', Array.from(keys)[0])}
                placeholder="Select frequency"
              >
                <SelectItem key="hourly">Hourly</SelectItem>
                <SelectItem key="daily">Daily</SelectItem>
                <SelectItem key="weekly">Weekly</SelectItem>
                <SelectItem key="monthly">Monthly</SelectItem>
              </Select>
              
              <Select
                label="Backup Location"
                selectedKeys={settings.backupLocation ? [settings.backupLocation] : ['cloud']}
                onSelectionChange={(keys) => onSettingsChange('backupLocation', Array.from(keys)[0])}
                placeholder="Select location"
              >
                <SelectItem key="local">Local Storage</SelectItem>
                <SelectItem key="cloud">Cloud Storage</SelectItem>
                <SelectItem key="ftp">FTP Server</SelectItem>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Backup Encryption</p>
                <p className="text-xs text-default-500">Encrypt backup files for security</p>
              </div>
              <Switch
                isSelected={settings.backupEncryption === true || settings.backupEncryption === 'true'}
                onValueChange={(value) => onSettingsChange('backupEncryption', value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Backup Status</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-content1 rounded-lg">
                <p className="text-sm text-default-600">Last Backup</p>
                <p className="text-lg font-semibold text-foreground">
                  {settings.lastBackup || 'Never'}
                </p>
              </div>
              
              <div className="p-4 bg-content1 rounded-lg">
                <p className="text-sm text-default-600">Next Backup</p>
                <p className="text-lg font-semibold text-foreground">
                  {settings.nextBackup || 'Not scheduled'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="lucide:download" className="w-4 h-4" />}
              >
                Create Backup Now
              </Button>
              
              <Button
                color="default"
                variant="flat"
                startContent={<Icon icon="lucide:upload" className="w-4 h-4" />}
              >
                Restore from Backup
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}