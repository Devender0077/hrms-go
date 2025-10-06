-- =====================================================
-- PAYROLL SYSTEM
-- =====================================================
-- Salary management, payroll processing, and employee contracts

-- Salary Components Table
CREATE TABLE IF NOT EXISTS salary_components (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('earning', 'deduction') NOT NULL,
  is_taxable BOOLEAN DEFAULT FALSE,
  is_fixed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Employee Salaries Table
CREATE TABLE IF NOT EXISTS employee_salaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  basic_salary DECIMAL(15,2) NOT NULL,
  effective_date DATE NOT NULL,
  end_date DATE,
  payment_type ENUM('monthly', 'weekly', 'biweekly', 'hourly') DEFAULT 'monthly',
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Salary Components Table
CREATE TABLE IF NOT EXISTS employee_salary_components (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_salary_id INT NOT NULL,
  salary_component_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_salary_id) REFERENCES employee_salaries(id) ON DELETE CASCADE,
  FOREIGN KEY (salary_component_id) REFERENCES salary_components(id) ON DELETE CASCADE
);

-- Payslips Table
CREATE TABLE IF NOT EXISTS payslips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  basic_salary DECIMAL(15,2) NOT NULL,
  total_earnings DECIMAL(15,2) NOT NULL,
  total_deductions DECIMAL(15,2) NOT NULL,
  net_salary DECIMAL(15,2) NOT NULL,
  payment_date DATE,
  payment_method ENUM('bank', 'cash', 'cheque', 'online') DEFAULT 'bank',
  status ENUM('draft', 'generated', 'paid', 'cancelled') DEFAULT 'draft',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Payroll Runs Table
CREATE TABLE IF NOT EXISTS payroll_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  run_id VARCHAR(50) UNIQUE,
  month INT NOT NULL,
  year INT NOT NULL,
  status ENUM('draft', 'processing', 'completed', 'failed') DEFAULT 'draft',
  total_employees INT DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  processed_at DATETIME NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Employee Contracts Table
CREATE TABLE IF NOT EXISTS employee_contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  contract_type ENUM('full_time', 'part_time', 'contract', 'internship') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  salary DECIMAL(10,2) NULL,
  status ENUM('active', 'expired', 'terminated') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
