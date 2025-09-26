-- =====================================================
-- COMPREHENSIVE LEAVE MANAGEMENT SYSTEM SCHEMA
-- =====================================================

-- Leave Types Table (Enhanced)
CREATE TABLE IF NOT EXISTS leave_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  max_days_per_year INT DEFAULT 0,
  max_consecutive_days INT DEFAULT 0,
  requires_approval BOOLEAN DEFAULT TRUE,
  requires_documentation BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT TRUE,
  carry_forward BOOLEAN DEFAULT FALSE,
  max_carry_forward_days INT DEFAULT 0,
  gender_restriction ENUM('all', 'male', 'female') DEFAULT 'all',
  min_service_days INT DEFAULT 0,
  advance_notice_days INT DEFAULT 0,
  color_code VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Leave Policies Table
CREATE TABLE IF NOT EXISTS leave_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  policy_type ENUM('general', 'department_specific', 'employee_specific') DEFAULT 'general',
  department_id INT NULL,
  employee_id INT NULL,
  leave_type_id INT NOT NULL,
  max_days_per_year INT DEFAULT 0,
  max_consecutive_days INT DEFAULT 0,
  requires_approval BOOLEAN DEFAULT TRUE,
  approval_workflow JSON,
  is_active BOOLEAN DEFAULT TRUE,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Leave Applications Table (Enhanced)
CREATE TABLE IF NOT EXISTS leave_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id VARCHAR(50) UNIQUE NOT NULL,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT NOT NULL,
  emergency_contact VARCHAR(255),
  attachment VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  rejection_reason TEXT,
  cancelled_at DATETIME NULL,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Leave Balances Table
CREATE TABLE IF NOT EXISTS leave_balances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  year YEAR NOT NULL,
  total_allocated INT DEFAULT 0,
  total_used INT DEFAULT 0,
  total_approved INT DEFAULT 0,
  total_pending INT DEFAULT 0,
  carry_forward_from_previous INT DEFAULT 0,
  carry_forward_to_next INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
);

-- Leave Approvals Table (For Multi-level Approval)
CREATE TABLE IF NOT EXISTS leave_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  leave_application_id INT NOT NULL,
  approver_id INT NOT NULL,
  approval_level INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  comments TEXT,
  approved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (leave_application_id) REFERENCES leave_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leave Holidays Table
CREATE TABLE IF NOT EXISTS leave_holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type ENUM('national', 'regional', 'company', 'floating') DEFAULT 'company',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern ENUM('yearly', 'monthly', 'weekly') NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Leave Workflows Table
CREATE TABLE IF NOT EXISTS leave_workflows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leave_type_id INT NULL,
  department_id INT NULL,
  approval_levels JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Leave Notifications Table
CREATE TABLE IF NOT EXISTS leave_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  leave_application_id INT NOT NULL,
  user_id INT NOT NULL,
  notification_type ENUM('application_submitted', 'application_approved', 'application_rejected', 'application_cancelled', 'reminder') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leave_application_id) REFERENCES leave_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- INSERT DEFAULT LEAVE TYPES
-- =====================================================

INSERT INTO leave_types (company_id, name, code, description, max_days_per_year, max_consecutive_days, requires_approval, requires_documentation, is_paid, carry_forward, color_code) VALUES
(1, 'Annual Leave', 'AL', 'Annual vacation leave', 21, 14, TRUE, FALSE, TRUE, TRUE, '#10B981'),
(1, 'Sick Leave', 'SL', 'Medical leave for illness', 12, 7, TRUE, TRUE, TRUE, FALSE, '#EF4444'),
(1, 'Personal Leave', 'PL', 'Personal time off', 5, 3, TRUE, FALSE, FALSE, FALSE, '#8B5CF6'),
(1, 'Maternity Leave', 'ML', 'Maternity leave for new mothers', 90, 90, TRUE, TRUE, TRUE, FALSE, '#EC4899'),
(1, 'Paternity Leave', 'PTL', 'Paternity leave for new fathers', 7, 7, TRUE, FALSE, TRUE, FALSE, '#06B6D4'),
(1, 'Emergency Leave', 'EL', 'Emergency situations', 3, 3, FALSE, FALSE, FALSE, FALSE, '#F59E0B'),
(1, 'Study Leave', 'STL', 'Educational leave', 10, 5, TRUE, TRUE, FALSE, FALSE, '#6366F1'),
(1, 'Bereavement Leave', 'BL', 'Death in family', 3, 3, FALSE, FALSE, TRUE, FALSE, '#6B7280');

-- =====================================================
-- INSERT DEFAULT HOLIDAYS
-- =====================================================

INSERT INTO leave_holidays (company_id, name, date, type, is_recurring, description) VALUES
(1, 'New Year', '2024-01-01', 'national', TRUE, 'New Year Day'),
(1, 'Independence Day', '2024-08-15', 'national', TRUE, 'Independence Day'),
(1, 'Gandhi Jayanti', '2024-10-02', 'national', TRUE, 'Mahatma Gandhi Birthday'),
(1, 'Christmas', '2024-12-25', 'national', TRUE, 'Christmas Day'),
(1, 'Company Foundation Day', '2024-06-15', 'company', TRUE, 'Company Foundation Anniversary');

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_leave_applications_employee ON leave_applications(employee_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_dates ON leave_applications(start_date, end_date);
CREATE INDEX idx_leave_balances_employee_year ON leave_balances(employee_id, year);
CREATE INDEX idx_leave_approvals_application ON leave_approvals(leave_application_id);
CREATE INDEX idx_leave_holidays_company_date ON leave_holidays(company_id, date);
CREATE INDEX idx_leave_notifications_user ON leave_notifications(user_id, is_read);
