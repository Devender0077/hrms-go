import React from 'react';
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface JoiningLetterSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function JoiningLetterSettings({ settings, onSettingsChange }: JoiningLetterSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Template Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:user-plus" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Joining Letter Template</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Header Title"
              
              onChange={(e) => onSettingsChange('template', {
                ...settings.template,
                header: e.target.value
              })}
              placeholder="JOINING LETTER"
              startContent={<Icon icon="lucide:type" className="text-default-400" />}
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

          <Textarea
            label="Company Address"
            
            onChange={(e) => onSettingsChange('template', {
              ...settings.template,
              companyAddress: e.target.value
            })}
            placeholder="123 Business Street, City, State 12345"
            startContent={<Icon icon="lucide:map-pin" className="text-default-400" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Phone"
              
              onChange={(e) => onSettingsChange('template', {
                ...settings.template,
                companyPhone: e.target.value
              })}
              placeholder="+1 (555) 123-4567"
              startContent={<Icon icon="lucide:phone" className="text-default-400" />}
            />

            <Input
              label="Company Email"
              
              onChange={(e) => onSettingsChange('template', {
                ...settings.template,
                companyEmail: e.target.value
              })}
              placeholder="hr@company.com"
              startContent={<Icon icon="lucide:mail" className="text-default-400" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:edit" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Letter Content</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Textarea
            label="Greeting"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              greeting: e.target.value
            })}
            placeholder="Dear [EMPLOYEE_NAME],"
            description="Use [EMPLOYEE_NAME] as placeholder"
            startContent={<Icon icon="lucide:user" className="text-default-400" />}
          />

          <Textarea
            label="Introduction"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              introduction: e.target.value
            })}
            placeholder="Welcome to [COMPANY_NAME]! We are excited to have you join our team."
            description="Use [COMPANY_NAME] as placeholder"
            startContent={<Icon icon="lucide:message-square" className="text-default-400" />}
          />

          <Textarea
            label="Job Details"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              details: e.target.value.split('\n').filter(detail => detail.trim())
            })}
            placeholder="Position: [POSITION]&#10;Department: [DEPARTMENT]&#10;Joining Date: [JOINING_DATE]&#10;Employee ID: [EMPLOYEE_ID]&#10;Reporting To: [MANAGER_NAME]&#10;Work Location: [WORK_LOCATION]"
            description="Enter each detail on a new line. Use placeholders like [POSITION], [DEPARTMENT], [JOINING_DATE], [EMPLOYEE_ID], [MANAGER_NAME], [WORK_LOCATION]"
            startContent={<Icon icon="lucide:briefcase" className="text-default-400" />}
          />

          <Textarea
            label="Policies & Requirements"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              policies: e.target.value.split('\n').filter(policy => policy.trim())
            })}
            placeholder="Please review our employee handbook&#10;Complete all required onboarding forms&#10;Attend orientation session on [ORIENTATION_DATE]&#10;Bring required documents on your first day"
            description="Enter each policy on a new line. Use [ORIENTATION_DATE] as placeholder"
            startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
          />

          <Textarea
            label="Closing"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              closing: e.target.value
            })}
            placeholder="We look forward to a successful journey together..."
            startContent={<Icon icon="lucide:handshake" className="text-default-400" />}
          />

          <Textarea
            label="Signature"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              signature: e.target.value
            })}
            placeholder="Welcome aboard!\n[HR_MANAGER_NAME]\nHuman Resources Manager"
            description="Use [HR_MANAGER_NAME] as placeholder"
            startContent={<Icon icon="lucide:pen-tool" className="text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:zap" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Automation Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Generate</p>
              <p className="text-xs text-default-500">Automatically generate joining letters for new employees</p>
            </div>
            <Switch
              isSelected={settings.automation?.autoGenerate === true || settings.automation?.autoGenerate === 'true'}
              onValueChange={(value) => onSettingsChange('automation', {
                ...settings.automation,
                autoGenerate: value
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Send Email</p>
              <p className="text-xs text-default-500">Automatically send joining letter via email</p>
            </div>
            <Switch
              isSelected={settings.automation?.sendEmail === true || settings.automation?.sendEmail === 'true'}
              onValueChange={(value) => onSettingsChange('automation', {
                ...settings.automation,
                sendEmail: value
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Generate on Joining</p>
              <p className="text-xs text-default-500">Generate joining letter when employee joins</p>
            </div>
            <Switch
              isSelected={settings.automation?.generateOnJoining === true || settings.automation?.generateOnJoining === 'true'}
              onValueChange={(value) => onSettingsChange('automation', {
                ...settings.automation,
                generateOnJoining: value
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Include Documents</p>
              <p className="text-xs text-default-500">Include required documents list in joining letter</p>
            </div>
            <Switch
              isSelected={settings.automation?.includeDocuments === true || settings.automation?.includeDocuments === 'true'}
              onValueChange={(value) => onSettingsChange('automation', {
                ...settings.automation,
                includeDocuments: value
              })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Preview and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:eye" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Preview & Actions</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-3">
            <Button color="primary" variant="flat" startContent={<Icon icon="lucide:eye" />}>
              Preview Template
            </Button>
            <Button color="secondary" variant="flat" startContent={<Icon icon="lucide:download" />}>
              Download Sample
            </Button>
            <Button color="success" variant="flat" startContent={<Icon icon="lucide:save" />}>
              Save Template
            </Button>
          </div>
          
          <div className="bg-default-50 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Available Placeholders:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-default-600">
              <span>[EMPLOYEE_NAME]</span>
              <span>[POSITION]</span>
              <span>[DEPARTMENT]</span>
              <span>[JOINING_DATE]</span>
              <span>[EMPLOYEE_ID]</span>
              <span>[MANAGER_NAME]</span>
              <span>[WORK_LOCATION]</span>
              <span>[COMPANY_NAME]</span>
              <span>[HR_MANAGER_NAME]</span>
              <span>[ORIENTATION_DATE]</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}