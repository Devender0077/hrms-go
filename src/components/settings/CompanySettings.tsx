import React from "react";
import { Input, Select, SelectItem, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CompanySettingsProps {
  settings: {
    companyName: string;
    companyAddress: string;
    companyCity: string;
    companyState: string;
    companyZipCode: string;
    companyCountry: string;
    companyPhone: string;
    companyEmail: string;
    companyWebsite: string;
    companyLogo: string;
    registrationNumber: string;
    taxNumber: string;
    industry: string;
    companySize: string;
    foundedYear: string;
    socialMedia: {
      linkedin: string;
      twitter: string;
      facebook: string;
      instagram: string;
    };
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function CompanySettings({ settings, onSettingsChange }: CompanySettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon icon="lucide:building" className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Company Information</h2>
          <p className="text-gray-600">Manage your company details and branding</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Company Name"
          placeholder="Enter company name"
          value={settings.companyName}
          onValueChange={(value) => onSettingsChange("companyName", value)}
        />
        <Input
          label="Company Email"
          type="email"
          placeholder="Enter company email"
          value={settings.companyEmail}
          onValueChange={(value) => onSettingsChange("companyEmail", value)}
        />
        <Input
          label="Company Phone"
          placeholder="Enter company phone"
          value={settings.companyPhone}
          onValueChange={(value) => onSettingsChange("companyPhone", value)}
        />
        <Input
          label="Company Website"
          placeholder="https://company.com"
          value={settings.companyWebsite}
          onValueChange={(value) => onSettingsChange("companyWebsite", value)}
        />
        <Input
          label="Registration Number"
          placeholder="Enter registration number"
          value={settings.registrationNumber}
          onValueChange={(value) => onSettingsChange("registrationNumber", value)}
        />
        <Input
          label="Tax Number"
          placeholder="Enter tax number"
          value={settings.taxNumber}
          onValueChange={(value) => onSettingsChange("taxNumber", value)}
        />
        <Select
          label="Industry"
          selectedKeys={[settings.industry]}
          onSelectionChange={(keys) => onSettingsChange("industry", Array.from(keys)[0])}
        >
          <SelectItem key="technology" value="technology">Technology</SelectItem>
          <SelectItem key="healthcare" value="healthcare">Healthcare</SelectItem>
          <SelectItem key="finance" value="finance">Finance</SelectItem>
          <SelectItem key="education" value="education">Education</SelectItem>
          <SelectItem key="retail" value="retail">Retail</SelectItem>
          <SelectItem key="manufacturing" value="manufacturing">Manufacturing</SelectItem>
          <SelectItem key="consulting" value="consulting">Consulting</SelectItem>
          <SelectItem key="other" value="other">Other</SelectItem>
        </Select>
        <Select
          label="Company Size"
          selectedKeys={[settings.companySize]}
          onSelectionChange={(keys) => onSettingsChange("companySize", Array.from(keys)[0])}
        >
          <SelectItem key="1-10" value="1-10">1-10 employees</SelectItem>
          <SelectItem key="11-50" value="11-50">11-50 employees</SelectItem>
          <SelectItem key="51-200" value="51-200">51-200 employees</SelectItem>
          <SelectItem key="201-500" value="201-500">201-500 employees</SelectItem>
          <SelectItem key="500+" value="500+">500+ employees</SelectItem>
        </Select>
        <Input
          label="Founded Year"
          placeholder="2020"
          value={settings.foundedYear}
          onValueChange={(value) => onSettingsChange("foundedYear", value)}
        />
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Company Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Address"
            placeholder="Enter company address"
            value={settings.companyAddress}
            onValueChange={(value) => onSettingsChange("companyAddress", value)}
          />
          <Input
            label="City"
            placeholder="Enter city"
            value={settings.companyCity}
            onValueChange={(value) => onSettingsChange("companyCity", value)}
          />
          <Input
            label="State/Province"
            placeholder="Enter state or province"
            value={settings.companyState}
            onValueChange={(value) => onSettingsChange("companyState", value)}
          />
          <Input
            label="ZIP/Postal Code"
            placeholder="Enter ZIP or postal code"
            value={settings.companyZipCode}
            onValueChange={(value) => onSettingsChange("companyZipCode", value)}
          />
          <Input
            label="Country"
            placeholder="Enter country"
            value={settings.companyCountry}
            onValueChange={(value) => onSettingsChange("companyCountry", value)}
          />
        </div>
      </div>

      <Divider />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="LinkedIn"
            placeholder="https://linkedin.com/company/yourcompany"
            value={settings.socialMedia.linkedin}
            onValueChange={(value) => onSettingsChange("socialMedia", { ...settings.socialMedia, linkedin: value })}
            startContent={<Icon icon="lucide:linkedin" className="text-blue-600" />}
          />
          <Input
            label="Twitter"
            placeholder="https://twitter.com/yourcompany"
            value={settings.socialMedia.twitter}
            onValueChange={(value) => onSettingsChange("socialMedia", { ...settings.socialMedia, twitter: value })}
            startContent={<Icon icon="lucide:twitter" className="text-blue-400" />}
          />
          <Input
            label="Facebook"
            placeholder="https://facebook.com/yourcompany"
            value={settings.socialMedia.facebook}
            onValueChange={(value) => onSettingsChange("socialMedia", { ...settings.socialMedia, facebook: value })}
            startContent={<Icon icon="lucide:facebook" className="text-blue-600" />}
          />
          <Input
            label="Instagram"
            placeholder="https://instagram.com/yourcompany"
            value={settings.socialMedia.instagram}
            onValueChange={(value) => onSettingsChange("socialMedia", { ...settings.socialMedia, instagram: value })}
            startContent={<Icon icon="lucide:instagram" className="text-pink-600" />}
          />
        </div>
      </div>
    </div>
  );
}
