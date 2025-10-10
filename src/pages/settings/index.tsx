import React, { useState, useEffect } from "react";
    import { 
      Card, 
      CardBody, 
      CardHeader,
      Button,
  Spinner,
  addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    import HeroSection from "../../components/common/HeroSection";
import DynamicPageTitle from "../../components/common/DynamicPageTitle";
import { useSettings } from "../../contexts/settings-context";
import { useAuth } from "../../contexts/auth-context";
import { useTranslation } from "../../contexts/translation-context";
import { 
  getAccessibleSettingsCategories, 
  getEditableSettingsCategories,
  canViewSettingsCategory,
  canEditSettingsCategory 
} from "../../utils/settings-permissions";
import SettingsPermissionWrapper from "../../components/settings/SettingsPermissionWrapper";

// Import settings components
import GeneralSettings from "../../components/settings/GeneralSettings";
import CompanySettings from "../../components/settings/CompanySettings";
import LocalizationSettings from "../../components/settings/LocalizationSettings";
import EmailSettings from "../../components/settings/EmailSettings";
import NotificationSettings from "../../components/settings/NotificationSettings";
import IntegrationSettings from "../../components/settings/IntegrationSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import BackupSettings from "../../components/settings/BackupSettings";
import ApiManagement from "../../components/settings/ApiManagement";
import WorkflowSettings from "../../components/settings/WorkflowSettings";
import ReportsSettings from "../../components/settings/ReportsSettings";
import ApiKeyModal from "../../components/settings/ApiKeyModal";
import OfferLetterSettings from "../../components/settings/OfferLetterSettings";
import JoiningLetterSettings from "../../components/settings/JoiningLetterSettings";
import CertificateSettings from "../../components/settings/CertificateSettings";
import NOCSettings from "../../components/settings/NOCSettings";
import GoogleCalendarSettings from "../../components/settings/GoogleCalendarSettings";
import SEOSettings from "../../components/settings/SEOSettings";
import CacheSettings from "../../components/settings/CacheSettings";
import WebhookSettings from "../../components/settings/WebhookSettings";
import CookieConsentSettings from "../../components/settings/CookieConsentSettings";
import ChatGPTSettings from "../../components/settings/ChatGPTSettings";
import SettingsExportImport from "../../components/settings/SettingsExportImport";
    
    export default function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Settings tabs configuration (with translations)
  const settingsTabs = [
    { key: "general", title: t("General Settings"), icon: "lucide:settings", description: t("Basic system configuration") },
    { key: "company", title: t("Company Information"), icon: "lucide:building", description: t("Company details and branding") },
    { key: "localization", title: t("Localization"), icon: "lucide:globe", description: t("Language, timezone, and regional settings") },
    { key: "email", title: t("Email Configuration"), icon: "lucide:mail", description: t("Email server and notification settings") },
    { key: "notification", title: t("Notifications"), icon: "lucide:bell", description: t("Notification preferences and channels") },
    { key: "integration", title: t("Integrations"), icon: "lucide:plug", description: t("Third-party service integrations") },
    { key: "security", title: t("Security & Privacy"), icon: "lucide:shield", description: t("Security policies and access control") },
    { key: "backup", title: t("Backup & Storage"), icon: "lucide:hard-drive", description: t("Data backup and storage management") },
    { key: "api", title: t("API Management"), icon: "lucide:code", description: t("API keys and webhook configuration") },
    { key: "workflow", title: t("Workflow Settings"), icon: "lucide:workflow", description: t("Approval workflows and automation") },
    { key: "reports", title: t("Reports & Analytics"), icon: "lucide:bar-chart", description: t("Report configuration and analytics") },
    { key: "offer-letter", title: t("Offer Letter Settings"), icon: "lucide:file-text", description: t("Offer letter templates and automation") },
    { key: "joining-letter", title: t("Joining Letter Settings"), icon: "lucide:user-plus", description: t("Joining letter templates and configuration") },
    { key: "certificate", title: t("Experience Certificate"), icon: "lucide:award", description: t("Experience certificate templates and settings") },
    { key: "noc", title: t("NOC Settings"), icon: "lucide:file-check", description: t("No Objection Certificate templates and settings") },
    { key: "google-calendar", title: t("Google Calendar"), icon: "lucide:calendar", description: t("Google Calendar integration and sync settings") },
    { key: "seo", title: t("SEO Settings"), icon: "lucide:search", description: t("Search engine optimization and meta tags") },
    { key: "cache", title: t("Cache Settings"), icon: "lucide:database", description: t("Cache configuration and management") },
    { key: "webhook", title: t("Webhook Settings"), icon: "lucide:webhook", description: t("Webhook endpoints and event configuration") },
    { key: "cookie-consent", title: t("Cookie Consent"), icon: "lucide:cookie", description: t("Cookie consent banner and privacy settings") },
    { key: "chatgpt", title: t("ChatGPT Integration"), icon: "lucide:bot", description: t("AI assistant and ChatGPT integration settings") },
    { key: "export-import", title: t("Export & Import"), icon: "lucide:download", description: t("Export and import settings configuration") }
  ];
  const { settings, loading, saving, updateSetting, updateCategory, saveAllSettings, error } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: "", description: "" });
  
  // Get user role and permissions
  const userRole = user?.role || 'employee';
  const accessibleCategories = getAccessibleSettingsCategories(userRole);
  const editableCategories = getEditableSettingsCategories(userRole);
  
  // Filter settings tabs based on user permissions
  const filteredSettingsTabs = settingsTabs.filter(tab => 
    accessibleCategories.includes(tab.key)
  );

  // Set default active tab to first accessible category
  useEffect(() => {
    if (accessibleCategories.length > 0 && !accessibleCategories.includes(activeTab)) {
      setActiveTab(accessibleCategories[0]);
    }
  }, [accessibleCategories, activeTab]);

  const handleSettingsChange = async (category: string, key: string, value: any) => {
    // Determine the correct type for the value
    let type = 'string';
    if (typeof value === 'boolean') {
      type = 'boolean';
    } else if (typeof value === 'number') {
      type = 'number';
    } else if (typeof value === 'object') {
      type = 'object';
    }
    
    // Save immediately to backend
    try {
      await updateSetting(category, key, value, type);
      addToast({
        title: 'Settings Saved',
        description: `${category}.${key} has been updated successfully`,
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error saving setting:', error);
      addToast({
        title: 'Save Failed',
        description: 'Failed to save setting. Please try again.',
        type: 'error',
        duration: 5000
      });
    }
  };

  const handleCreateApiKey = async () => {
    try {
      setIsLoading(true);
      
      // Validate input
      if (!newApiKey.name || newApiKey.name.trim().length === 0) {
        addToast({
          title: 'Validation Error',
          description: 'API key name is required',
          type: 'error',
          duration: 3000
        });
        return;
      }

      // Call API to create key
      const response = await fetch('http://localhost:8000/api/v1/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newApiKey.name,
          description: newApiKey.description,
          expiresIn: 365 // 1 year expiration
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast({
          title: 'API Key Created',
          description: `API key "${newApiKey.name}" has been created successfully. Make sure to copy it now as it won't be shown again.`,
          type: 'success',
          duration: 10000
        });
        
        // Show the API key in a modal or alert
        alert(`Your new API key:\n\n${data.data.api_key}\n\nPlease copy this key now. You won't be able to see it again!`);
        
        setIsApiModalOpen(false);
        setNewApiKey({ name: "", description: "" });
        
        // Refresh API keys list if you have one
        // await loadApiKeys();
      } else {
        throw new Error(data.error || 'Failed to create API key');
      }
    } catch (error: any) {
      console.error('Error creating API key:', error);
      addToast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create API key. Please try again.',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string | number) => {
    try {
      setIsLoading(true);
      
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
        return;
      }

      // Call API to delete key
      const response = await fetch(`http://localhost:8000/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        addToast({
          title: 'API Key Deleted',
          description: 'API key has been deleted successfully',
          type: 'success',
          duration: 3000
        });
        
        // Refresh API keys list if you have one
        // await loadApiKeys();
      } else {
        throw new Error(data.error || 'Failed to delete API key');
      }
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      addToast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete API key. Please try again.',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsImport = async (importedSettings: Record<string, any>) => {
    // Persist each category to backend using global context
    for (const [category, categorySettings] of Object.entries(importedSettings)) {
      if (typeof categorySettings === 'object' && categorySettings !== null) {
        await updateCategory(category, categorySettings);
      }
    }
    console.log('Settings imported successfully');
  };

      const renderSettingsForm = () => {
        switch (activeTab) {
      case "general":
            return (
          <SettingsPermissionWrapper userRole={userRole} category="general" action="view">
            <GeneralSettings 
              settings={settings.general || {}} 
              onSettingsChange={(field, value) => handleSettingsChange('general', field, value)} 
            />
          </SettingsPermissionWrapper>
            );
            
          case "company":
            return (
          <SettingsPermissionWrapper userRole={userRole} category="company" action="view">
            <CompanySettings 
              settings={settings.company || {}} 
              onSettingsChange={(field, value) => handleSettingsChange('company', field, value)} 
            />
          </SettingsPermissionWrapper>
        );
      
      case "localization":
        return (
          <SettingsPermissionWrapper userRole={userRole} category="localization" action="view">
            <LocalizationSettings 
              settings={settings.localization || {}} 
              onSettingsChange={(field, value) => handleSettingsChange('localization', field, value)} 
            />
          </SettingsPermissionWrapper>
            );
            
          case "email":
            return (
          <SettingsPermissionWrapper userRole={userRole} category="email" action="view">
            <EmailSettings 
              settings={settings.email || {}} 
              onSettingsChange={(field, value) => handleSettingsChange('email', field, value)} 
            />
          </SettingsPermissionWrapper>
        );

      case "notification":
        return (
          <NotificationSettings 
            settings={settings.notification || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('notification', field, value)} 
          />
            );
            
          case "integration":
            return (
          <IntegrationSettings 
            settings={settings.integration || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('integration', field, value)} 
          />
        );
        
      case "security":
        return (
          <SecuritySettings 
            settings={settings.security || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('security', field, value)} 
          />
        );

      case "backup":
        return (
          <BackupSettings 
            settings={settings.backup || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('backup', field, value)} 
          />
        );

      case "api":
        return (
          <ApiManagement 
            settings={settings.api || {}}
            onSettingsChange={(field, value) => handleSettingsChange('api', field, value)}
            onCreateApiKey={() => setIsApiModalOpen(true)}
            onDeleteApiKey={handleDeleteApiKey}
          />
        );

      case "workflow":
        return (
          <WorkflowSettings 
            settings={settings.workflow || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('workflow', field, value)} 
          />
        );

      case "reports":
        return (
          <ReportsSettings 
            settings={settings.reports || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('reports', field, value)} 
          />
        );

      case "offer-letter":
        return (
          <OfferLetterSettings 
            settings={settings['offer-letter'] || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('offer-letter', field, value)} 
          />
        );

      case "joining-letter":
        return (
          <JoiningLetterSettings 
            settings={settings['joining-letter'] || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('joining-letter', field, value)} 
          />
        );

      case "certificate":
        return (
          <CertificateSettings 
            settings={settings.certificate || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('certificate', field, value)} 
          />
        );

      case "noc":
        return (
          <NOCSettings 
            settings={settings.noc || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('noc', field, value)} 
          />
        );

      case "google-calendar":
        return (
          <GoogleCalendarSettings 
            settings={settings['google-calendar'] || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('google-calendar', field, value)} 
          />
        );

      case "seo":
        return (
          <SEOSettings 
            settings={settings.seo || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('seo', field, value)} 
          />
        );

      case "cache":
        return (
          <CacheSettings 
            settings={settings.cache || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('cache', field, value)} 
          />
        );

      case "webhook":
        return (
          <WebhookSettings 
            settings={settings.webhook || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('webhook', field, value)}
            onAddWebhook={() => console.log("Add webhook")}
            onEditWebhook={(webhook) => console.log("Edit webhook", webhook)}
            onDeleteWebhook={(id) => console.log("Delete webhook", id)}
            onTestWebhook={(id) => console.log("Test webhook", id)}
          />
        );

      case "cookie-consent":
        return (
          <CookieConsentSettings 
            settings={settings['cookie-consent'] || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('cookie-consent', field, value)} 
          />
        );

      case "chatgpt":
        return (
          <ChatGPTSettings 
            settings={settings.chatgpt || {}} 
            onSettingsChange={(field, value) => handleSettingsChange('chatgpt', field, value)} 
          />
        );

      case "export-import":
            return (
          <SettingsExportImport 
            settings={settings} 
            onSettingsImport={handleSettingsImport}
            currentUser="admin"
          />
            );
            
          default:
            return (
              <div className="flex items-center justify-center p-8">
                <p className="text-default-500">Select a settings category from the sidebar</p>
              </div>
            );
        }
      };
      
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 dark:text-default-400 mt-4 text-sm sm:text-base">Loading settings...</p>
        </div>
      </div>
    );
  }
      
      return (
    <div className="min-h-screen bg-background">
        <DynamicPageTitle pageName="Settings" />
        {/* Hero Section */}
        <HeroSection
          title={t("Settings")}
          subtitle={t("System Configuration")}
          description={t("Configure your HRMS system settings, integrations, and preferences.")}
          icon="lucide:settings"
          illustration="settings"
          actions={[
            {
              label: t("Export Settings"),
              icon: "lucide:download",
              onPress: () => console.log("Export settings"),
              variant: "bordered"
            },
            {
              label: "Reset to Defaults",
              icon: "lucide:refresh-cw",
              onPress: () => console.log("Reset settings"),
              variant: "flat"
            }
          ]}
        />
          
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 sm:p-6">
        {/* Floating Sidebar Navigation */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="border-0 shadow-lg rounded-2xl h-fit lg:sticky lg:top-6">
            <CardHeader className="pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Icon icon="lucide:list" className="text-primary-600 dark:text-primary-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Settings Categories</h3>
                  <p className="text-default-500 text-xs sm:text-sm">Choose a category to configure</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                {filteredSettingsTabs.map((tab) => (
                  <Button
                      key={tab.key}
                    variant={activeTab === tab.key ? "flat" : "light"}
                    color={activeTab === tab.key ? "primary" : "default"}
                    className={`w-full justify-start h-auto p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.key 
                        ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 shadow-sm" 
                        : "hover:bg-default-100 dark:hover:bg-default-50 hover:shadow-sm"
                    }`}
                    onPress={() => setActiveTab(tab.key)}
                    startContent={
                      <div className={`p-1.5 sm:p-2 rounded-lg ${
                        activeTab === tab.key ? "bg-primary-100 dark:bg-primary-800" : "bg-default-100 dark:bg-default-200"
                      }`}>
                        <Icon 
                          icon={tab.icon} 
                          className={`text-base sm:text-lg ${
                            activeTab === tab.key ? "text-primary-600 dark:text-primary-400" : "text-default-500 dark:text-default-400"
                          }`} 
                        />
                        </div>
                      }
                  >
                    <div className="text-left ml-1 sm:ml-2 min-w-0 flex-1">
                      <div className={`font-medium text-sm sm:text-base truncate ${
                        activeTab === tab.key ? "text-primary-600 dark:text-primary-400" : "text-foreground"
                      }`}>
                        {tab.title}
                      </div>
                      <div className="text-xs text-default-500 dark:text-default-400 mt-1 line-clamp-2">
                        {tab.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              </CardBody>
            </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-divider">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground truncate">
                    {filteredSettingsTabs.find(tab => tab.key === activeTab)?.title}
                  </h2>
                  <p className="text-default-500 text-sm mt-1 sm:mt-2">
                    {filteredSettingsTabs.find(tab => tab.key === activeTab)?.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {saving && (
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <Spinner size="sm" color="primary" />
                      <span className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400">Saving...</span>
                    </div>
                  )}
                  <Button
                    color="primary"
                    variant="solid"
                    size="sm"
                    onPress={saveAllSettings}
                    isLoading={saving}
                    isDisabled={saving}
                    startContent={!saving ? <Icon icon="lucide:save" className="w-4 h-4" /> : null}
                    className="flex"
                  >
                    <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
                    <span className="sm:hidden">{saving ? 'Saving...' : 'Save'}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              {loading ? (
                <div className="flex items-center justify-center py-12 sm:py-16">
                  <div className="text-center">
                    <Spinner size="lg" color="primary" />
                    <p className="text-default-500 dark:text-default-400 mt-4">Loading settings...</p>
                  </div>
                </div>
              ) : (
                renderSettingsForm()
              )}
              </CardBody>
            </Card>
          </div>
      </div>

      {/* Modals */}
      <ApiKeyModal 
        isOpen={isApiModalOpen}
        onOpenChange={() => setIsApiModalOpen(false)}
        onSave={handleCreateApiKey}
        name={newApiKey.name}
        description={newApiKey.description}
        onNameChange={(value) => setNewApiKey(prev => ({ ...prev, name: value }))}
        onDescriptionChange={(value) => setNewApiKey(prev => ({ ...prev, description: value }))}
      />
    </div>
      );
    }