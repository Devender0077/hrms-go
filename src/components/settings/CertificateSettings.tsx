import React from 'react';
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Select, SelectItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface CertificateSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function CertificateSettings({ settings, onSettingsChange }: CertificateSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Template Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:award" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Experience Certificate Template</h3>
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
              placeholder="EXPERIENCE CERTIFICATE"
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
            <h3 className="text-lg font-semibold text-foreground">Certificate Content</h3>
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
            placeholder="This is to certify that [EMPLOYEE_NAME] was employed with [COMPANY_NAME] from [START_DATE] to [END_DATE]."
            description="Use [EMPLOYEE_NAME], [COMPANY_NAME], [START_DATE], [END_DATE] as placeholders"
            startContent={<Icon icon="lucide:message-square" className="text-default-400" />}
          />

          <Textarea
            label="Employment Details"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              details: e.target.value.split('\n').filter(detail => detail.trim())
            })}
            placeholder="Position: [POSITION]&#10;Department: [DEPARTMENT]&#10;Employee ID: [EMPLOYEE_ID]&#10;Duration: [DURATION]&#10;Last Salary: [LAST_SALARY]&#10;Reason for Leaving: [REASON_FOR_LEAVING]"
            description="Enter each detail on a new line. Use placeholders like [POSITION], [DEPARTMENT], [EMPLOYEE_ID], [DURATION], [LAST_SALARY], [REASON_FOR_LEAVING]"
            startContent={<Icon icon="lucide:briefcase" className="text-default-400" />}
          />

          <Textarea
            label="Performance Statement"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              performance: e.target.value
            })}
            placeholder="During [his/her] tenure with us, [EMPLOYEE_NAME] demonstrated excellent performance and was a valuable member of our team."
            description="Use [his/her], [EMPLOYEE_NAME] as placeholders"
            startContent={<Icon icon="lucide:star" className="text-default-400" />}
          />

          <Textarea
            label="Closing"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              closing: e.target.value
            })}
            placeholder="We wish [EMPLOYEE_NAME] all the best in [his/her] future endeavors."
            description="Use [EMPLOYEE_NAME], [his/her] as placeholders"
            startContent={<Icon icon="lucide:handshake" className="text-default-400" />}
          />

          <Textarea
            label="Signature"
            
            onChange={(e) => onSettingsChange('content', {
              ...settings.content,
              signature: e.target.value
            })}
            placeholder="This certificate is issued upon request.\n\n[HR_MANAGER_NAME]\nHuman Resources Manager\n[COMPANY_NAME]"
            description="Use [HR_MANAGER_NAME], [COMPANY_NAME] as placeholders"
            startContent={<Icon icon="lucide:pen-tool" className="text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* Styling Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:palette" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Document Styling</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Font Family"
              placeholder="Select font"
              selectedKeys={settings.styling?.fontFamily ? [settings.styling.fontFamily] : ['Times New Roman']}
              onSelectionChange={(keys) => onSettingsChange('styling', {
                ...settings.styling,
                fontFamily: Array.from(keys)[0]
              })}
            >
              <SelectItem key="Times New Roman">Times New Roman</SelectItem>
              <SelectItem key="Arial">Arial</SelectItem>
              <SelectItem key="Helvetica">Helvetica</SelectItem>
              <SelectItem key="Georgia">Georgia</SelectItem>
              <SelectItem key="Calibri">Calibri</SelectItem>
            </Select>

            <Input
              label="Font Size"
              
              onChange={(e) => onSettingsChange('styling', {
                ...settings.styling,
                fontSize: e.target.value
              })}
              placeholder="12pt"
              startContent={<Icon icon="lucide:type" className="text-default-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Line Height"
              
              onChange={(e) => onSettingsChange('styling', {
                ...settings.styling,
                lineHeight: e.target.value
              })}
              placeholder="1.6"
              startContent={<Icon icon="lucide:align-justify" className="text-default-400" />}
            />

            <Input
              label="Top Margin"
              
              onChange={(e) => onSettingsChange('styling', {
                ...settings.styling,
                marginTop: e.target.value
              })}
              placeholder="1in"
              startContent={<Icon icon="lucide:move-vertical" className="text-default-400" />}
            />
          </div>
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
              <p className="text-xs text-default-500">Automatically generate certificates when employees leave</p>
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
              <p className="text-xs text-default-500">Require HR manager approval before generating certificates</p>
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
              <p className="text-xs text-default-500">Include digital signature in certificates</p>
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
              validityPeriod: parseInt(e.target.value) || 365
            })}
            placeholder="365"
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
              <span>[POSITION]</span>
              <span>[DEPARTMENT]</span>
              <span>[START_DATE]</span>
              <span>[END_DATE]</span>
              <span>[EMPLOYEE_ID]</span>
              <span>[DURATION]</span>
              <span>[LAST_SALARY]</span>
              <span>[REASON_FOR_LEAVING]</span>
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