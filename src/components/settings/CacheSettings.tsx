import React from 'react';
import { Card, CardBody, CardHeader, Switch, Input, Select, SelectItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface CacheSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function CacheSettings({ settings, onSettingsChange }: CacheSettingsProps) {
  return (
    <div className="space-y-6">
      {/* General Cache Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:database" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">General Cache Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Cache</p>
              <p className="text-xs text-default-500">Enable caching system for better performance</p>
            </div>
            <Switch
              isSelected={settings.enabled === true || settings.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('enabled', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cache Driver"
              placeholder="Select cache driver"
              selectedKeys={settings.driver ? [settings.driver] : ['file']}
              onSelectionChange={(keys) => onSettingsChange('driver', Array.from(keys)[0])}
            >
              <SelectItem key="file">File</SelectItem>
              <SelectItem key="redis">Redis</SelectItem>
              <SelectItem key="memcached">Memcached</SelectItem>
              <SelectItem key="database">Database</SelectItem>
            </Select>

            <Input
              label="TTL (Time To Live)"
              type="number"
              
              onChange={(e) => onSettingsChange('ttl', parseInt(e.target.value) || 3600)}
              placeholder="3600"
              description="Cache expiration time in seconds"
              startContent={<Icon icon="lucide:clock" className="text-default-400" />}
            />
          </div>

          <Input
            label="Cache Prefix"
            
            onChange={(e) => onSettingsChange('prefix', e.target.value)}
            placeholder="hrms_"
            description="Prefix for all cache keys"
            startContent={<Icon icon="lucide:tag" className="text-default-400" />}
          />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Clear Cache on Update</p>
              <p className="text-xs text-default-500">Automatically clear cache when data is updated</p>
            </div>
            <Switch
              isSelected={settings.clearOnUpdate === true || settings.clearOnUpdate === 'true'}
              onValueChange={(value) => onSettingsChange('clearOnUpdate', value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Redis Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:server" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Redis Configuration</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Redis Host"
              
              onChange={(e) => onSettingsChange('redis', {
                ...settings.redis,
                host: e.target.value
              })}
              placeholder="127.0.0.1"
              startContent={<Icon icon="lucide:server" className="text-default-400" />}
            />

            <Input
              label="Redis Port"
              type="number"
              
              onChange={(e) => onSettingsChange('redis', {
                ...settings.redis,
                port: parseInt(e.target.value) || 6379
              })}
              placeholder="6379"
              startContent={<Icon icon="lucide:network" className="text-default-400" />}
            />
          </div>

          <Input
            label="Redis Password"
            type="password"
            
            onChange={(e) => onSettingsChange('redis', {
              ...settings.redis,
              password: e.target.value
            })}
            placeholder="Enter Redis password"
            startContent={<Icon icon="lucide:lock" className="text-default-400" />}
          />

          <Input
            label="Redis Database"
            type="number"
            
            onChange={(e) => onSettingsChange('redis', {
              ...settings.redis,
              database: parseInt(e.target.value) || 0
            })}
            placeholder="0"
            startContent={<Icon icon="lucide:database" className="text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* Memcached Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:memory-stick" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Memcached Configuration</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Memcached Host"
              
              onChange={(e) => onSettingsChange('memcached', {
                ...settings.memcached,
                host: e.target.value
              })}
              placeholder="127.0.0.1"
              startContent={<Icon icon="lucide:server" className="text-default-400" />}
            />

            <Input
              label="Memcached Port"
              type="number"
              
              onChange={(e) => onSettingsChange('memcached', {
                ...settings.memcached,
                port: parseInt(e.target.value) || 11211
              })}
              placeholder="11211"
              startContent={<Icon icon="lucide:network" className="text-default-400" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* File Cache Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:folder" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">File Cache Configuration</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Cache Path"
            
            onChange={(e) => onSettingsChange('file', {
              ...settings.file,
              path: e.target.value
            })}
            placeholder="storage/cache"
            description="Directory path for file cache storage"
            startContent={<Icon icon="lucide:folder-open" className="text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* Cache Warmup */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:zap" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Cache Warmup</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Cache Warmup</p>
              <p className="text-xs text-default-500">Automatically warm up cache with frequently accessed data</p>
            </div>
            <Switch
              isSelected={settings.warmup?.enabled === true || settings.warmup?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('warmup', {
                ...settings.warmup,
                enabled: value
              })}
            />
          </div>

          {settings.warmup?.enabled && (
            <Input
              label="Warmup Schedule"
              
              onChange={(e) => onSettingsChange('warmup', {
                ...settings.warmup,
                schedule: e.target.value
              })}
              placeholder="0 2 * * *"
              description="Cron expression for cache warmup schedule"
              startContent={<Icon icon="lucide:calendar" className="text-default-400" />}
            />
          )}
        </CardBody>
      </Card>

      {/* Cache Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:settings" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Cache Management</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-3">
            <Button color="primary" variant="flat" startContent={<Icon icon="lucide:trash-2" />}>
              Clear All Cache
            </Button>
            <Button color="secondary" variant="flat" startContent={<Icon icon="lucide:zap" />}>
              Warm Up Cache
            </Button>
            <Button color="success" variant="flat" startContent={<Icon icon="lucide:activity" />}>
              Cache Statistics
            </Button>
          </div>
          
          <div className="bg-default-50 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Cache Status:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:database" className="text-primary-500" />
                <span>Driver: {settings.driver || 'file'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:clock" className="text-primary-500" />
                <span>TTL: {settings.ttl || 3600}s</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:tag" className="text-primary-500" />
                <span>Prefix: {settings.prefix || 'hrms_'}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}