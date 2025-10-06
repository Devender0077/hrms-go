export const up = async (connection) => {
  try {
    console.log('Running migration: Create default departments, designations, and employee records...');
    
    // Create default departments
    await connection.execute(`
      INSERT IGNORE INTO departments (id, company_id, name, code, description, status, created_at, updated_at) 
      VALUES 
        (1, 1, 'Administration', 'ADMIN', 'Administrative department', 'active', NOW(), NOW()),
        (2, 1, 'Human Resources', 'HR', 'Human Resources department', 'active', NOW(), NOW()),
        (3, 1, 'Information Technology', 'IT', 'IT department', 'active', NOW(), NOW())
    `);
    console.log('✅ Created default departments');
    
    // Create default designations
    await connection.execute(`
      INSERT IGNORE INTO designations (id, company_id, department_id, name, code, description, status, created_at, updated_at) 
      VALUES 
        (1, 1, 1, 'Administrator', 'ADMIN', 'System Administrator', 'active', NOW(), NOW()),
        (2, 1, 2, 'HR Manager', 'HRM', 'Human Resources Manager', 'active', NOW(), NOW()),
        (3, 1, 3, 'Software Developer', 'DEV', 'Software Developer', 'active', NOW(), NOW())
    `);
    console.log('✅ Created default designations');
    
    // Create employee record for admin user if it doesn't exist
    await connection.execute(`
      INSERT IGNORE INTO employees (
        user_id, 
        company_id, 
        first_name, 
        last_name, 
        email, 
        employee_id, 
        department_id, 
        designation_id, 
        status, 
        created_at, 
        updated_at
      ) 
      SELECT 
        1, 
        1, 
        'Admin', 
        'User', 
        u.email, 
        'EMP001', 
        1, 
        1, 
        'active', 
        NOW(), 
        NOW()
      FROM users u 
      WHERE u.id = 1 
      AND NOT EXISTS (
        SELECT 1 FROM employees e WHERE e.user_id = 1
      )
    `);
    console.log('✅ Created employee record for admin user');
    
    console.log('✅ Migration completed: Default data created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Remove default data...');
    
    // Remove employee record for admin user
    await connection.execute('DELETE FROM employees WHERE user_id = 1');
    console.log('✅ Removed employee record for admin user');
    
    // Remove default designations
    await connection.execute('DELETE FROM designations WHERE id IN (1, 2, 3)');
    console.log('✅ Removed default designations');
    
    // Remove default departments
    await connection.execute('DELETE FROM departments WHERE id IN (1, 2, 3)');
    console.log('✅ Removed default departments');
    
    console.log('✅ Rollback completed: Default data removed');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};
