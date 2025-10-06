-- =====================================================
-- DEFAULT DATA
-- =====================================================
-- Insert default data for the system to work properly

-- Insert default company
INSERT IGNORE INTO companies (id, name, legal_name, email, phone, address, city, state, country, zip_code)
VALUES (1, 'HRMS Company', 'HRMS Company Ltd.', 'admin@hrms.com', '+1-555-0123', '123 Business St', 'Business City', 'Business State', 'Business Country', '12345');

-- Insert default permissions
INSERT IGNORE INTO permissions (permission_name, name, description, module) VALUES
('users.create', 'Create Users', 'Create new user accounts', 'users'),
('users.read', 'Read Users', 'View user information', 'users'),
('users.update', 'Update Users', 'Modify user information', 'users'),
('users.delete', 'Delete Users', 'Remove user accounts', 'users'),
('employees.create', 'Create Employees', 'Add new employees', 'employees'),
('employees.read', 'Read Employees', 'View employee information', 'employees'),
('employees.update', 'Update Employees', 'Modify employee information', 'employees'),
('employees.delete', 'Delete Employees', 'Remove employee records', 'employees'),
('attendance.read', 'Read Attendance', 'View attendance records', 'attendance'),
('attendance.update', 'Update Attendance', 'Modify attendance records', 'attendance'),
('leave.read', 'Read Leave', 'View leave applications', 'leave'),
('leave.approve', 'Approve Leave', 'Approve or reject leave applications', 'leave'),
('payroll.read', 'Read Payroll', 'View payroll information', 'payroll'),
('payroll.process', 'Process Payroll', 'Process monthly payroll', 'payroll'),
('reports.read', 'Read Reports', 'View system reports', 'reports'),
('settings.read', 'Read Settings', 'View system settings', 'settings'),
('settings.update', 'Update Settings', 'Modify system settings', 'settings');

-- Insert default leave types
INSERT IGNORE INTO leave_types (company_id, name, code, description, days_per_year) VALUES
(1, 'Annual Leave', 'AL', 'Annual vacation leave', 21),
(1, 'Sick Leave', 'SL', 'Medical leave for illness', 12),
(1, 'Personal Leave', 'PL', 'Personal time off', 5),
(1, 'Maternity Leave', 'ML', 'Maternity leave for new mothers', 90),
(1, 'Paternity Leave', 'PTL', 'Paternity leave for new fathers', 7);

-- Insert default shifts
INSERT IGNORE INTO shifts (company_id, name, start_time, end_time, working_hours, is_night_shift) VALUES
(1, 'Day Shift', '09:00:00', '17:00:00', 8.0, FALSE),
(1, 'Night Shift', '22:00:00', '06:00:00', 8.0, TRUE),
(1, 'Evening Shift', '14:00:00', '22:00:00', 8.0, FALSE);

-- Insert default holidays
INSERT IGNORE INTO leave_holidays (company_id, name, date, type) VALUES
(1, 'New Year', '2024-01-01', 'national'),
(1, 'Independence Day', '2024-08-15', 'national'),
(1, 'Gandhi Jayanti', '2024-10-02', 'national'),
(1, 'Christmas', '2024-12-25', 'national'),
(1, 'Company Foundation Day', '2024-06-15', 'company');

-- Insert default salary components
INSERT IGNORE INTO salary_components (company_id, name, type, is_taxable, is_fixed) VALUES
(1, 'Basic Salary', 'earning', TRUE, TRUE),
(1, 'House Rent Allowance', 'earning', TRUE, FALSE),
(1, 'Transport Allowance', 'earning', TRUE, FALSE),
(1, 'Medical Allowance', 'earning', TRUE, FALSE),
(1, 'Provident Fund', 'deduction', FALSE, FALSE),
(1, 'Income Tax', 'deduction', FALSE, FALSE),
(1, 'Professional Tax', 'deduction', FALSE, FALSE);

-- Insert default settings
INSERT IGNORE INTO settings (company_id, category, setting_key, setting_value, setting_type) VALUES
(1, 'company', 'name', 'HRMS Company', 'string'),
(1, 'company', 'email', 'admin@hrms.com', 'string'),
(1, 'company', 'phone', '+1-555-0123', 'string'),
(1, 'system', 'timezone', 'UTC', 'string'),
(1, 'system', 'date_format', 'YYYY-MM-DD', 'string'),
(1, 'system', 'currency', 'USD', 'string'),
(1, 'attendance', 'working_hours', '8', 'number'),
(1, 'attendance', 'grace_period', '15', 'number');
