import React from 'react';
import { Card, CardBody, CardHeader, Input, Textarea, Switch, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface SEOSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
}

export default function SEOSettings({ settings, onSettingsChange }: SEOSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Meta Tags */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:search" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Meta Tags</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Meta Title"
            
            onChange={(e) => onSettingsChange('metaTitle', e.target.value)}
            placeholder="Enter meta title"
            description="Recommended length: 50-60 characters"
            startContent={<Icon icon="lucide:type" className="text-default-400" />}
          />

          <Textarea
            label="Meta Description"
            
            onChange={(e) => onSettingsChange('metaDescription', e.target.value)}
            placeholder="Enter meta description"
            description="Recommended length: 150-160 characters"
            startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
          />

          <Textarea
            label="Meta Keywords"
            
            onChange={(e) => onSettingsChange('metaKeywords', e.target.value)}
            placeholder="Enter meta keywords separated by commas"
            description="Separate keywords with commas"
            startContent={<Icon icon="lucide:tags" className="text-default-400" />}
          />

          <Input
            label="Canonical URL"
            
            onChange={(e) => onSettingsChange('canonicalUrl', e.target.value)}
            placeholder="https://hrms.company.com"
            startContent={<Icon icon="lucide:link" className="text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* Open Graph Tags */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:share-2" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Open Graph Tags</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="OG Title"
            
            onChange={(e) => onSettingsChange('ogTitle', e.target.value)}
            placeholder="Enter Open Graph title"
            startContent={<Icon icon="lucide:type" className="text-default-400" />}
          />

          <Textarea
            label="OG Description"
            
            onChange={(e) => onSettingsChange('ogDescription', e.target.value)}
            placeholder="Enter Open Graph description"
            startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
          />

          <Input
            label="OG Image URL"
            
            onChange={(e) => onSettingsChange('ogImage', e.target.value)}
            placeholder="https://company.com/og-image.png"
            description="Recommended size: 1200x630 pixels"
            startContent={<Icon icon="lucide:image" className="text-default-400" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="OG Type"
              
              onChange={(e) => onSettingsChange('ogType', e.target.value)}
              placeholder="website"
              startContent={<Icon icon="lucide:globe" className="text-default-400" />}
            />

            <Input
              label="OG Site Name"
              
              onChange={(e) => onSettingsChange('ogSiteName', e.target.value)}
              placeholder="HRMS Pro"
              startContent={<Icon icon="lucide:building" className="text-default-400" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* Twitter Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:twitter" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Twitter Cards</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Twitter Card Type"
              
              onChange={(e) => onSettingsChange('twitterCard', e.target.value)}
              placeholder="summary_large_image"
              startContent={<Icon icon="lucide:credit-card" className="text-default-400" />}
            />

            <Input
              label="Twitter Site"
              
              onChange={(e) => onSettingsChange('twitterSite', e.target.value)}
              placeholder="@company"
              startContent={<Icon icon="lucide:at-sign" className="text-default-400" />}
            />
          </div>

          <Input
            label="Twitter Creator"
            
            onChange={(e) => onSettingsChange('twitterCreator', e.target.value)}
            placeholder="@company"
            startContent={<Icon icon="lucide:user" className="text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:bar-chart" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Analytics & Tracking</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Google Analytics ID"
            
            onChange={(e) => onSettingsChange('analytics', {
              ...settings.analytics,
              googleAnalytics: e.target.value
            })}
            placeholder="GA-XXXXXXXXX-X"
            startContent={<Icon icon="lucide:activity" className="text-default-400" />}
          />

          <Input
            label="Google Tag Manager ID"
            
            onChange={(e) => onSettingsChange('analytics', {
              ...settings.analytics,
              googleTagManager: e.target.value
            })}
            placeholder="GTM-XXXXXXX"
            startContent={<Icon icon="lucide:tag" className="text-default-400" />}
          />

          <Input
            label="Facebook Pixel ID"
            
            onChange={(e) => onSettingsChange('analytics', {
              ...settings.analytics,
              facebookPixel: e.target.value
            })}
            placeholder="123456789012345"
            startContent={<Icon icon="lucide:facebook" className="text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* Sitemap & Robots */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:sitemap" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Sitemap & Robots</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Sitemap URL"
            
            onChange={(e) => onSettingsChange('sitemapUrl', e.target.value)}
            placeholder="https://hrms.company.com/sitemap.xml"
            startContent={<Icon icon="lucide:map" className="text-default-400" />}
          />

          <Textarea
            label="Robots.txt Content"
            
            onChange={(e) => onSettingsChange('robotsTxt', e.target.value)}
            placeholder="User-agent: *\nAllow: /"
            description="Enter robots.txt content"
            startContent={<Icon icon="lucide:bot" className="text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:settings" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">SEO Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable SEO</p>
              <p className="text-xs text-default-500">Enable SEO optimization features</p>
            </div>
            <Switch
              isSelected={settings.enableSEO === true || settings.enableSEO === 'true'}
              onValueChange={(value) => onSettingsChange('enableSEO', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Generate Sitemap</p>
              <p className="text-xs text-default-500">Automatically generate sitemap</p>
            </div>
            <Switch
              isSelected={settings.autoGenerateSitemap === true || settings.autoGenerateSitemap === 'true'}
              onValueChange={(value) => onSettingsChange('autoGenerateSitemap', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Structured Data</p>
              <p className="text-xs text-default-500">Enable JSON-LD structured data</p>
            </div>
            <Switch
              isSelected={settings.enableStructuredData === true || settings.enableStructuredData === 'true'}
              onValueChange={(value) => onSettingsChange('enableStructuredData', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Breadcrumbs</p>
              <p className="text-xs text-default-500">Enable breadcrumb navigation for SEO</p>
            </div>
            <Switch
              isSelected={settings.enableBreadcrumbs === true || settings.enableBreadcrumbs === 'true'}
              onValueChange={(value) => onSettingsChange('enableBreadcrumbs', value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:zap" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">SEO Actions</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-3">
            <Button color="primary" variant="flat" startContent={<Icon icon="lucide:search" />}>
              Test SEO
            </Button>
            <Button color="secondary" variant="flat" startContent={<Icon icon="lucide:download" />}>
              Generate Sitemap
            </Button>
            <Button color="success" variant="flat" startContent={<Icon icon="lucide:save" />}>
              Save Settings
            </Button>
          </div>
          
          <div className="bg-default-50 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">SEO Checklist:</h4>
            <div className="space-y-2 text-sm text-default-600">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:check" className="text-success-500" />
                <span>Meta title and description configured</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:check" className="text-success-500" />
                <span>Open Graph tags set up</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:check" className="text-success-500" />
                <span>Twitter Cards configured</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:check" className="text-success-500" />
                <span>Analytics tracking enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:check" className="text-success-500" />
                <span>Sitemap and robots.txt configured</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}