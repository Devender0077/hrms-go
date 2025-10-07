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
  const [currentVersion, setCurrentVersion] = useState('2.4.4');

  const updateVersion = (version: string) => {
    setCurrentVersion(version);
    // You could also update package.json or a config file here
  };

  const getVersionHistory = () => {
    return [
      {
        version: '2.4.4',
        date: new Date().toISOString().split('T')[0],
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
    setCurrentVersion('2.4.4');
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
