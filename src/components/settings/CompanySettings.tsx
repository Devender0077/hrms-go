import React from 'react';
import { Card, CardBody, CardHeader, Input, Textarea } from '@heroui/react';
import { Icon } from '@iconify/react';

interface CompanySettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function CompanySettings({ settings, onSettingsChange }: CompanySettingsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon icon="lucide:building" className="text-primary-600 dark:text-primary-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 sm:space-y-6">
          <Input
            label="Company Name"
            value={settings.company_name || ''}
            onChange={(e) => onSettingsChange('companyName', e.target.value)}
            placeholder="Enter company name"
            startContent={<Icon icon="lucide:building-2" className="text-default-400" />}
          />
          
          <Textarea
            label="Company Address"
            value={settings.company_address || ''}
            onChange={(e) => onSettingsChange('companyAddress', e.target.value)}
            placeholder="Enter company address"
            rows={3}
            startContent={<Icon icon="lucide:map-pin" className="text-default-400" />}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              value={settings.companyCity || ''}
              onChange={(e) => onSettingsChange('companyCity', e.target.value)}
              placeholder="Enter city"
              startContent={<Icon icon="lucide:building-2" className="text-default-400" />}
            />
            
            <Input
              label="State"
              value={settings.companyState || ''}
              onChange={(e) => onSettingsChange('companyState', e.target.value)}
              placeholder="Enter state"
              startContent={<Icon icon="lucide:map" className="text-default-400" />}
            />
            
            <Input
              label="ZIP Code"
              value={settings.companyZipCode || ''}
              onChange={(e) => onSettingsChange('companyZipCode', e.target.value)}
              placeholder="Enter ZIP code"
              startContent={<Icon icon="lucide:hash" className="text-default-400" />}
            />
            
            <Input
              label="Country"
              value={settings.companyCountry || ''}
              onChange={(e) => onSettingsChange('companyCountry', e.target.value)}
              placeholder="Enter country"
              startContent={<Icon icon="lucide:globe" className="text-default-400" />}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={settings.company_phone || ''}
              onChange={(e) => onSettingsChange('companyPhone', e.target.value)}
              placeholder="Enter phone number"
              startContent={<Icon icon="lucide:phone" className="text-default-400" />}
            />
            
            <Input
              label="Email Address"
              type="email"
              value={settings.company_email || ''}
              onChange={(e) => onSettingsChange('companyEmail', e.target.value)}
              placeholder="Enter email address"
              startContent={<Icon icon="lucide:mail" className="text-default-400" />}
            />
          </div>
          
          <Input
            label="Website"
            value={settings.companyWebsite || ''}
            onChange={(e) => onSettingsChange('companyWebsite', e.target.value)}
            placeholder="Enter website URL"
            startContent={<Icon icon="lucide:globe" className="text-default-400" />}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              value={settings.registrationNumber || ''}
              onChange={(e) => onSettingsChange('registrationNumber', e.target.value)}
              placeholder="Enter registration number"
              startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
            />
            
            <Input
              label="Tax Number"
              value={settings.taxNumber || ''}
              onChange={(e) => onSettingsChange('taxNumber', e.target.value)}
              placeholder="Enter tax number"
              startContent={<Icon icon="lucide:receipt" className="text-default-400" />}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}