import React from "react";
import { Input, Select, SelectItem, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface WorkflowSettingsProps {
  settings: {
    leaveApprovalWorkflow: string;
    expenseApprovalWorkflow: string;
    recruitmentWorkflow: string;
    autoApprovalLimit: number;
    escalationDays: number;
    reminderFrequency: string;
    approvalDeadline: number;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function WorkflowSettings({ settings, onSettingsChange }: WorkflowSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:workflow" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Workflow Settings</h2>
          <p className="text-default-600">Configure approval workflows and automation</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Approval Workflows</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Leave Approval Workflow"
              selectedKeys={[settings.leaveApprovalWorkflow]}
              onSelectionChange={(keys) => onSettingsChange("leaveApprovalWorkflow", Array.from(keys)[0])}
            >
              <SelectItem key="manager" value="manager">Direct Manager</SelectItem>
              <SelectItem key="hr" value="hr">HR Department</SelectItem>
              <SelectItem key="both" value="both">Manager + HR</SelectItem>
              <SelectItem key="auto" value="auto">Auto Approval</SelectItem>
            </Select>
            
            <Select
              label="Expense Approval Workflow"
              selectedKeys={[settings.expenseApprovalWorkflow]}
              onSelectionChange={(keys) => onSettingsChange("expenseApprovalWorkflow", Array.from(keys)[0])}
            >
              <SelectItem key="manager" value="manager">Direct Manager</SelectItem>
              <SelectItem key="finance" value="finance">Finance Department</SelectItem>
              <SelectItem key="both" value="both">Manager + Finance</SelectItem>
              <SelectItem key="auto" value="auto">Auto Approval</SelectItem>
            </Select>
            
            <Select
              label="Recruitment Workflow"
              selectedKeys={[settings.recruitmentWorkflow]}
              onSelectionChange={(keys) => onSettingsChange("recruitmentWorkflow", Array.from(keys)[0])}
            >
              <SelectItem key="hr" value="hr">HR Department</SelectItem>
              <SelectItem key="manager" value="manager">Hiring Manager</SelectItem>
              <SelectItem key="both" value="both">HR + Manager</SelectItem>
              <SelectItem key="committee" value="committee">Hiring Committee</SelectItem>
            </Select>
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-semibold mb-4">Auto Approval Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Auto Approval Limit ($)"
              type="number"
              placeholder="100"
              value={settings.autoApprovalLimit.toString()}
              onValueChange={(value) => onSettingsChange("autoApprovalLimit", parseInt(value))}
              description="Expenses under this amount will be auto-approved"
            />
            
            <Input
              label="Approval Deadline (days)"
              type="number"
              placeholder="5"
              value={settings.approvalDeadline.toString()}
              onValueChange={(value) => onSettingsChange("approvalDeadline", parseInt(value))}
              description="Number of days to approve requests"
            />
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-semibold mb-4">Escalation Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Escalation Days"
              type="number"
              placeholder="3"
              value={settings.escalationDays.toString()}
              onValueChange={(value) => onSettingsChange("escalationDays", parseInt(value))}
              description="Days before escalating to next level"
            />
            
            <Select
              label="Reminder Frequency"
              selectedKeys={[settings.reminderFrequency]}
              onSelectionChange={(keys) => onSettingsChange("reminderFrequency", Array.from(keys)[0])}
            >
              <SelectItem key="daily" value="daily">Daily</SelectItem>
              <SelectItem key="twice_daily" value="twice_daily">Twice Daily</SelectItem>
              <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
              <SelectItem key="custom" value="custom">Custom</SelectItem>
            </Select>
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-semibold mb-4">Workflow Rules</h3>
          <div className="space-y-4">
            <div className="p-4 bg-content1 rounded-lg">
              <h4 className="font-medium mb-2">Leave Request Rules</h4>
              <ul className="text-sm text-default-600 space-y-1">
                <li>• Requests under 3 days: Auto-approved for employees with good attendance</li>
                <li>• Requests over 7 days: Require manager and HR approval</li>
                <li>• Emergency leave: Can be approved by any manager</li>
                <li>• Holiday requests: First come, first served basis</li>
              </ul>
            </div>
            
            <div className="p-4 bg-content1 rounded-lg">
              <h4 className="font-medium mb-2">Expense Claim Rules</h4>
              <ul className="text-sm text-default-600 space-y-1">
                <li>• Expenses under $50: Auto-approved</li>
                <li>• Expenses $50-$500: Manager approval required</li>
                <li>• Expenses over $500: Finance department approval required</li>
                <li>• Travel expenses: Require pre-approval for amounts over $200</li>
              </ul>
            </div>
            
            <div className="p-4 bg-content1 rounded-lg">
              <h4 className="font-medium mb-2">Recruitment Rules</h4>
              <ul className="text-sm text-default-600 space-y-1">
                <li>• Junior positions: HR screening + Hiring manager interview</li>
                <li>• Senior positions: HR + Manager + Team lead interviews</li>
                <li>• Executive positions: Full hiring committee review</li>
                <li>• Internal transfers: Manager approval only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
