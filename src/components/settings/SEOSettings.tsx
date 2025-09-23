import React from "react";
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Button, Divider } from "@heroui/react";

interface SEOSettingsProps {
  settings: {
    siteTitle: string;
    siteDescription: string;
    siteKeywords: string;
    siteUrl: string;
    siteLogo: string;
    favicon: string;
    ogImage: string;
    twitterHandle: string;
    facebookAppId: string;
    googleAnalyticsId: string;
    googleTagManagerId: string;
    facebookPixelId: string;
    enableSitemap: boolean;
    enableRobotsTxt: boolean;
    enableMetaTags: boolean;
    enableOpenGraph: boolean;
    enableTwitterCards: boolean;
    enableSchemaMarkup: boolean;
    enableCanonicalUrls: boolean;
    enableBreadcrumbs: boolean;
  };
  onSettingsChange: (field: string, value: any) => void;
}

export default function SEOSettings({ settings, onSettingsChange }: SEOSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Basic SEO Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Site Title"
              placeholder="Enter site title"
              value={settings.siteTitle}
              onChange={(e) => onSettingsChange("siteTitle", e.target.value)}
            />
            <Input
              label="Site URL"
              placeholder="https://yourdomain.com"
              value={settings.siteUrl}
              onChange={(e) => onSettingsChange("siteUrl", e.target.value)}
            />
            <Input
              label="Site Logo URL"
              placeholder="https://yourdomain.com/logo.png"
              value={settings.siteLogo}
              onChange={(e) => onSettingsChange("siteLogo", e.target.value)}
            />
            <Input
              label="Favicon URL"
              placeholder="https://yourdomain.com/favicon.ico"
              value={settings.favicon}
              onChange={(e) => onSettingsChange("favicon", e.target.value)}
            />
            <Input
              label="OG Image URL"
              placeholder="https://yourdomain.com/og-image.png"
              value={settings.ogImage}
              onChange={(e) => onSettingsChange("ogImage", e.target.value)}
            />
            <Input
              label="Twitter Handle"
              placeholder="@yourcompany"
              value={settings.twitterHandle}
              onChange={(e) => onSettingsChange("twitterHandle", e.target.value)}
            />
          </div>
          <Textarea
            label="Site Description"
            placeholder="Enter site description for SEO"
            value={settings.siteDescription}
            onChange={(e) => onSettingsChange("siteDescription", e.target.value)}
            minRows={3}
          />
          <Input
            label="Site Keywords"
            placeholder="hr, human resources, management, employee"
            value={settings.siteKeywords}
            onChange={(e) => onSettingsChange("siteKeywords", e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Analytics & Tracking</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Google Analytics ID"
              placeholder="GA-XXXXXXXXX-X"
              value={settings.googleAnalyticsId}
              onChange={(e) => onSettingsChange("googleAnalyticsId", e.target.value)}
            />
            <Input
              label="Google Tag Manager ID"
              placeholder="GTM-XXXXXXX"
              value={settings.googleTagManagerId}
              onChange={(e) => onSettingsChange("googleTagManagerId", e.target.value)}
            />
            <Input
              label="Facebook Pixel ID"
              placeholder="123456789012345"
              value={settings.facebookPixelId}
              onChange={(e) => onSettingsChange("facebookPixelId", e.target.value)}
            />
            <Input
              label="Facebook App ID"
              placeholder="123456789012345"
              value={settings.facebookAppId}
              onChange={(e) => onSettingsChange("facebookAppId", e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">SEO Features</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable XML Sitemap</span>
                <span className="text-xs text-gray-500">Generate XML sitemap for search engines</span>
              </div>
              <Switch
                isSelected={settings.enableSitemap}
                onValueChange={(value) => onSettingsChange("enableSitemap", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable robots.txt</span>
                <span className="text-xs text-gray-500">Generate robots.txt file for crawlers</span>
              </div>
              <Switch
                isSelected={settings.enableRobotsTxt}
                onValueChange={(value) => onSettingsChange("enableRobotsTxt", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable meta tags</span>
                <span className="text-xs text-gray-500">Add meta description and keywords</span>
              </div>
              <Switch
                isSelected={settings.enableMetaTags}
                onValueChange={(value) => onSettingsChange("enableMetaTags", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable Open Graph tags</span>
                <span className="text-xs text-gray-500">Add Open Graph meta tags for social sharing</span>
              </div>
              <Switch
                isSelected={settings.enableOpenGraph}
                onValueChange={(value) => onSettingsChange("enableOpenGraph", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable Twitter Cards</span>
                <span className="text-xs text-gray-500">Add Twitter Card meta tags</span>
              </div>
              <Switch
                isSelected={settings.enableTwitterCards}
                onValueChange={(value) => onSettingsChange("enableTwitterCards", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable Schema markup</span>
                <span className="text-xs text-gray-500">Add structured data markup</span>
              </div>
              <Switch
                isSelected={settings.enableSchemaMarkup}
                onValueChange={(value) => onSettingsChange("enableSchemaMarkup", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable canonical URLs</span>
                <span className="text-xs text-gray-500">Add canonical URL tags to prevent duplicate content</span>
              </div>
              <Switch
                isSelected={settings.enableCanonicalUrls}
                onValueChange={(value) => onSettingsChange("enableCanonicalUrls", value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable breadcrumbs</span>
                <span className="text-xs text-gray-500">Add breadcrumb navigation for better UX</span>
              </div>
              <Switch
                isSelected={settings.enableBreadcrumbs}
                onValueChange={(value) => onSettingsChange("enableBreadcrumbs", value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
