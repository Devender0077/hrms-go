import React from 'react';
import { Card, CardBody, CardHeader, Switch, Input, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';

interface WorkflowSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function WorkflowSettings({ settings, onSettingsChange }: WorkflowSettingsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Leave Approval Workflow */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon icon="lucide:calendar-x" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Leave Approval Workflow</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Auto Approve Leave Requests</p>
              <p className="text-xs text-default-500 dark:text-default-400">Automatically approve leave requests under specified conditions</p>
            </div>
            <Switch
              isSelected={settings.leaveApproval?.autoApprove === true || settings.leaveApproval?.autoApprove === 'true'}
              onValueChange={(value) => onSettingsChange('leaveApproval', {
                ...settings.leaveApproval,
                autoApprove: value
              })}
              color="primary"
            />
          </div>

          {settings.leaveApproval?.autoApprove && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Max Auto-Approve Days"
                type="number"
                
                onChange={(e) => onSettingsChange('leaveApproval', {
                  ...settings.leaveApproval,
                  maxAutoApproveDays: parseInt(e.target.value) || 1
                })}
                placeholder="1"
                startContent={<Icon icon="lucide:calendar-days" className="text-default-400" />}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Require Manager Approval</p>
              <p className="text-xs text-default-500">All leave requests must be approved by direct manager</p>
            </div>
            <Switch
              isSelected={settings.leaveApproval?.requireManagerApproval === true || settings.leaveApproval?.requireManagerApproval === 'true'}
              onValueChange={(value) => onSettingsChange('leaveApproval', {
                ...settings.leaveApproval,
                requireManagerApproval: value
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Require HR Approval</p>
              <p className="text-xs text-default-500">All leave requests must be approved by HR department</p>
            </div>
            <Switch
              isSelected={settings.leaveApproval?.requireHRApproval === true || settings.leaveApproval?.requireHRApproval === 'true'}
              onValueChange={(value) => onSettingsChange('leaveApproval', {
                ...settings.leaveApproval,
                requireHRApproval: value
              })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Attendance Approval Workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:clock" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Attendance Approval Workflow</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Approve Attendance</p>
              <p className="text-xs text-default-500">Automatically approve attendance records within tolerance</p>
            </div>
            <Switch
              isSelected={settings.attendanceApproval?.autoApprove === true || settings.attendanceApproval?.autoApprove === 'true'}
              onValueChange={(value) => onSettingsChange('attendanceApproval', {
                ...settings.attendanceApproval,
                autoApprove: value
              })}
            />
          </div>

          {settings.attendanceApproval?.autoApprove && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tolerance Minutes"
                type="number"
                
                onChange={(e) => onSettingsChange('attendanceApproval', {
                  ...settings.attendanceApproval,
                  toleranceMinutes: parseInt(e.target.value) || 15
                })}
                placeholder="15"
                startContent={<Icon icon="lucide:clock" className="text-default-400" />}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Require Manager Approval</p>
              <p className="text-xs text-default-500">Attendance corrections require manager approval</p>
            </div>
            <Switch
              isSelected={settings.attendanceApproval?.requireManagerApproval === true || settings.attendanceApproval?.requireManagerApproval === 'true'}
              onValueChange={(value) => onSettingsChange('attendanceApproval', {
                ...settings.attendanceApproval,
                requireManagerApproval: value
              })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Expense Approval Workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:receipt" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Expense Approval Workflow</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Approve Expenses</p>
              <p className="text-xs text-default-500">Automatically approve expenses under specified amount</p>
            </div>
            <Switch
              isSelected={settings.expenseApproval?.autoApprove === true || settings.expenseApproval?.autoApprove === 'true'}
              onValueChange={(value) => onSettingsChange('expenseApproval', {
                ...settings.expenseApproval,
                autoApprove: value
              })}
            />
          </div>

          {settings.expenseApproval?.autoApprove && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Max Auto-Approve Amount"
                type="number"
                
                onChange={(e) => onSettingsChange('expenseApproval', {
                  ...settings.expenseApproval,
                  maxAutoApproveAmount: parseFloat(e.target.value) || 100
                })}
                placeholder="100"
                startContent={<Icon icon="lucide:dollar-sign" className="text-default-400" />}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Require Manager Approval</p>
              <p className="text-xs text-default-500">All expenses require manager approval</p>
            </div>
            <Switch
              isSelected={settings.expenseApproval?.requireManagerApproval === true || settings.expenseApproval?.requireManagerApproval === 'true'}
              onValueChange={(value) => onSettingsChange('expenseApproval', {
                ...settings.expenseApproval,
                requireManagerApproval: value
              })}
            />
          </div>
        </CardBody>
      </Card>

      {/* General Workflow Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:settings" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">General Workflow Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Default Approval Timeout"
              placeholder="Select timeout period"
              selectedKeys={settings.defaultApprovalTimeout ? [settings.defaultApprovalTimeout] : ['7']}
              onSelectionChange={(keys) => onSettingsChange('defaultApprovalTimeout', Array.from(keys)[0])}
            >
              <SelectItem key="1">1 Day</SelectItem>
              <SelectItem key="3">3 Days</SelectItem>
              <SelectItem key="7">7 Days</SelectItem>
              <SelectItem key="14">14 Days</SelectItem>
              <SelectItem key="30">30 Days</SelectItem>
            </Select>

            <Select
              label="Escalation Level"
              placeholder="Select escalation level"
              selectedKeys={settings.escalationLevel ? [settings.escalationLevel] : ['manager']}
              onSelectionChange={(keys) => onSettingsChange('escalationLevel', Array.from(keys)[0])}
            >
              <SelectItem key="manager">Manager</SelectItem>
              <SelectItem key="hr">HR Department</SelectItem>
              <SelectItem key="admin">Administrator</SelectItem>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Email Notifications</p>
              <p className="text-xs text-default-500">Send email notifications for workflow actions</p>
            </div>
            <Switch
              isSelected={settings.enableEmailNotifications === true || settings.enableEmailNotifications === 'true'}
              onValueChange={(value) => onSettingsChange('enableEmailNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable SMS Notifications</p>
              <p className="text-xs text-default-500">Send SMS notifications for urgent approvals</p>
            </div>
            <Switch
              isSelected={settings.enableSMSNotifications === true || settings.enableSMSNotifications === 'true'}
              onValueChange={(value) => onSettingsChange('enableSMSNotifications', value)}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}