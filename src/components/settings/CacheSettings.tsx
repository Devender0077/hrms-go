import React from "react";
import { Card, CardBody, CardHeader, Input, Switch, Button, Divider, Select, SelectItem } from "@heroui/react";

interface CacheSettingsProps {
  settings: {
    enabled: boolean;
    driver: string;
    host: string;
    port: number;
    password: string;
    database: number;
    prefix: string;
    defaultTtl: number;
    maxMemory: string;
    enableQueryCache: boolean;
    enableViewCache: boolean;
    enableRouteCache: boolean;
    enableConfigCache: boolean;
    enableEventCache: boolean;
    enableSessionCache: boolean;
    enableUserCache: boolean;
    enableEmployeeCache: boolean;
    enableDepartmentCache: boolean;
    enableAttendanceCache: boolean;
    enableLeaveCache: boolean;
    enablePayrollCache: boolean;
    autoClearCache: boolean;
    clearCacheOnUpdate: boolean;
    clearCacheOnDelete: boolean;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function CacheSettings({ settings, onSettingsChange }: CacheSettingsProps) {
  const cacheDrivers = [
    { label: "Redis", value: "redis" },
    { label: "Memcached", value: "memcached" },
    { label: "File", value: "file" },
    { label: "Database", value: "database" },
    { label: "Array", value: "array" }
  ];

  const memoryOptions = [
    { label: "64MB", value: "64m" },
    { label: "128MB", value: "128m" },
    { label: "256MB", value: "256m" },
    { label: "512MB", value: "512m" },
    { label: "1GB", value: "1g" },
    { label: "2GB", value: "2g" }
  ];

  const handleClearCache = () => {
    // Implement cache clearing logic
    console.log("Clearing cache...");
  };

  const handleClearSpecificCache = (type: string) => {
    // Implement specific cache clearing logic
    console.log(`Clearing ${type} cache...`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cache Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cache Driver"
              placeholder="Select cache driver"
              selectedKeys={[settings.driver]}
              onChange={(e) => onSettingsChange("driver", e.target.value)}
            >
              {cacheDrivers.map((driver) => (
                <SelectItem key={driver.value} value={driver.value}>
                  {driver.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Cache Host"
              placeholder="localhost"
              value={settings.host}
              onChange={(e) => onSettingsChange("host", e.target.value)}
            />
            <Input
              label="Cache Port"
              type="number"
              placeholder="6379"
              value={settings.port.toString()}
              onChange={(e) => onSettingsChange("port", parseInt(e.target.value))}
            />
            <Input
              label="Cache Password"
              type="password"
              placeholder="Enter cache password"
              value={settings.password}
              onChange={(e) => onSettingsChange("password", e.target.value)}
            />
            <Input
              label="Cache Database"
              type="number"
              placeholder="0"
              value={settings.database.toString()}
              onChange={(e) => onSettingsChange("database", parseInt(e.target.value))}
            />
            <Input
              label="Cache Prefix"
              placeholder="hrms_"
              value={settings.prefix}
              onChange={(e) => onSettingsChange("prefix", e.target.value)}
            />
            <Input
              label="Default TTL (seconds)"
              type="number"
              placeholder="3600"
              value={settings.defaultTtl.toString()}
              onChange={(e) => onSettingsChange("defaultTtl", parseInt(e.target.value))}
            />
            <Select
              label="Max Memory"
              placeholder="Select max memory"
              selectedKeys={[settings.maxMemory]}
              onChange={(e) => onSettingsChange("maxMemory", e.target.value)}
            >
              {memoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cache Features</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable caching system</span>
                <span className="text-xs text-gray-500">Enable overall caching functionality</span>
              </div>
              <Switch
                isSelected={settings.enabled}
                onValueChange={(value) => onSettingsChange("enabled", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable query cache</span>
                <span className="text-xs text-gray-500">Cache database queries for better performance</span>
              </div>
              <Switch
                isSelected={settings.enableQueryCache}
                onValueChange={(value) => onSettingsChange("enableQueryCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable view cache</span>
                <span className="text-xs text-gray-500">Cache rendered views and templates</span>
              </div>
              <Switch
                isSelected={settings.enableViewCache}
                onValueChange={(value) => onSettingsChange("enableViewCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable route cache</span>
                <span className="text-xs text-gray-500">Cache application routes</span>
              </div>
              <Switch
                isSelected={settings.enableRouteCache}
                onValueChange={(value) => onSettingsChange("enableRouteCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable config cache</span>
                <span className="text-xs text-gray-500">Cache configuration files</span>
              </div>
              <Switch
                isSelected={settings.enableConfigCache}
                onValueChange={(value) => onSettingsChange("enableConfigCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable event cache</span>
                <span className="text-xs text-gray-500">Cache event listeners and handlers</span>
              </div>
              <Switch
                isSelected={settings.enableEventCache}
                onValueChange={(value) => onSettingsChange("enableEventCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable session cache</span>
                <span className="text-xs text-gray-500">Cache user sessions</span>
              </div>
              <Switch
                isSelected={settings.enableSessionCache}
                onValueChange={(value) => onSettingsChange("enableSessionCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable user cache</span>
                <span className="text-xs text-gray-500">Cache user data and profiles</span>
              </div>
              <Switch
                isSelected={settings.enableUserCache}
                onValueChange={(value) => onSettingsChange("enableUserCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable employee cache</span>
                <span className="text-xs text-gray-500">Cache employee information</span>
              </div>
              <Switch
                isSelected={settings.enableEmployeeCache}
                onValueChange={(value) => onSettingsChange("enableEmployeeCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable department cache</span>
                <span className="text-xs text-gray-500">Cache department and organizational data</span>
              </div>
              <Switch
                isSelected={settings.enableDepartmentCache}
                onValueChange={(value) => onSettingsChange("enableDepartmentCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable attendance cache</span>
                <span className="text-xs text-gray-500">Cache attendance records and reports</span>
              </div>
              <Switch
                isSelected={settings.enableAttendanceCache}
                onValueChange={(value) => onSettingsChange("enableAttendanceCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable leave cache</span>
                <span className="text-xs text-gray-500">Cache leave requests and balances</span>
              </div>
              <Switch
                isSelected={settings.enableLeaveCache}
                onValueChange={(value) => onSettingsChange("enableLeaveCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable payroll cache</span>
                <span className="text-xs text-gray-500">Cache payroll calculations and reports</span>
              </div>
              <Switch
                isSelected={settings.enablePayrollCache}
                onValueChange={(value) => onSettingsChange("enablePayrollCache", value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cache Management</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Auto-clear cache on updates</span>
                <span className="text-xs text-gray-500">Automatically clear cache when data is updated</span>
              </div>
              <Switch
                isSelected={settings.autoClearCache}
                onValueChange={(value) => onSettingsChange("autoClearCache", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Clear cache on data updates</span>
                <span className="text-xs text-gray-500">Clear relevant cache when data is modified</span>
              </div>
              <Switch
                isSelected={settings.clearCacheOnUpdate}
                onValueChange={(value) => onSettingsChange("clearCacheOnUpdate", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Clear cache on data deletion</span>
                <span className="text-xs text-gray-500">Clear relevant cache when data is deleted</span>
              </div>
              <Switch
                isSelected={settings.clearCacheOnDelete}
                onValueChange={(value) => onSettingsChange("clearCacheOnDelete", value)}
              />
            </div>
          </div>
          
          <Divider />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              color="primary" 
              className="w-full"
              onClick={handleClearCache}
            >
              Clear All Cache
            </Button>
            <Button 
              color="secondary" 
              className="w-full"
              onClick={() => handleClearSpecificCache("user")}
            >
              Clear User Cache
            </Button>
            <Button 
              color="secondary" 
              className="w-full"
              onClick={() => handleClearSpecificCache("employee")}
            >
              Clear Employee Cache
            </Button>
            <Button 
              color="secondary" 
              className="w-full"
              onClick={() => handleClearSpecificCache("attendance")}
            >
              Clear Attendance Cache
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
