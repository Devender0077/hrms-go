export const up = async (connection) => {
  try {
    console.log('Running migration: Add basic demo data...');
    
    // 1. Add sample system settings
    await connection.execute(`
      INSERT IGNORE INTO system_settings (company_id, setting_key, setting_value) VALUES
      (1, 'siteName', 'HRMS HUI v2'),
      (1, 'siteDescription', 'Modern Human Resource Management System'),
      (1, 'primaryColor', '#3b82f6'),
      (1, 'secondaryColor', '#64748b'),
      (1, 'accentColor', '#f59e0b'),
      (1, 'maintenanceMode', 'false'),
      (1, 'debugMode', 'false'),
      (1, 'timezone', 'America/New_York'),
      (1, 'dateFormat', 'MM/DD/YYYY'),
      (1, 'timeFormat', '12h'),
      (1, 'currency', 'USD'),
      (1, 'currencySymbol', '$'),
      (1, 'itemsPerPage', '10'),
      (1, 'sessionTimeout', '30'),
      (1, 'passwordMinLength', '8'),
      (1, 'requireEmailVerification', 'true'),
      (1, 'allowSelfRegistration', 'false'),
      (1, 'defaultLanguage', 'en'),
      (1, 'enableNotifications', 'true'),
      (1, 'enableAuditLog', 'true')
    `);
    console.log('✅ Added system settings');
    
    // 2. Add sample tasks
    await connection.execute(`
      INSERT IGNORE INTO tasks (id, title, description, assigned_to, assigned_by, priority, status, due_date, created_at) VALUES
      (1, 'Complete Q1 Report', 'Prepare and submit quarterly financial report', 1, 1, 'high', 'in_progress', '2024-03-31', '2024-02-01'),
      (2, 'Update Employee Handbook', 'Review and update company employee handbook', 1, 1, 'medium', 'pending', '2024-03-15', '2024-02-01'),
      (3, 'Database Optimization', 'Optimize database performance and queries', 1, 1, 'medium', 'completed', '2024-02-15', '2024-02-01'),
      (4, 'System Security Review', 'Conduct comprehensive security audit', 1, 1, 'high', 'pending', '2024-03-10', '2024-02-01'),
      (5, 'User Training Session', 'Conduct training for new features', 1, 1, 'low', 'pending', '2024-03-20', '2024-02-01')
    `);
    console.log('✅ Added sample tasks');
    
    // 3. Add sample calendar events
    await connection.execute(`
      INSERT IGNORE INTO calendar_events (id, title, description, start_date, end_date, event_type, location, created_by, is_all_day) VALUES
      (1, 'Team Meeting', 'Weekly team standup meeting', '2024-02-05 10:00:00', '2024-02-05 11:00:00', 'meeting', 'Conference Room A', 1, 0),
      (2, 'Company All Hands', 'Monthly company all hands meeting', '2024-02-15 14:00:00', '2024-02-15 16:00:00', 'meeting', 'Main Auditorium', 1, 0),
      (3, 'Holiday - Presidents Day', 'Presidents Day Holiday', '2024-02-19 00:00:00', '2024-02-19 23:59:59', 'holiday', 'Office Closed', 1, 1),
      (4, 'Training Session', 'New employee orientation training', '2024-02-22 09:00:00', '2024-02-22 17:00:00', 'training', 'Training Room', 1, 0),
      (5, 'Performance Review', 'Q1 Performance Review Period', '2024-03-01 00:00:00', '2024-03-31 23:59:59', 'review', 'Various Locations', 1, 1)
    `);
    console.log('✅ Added sample calendar events');
    
    // 4. Add sample attendance records for the admin user
    await connection.execute(`
      INSERT IGNORE INTO attendance_records (id, employee_id, date, check_in_time, check_out_time, total_hours, status, notes) VALUES
      (1, 1, '2024-02-01', '2024-02-01 09:00:00', '2024-02-01 17:00:00', 8.00, 'present', 'Regular working day'),
      (2, 1, '2024-02-02', '2024-02-02 09:00:00', '2024-02-02 17:00:00', 8.00, 'present', 'Regular working day'),
      (3, 1, '2024-02-03', '2024-02-03 09:00:00', '2024-02-03 17:00:00', 8.00, 'present', 'Regular working day'),
      (4, 1, '2024-02-04', '2024-02-04 09:00:00', '2024-02-04 17:00:00', 8.00, 'present', 'Regular working day'),
      (5, 1, '2024-02-05', '2024-02-05 09:00:00', '2024-02-05 17:00:00', 8.00, 'present', 'Regular working day')
    `);
    console.log('✅ Added sample attendance records');
    
    console.log('🎉 Basic demo data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Remove basic demo data...');
    
    // Remove demo data in reverse order
    await connection.execute('DELETE FROM attendance_records WHERE id IN (1,2,3,4,5)');
    await connection.execute('DELETE FROM calendar_events WHERE id IN (1,2,3,4,5)');
    await connection.execute('DELETE FROM tasks WHERE id IN (1,2,3,4,5)');
    await connection.execute('DELETE FROM system_settings WHERE company_id = 1');
    
    console.log('✅ Rollback completed: Basic demo data removed');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};
