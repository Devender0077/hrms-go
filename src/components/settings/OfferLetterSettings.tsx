import React from "react";
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Button, Divider, Radio, RadioGroup } from "@heroui/react";

interface OfferLetterSettingsProps {
  settings: {
    companyName: string;
    companyAddress: string;
    hrEmail: string;
    hrPhone: string;
    defaultTemplate: string;
    autoGenerate: boolean;
    includeSalary: boolean;
    includeBenefits: boolean;
    includeStartDate: boolean;
    validityDays: number;
    signatureRequired: boolean;
    digitalSignature: boolean;
    letterheadTemplate: string;
    useCustomLetterhead: boolean;
    letterheadFile: File | null;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function OfferLetterSettings({ settings, onSettingsChange }: OfferLetterSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Company Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="Enter company name"
              value={settings.companyName}
              onChange={(e) => onSettingsChange("companyName", e.target.value)}
            />
            <Input
              label="HR Email"
              placeholder="hr@company.com"
              value={settings.hrEmail}
              onChange={(e) => onSettingsChange("hrEmail", e.target.value)}
            />
            <Input
              label="HR Phone"
              placeholder="+1 (555) 123-4567"
              value={settings.hrPhone}
              onChange={(e) => onSettingsChange("hrPhone", e.target.value)}
            />
            <Input
              label="Validity Days"
              type="number"
              placeholder="30"
              value={settings.validityDays.toString()}
              onChange={(e) => onSettingsChange("validityDays", parseInt(e.target.value))}
            />
          </div>
          <Textarea
            label="Company Address"
            placeholder="Enter complete company address"
            value={settings.companyAddress}
            onChange={(e) => onSettingsChange("companyAddress", e.target.value)}
            minRows={3}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Letterhead Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Use Custom Letterhead</span>
                <span className="text-xs text-gray-500">Upload a custom letterhead template or use auto-generated one</span>
              </div>
              <Switch
                isSelected={settings.useCustomLetterhead}
                onValueChange={(value) => onSettingsChange("useCustomLetterhead", value)}
              />
            </div>
            
            {settings.useCustomLetterhead ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".docx,.doc,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onSettingsChange("letterheadFile", file);
                      }
                    }}
                    className="hidden"
                    id="letterhead-upload"
                  />
                  <label htmlFor="letterhead-upload" className="cursor-pointer">
                    <div className="text-gray-500 mb-2">
                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      Click to upload letterhead template
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports .docx, .doc, .pdf files
                    </p>
                  </label>
                </div>
                {settings.letterheadFile && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Uploaded: {settings.letterheadFile.name}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Auto-Generated Letterhead</h4>
                <p className="text-xs text-blue-700">
                  We'll automatically generate a professional letterhead using your company logo and branding information.
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Template Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <span className="bg-gray-100 px-2 py-1 rounded">[CANDIDATE_NAME]</span>
              <span className="bg-gray-100 px-2 py-1 rounded">[POSITION]</span>
              <span className="bg-gray-100 px-2 py-1 rounded">[DEPARTMENT]</span>
              <span className="bg-gray-100 px-2 py-1 rounded">[SALARY]</span>
              <span className="bg-gray-100 px-2 py-1 rounded">[START_DATE]</span>
              <span className="bg-gray-100 px-2 py-1 rounded">[COMPANY_NAME]</span>
              <span className="bg-gray-100 px-2 py-1 rounded">[HR_EMAIL]</span>
              <span className="bg-gray-100 px-2 py-1 rounded">[HR_PHONE]</span>
              <span className="bg-gray-100 px-2 py-1 rounded">[VALIDITY_DAYS]</span>
            </div>
          </div>
          <Textarea
            label="Default Template"
            placeholder="Enter default offer letter template"
            value={settings.defaultTemplate}
            onChange={(e) => onSettingsChange("defaultTemplate", e.target.value)}
            minRows={12}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Automation Settings</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Auto-generate offer letters</span>
                <span className="text-xs text-gray-500">Automatically generate offer letters when new employees are added</span>
              </div>
              <Switch
                isSelected={settings.autoGenerate}
                onValueChange={(value) => onSettingsChange("autoGenerate", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Include salary information</span>
                <span className="text-xs text-gray-500">Add salary details to the offer letter</span>
              </div>
              <Switch
                isSelected={settings.includeSalary}
                onValueChange={(value) => onSettingsChange("includeSalary", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Include benefits package</span>
                <span className="text-xs text-gray-500">Add benefits and perks information</span>
              </div>
              <Switch
                isSelected={settings.includeBenefits}
                onValueChange={(value) => onSettingsChange("includeBenefits", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Include start date</span>
                <span className="text-xs text-gray-500">Add employment start date</span>
              </div>
              <Switch
                isSelected={settings.includeStartDate}
                onValueChange={(value) => onSettingsChange("includeStartDate", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Require digital signature</span>
                <span className="text-xs text-gray-500">Make digital signature mandatory</span>
              </div>
              <Switch
                isSelected={settings.signatureRequired}
                onValueChange={(value) => onSettingsChange("signatureRequired", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable digital signature</span>
                <span className="text-xs text-gray-500">Allow digital signature functionality</span>
              </div>
              <Switch
                isSelected={settings.digitalSignature}
                onValueChange={(value) => onSettingsChange("digitalSignature", value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
