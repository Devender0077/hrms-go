import React from 'react';
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface NOCSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function NOCSettings({ settings, onSettingsChange }: NOCSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Template Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:file-check" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">NOC Template</h3>
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
              placeholder="NO OBJECTION CERTIFICATE"
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
            <h3 className="text-lg font-semibold text-foreground">NOC Content</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Textarea
            label="Greeting"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              greeting: e.target.value
            })}
            placeholder="To Whom It May Concern,"
            startContent={<Icon icon="lucide:user" className="text-default-400" />}
          />

          <Textarea
            label="Introduction"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              introduction: e.target.value
            })}
            placeholder="This is to certify that we have no objection to [EMPLOYEE_NAME] (Employee ID: [EMPLOYEE_ID]) pursuing [PURPOSE]."
            description="Use [EMPLOYEE_NAME], [EMPLOYEE_ID], [PURPOSE] as placeholders"
            startContent={<Icon icon="lucide:message-square" className="text-default-400" />}
          />

          <Textarea
            label="Employee Details"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              details: e.target.value.split('\n').filter(detail => detail.trim())
            })}
            placeholder="Employee Name: [EMPLOYEE_NAME]&#10;Employee ID: [EMPLOYEE_ID]&#10;Position: [POSITION]&#10;Department: [DEPARTMENT]&#10;Employment Period: [START_DATE] to [END_DATE]&#10;Current Status: [EMPLOYMENT_STATUS]"
            description="Enter each detail on a new line. Use placeholders like [EMPLOYEE_NAME], [EMPLOYEE_ID], [POSITION], [DEPARTMENT], [START_DATE], [END_DATE], [EMPLOYMENT_STATUS]"
            startContent={<Icon icon="lucide:briefcase" className="text-default-400" />}
          />

          <Textarea
            label="Purpose Statement"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              purpose: e.target.value
            })}
            placeholder="The purpose of this NOC is for [PURPOSE]."
            description="Use [PURPOSE] as placeholder"
            startContent={<Icon icon="lucide:target" className="text-default-400" />}
          />

          <Textarea
            label="Conditions"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              conditions: e.target.value.split('\n').filter(condition => condition.trim())
            })}
            placeholder="This NOC is valid for [VALIDITY_PERIOD] days from the date of issue&#10;The employee must complete all pending work before leaving&#10;All company property must be returned&#10;Confidentiality agreement remains in effect"
            description="Enter each condition on a new line. Use [VALIDITY_PERIOD] as placeholder"
            startContent={<Icon icon="lucide:list" className="text-default-400" />}
          />

          <Textarea
            label="Closing"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              closing: e.target.value
            })}
            placeholder="We wish [EMPLOYEE_NAME] success in [his/her] future endeavors."
            description="Use [EMPLOYEE_NAME], [his/her] as placeholders"
            startContent={<Icon icon="lucide:handshake" className="text-default-400" />}
          />

          <Textarea
            label="Signature"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              signature: e.target.value
            })}
            placeholder="This NOC is issued upon request.\n\n[HR_MANAGER_NAME]\nHuman Resources Manager\n[COMPANY_NAME]"
            description="Use [HR_MANAGER_NAME], [COMPANY_NAME] as placeholders"
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
              <p className="text-xs text-default-500">Automatically generate NOC when requested</p>
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
              <p className="text-sm font-medium text-foreground">Require Approval</p>
              <p className="text-xs text-default-500">Require HR manager approval before generating NOC</p>
            </div>
            <Switch
              isSelected={settings.automation?.requireApproval === true || settings.automation?.requireApproval === 'true'}
              onValueChange={(value) => onSettingsChange('automation', {
                ...settings.automation,
                requireApproval: value
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Include Signature</p>
              <p className="text-xs text-default-500">Include digital signature in NOC</p>
            </div>
            <Switch
              isSelected={settings.automation?.includeSignature === true || settings.automation?.includeSignature === 'true'}
              onValueChange={(value) => onSettingsChange('automation', {
                ...settings.automation,
                includeSignature: value
              })}
            />
          </div>

          <Input
            label="Validity Period (Days)"
            type="number"
            
            onChange={(e) => onSettingsChange('automation', {
              ...settings.automation,
              validityPeriod: parseInt(e.target.value) || 30
            })}
            placeholder="30"
            startContent={<Icon icon="lucide:calendar-days" className="text-default-400" />}
          />
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
              <span>[EMPLOYEE_ID]</span>
              <span>[POSITION]</span>
              <span>[DEPARTMENT]</span>
              <span>[START_DATE]</span>
              <span>[END_DATE]</span>
              <span>[EMPLOYMENT_STATUS]</span>
              <span>[PURPOSE]</span>
              <span>[VALIDITY_PERIOD]</span>
              <span>[COMPANY_NAME]</span>
              <span>[HR_MANAGER_NAME]</span>
              <span>[his/her]</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}