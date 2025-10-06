import React from 'react';
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Select, SelectItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface OfferLetterSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function OfferLetterSettings({ settings, onSettingsChange }: OfferLetterSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Template Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:file-text" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Offer Letter Template</h3>
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
              placeholder="OFFER OF EMPLOYMENT"
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
            placeholder="Dear [CANDIDATE_NAME],"
            description="Use [CANDIDATE_NAME] as placeholder"
            startContent={<Icon icon="lucide:user" className="text-default-400" />}
          />

          <Textarea
            label="Introduction"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              introduction: e.target.value
            })}
            placeholder="We are pleased to offer you the position of [POSITION] at [COMPANY_NAME]."
            description="Use [POSITION], [COMPANY_NAME] as placeholders"
            startContent={<Icon icon="lucide:message-square" className="text-default-400" />}
          />

          <Textarea
            label="Terms & Conditions"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              terms: e.target.value.split('\n').filter(term => term.trim())
            })}
            placeholder="Position: [POSITION]&#10;Department: [DEPARTMENT]&#10;Start Date: [START_DATE]&#10;Salary: [SALARY] per [SALARY_PERIOD]"
            description="Enter each term on a new line. Use placeholders like [POSITION], [DEPARTMENT], [START_DATE], [SALARY], [SALARY_PERIOD]"
            startContent={<Icon icon="lucide:list" className="text-default-400" />}
          />

          <Textarea
            label="Closing"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              closing: e.target.value
            })}
            placeholder="We look forward to welcoming you to our team..."
            startContent={<Icon icon="lucide:handshake" className="text-default-400" />}
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
              <p className="text-xs text-default-500">Automatically generate offer letters when creating new employees</p>
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
              <p className="text-xs text-default-500">Automatically send offer letter via email</p>
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
              <p className="text-sm font-medium text-foreground">Require Signature</p>
              <p className="text-xs text-default-500">Require digital signature for offer acceptance</p>
            </div>
            <Switch
              isSelected={settings.automation?.requireSignature === true || settings.automation?.requireSignature === 'true'}
              onValueChange={(value) => onSettingsChange('automation', {
                ...settings.automation,
                requireSignature: value
              })}
            />
          </div>

          <Input
            label="Expiration Days"
            type="number"
            
            onChange={(e) => onSettingsChange('automation', {
              ...settings.automation,
              expirationDays: parseInt(e.target.value) || 7
            })}
            placeholder="7"
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
              <span>[CANDIDATE_NAME]</span>
              <span>[POSITION]</span>
              <span>[DEPARTMENT]</span>
              <span>[START_DATE]</span>
              <span>[SALARY]</span>
              <span>[SALARY_PERIOD]</span>
              <span>[COMPANY_NAME]</span>
              <span>[HR_MANAGER_NAME]</span>
              <span>[WORK_LOCATION]</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}