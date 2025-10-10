/**
 * Migration: Add Missing Permissions for New Features
 * - Messenger permissions (create, delete, update, etc.)
 * - Profile permissions (view, update, face_recognition)
 * - Organization chart permissions
 * - Roles management permissions
 * - Additional dashboard permissions
 */

exports.up = async function(connection) {
  try {
    console.log('🔄 Adding missing permissions for new features...');

    // Define new permissions to add
    const newPermissions = [
      // Messenger permissions (expand from 1 to full CRUD)
      { name: 'messenger.view', module: 'messenger', description: 'View messenger and conversations' },
      { name: 'messenger.create', module: 'messenger', description: 'Create new messages and conversations' },
      { name: 'messenger.update', module: 'messenger', description: 'Update messages' },
      { name: 'messenger.delete', module: 'messenger', description: 'Delete messages' },
      { name: 'messenger.groups.view', module: 'messenger', description: 'View group conversations' },
      { name: 'messenger.groups.create', module: 'messenger', description: 'Create group conversations' },
      { name: 'messenger.groups.manage', module: 'messenger', description: 'Manage group members and settings' },
      
      // Profile permissions
      { name: 'profile.view', module: 'profile', description: 'View own profile' },
      { name: 'profile.update', module: 'profile', description: 'Update own profile' },
      { name: 'profile.face_recognition', module: 'profile', description: 'Use face recognition features' },
      { name: 'profile.emergency_contact', module: 'profile', description: 'Manage emergency contact' },
      
      // Roles management permissions
      { name: 'roles.view', module: 'users', description: 'View roles' },
      { name: 'roles.create', module: 'users', description: 'Create new roles' },
      { name: 'roles.update', module: 'users', description: 'Update existing roles' },
      { name: 'roles.delete', module: 'users', description: 'Delete roles' },
      { name: 'roles.manage_permissions', module: 'users', description: 'Manage role permissions' },
      
      // Organization chart permissions
      { name: 'organization.chart.view', module: 'organization', description: 'View organization chart' },
      { name: 'organization.chart.export', module: 'organization', description: 'Export organization chart' },
      
      // Dashboard advanced permissions
      { name: 'dashboard.analytics', module: 'dashboard', description: 'View advanced analytics' },
      { name: 'dashboard.export', module: 'dashboard', description: 'Export dashboard reports' },
      { name: 'dashboard.company_admin', module: 'dashboard', description: 'Access company admin dashboard' },
      { name: 'dashboard.super_admin', module: 'dashboard', description: 'Access super admin dashboard' },
      
      // Additional features
      { name: 'announcements.view', module: 'announcements', description: 'View announcements' },
      { name: 'announcements.create', module: 'announcements', description: 'Create announcements' },
      { name: 'meetings.view', module: 'meetings', description: 'View meetings' },
      { name: 'meetings.create', module: 'meetings', description: 'Schedule meetings' },
      { name: 'trips.view', module: 'trips', description: 'View business trips' },
      { name: 'trips.create', module: 'trips', description: 'Create trip requests' },
      { name: 'landing_page.manage', module: 'settings', description: 'Manage landing page' },
      { name: 'media_library.view', module: 'documents', description: 'View media library' },
      { name: 'media_library.upload', module: 'documents', description: 'Upload to media library' },
    ];

    // Insert permissions one by one to avoid duplicates
    for (const perm of newPermissions) {
      try {
        // Check if permission already exists
        const [existing] = await connection.execute(
          'SELECT id FROM permissions WHERE name = ?',
          [perm.name]
        );

        if (existing.length === 0) {
          await connection.execute(
            'INSERT INTO permissions (name, permission_name, module, description) VALUES (?, ?, ?, ?)',
            [perm.name, perm.name, perm.module, perm.description]
          );
          console.log(`✅ Added permission: ${perm.name}`);
        } else {
          console.log(`⏭️  Permission already exists: ${perm.name}`);
        }
      } catch (error) {
        console.warn(`⚠️  Error adding permission ${perm.name}:`, error.message);
      }
    }
    
    console.log('✅ Missing permissions migration completed');
    return true;
  } catch (error) {
    console.error('❌ Error in missing permissions migration:', error);
    throw error;
  }
};

exports.down = async function(connection) {
  try {
    console.log('🔄 Rolling back missing permissions...');
    
    // Delete the permissions we added
    const permissionsToRemove = [
      'messenger.create', 'messenger.update', 'messenger.delete',
      'messenger.groups.view', 'messenger.groups.create', 'messenger.groups.manage',
      'profile.view', 'profile.update', 'profile.face_recognition', 'profile.emergency_contact',
      'roles.view', 'roles.create', 'roles.update', 'roles.delete', 'roles.manage_permissions',
      'organization.chart.view', 'organization.chart.export',
      'dashboard.analytics', 'dashboard.export', 'dashboard.company_admin', 'dashboard.super_admin',
      'announcements.view', 'announcements.create',
      'meetings.view', 'meetings.create',
      'trips.view', 'trips.create',
      'landing_page.manage', 'media_library.view', 'media_library.upload'
    ];
    
    for (const permName of permissionsToRemove) {
      await connection.execute(
        'DELETE FROM permissions WHERE name = ?',
        [permName]
      );
    }
    
    console.log('✅ Rollback completed');
    return true;
  } catch (error) {
    console.error('❌ Error in rollback:', error);
    throw error;
  }
};
