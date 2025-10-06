import React from 'react';
import { Card, CardBody, CardHeader, Switch, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { Icon } from '@iconify/react';

interface ReportsSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function ReportsSettings({ settings, onSettingsChange }: ReportsSettingsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Report Generation Settings */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon icon="lucide:file-bar-chart" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Report Generation</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Default Report Format"
              placeholder="Select default format"
              selectedKeys={settings.defaultReportFormat ? [settings.defaultReportFormat] : ['pdf']}
              onSelectionChange={(keys) => onSettingsChange('defaultReportFormat', Array.from(keys)[0])}
            >
              <SelectItem key="pdf">PDF</SelectItem>
              <SelectItem key="excel">Excel</SelectItem>
              <SelectItem key="csv">CSV</SelectItem>
              <SelectItem key="html">HTML</SelectItem>
            </Select>

            <Select
              label="Report Quality"
              placeholder="Select quality"
              selectedKeys={settings.reportQuality ? [settings.reportQuality] : ['high']}
              onSelectionChange={(keys) => onSettingsChange('reportQuality', Array.from(keys)[0])}
            >
              <SelectItem key="low">Low (Fast)</SelectItem>
              <SelectItem key="medium">Medium</SelectItem>
              <SelectItem key="high">High (Best)</SelectItem>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Include Charts</p>
              <p className="text-xs text-default-500 dark:text-default-400">Include visual charts in reports</p>
            </div>
            <Switch
              isSelected={settings.includeCharts === true || settings.includeCharts === 'true'}
              onValueChange={(value) => onSettingsChange('includeCharts', value)}
              color="primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Include Raw Data</p>
              <p className="text-xs text-default-500 dark:text-default-400">Include raw data tables in reports</p>
            </div>
            <Switch
              isSelected={settings.includeRawData === true || settings.includeRawData === 'true'}
              onValueChange={(value) => onSettingsChange('includeRawData', value)}
              color="primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Include Summary</p>
              <p className="text-xs text-default-500 dark:text-default-400">Include executive summary in reports</p>
            </div>
            <Switch
              isSelected={settings.includeSummary === true || settings.includeSummary === 'true'}
              onValueChange={(value) => onSettingsChange('includeSummary', value)}
              color="primary"
            />
          </div>
        </CardBody>
      </Card>

      {/* Auto-Generation Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:calendar-clock" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Auto-Generation</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Monthly Reports</p>
              <p className="text-xs text-default-500">Automatically generate monthly reports</p>
            </div>
            <Switch
              isSelected={settings.autoGenerate?.monthly === true || settings.autoGenerate?.monthly === 'true'}
              onValueChange={(value) => onSettingsChange('autoGenerate', {
                ...settings.autoGenerate,
                monthly: value
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Quarterly Reports</p>
              <p className="text-xs text-default-500">Automatically generate quarterly reports</p>
            </div>
            <Switch
              isSelected={settings.autoGenerate?.quarterly === true || settings.autoGenerate?.quarterly === 'true'}
              onValueChange={(value) => onSettingsChange('autoGenerate', {
                ...settings.autoGenerate,
                quarterly: value
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Yearly Reports</p>
              <p className="text-xs text-default-500">Automatically generate yearly reports</p>
            </div>
            <Switch
              isSelected={settings.autoGenerate?.yearly === true || settings.autoGenerate?.yearly === 'true'}
              onValueChange={(value) => onSettingsChange('autoGenerate', {
                ...settings.autoGenerate,
                yearly: value
              })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Generation Time"
              type="time"
              
              onChange={(e) => onSettingsChange('autoGenerate', {
                ...settings.autoGenerate,
                time: e.target.value
              })}
              startContent={<Icon icon="lucide:clock" className="text-default-400" />}
            />

            <Select
              label="Generation Day"
              placeholder="Select day"
              selectedKeys={settings.autoGenerate?.day ? [settings.autoGenerate.day] : ['1']}
              onSelectionChange={(keys) => onSettingsChange('autoGenerate', {
                ...settings.autoGenerate,
                day: Array.from(keys)[0]
              })}
            >
              <SelectItem key="1">1st of Month</SelectItem>
              <SelectItem key="15">15th of Month</SelectItem>
              <SelectItem key="last">Last Day of Month</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Email Reports Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:mail" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Email Reports</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Email Reports</p>
              <p className="text-xs text-default-500">Automatically email generated reports</p>
            </div>
            <Switch
              isSelected={settings.emailReports?.enabled === true || settings.emailReports?.enabled === 'true'}
              onValueChange={(value) => onSettingsChange('emailReports', {
                ...settings.emailReports,
                enabled: value
              })}
            />
          </div>

          {settings.emailReports?.enabled && (
            <>
              <Textarea
                label="Email Recipients"
                placeholder="Enter email addresses separated by commas"
                
                onChange={(e) => onSettingsChange('emailReports', {
                  ...settings.emailReports,
                  recipients: e.target.value.split(',').map(email => email.trim()).filter(email => email)
                })}
                description="Enter email addresses separated by commas"
                startContent={<Icon icon="lucide:users" className="text-default-400" />}
              />

              <Input
                label="Email Subject Template"
                value={settings.emailReports?.subjectTemplate || 'Monthly Report - {month} {year}'}
                onChange={(e) => onSettingsChange('emailReports', {
                  ...settings.emailReports,
                  subjectTemplate: e.target.value
                })}
                placeholder="Monthly HR Report - {month} {year}"
                startContent={<Icon icon="lucide:mail" className="text-default-400" />}
              />

              <Textarea
                label="Email Body Template"
                placeholder="Enter email body template"
                value={settings.emailReports?.bodyTemplate || 'Please find attached the monthly HR report for {month} {year}.'}
                onChange={(e) => onSettingsChange('emailReports', {
                  ...settings.emailReports,
                  bodyTemplate: e.target.value
                })}
                description="Use {month}, {year}, {company} as placeholders"
                startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
              />
            </>
          )}
        </CardBody>
      </Card>

      {/* Data Retention Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:database" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Data Retention</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Retention Period (Days)"
              type="number"
              
              onChange={(e) => onSettingsChange('retentionPeriod', parseInt(e.target.value) || 365)}
              placeholder="365"
              startContent={<Icon icon="lucide:calendar-days" className="text-default-400" />}
            />

            <Select
              label="Archive Format"
              placeholder="Select archive format"
              selectedKeys={settings.archiveFormat ? [settings.archiveFormat] : ['zip']}
              onSelectionChange={(keys) => onSettingsChange('archiveFormat', Array.from(keys)[0])}
            >
              <SelectItem key="zip">ZIP</SelectItem>
              <SelectItem key="tar">TAR</SelectItem>
              <SelectItem key="7z">7Z</SelectItem>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Archive</p>
              <p className="text-xs text-default-500">Automatically archive old reports</p>
            </div>
            <Switch
              isSelected={settings.autoArchive === true || settings.autoArchive === 'true'}
              onValueChange={(value) => onSettingsChange('autoArchive', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Delete</p>
              <p className="text-xs text-default-500">Automatically delete archived reports after retention period</p>
            </div>
            <Switch
              isSelected={settings.autoDelete === true || settings.autoDelete === 'true'}
              onValueChange={(value) => onSettingsChange('autoDelete', value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:template" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Report Templates</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Logo URL"
              
              onChange={(e) => onSettingsChange('template', {
                ...settings.template,
                logoUrl: e.target.value
              })}
              placeholder="https://company.com/logo.png"
              startContent={<Icon icon="lucide:image" className="text-default-400" />}
            />

            <Input
              label="Company Name"
              
              onChange={(e) => onSettingsChange('template', {
                ...settings.template,
                companyName: e.target.value
              })}
              placeholder="Your Company Name"
              startContent={<Icon icon="lucide:building" className="text-default-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Primary Color"
              type="color"
              
              onChange={(e) => onSettingsChange('template', {
                ...settings.template,
                primaryColor: e.target.value
              })}
              startContent={<Icon icon="lucide:palette" className="text-default-400" />}
            />

            <Input
              label="Secondary Color"
              type="color"
              
              onChange={(e) => onSettingsChange('template', {
                ...settings.template,
                secondaryColor: e.target.value
              })}
              startContent={<Icon icon="lucide:palette" className="text-default-400" />}
            />

            <Select
              label="Font Family"
              placeholder="Select font"
              selectedKeys={settings.template?.fontFamily ? [settings.template.fontFamily] : ['Arial']}
              onSelectionChange={(keys) => onSettingsChange('template', {
                ...settings.template,
                fontFamily: Array.from(keys)[0]
              })}
            >
              <SelectItem key="Arial">Arial</SelectItem>
              <SelectItem key="Times New Roman">Times New Roman</SelectItem>
              <SelectItem key="Helvetica">Helvetica</SelectItem>
              <SelectItem key="Calibri">Calibri</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}