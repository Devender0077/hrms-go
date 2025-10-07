import React from 'react';
import { Card, CardBody, CardHeader, Chip, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import DynamicPageTitle from '../components/common/DynamicPageTitle';

interface Version {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  features: string[];
  fixes: string[];
  improvements: string[];
}

const versionHistory: Version[] = [
  {
    version: '2.4.2',
    date: '2025-01-07',
    type: 'minor',
    features: [],
    fixes: [
      'Fixed roles table UI design with modern styling',
      'Added progress bars for permission counts',
      'Enhanced search functionality with clear button',
      'Improved responsive design for mobile devices'
    ],
    improvements: [
      'Better visual hierarchy and spacing',
      'Enhanced hover effects and transitions',
      'Improved accessibility with proper ARIA labels',
      'Better status indicators with icons'
    ]
  },
  {
    version: '2.4.1',
    date: '2025-01-07',
    type: 'patch',
    features: [],
    fixes: [
      'Fixed 404 errors for deleted test pages',
      'Removed unnecessary files and scripts',
      'Cleaned up project structure'
    ],
    improvements: [
      'Reduced repository size by 2,930 lines',
      'Cleaner project structure',
      'Production-ready codebase'
    ]
  },
  {
    version: '2.4.0',
    date: '2025-01-07',
    type: 'minor',
    features: [
      'Fixed permission counts display for all roles',
      'Optimized SQL queries with proper JOIN conditions',
      'Complete role setup with appropriate permissions'
    ],
    fixes: [
      'Fixed roles page showing incorrect permission counts',
      'Corrected SQL query in user.routes.js',
      'Fixed frontend permission filtering',
      'Resolved permission count display issues'
    ],
    improvements: [
      'Enhanced permission management UI',
      'Improved API performance for permission queries',
      'Better role hierarchy with proper permission distribution'
    ]
  },
  {
    version: '2.3.0',
    date: '2025-01-06',
    type: 'minor',
    features: [
      'Comprehensive permission system with 224 permissions',
      'Role-based access control with complete permission management',
      'Enhanced authentication with proper role mapping',
      'Permission management UI with interactive roles page',
      'Select All functionality for bulk permission assignment',
      'Version History page with complete release notes',
      'Enhanced search with keyboard shortcuts (Ctrl/Cmd + K)',
      'Smart notifications with interactive notification system',
      'Dynamic system status and version display in sidebar',
      'Comprehensive demo data across all HR modules',
      'Advanced audit system with comprehensive logging',
      'Webhook integration with event-driven system'
    ],
    fixes: [
      'Authentication system login issues and role mapping problems',
      'Permission checking Access Denied errors for super admin users',
      'Roles page No Permissions Found error in permission management',
      'API endpoints permission API endpoints and data structure',
      'Frontend permission logic usePermissions hook for admin role',
      'Database permissions assigned all 224 permissions to super admin role',
      'Modal functionality permission modal loading and selection',
      'API connection resolved ERR_CONNECTION_REFUSED errors',
      'Settings context fixed undefined settings errors',
      'Auth service corrected permission fetching and token handling'
    ],
    improvements: [
      'Permission architecture complete permission system with 19 modules',
      'Role management enhanced role-based access control',
      'Authentication flow improved login process with proper role mapping',
      'Database structure enhanced permissions and role_permissions tables',
      'Frontend security better permission checking and access control',
      'User experience fixed all access denied issues for super admin users',
      'API performance optimized permission loading and caching',
      'Error handling better error messages and user feedback',
      'Debug logging added comprehensive logging for troubleshooting'
    ]
  }
];

const getVersionTypeColor = (type: string) => {
  switch (type) {
    case 'major': return 'danger';
    case 'minor': return 'warning';
    case 'patch': return 'success';
    default: return 'default';
  }
};

const getVersionTypeIcon = (type: string) => {
  switch (type) {
    case 'major': return 'lucide:zap';
    case 'minor': return 'lucide:plus';
    case 'patch': return 'lucide:bug';
    default: return 'lucide:tag';
  }
};

export default function VersionHistory() {
  return (
    <div className="space-y-6">
      <DynamicPageTitle pageName="Version History" />
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <Icon icon="lucide:git-branch" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Version History</h1>
          <p className="text-default-500">Track all releases, features, and improvements</p>
        </div>
      </div>

      {/* Version List */}
      <div className="space-y-4">
        {versionHistory.map((version, index) => (
          <Card key={version.version} className="shadow-sm border border-default-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Chip
                    color={getVersionTypeColor(version.type)}
                    variant="flat"
                    startContent={<Icon icon={getVersionTypeIcon(version.type)} className="w-3 h-3" />}
                  >
                    {version.type.toUpperCase()}
                  </Chip>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">v{version.version}</h3>
                    <p className="text-sm text-default-500">{version.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:calendar" className="w-4 h-4 text-default-400" />
                  <span className="text-sm text-default-500">{version.date}</span>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-4">
                {/* Features */}
                {version.features.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="lucide:star" className="w-4 h-4 text-success-500" />
                      <h4 className="font-semibold text-foreground">New Features</h4>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {version.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-default-600 flex items-start gap-2">
                          <Icon icon="lucide:check" className="w-3 h-3 text-success-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bug Fixes */}
                {version.fixes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="lucide:bug" className="w-4 h-4 text-danger-500" />
                      <h4 className="font-semibold text-foreground">Bug Fixes</h4>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {version.fixes.map((fix, idx) => (
                        <li key={idx} className="text-sm text-default-600 flex items-start gap-2">
                          <Icon icon="lucide:check" className="w-3 h-3 text-danger-500 mt-0.5 flex-shrink-0" />
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {version.improvements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="lucide:trending-up" className="w-4 h-4 text-primary-500" />
                      <h4 className="font-semibold text-foreground">Improvements</h4>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {version.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm text-default-600 flex items-start gap-2">
                          <Icon icon="lucide:check" className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <Card className="shadow-sm border border-default-200">
        <CardBody className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon icon="lucide:heart" className="w-4 h-4 text-danger-500" />
            <span className="text-sm text-default-500">Built with love using modern web technologies</span>
          </div>
          <p className="text-xs text-default-400">
            HRMS HUI v2 - Empowering organizations with modern HR management solutions
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
