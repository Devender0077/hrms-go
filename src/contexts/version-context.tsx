import React, { createContext, useContext, useState, useEffect } from 'react';

interface VersionContextType {
  currentVersion: string;
  updateVersion: (version: string) => void;
  getVersionHistory: () => any[];
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const useVersion = () => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};

interface VersionProviderProps {
  children: React.ReactNode;
}

export const VersionProvider: React.FC<VersionProviderProps> = ({ children }) => {
  const [currentVersion, setCurrentVersion] = useState('2.9.0');

  const updateVersion = (version: string) => {
    setCurrentVersion(version);
    // You could also update package.json or a config file here
  };

  const getVersionHistory = () => {
    return [
      {
        version: '2.7.0',
        date: '2025-01-10',
        type: 'minor',
        features: [
          'Real-Time Messenger System with direct messaging',
          'Group Messaging with 6 group types (Team Lead, Management, Accounts, HR, Department, Custom)',
          'Pusher WebSocket integration for real-time message delivery',
          'HR System Setup integration for messenger management',
          '16 new API endpoints for messaging and groups',
          'Message groups with admin-only member controls',
          'Read receipts with double-check marks',
          'Unread message counts and online status indicators',
          'Message history and auto-scroll to latest'
        ],
        fixes: [
          'Fixed Leave Reports API malformed calls (GET http://localhost:8000/api/v1GET 404)',
          'Resolved messenger routes database column mapping (recipient_id, body)',
          'Fixed null-safe filtering in messenger UI',
          'Corrected database seeder permission_name column',
          'Fixed settings table category column usage'
        ],
        improvements: [
          'Expanded backend from 19 to 20 modular routes',
          'Enhanced database with message_groups and message_group_members tables',
          'Added 3 new permissions (messenger.view, groups.create, groups.manage)',
          'Improved security with permission-based access and group membership verification',
          'Enhanced UI with color-coded group type badges and member selection'
        ]
      },
      {
        version: '2.6.0',
        date: '2025-01-08',
        type: 'minor',
        features: [
          'Real-Time Integrations System (Pusher, Slack, Microsoft Teams, Zoom, Google Calendar/Drive)',
          'Test connection buttons for all integrations',
          'Integration services with unified backend layer',
          'Enhanced settings persistence with category column',
          'Toast notifications for settings changes',
          'Attendance location tracking (latitude, longitude, IP address)',
          'SDK installation for Twilio, SendGrid, AWS S3'
        ],
        fixes: [
          'Fixed settings not persisting after page refresh',
          'Resolved duplicate Pusher and Microsoft Teams sections',
          'Fixed attendance records API 500 error',
          'Corrected JSON parsing for integration settings',
          'Fixed audit logs 404 errors by registering routes'
        ],
        improvements: [
          'Enhanced database queries with proper JSON parsing',
          'Improved UI with loading states and success/error messages',
          'Added 19 backend modules with integration endpoints',
          'Better error handling and detailed logging',
          'Cleaner interface with removed unnecessary borders'
        ]
      },
      {
        version: '2.5.2',
        date: '2025-01-05',
        type: 'patch',
        features: [],
        fixes: [
          'Fixed attendance records API 500 error with proper SQL query',
          'Fixed audit logs 404 by registering audit-logs routes',
          'Resolved check-in/check-out button states logic',
          'Fixed role-based filtering for attendance records'
        ],
        improvements: [
          'UI cleanup: Removed drop shadows and borders for modern flat design',
          'Better visual hierarchy with focus on content',
          'Consistent styling across all components',
          'Improved error handling with graceful fallbacks'
        ]
      },
      {
        version: '2.5.1',
        date: '2025-01-03',
        type: 'patch',
        features: [
          'Universal deployment system with one-command setup',
          'Automated database setup with comprehensive seeding',
          'PM2 integration for production process management',
          'Docker support with docker-compose configuration',
          'Environment templates for easy configuration'
        ],
        fixes: [
          'Fixed database seeding for new environments',
          'Resolved migration tracking to prevent duplicates',
          'Fixed default user and permission creation'
        ],
        improvements: [
          'Complete deployment documentation (DEPLOYMENT.md)',
          'Universal compatibility (Local, VPS, AWS, DigitalOcean, etc.)',
          'Smart migration system with rollback safety',
          'Post-setup verification for all tables and data'
        ]
      },
      {
        version: '2.5.0',
        date: '2024-12-30',
        type: 'minor',
        features: [
          'Multi-language support for 10 languages (English, Hindi, Spanish, French, German, Chinese, Arabic, Portuguese, Russian, Japanese)',
          'Country-wise holiday management (India + USA with 24 holidays)',
          'Logo & favicon upload functionality',
          'Language selector in top navbar and settings',
          'Enhanced color picker with visual swatches',
          'Mobile responsive design with permission-based navigation'
        ],
        fixes: [
          'Fixed settings page not saving changes',
          'Resolved integration toggle switches not working',
          'Fixed holidays API 500 errors',
          'Corrected weekend display (Saturday & Sunday)',
          'Fixed attendance data not reflecting after updates',
          'Resolved mobile sidebar require() error'
        ],
        improvements: [
          'Modern sidebar design with gradient backgrounds',
          'Frosted glass effect and custom scrollbar',
          'Enhanced navigation with rounded buttons and glow effects',
          'Currency support with Indian Rupee and 9 other currencies',
          'Timezone support with IST and 10 other timezones',
          'Smart holiday grouping for duplicate holidays'
        ]
      },
      {
        version: '2.4.4',
        date: '2024-12-28',
        type: 'minor',
        features: [
          'Created comprehensive Training Sessions management system',
          'Built Employee Training tracking with progress monitoring',
          'Developed Project Time Tracking with budget management',
          'Added dynamic version history with real-time updates',
          'Implemented modern UI components matching employees page design'
        ],
        fixes: [
          'Fixed missing training pages causing 404 redirects to dashboard',
          'Resolved routing issues for /dashboard/training/sessions',
          'Fixed routing issues for /dashboard/training/employee-training',
          'Resolved routing issues for /dashboard/time-tracking/projects',
          'Fixed broken imports and variable naming conflicts',
          'Corrected all TypeScript and linting errors in new pages'
        ],
        improvements: [
          'Enhanced sidebar navigation with proper icons and permissions',
          'Improved page consistency with HeroUI design system',
          'Added comprehensive CRUD operations for training management',
          'Implemented advanced filtering and search functionality',
          'Enhanced user experience with loading states and empty states',
          'Added professional table designs with dropdown actions',
          'Improved responsive design for all screen sizes'
        ]
      },
      {
        version: '2.4.3',
        date: '2024-12-28',
        type: 'patch',
        features: [
          'Complete roles system overhaul with CRUD operations',
          'Advanced permission management with bulk operations',
          'Dynamic sidebar based on user permissions'
        ],
        fixes: [
          'Fixed version history page redirecting to dashboard',
          'Corrected super admin login showing employee dashboard',
          'Resolved sidebar dynamic version number display',
          'Fixed comprehensive project audit for pages and database'
        ],
        improvements: [
          'Redesigned roles page UI with modern HeroUI components',
          'Enhanced security with role-based access control',
          'Added safety checks to prevent deletion of roles assigned to users',
          'Improved permission management with better UX'
        ]
      },
      {
        version: '2.4.2',
        date: '2024-12-27',
        type: 'minor',
        features: [],
        fixes: [
          'Fixed incorrect permission counts on roles page for non-super_admin roles',
          'Resolved "No Permissions Found" when clicking "Manage" for a role',
          'Fixed percentage calculation and "undefined Module" display',
          'Corrected API endpoint for loading all permissions'
        ],
        improvements: [
          'Enhanced roles table UI with modern design and responsiveness',
          'Improved search and filter section with clear button and total count',
          'Added visual progress bars for permission counts',
          'Better user experience with improved modals and interactions'
        ]
      },
      {
        version: '2.4.1',
        date: '2024-12-26',
        type: 'patch',
        features: [],
        fixes: [
          'Fixed "Access Denied" for dashboard.view after login',
          'Resolved super_admin login issues and mapped to admin for frontend',
          'Fixed usePermissions hook to treat admin role as super admin',
          'Corrected permission fetching logic in auth-service.ts'
        ],
        improvements: [
          'Updated README.md with new credentials and permission system',
          'Enhanced authentication flow with proper role mapping',
          'Improved permission checking and access control',
          'Better error handling and user feedback'
        ]
      },
      {
        version: '2.4.0',
        date: '2024-12-25',
        type: 'minor',
        features: [
          'Implemented comprehensive permission system with 224 permissions across 19 modules',
          'Added "Select All" functionality to roles permissions page',
          'Created complete role hierarchy with proper permission distribution',
          'Built advanced permission management UI with interactive components'
        ],
        fixes: [
          'Fixed backend server connection issues (ERR_CONNECTION_REFUSED)',
          'Resolved "await" outside "async" function syntax error in auth-service.ts',
          'Fixed React Hooks violation in settings-service.ts',
          'Corrected infinite re-render in useTasks.ts hook'
        ],
        improvements: [
          'Refactored settings-service.ts to use React Hooks correctly',
          'Optimized useTasks.ts to prevent infinite re-renders',
          'Enhanced authentication system with proper token handling',
          'Improved error handling and user feedback throughout the application'
        ]
      }
    ];
  };

  useEffect(() => {
    // Load version from package.json or config
    // For now, we'll use the hardcoded version
    setCurrentVersion('2.7.0');
  }, []);

  const value: VersionContextType = {
    currentVersion,
    updateVersion,
    getVersionHistory
  };

  return (
    <VersionContext.Provider value={value}>
      {children}
    </VersionContext.Provider>
  );
};
