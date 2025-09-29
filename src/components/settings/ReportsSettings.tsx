import React from "react";
import { Switch, Input, Select, SelectItem, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface ReportsSettingsProps {
  settings: {
    autoReportGeneration: boolean;
    reportFrequency: string;
    reportFormat: string;
    emailReports: boolean;
    reportRetention: number;
    includeCharts: boolean;
    includeRawData: boolean;
    reportTimezone: string;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function ReportsSettings({ settings, onSettingsChange }: ReportsSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:bar-chart" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Reports & Analytics</h2>
          <p className="text-default-600">Configure report generation and analytics settings</p>
        </div>
      </div>

      {/* Report Generation Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Report Generation</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Auto Report Generation</span>
              <span className="text-xs text-default-500">Automatically generate reports on schedule</span>
            </div>
            <Switch
              isSelected={settings.autoReportGeneration}
              onValueChange={(value) => onSettingsChange("autoReportGeneration", value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Report Frequency"
              selectedKeys={[settings.reportFrequency]}
              onSelectionChange={(keys) => onSettingsChange("reportFrequency", Array.from(keys)[0])}
            >
              <SelectItem key="daily" value="daily">Daily</SelectItem>
              <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
              <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
              <SelectItem key="quarterly" value="quarterly">Quarterly</SelectItem>
              <SelectItem key="yearly" value="yearly">Yearly</SelectItem>
            </Select>
            
            <Select
              label="Report Format"
              selectedKeys={[settings.reportFormat]}
              onSelectionChange={(keys) => onSettingsChange("reportFormat", Array.from(keys)[0])}
            >
              <SelectItem key="pdf" value="pdf">PDF</SelectItem>
              <SelectItem key="excel" value="excel">Excel</SelectItem>
              <SelectItem key="csv" value="csv">CSV</SelectItem>
              <SelectItem key="json" value="json">JSON</SelectItem>
            </Select>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Email Reports</span>
              <span className="text-xs text-default-500">Automatically email reports to stakeholders</span>
            </div>
            <Switch
              isSelected={settings.emailReports}
              onValueChange={(value) => onSettingsChange("emailReports", value)}
            />
          </div>
          
          <Input
            label="Report Retention (days)"
            type="number"
            placeholder="365"
            value={settings.reportRetention.toString()}
            onValueChange={(value) => onSettingsChange("reportRetention", parseInt(value))}
            description="How long to keep generated reports"
          />
        </CardBody>
      </Card>

      {/* Report Content Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Report Content</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Include Charts</span>
              <span className="text-xs text-default-500">Add visual charts and graphs to reports</span>
            </div>
            <Switch
              isSelected={settings.includeCharts}
              onValueChange={(value) => onSettingsChange("includeCharts", value)}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Include Raw Data</span>
              <span className="text-xs text-default-500">Include detailed data tables in reports</span>
            </div>
            <Switch
              isSelected={settings.includeRawData}
              onValueChange={(value) => onSettingsChange("includeRawData", value)}
            />
          </div>
          
          <Select
            label="Report Timezone"
            selectedKeys={[settings.reportTimezone]}
            onSelectionChange={(keys) => onSettingsChange("reportTimezone", Array.from(keys)[0])}
          >
            <SelectItem key="UTC" value="UTC">UTC</SelectItem>
            <SelectItem key="America/New_York" value="America/New_York">Eastern Time</SelectItem>
            <SelectItem key="America/Chicago" value="America/Chicago">Central Time</SelectItem>
            <SelectItem key="America/Denver" value="America/Denver">Mountain Time</SelectItem>
            <SelectItem key="America/Los_Angeles" value="America/Los_Angeles">Pacific Time</SelectItem>
            <SelectItem key="Europe/London" value="Europe/London">London</SelectItem>
            <SelectItem key="Europe/Paris" value="Europe/Paris">Paris</SelectItem>
            <SelectItem key="Asia/Tokyo" value="Asia/Tokyo">Tokyo</SelectItem>
          </Select>
        </CardBody>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Available Reports</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="lucide:users" className="text-primary-600" />
                <h4 className="font-medium">Employee Reports</h4>
              </div>
              <ul className="text-sm text-default-600 space-y-1">
                <li>• Employee Directory</li>
                <li>• Attendance Summary</li>
                <li>• Performance Reviews</li>
                <li>• Salary Reports</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="lucide:calendar" className="text-success-600" />
                <h4 className="font-medium">Leave Reports</h4>
              </div>
              <ul className="text-sm text-default-600 space-y-1">
                <li>• Leave Balance</li>
                <li>• Leave Usage</li>
                <li>• Holiday Calendar</li>
                <li>• Leave Trends</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="lucide:dollar-sign" className="text-warning-600" />
                <h4 className="font-medium">Payroll Reports</h4>
              </div>
              <ul className="text-sm text-default-600 space-y-1">
                <li>• Payroll Summary</li>
                <li>• Tax Reports</li>
                <li>• Benefits Summary</li>
                <li>• Deduction Reports</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="lucide:trending-up" className="text-secondary-600" />
                <h4 className="font-medium">Analytics Reports</h4>
              </div>
              <ul className="text-sm text-default-600 space-y-1">
                <li>• HR Analytics</li>
                <li>• Performance Metrics</li>
                <li>• Cost Analysis</li>
                <li>• Trend Analysis</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Report Scheduling */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Report Scheduling</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="p-4 bg-content1 rounded-lg">
              <h4 className="font-medium mb-2">Scheduled Reports</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly Attendance Report</span>
                  <span className="text-xs text-default-500">Every Monday at 9:00 AM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monthly Payroll Report</span>
                  <span className="text-xs text-default-500">1st of every month at 8:00 AM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quarterly Performance Report</span>
                  <span className="text-xs text-default-500">1st of quarter at 10:00 AM</span>
                </div>
              </div>
            </div>
            
            <button className="w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
              <Icon icon="lucide:plus" className="inline mr-2" />
              Add New Scheduled Report
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
