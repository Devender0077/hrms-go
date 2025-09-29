import React from "react";
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Button, Divider, Select, SelectItem } from "@heroui/react";

interface CookieConsentSettingsProps {
  settings: {
    enabled: boolean;
    position: string;
    message: string;
    acceptButtonText: string;
    declineButtonText: string;
    learnMoreText: string;
    learnMoreUrl: string;
    cookiePolicyUrl: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
    showDeclineButton: boolean;
    showLearnMoreButton: boolean;
    autoAccept: boolean;
    autoAcceptDelay: number;
    rememberChoice: boolean;
    cookieExpiry: number;
    requiredCookies: string[];
    optionalCookies: string[];
    analyticsCookies: string[];
    marketingCookies: string[];
    functionalCookies: string[];
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function CookieConsentSettings({ settings, onSettingsChange }: CookieConsentSettingsProps) {
  const positionOptions = [
    { label: "Bottom", value: "bottom" },
    { label: "Top", value: "top" },
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Bottom Right", value: "bottom-right" },
    { label: "Top Left", value: "top-left" },
    { label: "Top Right", value: "top-right" }
  ];


  const cookieTypes = [
    { key: "required", label: "Required Cookies", description: "Essential for website functionality" },
    { key: "functional", label: "Functional Cookies", description: "Enhance user experience" },
    { key: "analytics", label: "Analytics Cookies", description: "Help us understand website usage" },
    { key: "marketing", label: "Marketing Cookies", description: "Used for targeted advertising" }
  ];

  const handleCookieTypeChange = (type: string, value: string) => {
    const currentCookies = settings[`${type}Cookies` as keyof typeof settings] as string[];
    const updatedCookies = currentCookies.includes(value)
      ? currentCookies.filter(cookie => cookie !== value)
      : [...currentCookies, value];
    onSettingsChange(`${type}Cookies`, updatedCookies);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cookie Consent Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Position"
              placeholder="Select position"
              selectedKeys={[settings.position]}
              onChange={(e) => onSettingsChange("position", e.target.value)}
            >
              {positionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Auto Accept Delay (seconds)"
              type="number"
              placeholder="0"
              value={settings.autoAcceptDelay.toString()}
              onChange={(e) => onSettingsChange("autoAcceptDelay", parseInt(e.target.value))}
            />
            <Input
              label="Cookie Expiry (days)"
              type="number"
              placeholder="365"
              value={settings.cookieExpiry.toString()}
              onChange={(e) => onSettingsChange("cookieExpiry", parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Enable cookie consent banner</span>
                <span className="text-xs text-default-500">Show cookie consent banner to users</span>
              </div>
              <Switch
                isSelected={settings.enabled}
                onValueChange={(value) => onSettingsChange("enabled", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Show decline button</span>
                <span className="text-xs text-default-500">Display decline option for users</span>
              </div>
              <Switch
                isSelected={settings.showDeclineButton}
                onValueChange={(value) => onSettingsChange("showDeclineButton", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Show learn more button</span>
                <span className="text-xs text-default-500">Display learn more link for detailed information</span>
              </div>
              <Switch
                isSelected={settings.showLearnMoreButton}
                onValueChange={(value) => onSettingsChange("showLearnMoreButton", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Auto accept cookies</span>
                <span className="text-xs text-default-500">Automatically accept cookies after delay</span>
              </div>
              <Switch
                isSelected={settings.autoAccept}
                onValueChange={(value) => onSettingsChange("autoAccept", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-content1 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Remember user choice</span>
                <span className="text-xs text-default-500">Remember user's cookie preferences</span>
              </div>
              <Switch
                isSelected={settings.rememberChoice}
                onValueChange={(value) => onSettingsChange("rememberChoice", value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Banner Text Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Textarea
            label="Consent Message"
            placeholder="We use cookies to enhance your experience..."
            value={settings.message}
            onChange={(e) => onSettingsChange("message", e.target.value)}
            minRows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Accept Button Text"
              placeholder="Accept All"
              value={settings.acceptButtonText}
              onChange={(e) => onSettingsChange("acceptButtonText", e.target.value)}
            />
            <Input
              label="Decline Button Text"
              placeholder="Decline"
              value={settings.declineButtonText}
              onChange={(e) => onSettingsChange("declineButtonText", e.target.value)}
            />
            <Input
              label="Learn More Text"
              placeholder="Learn More"
              value={settings.learnMoreText}
              onChange={(e) => onSettingsChange("learnMoreText", e.target.value)}
            />
            <Input
              label="Learn More URL"
              placeholder="https://yourdomain.com/cookies"
              value={settings.learnMoreUrl}
              onChange={(e) => onSettingsChange("learnMoreUrl", e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Policy URLs</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cookie Policy URL"
              placeholder="https://yourdomain.com/cookie-policy"
              value={settings.cookiePolicyUrl}
              onChange={(e) => onSettingsChange("cookiePolicyUrl", e.target.value)}
            />
            <Input
              label="Privacy Policy URL"
              placeholder="https://yourdomain.com/privacy-policy"
              value={settings.privacyPolicyUrl}
              onChange={(e) => onSettingsChange("privacyPolicyUrl", e.target.value)}
            />
            <Input
              label="Terms of Service URL"
              placeholder="https://yourdomain.com/terms-of-service"
              value={settings.termsOfServiceUrl}
              onChange={(e) => onSettingsChange("termsOfServiceUrl", e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cookie Categories</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {cookieTypes.map((type) => (
            <div key={type.key}>
              <h4 className="text-md font-medium mb-2">{type.label}</h4>
              <p className="text-sm text-default-600 mb-4">{type.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {settings[`${type.key}Cookies` as keyof typeof settings]?.map((cookie: string) => (
                  <div key={cookie} className="flex items-center justify-between p-3 bg-content1 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{cookie}</span>
                      <span className="text-xs text-default-500">Enable {cookie.toLowerCase()} cookie</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleCookieTypeChange(type.key, cookie)}
                      className="w-4 h-4 text-primary-600 bg-content2 border-divider rounded focus:ring-primary-500 focus:ring-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
