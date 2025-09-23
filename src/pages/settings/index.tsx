import React from "react";
    import { 
      Card, 
      CardBody, 
      CardHeader,
      Button,
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";

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
    
    // Settings tabs configuration
    const settingsTabs = [
  { key: "general", title: "General Settings", icon: "lucide:settings", description: "Basic system configuration" },
  { key: "company", title: "Company Information", icon: "lucide:building", description: "Company details and branding" },
  { key: "localization", title: "Localization", icon: "lucide:globe", description: "Language, timezone, and regional settings" },
  { key: "email", title: "Email Configuration", icon: "lucide:mail", description: "Email server and notification settings" },
  { key: "notification", title: "Notifications", icon: "lucide:bell", description: "Notification preferences and channels" },
  { key: "integration", title: "Integrations", icon: "lucide:plug", description: "Third-party service integrations" },
  { key: "security", title: "Security & Privacy", icon: "lucide:shield", description: "Security policies and access control" },
  { key: "backup", title: "Backup & Storage", icon: "lucide:hard-drive", description: "Data backup and storage management" },
  { key: "api", title: "API Management", icon: "lucide:code", description: "API keys and webhook configuration" },
  { key: "workflow", title: "Workflow Settings", icon: "lucide:workflow", description: "Approval workflows and automation" },
  { key: "reports", title: "Reports & Analytics", icon: "lucide:bar-chart", description: "Report configuration and analytics" },
  { key: "offer-letter", title: "Offer Letter Settings", icon: "lucide:file-text", description: "Offer letter templates and automation" },
  { key: "joining-letter", title: "Joining Letter Settings", icon: "lucide:user-plus", description: "Joining letter templates and configuration" },
  { key: "certificate", title: "Experience Certificate", icon: "lucide:award", description: "Experience certificate templates and settings" },
  { key: "noc", title: "NOC Settings", icon: "lucide:file-check", description: "No Objection Certificate templates and settings" },
  { key: "google-calendar", title: "Google Calendar", icon: "lucide:calendar", description: "Google Calendar integration and sync settings" },
  { key: "seo", title: "SEO Settings", icon: "lucide:search", description: "Search engine optimization and meta tags" },
  { key: "cache", title: "Cache Settings", icon: "lucide:database", description: "Cache configuration and management" },
  { key: "webhook", title: "Webhook Settings", icon: "lucide:webhook", description: "Webhook endpoints and event configuration" },
  { key: "cookie-consent", title: "Cookie Consent", icon: "lucide:cookie", description: "Cookie consent banner and privacy settings" },
  { key: "chatgpt", title: "ChatGPT Integration", icon: "lucide:bot", description: "AI assistant and ChatGPT integration settings" },
    ];
    
    export default function Settings() {
  const [activeTab, setActiveTab] = React.useState("general");
      const [isLoading, setIsLoading] = React.useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = React.useState(false);
  const [newApiKey, setNewApiKey] = React.useState({ name: "", description: "" });
      
      // Form state for different settings
  const [generalSettings, setGeneralSettings] = React.useState({
        siteName: "HRMGO",
    siteDescription: "Human Resource Management System",
    siteLogo: "",
        favicon: "",
        primaryColor: "#6366f1",
        secondaryColor: "#8b5cf6",
        themeMode: "system",
    rtlEnabled: false,
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    sessionTimeout: 30
      });
      
      const [companySettings, setCompanySettings] = React.useState({
        companyName: "HRMGO Inc.",
        companyAddress: "123 Business Avenue, Suite 100",
        companyCity: "New York",
        companyState: "NY",
        companyZipCode: "10001",
        companyCountry: "United States",
        companyPhone: "+1 (555) 123-4567",
        companyEmail: "info@hrmgo.com",
        companyWebsite: "https://hrmgo.com",
        companyLogo: "",
        registrationNumber: "REG123456789",
        taxNumber: "TAX987654321",
    industry: "Technology",
    companySize: "51-200",
    foundedYear: "2020",
    socialMedia: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: ""
    }
  });

  const [localizationSettings, setLocalizationSettings] = React.useState({
    defaultLanguage: "en",
    supportedLanguages: ["en", "es", "fr", "de", "zh"],
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    currency: "USD",
    currencySymbol: "$",
    numberFormat: "US",
    firstDayOfWeek: "sunday",
    businessDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    workingHours: {
      start: "09:00",
      end: "17:00"
    }
      });
      
      const [emailSettings, setEmailSettings] = React.useState({
        mailDriver: "smtp",
        mailHost: "smtp.example.com",
        mailPort: "587",
        mailUsername: "noreply@example.com",
        mailPassword: "",
        mailEncryption: "tls",
        mailFromAddress: "noreply@example.com",
    mailFromName: "HRMGO",
    mailQueueEnabled: true,
    mailRetryAttempts: 3,
    mailTimeout: 30
  });

  const [notificationSettings, setNotificationSettings] = React.useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    inAppNotifications: true,
    notificationChannels: {
      newEmployee: ["email", "in-app"],
      leaveRequest: ["email", "in-app"],
      attendanceAlert: ["email", "sms"],
      payrollProcessed: ["email"],
      systemMaintenance: ["email", "in-app"]
    },
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00"
    }
      });
      
      const [integrationSettings, setIntegrationSettings] = React.useState({
        // Pusher settings
        pusherEnabled: false,
        pusherAppId: "",
        pusherAppKey: "",
        pusherAppSecret: "",
        pusherCluster: "us2",
        
        // Zoom settings
        zoomEnabled: false,
        zoomClientId: "",
        zoomClientSecret: "",
        
        // Teams settings
        teamsEnabled: false,
        teamsClientId: "",
        teamsClientSecret: "",
        
        // Slack settings
        slackEnabled: false,
        slackClientId: "",
        slackClientSecret: "",
        
        // Telegram settings
        telegramEnabled: false,
        telegramBotToken: "",
        
        // Twilio settings
        twilioEnabled: false,
        twilioSid: "",
        twilioAuthToken: "",
        twilioFromNumber: ""
      });
      
      const [securitySettings, setSecuritySettings] = React.useState({
        // reCAPTCHA settings
        recaptchaEnabled: false,
        recaptchaSiteKey: "",
        recaptchaSecretKey: "",
        
        // IP restriction settings
        ipRestrictionEnabled: false,
        allowedIps: "",
        
        // 2FA settings
        twoFactorEnabled: false,
        twoFactorMethod: "email"
      });
      
  const [workflowSettings, setWorkflowSettings] = React.useState({
    leaveApprovalWorkflow: "manager",
    expenseApprovalWorkflow: "finance",
    recruitmentWorkflow: "hr",
    autoApprovalLimit: 100,
    escalationDays: 3,
    reminderFrequency: "daily",
    approvalDeadline: 5
  });

  const [reportsSettings, setReportsSettings] = React.useState({
    autoReportGeneration: true,
    reportFrequency: "monthly",
    reportFormat: "pdf",
    emailReports: true,
    reportRetention: 365,
    includeCharts: true,
    includeRawData: false,
    reportTimezone: "America/New_York"
  });

  // New settings state
  const [offerLetterSettings, setOfferLetterSettings] = React.useState({
    companyName: "",
    companyAddress: "",
    hrEmail: "",
    hrPhone: "",
    defaultTemplate: `Dear [CANDIDATE_NAME],

We are pleased to offer you the position of [POSITION] at [COMPANY_NAME]. After careful consideration of your qualifications and experience, we believe you will be a valuable addition to our team.

**Position Details:**
- Job Title: [POSITION]
- Department: [DEPARTMENT]
- Reporting Manager: [MANAGER_NAME]
- Start Date: [START_DATE]
- Employment Type: [EMPLOYMENT_TYPE]

**Compensation & Benefits:**
- Annual Salary: [SALARY]
- Benefits: [BENEFITS]
- Probation Period: [PROBATION_PERIOD] months

**Terms & Conditions:**
- This offer is valid for [VALIDITY_DAYS] days from the date of this letter
- Your employment will be subject to our standard terms and conditions
- You will be required to complete all necessary documentation before your start date

We look forward to welcoming you to our team. Please confirm your acceptance by signing and returning this letter by [ACCEPTANCE_DEADLINE].

If you have any questions, please feel free to contact us.

Best regards,
[HR_MANAGER_NAME]
Human Resources Manager
[COMPANY_NAME]
[HR_EMAIL] | [HR_PHONE]`,
    autoGenerate: false,
    includeSalary: true,
    includeBenefits: true,
    includeStartDate: true,
    validityDays: 30,
    signatureRequired: true,
    digitalSignature: false,
    letterheadTemplate: "",
    useCustomLetterhead: false,
    letterheadFile: null
  });

  const [joiningLetterSettings, setJoiningLetterSettings] = React.useState({
    companyName: "",
    companyAddress: "",
    hrEmail: "",
    hrPhone: "",
    defaultTemplate: `Dear [EMPLOYEE_NAME],

Welcome to [COMPANY_NAME]! We are excited to have you join our team as [POSITION] in the [DEPARTMENT] department.

**Joining Details:**
- Position: [POSITION]
- Department: [DEPARTMENT]
- Start Date: [JOINING_DATE]
- Reporting Manager: [MANAGER_NAME]
- Work Location: [WORK_LOCATION]
- Probation Period: [PROBATION_PERIOD] months

**Important Information:**
- Please report to the HR department on your first day at 9:00 AM
- Bring all required documents (ID proof, address proof, educational certificates)
- You will receive your employee ID and system access on the first day
- Company policies and procedures will be explained during orientation

**IT Setup:**
- Your workstation will be prepared with necessary software and tools
- You will receive login credentials for company systems
- IT support will be available for any technical assistance

We look forward to your valuable contribution to our team.

Best regards,
[HR_MANAGER_NAME]
Human Resources Manager
[COMPANY_NAME]
[HR_EMAIL] | [HR_PHONE]`,
    autoGenerate: false,
    includeReportingManager: true,
    includeDepartment: true,
    includeDesignation: true,
    includeWorkLocation: true,
    includeJoiningDate: true,
    includeProbationPeriod: true,
    probationPeriod: 3,
    includeCompanyPolicies: true,
    includeITSetup: true,
    letterheadTemplate: "",
    useCustomLetterhead: false,
    letterheadFile: null
  });

  const [certificateSettings, setCertificateSettings] = React.useState({
    companyName: "",
    companyAddress: "",
    hrEmail: "",
    hrPhone: "",
    defaultTemplate: `**EXPERIENCE CERTIFICATE**

This is to certify that [EMPLOYEE_NAME] was employed with [COMPANY_NAME] as [POSITION] in the [DEPARTMENT] department from [START_DATE] to [END_DATE].

**Employment Details:**
- Position: [POSITION]
- Department: [DEPARTMENT]
- Employment Period: [START_DATE] to [END_DATE]
- Total Duration: [DURATION]

**Job Responsibilities:**
[JOB_DESCRIPTION]

**Performance & Skills:**
- Performance Rating: [PERFORMANCE_RATING]
- Key Skills: [SKILLS]
- Major Projects: [PROJECTS]
- Achievements: [ACHIEVEMENTS]

During this period, [EMPLOYEE_NAME] has been found to be sincere, hardworking, and dedicated to their work. They have demonstrated excellent professional skills and contributed significantly to the organization's growth.

We wish them all the best for their future endeavors and have no hesitation in recommending them for any suitable position.

This certificate is issued upon request and without any prejudice.

Best regards,
[HR_MANAGER_NAME]
Human Resources Manager
[COMPANY_NAME]
[HR_EMAIL] | [HR_PHONE]

Date: [CERTIFICATE_DATE]`,
    autoGenerate: false,
    includeJobDescription: true,
    includePerformanceRating: true,
    includeSkills: true,
    includeProjects: true,
    includeAchievements: true,
    includeDuration: true,
    includeReasonForLeaving: false,
    includeRecommendation: true,
    signatureRequired: true,
    digitalSignature: false,
    letterheadTemplate: "",
    useCustomLetterhead: false,
    letterheadFile: null
  });

  const [nocSettings, setNocSettings] = React.useState({
    companyName: "",
    companyAddress: "",
    hrEmail: "",
    hrPhone: "",
    defaultTemplate: `**NO OBJECTION CERTIFICATE**

This is to certify that [EMPLOYEE_NAME] was employed with [COMPANY_NAME] as [POSITION] in the [DEPARTMENT] department.

**Employee Details:**
- Name: [EMPLOYEE_NAME]
- Position: [POSITION]
- Department: [DEPARTMENT]
- Employee ID: [EMPLOYEE_ID]

**Employment History:**
- Start Date: [START_DATE]
- Last Working Day: [LAST_WORKING_DAY]
- Notice Period: [NOTICE_PERIOD]
- Total Service: [TOTAL_SERVICE]

**Clearance Status:**
- All company assets returned: ✓
- Outstanding dues cleared: ✓
- Exit formalities completed: ✓
- No pending obligations: ✓

We have no objection to [EMPLOYEE_NAME] pursuing other opportunities and hereby issue this No Objection Certificate.

This certificate is issued upon request and without any prejudice.

Best regards,
[HR_MANAGER_NAME]
Human Resources Manager
[COMPANY_NAME]
[HR_EMAIL] | [HR_PHONE]

Date: [NOC_DATE]`,
    autoGenerate: false,
    includeEmployeeDetails: true,
    includeEmploymentHistory: true,
    includeClearanceStatus: true,
    includeOutstandingDues: true,
    includeNoticePeriod: true,
    includeLastWorkingDay: true,
    includeReasonForLeaving: false,
    includeRecommendation: true,
    signatureRequired: true,
    digitalSignature: false,
    letterheadTemplate: "",
    useCustomLetterhead: false,
    letterheadFile: null
  });

  const [googleCalendarSettings, setGoogleCalendarSettings] = React.useState({
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    enabled: false,
    syncEmployees: true,
    syncLeaveRequests: true,
    syncMeetings: true,
    syncInterviews: true,
    syncEvents: true,
    autoAccept: false,
    reminderMinutes: 15,
    timezone: "America/New_York",
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
  });

  const [seoSettings, setSeoSettings] = React.useState({
    siteTitle: "",
    siteDescription: "",
    siteKeywords: "",
    siteUrl: "",
    siteLogo: "",
    favicon: "",
    ogImage: "",
    twitterHandle: "",
    facebookAppId: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    enableSitemap: true,
    enableRobotsTxt: true,
    enableMetaTags: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
    enableSchemaMarkup: true,
    enableCanonicalUrls: true,
    enableBreadcrumbs: true
  });

  const [cacheSettings, setCacheSettings] = React.useState({
    enabled: true,
    driver: "redis",
    host: "localhost",
    port: 6379,
    password: "",
    database: 0,
    prefix: "hrms_",
    defaultTtl: 3600,
    maxMemory: "256m",
    enableQueryCache: true,
    enableViewCache: true,
    enableRouteCache: true,
    enableConfigCache: true,
    enableEventCache: true,
    enableSessionCache: true,
    enableUserCache: true,
    enableEmployeeCache: true,
    enableDepartmentCache: true,
    enableAttendanceCache: true,
    enableLeaveCache: true,
    enablePayrollCache: true,
    autoClearCache: true,
    clearCacheOnUpdate: true,
    clearCacheOnDelete: true
  });

  const [webhookSettings, setWebhookSettings] = React.useState({
    enabled: false,
    secret: "",
    timeout: 30,
    retryAttempts: 3,
    retryDelay: 5,
    webhooks: []
  });

  const [cookieConsentSettings, setCookieConsentSettings] = React.useState({
    enabled: true,
    position: "bottom",
    theme: "light",
    message: "We use cookies to enhance your experience on our website.",
    acceptButtonText: "Accept All",
    declineButtonText: "Decline",
    learnMoreText: "Learn More",
    learnMoreUrl: "",
    cookiePolicyUrl: "",
    privacyPolicyUrl: "",
    termsOfServiceUrl: "",
    showDeclineButton: true,
    showLearnMoreButton: true,
    autoAccept: false,
    autoAcceptDelay: 0,
    rememberChoice: true,
    cookieExpiry: 365,
    requiredCookies: ["session", "csrf", "auth"],
    optionalCookies: ["analytics", "marketing", "functional"],
    analyticsCookies: ["google_analytics", "mixpanel"],
    marketingCookies: ["facebook_pixel", "google_ads"],
    functionalCookies: ["preferences", "language"]
  });

  const [chatgptSettings, setChatgptSettings] = React.useState({
    apiKey: "",
    model: "gpt-3.5-turbo",
    maxTokens: 1000,
    temperature: 0.7,
    enabled: false,
    enableHRAssistant: true,
    enableRecruitmentAssistant: true,
    enablePerformanceAssistant: true,
    enableLeaveAssistant: true,
    enablePayrollAssistant: true,
    enableEmployeeSupport: true,
    enableManagerSupport: true,
    enableAdminSupport: true,
    autoRespond: false,
    responseDelay: 2,
    contextWindow: 4000,
    enableLearning: true,
    enableFeedback: true,
    enableAnalytics: true,
    enableIntegration: false,
    webhookUrl: "",
    webhookSecret: ""
  });

  const [apiSettings, setApiSettings] = React.useState({
    apiEnabled: true,
    rateLimit: 1000,
    webhookUrl: "",
    webhookSecret: "",
    apiKeys: [
      { id: 1, name: "Mobile App", key: "sk-***...***abc", created: "2024-11-01", lastUsed: "2024-12-01" },
      { id: 2, name: "Integration", key: "sk-***...***def", created: "2024-11-15", lastUsed: "2024-11-30" }
    ]
  });

  const [backupSettings, setBackupSettings] = React.useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
    backupLocation: "cloud",
    backupEncryption: true,
    lastBackup: "2024-12-01 10:30:00",
    nextBackup: "2024-12-02 10:30:00"
  });

      
      const handleSaveSettings = () => {
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
          setIsLoading(false);
          
          addToast({
            title: "Settings Saved",
            description: "Your settings have been saved successfully.",
            color: "success",
          });
        }, 1000);
      };
      
  const handleCreateApiKey = () => {
    if (!newApiKey.name) {
      addToast({
        title: "Error",
        description: "Please enter a name for the API key.",
        color: "danger",
      });
      return;
    }

    const newKey = {
      id: Date.now(),
      name: newApiKey.name,
      key: `sk-${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never"
    };

    setApiSettings(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, newKey]
    }));

    setNewApiKey({ name: "", description: "" });
    setIsApiModalOpen(false);
    
    addToast({
      title: "API Key Created",
      description: "New API key has been created successfully.",
      color: "success",
    });
  };

  const handleDeleteApiKey = (id: number) => {
    setApiSettings(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter(key => key.id !== id)
    }));
    
    addToast({
      title: "API Key Deleted",
      description: "API key has been deleted successfully.",
      color: "success",
    });
  };

      
      // Render different settings forms based on active tab
      const renderSettingsForm = () => {
        switch (activeTab) {
      case "general":
            return (
          <GeneralSettings 
            settings={generalSettings} 
            onSettingsChange={(field, value) => setGeneralSettings(prev => ({ ...prev, [field]: value }))} 
          />
            );
            
          case "company":
            return (
          <CompanySettings 
            settings={companySettings} 
            onSettingsChange={(field, value) => setCompanySettings(prev => ({ ...prev, [field]: value }))} 
          />
        );
      
      case "localization":
        return (
          <LocalizationSettings 
            settings={localizationSettings} 
            onSettingsChange={(field, value) => setLocalizationSettings(prev => ({ ...prev, [field]: value }))} 
          />
            );
            
          case "email":
            return (
          <EmailSettings 
            settings={emailSettings} 
            onSettingsChange={(field, value) => setEmailSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "notification":
        return (
          <NotificationSettings 
            settings={notificationSettings} 
            onSettingsChange={(field, value) => setNotificationSettings(prev => ({ ...prev, [field]: value }))} 
          />
            );
            
          case "integration":
            return (
          <IntegrationSettings 
            settings={integrationSettings} 
            onSettingsChange={(field, value) => setIntegrationSettings(prev => ({ ...prev, [field]: value }))} 
          />
            );
            
          case "security":
            return (
          <SecuritySettings 
            settings={securitySettings} 
            onSettingsChange={(field, value) => setSecuritySettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "backup":
        return (
          <BackupSettings 
            settings={backupSettings} 
            onSettingsChange={(field, value) => setBackupSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "api":
        return (
          <ApiManagement 
            settings={apiSettings}
            onSettingsChange={(field, value) => setApiSettings(prev => ({ ...prev, [field]: value }))}
            onCreateApiKey={() => setIsApiModalOpen(true)}
            onDeleteApiKey={handleDeleteApiKey}
          />
        );


      case "workflow":
        return (
          <WorkflowSettings 
            settings={workflowSettings} 
            onSettingsChange={(field, value) => setWorkflowSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "reports":
        return (
          <ReportsSettings 
            settings={reportsSettings} 
            onSettingsChange={(field, value) => setReportsSettings(prev => ({ ...prev, [field]: value }))} 
          />
            );

      case "offer-letter":
        return (
          <OfferLetterSettings 
            settings={offerLetterSettings} 
            onSettingsChange={(field, value) => setOfferLetterSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "joining-letter":
        return (
          <JoiningLetterSettings 
            settings={joiningLetterSettings} 
            onSettingsChange={(field, value) => setJoiningLetterSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "certificate":
            return (
          <CertificateSettings 
            settings={certificateSettings} 
            onSettingsChange={(field, value) => setCertificateSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "noc":
        return (
          <NOCSettings 
            settings={nocSettings} 
            onSettingsChange={(field, value) => setNocSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "google-calendar":
        return (
          <GoogleCalendarSettings 
            settings={googleCalendarSettings} 
            onSettingsChange={(field, value) => setGoogleCalendarSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "seo":
        return (
          <SEOSettings 
            settings={seoSettings} 
            onSettingsChange={(field, value) => setSeoSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "cache":
        return (
          <CacheSettings 
            settings={cacheSettings} 
            onSettingsChange={(field, value) => setCacheSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "webhook":
        return (
          <WebhookSettings 
            settings={webhookSettings} 
            onSettingsChange={(field, value) => setWebhookSettings(prev => ({ ...prev, [field]: value }))}
            onAddWebhook={() => console.log("Add webhook")}
            onEditWebhook={(webhook) => console.log("Edit webhook", webhook)}
            onDeleteWebhook={(id) => console.log("Delete webhook", id)}
            onTestWebhook={(id) => console.log("Test webhook", id)}
          />
        );

      case "cookie-consent":
        return (
          <CookieConsentSettings 
            settings={cookieConsentSettings} 
            onSettingsChange={(field, value) => setCookieConsentSettings(prev => ({ ...prev, [field]: value }))} 
          />
        );

      case "chatgpt":
            return (
          <ChatGPTSettings 
            settings={chatgptSettings} 
            onSettingsChange={(field, value) => setChatgptSettings(prev => ({ ...prev, [field]: value }))} 
          />
            );
            
          default:
            return (
              <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Select a settings category from the sidebar</p>
              </div>
            );
        }
      };
      
      return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your application settings and preferences</p>
            </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="bordered"
              startContent={<Icon icon="lucide:download" />}
              className="border-gray-300"
            >
              Export Settings
            </Button>
            <Button 
              color="primary" 
              onPress={handleSaveSettings}
              isLoading={isLoading}
              startContent={<Icon icon="lucide:save" />}
              className="shadow-lg"
            >
              Save Settings
            </Button>
          </div>
        </div>
          </div>
          
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <h3 className="text-lg font-semibold">Settings Categories</h3>
            </CardHeader>
              <CardBody className="p-0">
              <div className="space-y-1">
                  {settingsTabs.map((tab) => (
                  <button
                      key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      activeTab === tab.key ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activeTab === tab.key ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <Icon 
                          icon={tab.icon} 
                          className={`text-lg ${
                            activeTab === tab.key ? 'text-primary-600' : 'text-gray-600'
                          }`} 
                        />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          activeTab === tab.key ? 'text-primary-600' : 'text-gray-900'
                        }`}>
                          {tab.title}
                        </p>
                        <p className="text-xs text-gray-500">{tab.description}</p>
                      </div>
                        </div>
                  </button>
                  ))}
              </div>
              </CardBody>
            </Card>
            
            {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardBody className="p-6">
                {renderSettingsForm()}
              </CardBody>
            </Card>
          </div>
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
