-- HRM System Database Schema

    -- Users Table
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      remember_token VARCHAR(100),
      email_verified_at TIMESTAMP NULL,
      role ENUM('super_admin', 'company_admin', 'employee') NOT NULL,
      status ENUM('active', 'inactive') DEFAULT 'active',
      profile_photo VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Companies Table
    CREATE TABLE companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      legal_name VARCHAR(255),
      tax_id VARCHAR(50),
      registration_number VARCHAR(50),
      logo VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(20),
      website VARCHAR(255),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      zip_code VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Branches Table
    CREATE TABLE branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50),
      location VARCHAR(255),
      address TEXT,
      phone VARCHAR(20),
      email VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      zip_code VARCHAR(20),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Departments Table
    CREATE TABLE departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      branch_id INT,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50),
      description TEXT,
      manager_id INT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
    );

    -- Designations Table
    CREATE TABLE designations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      department_id INT,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50),
      description TEXT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    );

    -- Employees Table
    CREATE TABLE employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      company_id INT NOT NULL,
      branch_id INT,
      department_id INT,
      designation_id INT,
      employee_id VARCHAR(50) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      date_of_birth DATE,
      gender ENUM('male', 'female', 'other'),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      zip_code VARCHAR(20),
      joining_date DATE,
      exit_date DATE,
      status ENUM('active', 'inactive', 'on_leave', 'terminated') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL
    );

    -- Employee Documents Table
    CREATE TABLE employee_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      document_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      expiry_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Attendance Table
    CREATE TABLE attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      check_in DATETIME,
      check_out DATETIME,
      status ENUM('present', 'absent', 'late', 'leave') NOT NULL,
      work_hours DECIMAL(5,2),
      ip_address VARCHAR(45),
      location_latitude DECIMAL(10,8),
      location_longitude DECIMAL(11,8),
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Leave Types Table
    CREATE TABLE leave_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50),
      description TEXT,
      days_per_year INT,
      requires_approval BOOLEAN DEFAULT TRUE,
      is_paid BOOLEAN DEFAULT TRUE,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Leave Applications Table
    CREATE TABLE leave_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      leave_type_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_days INT NOT NULL,
      reason TEXT,
      status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
      approved_by INT,
      approved_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Salary Components Table
    CREATE TABLE salary_components (
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
    CREATE TABLE employee_salaries (
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
    CREATE TABLE employee_salary_components (
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
    CREATE TABLE payslips (
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

    -- Job Postings Table
    CREATE TABLE job_postings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      department_id INT,
      designation_id INT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      requirements TEXT,
      responsibilities TEXT,
      location VARCHAR(255),
      job_type ENUM('full_time', 'part_time', 'contract', 'internship', 'remote') DEFAULT 'full_time',
      experience_min INT,
      experience_max INT,
      salary_min DECIMAL(15,2),
      salary_max DECIMAL(15,2),
      vacancies INT DEFAULT 1,
      closing_date DATE,
      status ENUM('draft', 'published', 'closed', 'archived') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL
    );

    -- Job Applications Table
    CREATE TABLE job_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_posting_id INT NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      resume VARCHAR(255) NOT NULL,
      cover_letter TEXT,
      status ENUM('new', 'screening', 'interview', 'testing', 'offer', 'hired', 'rejected') DEFAULT 'new',
      source VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE
    );

    -- Performance Review Cycles Table
    CREATE TABLE performance_cycles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Performance Reviews Table
    CREATE TABLE performance_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cycle_id INT NOT NULL,
      employee_id INT NOT NULL,
      reviewer_id INT NOT NULL,
      overall_rating DECIMAL(3,2),
      comments TEXT,
      status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
      submission_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (cycle_id) REFERENCES performance_cycles(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Training Programs Table
    CREATE TABLE training_programs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      location VARCHAR(255),
      cost DECIMAL(15,2),
      status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Training Participants Table
    CREATE TABLE training_participants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      program_id INT NOT NULL,
      employee_id INT NOT NULL,
      status ENUM('enrolled', 'attending', 'completed', 'dropped') DEFAULT 'enrolled',
      completion_date DATE,
      feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Assets Table
    CREATE TABLE assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      asset_code VARCHAR(50),
      category VARCHAR(100),
      purchase_date DATE,
      purchase_cost DECIMAL(15,2),
      warranty_expiry DATE,
      status ENUM('available', 'assigned', 'under_maintenance', 'disposed') DEFAULT 'available',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Asset Assignments Table
    CREATE TABLE asset_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      employee_id INT NOT NULL,
      assigned_date DATE NOT NULL,
      return_date DATE,
      condition_on_assign TEXT,
      condition_on_return TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Announcements Table
    CREATE TABLE announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      departments VARCHAR(255),
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Documents Table
    CREATE TABLE documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      file_path VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      visibility ENUM('public', 'private', 'restricted') DEFAULT 'private',
      uploaded_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- System Settings Table
    CREATE TABLE system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      setting_key VARCHAR(100) NOT NULL,
      setting_value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Audit Logs Table
    CREATE TABLE audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100),
      entity_id INT,
      old_values TEXT,
      new_values TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Roles Table
    CREATE TABLE roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      permissions JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- User Roles Table
    CREATE TABLE user_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      assigned_by INT,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Offer Letters Table
    CREATE TABLE offer_letters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      candidate_name VARCHAR(255) NOT NULL,
      candidate_email VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      department VARCHAR(255),
      salary DECIMAL(15,2),
      start_date DATE,
      template_content TEXT,
      status ENUM('draft', 'sent', 'accepted', 'declined', 'expired') DEFAULT 'draft',
      sent_at DATETIME,
      expires_at DATETIME,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Joining Letters Table
    CREATE TABLE joining_letters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      template_content TEXT,
      status ENUM('draft', 'sent', 'acknowledged') DEFAULT 'draft',
      sent_at DATETIME,
      acknowledged_at DATETIME,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Experience Certificates Table
    CREATE TABLE experience_certificates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      template_content TEXT,
      status ENUM('draft', 'issued', 'delivered') DEFAULT 'draft',
      issued_at DATETIME,
      delivered_at DATETIME,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- NOC Letters Table
    CREATE TABLE noc_letters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      template_content TEXT,
      status ENUM('draft', 'issued', 'delivered') DEFAULT 'draft',
      issued_at DATETIME,
      delivered_at DATETIME,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Google Calendar Integration Table
    CREATE TABLE google_calendar_integrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      user_id INT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at DATETIME,
      calendar_id VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- SEO Settings Table
    CREATE TABLE seo_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      site_title VARCHAR(255),
      site_description TEXT,
      site_keywords TEXT,
      site_url VARCHAR(255),
      site_logo VARCHAR(255),
      favicon VARCHAR(255),
      og_image VARCHAR(255),
      twitter_handle VARCHAR(100),
      facebook_app_id VARCHAR(100),
      google_analytics_id VARCHAR(100),
      google_tag_manager_id VARCHAR(100),
      facebook_pixel_id VARCHAR(100),
      enable_sitemap BOOLEAN DEFAULT TRUE,
      enable_robots_txt BOOLEAN DEFAULT TRUE,
      enable_meta_tags BOOLEAN DEFAULT TRUE,
      enable_open_graph BOOLEAN DEFAULT TRUE,
      enable_twitter_cards BOOLEAN DEFAULT TRUE,
      enable_schema_markup BOOLEAN DEFAULT TRUE,
      enable_canonical_urls BOOLEAN DEFAULT TRUE,
      enable_breadcrumbs BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Cache Settings Table
    CREATE TABLE cache_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      driver VARCHAR(50) DEFAULT 'redis',
      host VARCHAR(255) DEFAULT 'localhost',
      port INT DEFAULT 6379,
      password VARCHAR(255),
      `database` INT DEFAULT 0,
      prefix VARCHAR(100) DEFAULT 'hrms_',
      default_ttl INT DEFAULT 3600,
      max_memory VARCHAR(20) DEFAULT '256m',
      enable_query_cache BOOLEAN DEFAULT TRUE,
      enable_view_cache BOOLEAN DEFAULT TRUE,
      enable_route_cache BOOLEAN DEFAULT TRUE,
      enable_config_cache BOOLEAN DEFAULT TRUE,
      enable_event_cache BOOLEAN DEFAULT TRUE,
      enable_session_cache BOOLEAN DEFAULT TRUE,
      enable_user_cache BOOLEAN DEFAULT TRUE,
      enable_employee_cache BOOLEAN DEFAULT TRUE,
      enable_department_cache BOOLEAN DEFAULT TRUE,
      enable_attendance_cache BOOLEAN DEFAULT TRUE,
      enable_leave_cache BOOLEAN DEFAULT TRUE,
      enable_payroll_cache BOOLEAN DEFAULT TRUE,
      auto_clear_cache BOOLEAN DEFAULT TRUE,
      clear_cache_on_update BOOLEAN DEFAULT TRUE,
      clear_cache_on_delete BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Webhooks Table
    CREATE TABLE webhooks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      events JSON,
      secret VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      last_triggered DATETIME,
      status ENUM('active', 'inactive', 'error', 'pending') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Webhook Logs Table
    CREATE TABLE webhook_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      webhook_id INT NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      payload TEXT,
      response_status INT,
      response_body TEXT,
      triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
    );

    -- Cookie Consent Settings Table
    CREATE TABLE cookie_consent_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      position ENUM('bottom', 'top', 'bottom-left', 'bottom-right', 'top-left', 'top-right') DEFAULT 'bottom',
      theme ENUM('light') DEFAULT 'light',
      message TEXT,
      accept_button_text VARCHAR(100) DEFAULT 'Accept All',
      decline_button_text VARCHAR(100) DEFAULT 'Decline',
      learn_more_text VARCHAR(100) DEFAULT 'Learn More',
      learn_more_url VARCHAR(500),
      cookie_policy_url VARCHAR(500),
      privacy_policy_url VARCHAR(500),
      terms_of_service_url VARCHAR(500),
      show_decline_button BOOLEAN DEFAULT TRUE,
      show_learn_more_button BOOLEAN DEFAULT TRUE,
      auto_accept BOOLEAN DEFAULT FALSE,
      auto_accept_delay INT DEFAULT 0,
      remember_choice BOOLEAN DEFAULT TRUE,
      cookie_expiry INT DEFAULT 365,
      required_cookies JSON,
      optional_cookies JSON,
      analytics_cookies JSON,
      marketing_cookies JSON,
      functional_cookies JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- ChatGPT Settings Table
    CREATE TABLE chatgpt_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      api_key VARCHAR(500),
      model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
      max_tokens INT DEFAULT 1000,
      temperature DECIMAL(3,2) DEFAULT 0.70,
      enabled BOOLEAN DEFAULT FALSE,
      enable_hr_assistant BOOLEAN DEFAULT TRUE,
      enable_recruitment_assistant BOOLEAN DEFAULT TRUE,
      enable_performance_assistant BOOLEAN DEFAULT TRUE,
      enable_leave_assistant BOOLEAN DEFAULT TRUE,
      enable_payroll_assistant BOOLEAN DEFAULT TRUE,
      enable_employee_support BOOLEAN DEFAULT TRUE,
      enable_manager_support BOOLEAN DEFAULT TRUE,
      enable_admin_support BOOLEAN DEFAULT TRUE,
      auto_respond BOOLEAN DEFAULT FALSE,
      response_delay INT DEFAULT 2,
      context_window INT DEFAULT 4000,
      enable_learning BOOLEAN DEFAULT TRUE,
      enable_feedback BOOLEAN DEFAULT TRUE,
      enable_analytics BOOLEAN DEFAULT TRUE,
      enable_integration BOOLEAN DEFAULT FALSE,
      webhook_url VARCHAR(500),
      webhook_secret VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- ChatGPT Conversations Table
    CREATE TABLE chatgpt_conversations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      session_id VARCHAR(255),
      message TEXT NOT NULL,
      response TEXT,
      model VARCHAR(100),
      tokens_used INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Expenses Table
    CREATE TABLE expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      category VARCHAR(100) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      description TEXT,
      receipt_path VARCHAR(255),
      expense_date DATE NOT NULL,
      status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
      approved_by INT,
      approved_at DATETIME,
      paid_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Expense Categories Table
    CREATE TABLE expense_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      max_amount DECIMAL(15,2),
      requires_approval BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Goals Table
    CREATE TABLE goals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      target_value DECIMAL(15,2),
      current_value DECIMAL(15,2) DEFAULT 0,
      unit VARCHAR(50),
      start_date DATE,
      end_date DATE,
      status ENUM('not_started', 'in_progress', 'completed', 'cancelled') DEFAULT 'not_started',
      progress_percentage DECIMAL(5,2) DEFAULT 0,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Goal Updates Table
    CREATE TABLE goal_updates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      goal_id INT NOT NULL,
      current_value DECIMAL(15,2),
      progress_percentage DECIMAL(5,2),
      notes TEXT,
      updated_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Interviews Table
    CREATE TABLE interviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_application_id INT NOT NULL,
      interviewer_id INT NOT NULL,
      interview_type ENUM('phone', 'video', 'in_person', 'technical', 'hr', 'final') NOT NULL,
      scheduled_date DATETIME NOT NULL,
      duration_minutes INT DEFAULT 60,
      location VARCHAR(255),
      meeting_link VARCHAR(500),
      status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
      feedback TEXT,
      rating INT,
      recommendation ENUM('hire', 'no_hire', 'maybe') DEFAULT 'maybe',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
      FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tasks Table
    CREATE TABLE tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      assigned_to INT,
      assigned_by INT NOT NULL,
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
      due_date DATETIME,
      completed_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Task Comments Table
    CREATE TABLE task_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      user_id INT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Notifications Table
    CREATE TABLE notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Calendar Events Table
    CREATE TABLE calendar_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      event_type ENUM('meeting', 'holiday', 'training', 'interview', 'other') DEFAULT 'other',
      location VARCHAR(255),
      attendees JSON,
      created_by INT NOT NULL,
      is_all_day BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Reports Table
    CREATE TABLE reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      report_type VARCHAR(100) NOT NULL,
      parameters JSON,
      generated_by INT NOT NULL,
      file_path VARCHAR(500),
      status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- API Keys Table
    CREATE TABLE api_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      key_value VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      permissions JSON,
      last_used_at DATETIME,
      expires_at DATETIME,
      is_active BOOLEAN DEFAULT TRUE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- File Uploads Table
    CREATE TABLE file_uploads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INT NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      uploaded_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Enhanced Users Table (for user management page)
    ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;
    ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    ALTER TABLE users ADD COLUMN department VARCHAR(100);
    ALTER TABLE users ADD COLUMN position VARCHAR(100);
    ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN login_attempts INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN locked_until DATETIME NULL;
    ALTER TABLE users ADD COLUMN last_login DATETIME NULL;
    ALTER TABLE users ADD COLUMN permissions JSON;

    -- User Permissions Table
    CREATE TABLE user_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      permission VARCHAR(100) NOT NULL,
      granted_by INT NOT NULL,
      granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_permission (user_id, permission)
    );

    -- Enhanced Assets Table (for asset management)
    ALTER TABLE assets ADD COLUMN asset_id VARCHAR(50) UNIQUE;
    ALTER TABLE assets ADD COLUMN category VARCHAR(100);
    ALTER TABLE assets ADD COLUMN type VARCHAR(100);
    ALTER TABLE assets ADD COLUMN brand VARCHAR(100);
    ALTER TABLE assets ADD COLUMN model VARCHAR(100);
    ALTER TABLE assets ADD COLUMN serial_number VARCHAR(100);
    ALTER TABLE assets ADD COLUMN purchase_date DATE;
    ALTER TABLE assets ADD COLUMN purchase_price DECIMAL(10,2);
    ALTER TABLE assets ADD COLUMN current_value DECIMAL(10,2);
    ALTER TABLE assets ADD COLUMN warranty_expiry DATE;
    ALTER TABLE assets ADD COLUMN maintenance_schedule VARCHAR(100);
    ALTER TABLE assets ADD COLUMN last_maintenance DATE;
    ALTER TABLE assets ADD COLUMN next_maintenance DATE;
    ALTER TABLE assets ADD COLUMN `condition` ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good';

    -- Enhanced Asset Assignments Table
    ALTER TABLE asset_assignments ADD COLUMN  assignment_id VARCHAR(50) UNIQUE;
    ALTER TABLE asset_assignments ADD COLUMN  return_date DATE;
    ALTER TABLE asset_assignments ADD COLUMN  return_notes TEXT;
    ALTER TABLE asset_assignments ADD COLUMN  condition ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'excellent';

    -- Enhanced Performance Reviews Table
    ALTER TABLE performance_reviews ADD COLUMN  review_id VARCHAR(50) UNIQUE;
    ALTER TABLE performance_reviews ADD COLUMN  reviewer_id INT;
    ALTER TABLE performance_reviews ADD COLUMN  reviewer_name VARCHAR(255);
    ALTER TABLE performance_reviews ADD COLUMN  review_period VARCHAR(100);
    ALTER TABLE performance_reviews ADD COLUMN  review_type ENUM('annual', 'quarterly', 'probation', 'promotion') DEFAULT 'quarterly';
    ALTER TABLE performance_reviews ADD COLUMN  overall_rating DECIMAL(3,1);
    ALTER TABLE performance_reviews ADD COLUMN  goals_rating DECIMAL(3,1);
    ALTER TABLE performance_reviews ADD COLUMN  skills_rating DECIMAL(3,1);
    ALTER TABLE performance_reviews ADD COLUMN  behavior_rating DECIMAL(3,1);
    ALTER TABLE performance_reviews ADD COLUMN  attendance_rating DECIMAL(3,1);
    ALTER TABLE performance_reviews ADD COLUMN  scheduled_date DATE;
    ALTER TABLE performance_reviews ADD COLUMN  completed_date DATE;
    ALTER TABLE performance_reviews ADD COLUMN  due_date DATE;
    ALTER TABLE performance_reviews ADD COLUMN  goals JSON;
    ALTER TABLE performance_reviews ADD COLUMN  achievements JSON;
    ALTER TABLE performance_reviews ADD COLUMN  areas_for_improvement JSON;
    ALTER TABLE performance_reviews ADD COLUMN  employee_comments TEXT;
    ALTER TABLE performance_reviews ADD COLUMN  manager_comments TEXT;
    ALTER TABLE performance_reviews ADD COLUMN  next_review_date DATE;
    ALTER TABLE performance_reviews ADD FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL;

    -- Enhanced Audit Logs Table
    ALTER TABLE audit_logs ADD COLUMN  log_id VARCHAR(50) UNIQUE;
    ALTER TABLE audit_logs ADD COLUMN  user_name VARCHAR(255);
    ALTER TABLE audit_logs ADD COLUMN  user_email VARCHAR(255);
    ALTER TABLE audit_logs ADD COLUMN  resource VARCHAR(100);
    ALTER TABLE audit_logs ADD COLUMN  resource_id VARCHAR(100);
    ALTER TABLE audit_logs ADD COLUMN  details TEXT;
    ALTER TABLE audit_logs ADD COLUMN  ip_address VARCHAR(45);
    ALTER TABLE audit_logs ADD COLUMN  user_agent TEXT;
    ALTER TABLE audit_logs ADD COLUMN  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low';
    ALTER TABLE audit_logs ADD COLUMN  department VARCHAR(100);
    ALTER TABLE audit_logs ADD COLUMN  location VARCHAR(100);
    ALTER TABLE audit_logs ADD COLUMN  session_id VARCHAR(100);
    ALTER TABLE audit_logs ADD COLUMN  changes JSON;
    ALTER TABLE audit_logs ADD COLUMN  old_values JSON;
    ALTER TABLE audit_logs ADD COLUMN  new_values JSON;

    -- Enhanced Tasks Table (for task management)
    ALTER TABLE tasks ADD COLUMN  task_id VARCHAR(50) UNIQUE;
    ALTER TABLE tasks ADD COLUMN  assignee_id VARCHAR(100);
    ALTER TABLE tasks ADD COLUMN  assignee_name VARCHAR(255);
    ALTER TABLE tasks ADD COLUMN  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium';
    ALTER TABLE tasks ADD COLUMN  progress INT DEFAULT 0;
    ALTER TABLE tasks ADD COLUMN  tags JSON;
    ALTER TABLE tasks ADD COLUMN  estimated_hours INT;
    ALTER TABLE tasks ADD COLUMN  actual_hours INT;
    ALTER TABLE tasks ADD COLUMN  project VARCHAR(255);
    ALTER TABLE tasks ADD COLUMN  department VARCHAR(100);

    -- Enhanced Calendar Events Table
    ALTER TABLE calendar_events ADD COLUMN  event_id VARCHAR(50) UNIQUE;
    ALTER TABLE calendar_events ADD COLUMN  color VARCHAR(7);
    ALTER TABLE calendar_events ADD COLUMN  is_recurring BOOLEAN DEFAULT FALSE;
    ALTER TABLE calendar_events ADD COLUMN  recurrence_pattern JSON;
    ALTER TABLE calendar_events ADD COLUMN  reminder_minutes INT;

    -- Enhanced Attendance Table
    ALTER TABLE attendance ADD COLUMN  attendance_id VARCHAR(50) UNIQUE;
    ALTER TABLE attendance ADD COLUMN  check_in_location VARCHAR(255);
    ALTER TABLE attendance ADD COLUMN  check_out_location VARCHAR(255);
    ALTER TABLE attendance ADD COLUMN  check_in_ip VARCHAR(45);
    ALTER TABLE attendance ADD COLUMN  check_out_ip VARCHAR(45);
    ALTER TABLE attendance ADD COLUMN  check_in_device VARCHAR(255);
    ALTER TABLE attendance ADD COLUMN  check_out_device VARCHAR(255);
    ALTER TABLE attendance ADD COLUMN  total_hours DECIMAL(4,2);
    ALTER TABLE attendance ADD COLUMN  overtime_hours DECIMAL(4,2);
    ALTER TABLE attendance ADD COLUMN  status ENUM('present', 'absent', 'late', 'half_day', 'holiday') DEFAULT 'present';

    -- Enhanced Leave Applications Table
    ALTER TABLE leave_applications ADD COLUMN  leave_id VARCHAR(50) UNIQUE;
    ALTER TABLE leave_applications ADD COLUMN  days INT;
    ALTER TABLE leave_applications ADD COLUMN  emergency_contact VARCHAR(255);
    ALTER TABLE leave_applications ADD COLUMN  attachment VARCHAR(500);
    ALTER TABLE leave_applications ADD COLUMN  approved_by INT;
    ALTER TABLE leave_applications ADD COLUMN  approved_at DATETIME;
    ALTER TABLE leave_applications ADD COLUMN  rejection_reason TEXT;
    ALTER TABLE leave_applications ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

    -- Enhanced Employees Table (Additional columns)
    ALTER TABLE employees ADD COLUMN reports_to INT NULL;
    ALTER TABLE employees ADD COLUMN profile_photo VARCHAR(255) NULL;
    ALTER TABLE employees ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') NULL;
    ALTER TABLE employees ADD COLUMN attendance_policy_id INT NULL;
    ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255) NULL;
    ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(50) NULL;
    ALTER TABLE employees ADD COLUMN bank_routing_number VARCHAR(50) NULL;
    ALTER TABLE employees ADD COLUMN bank_swift_code VARCHAR(20) NULL;
    ALTER TABLE employees ADD COLUMN bank_address TEXT NULL;
    ALTER TABLE employees ADD COLUMN role VARCHAR(50) NULL;
    ALTER TABLE employees ADD COLUMN reporting_to INT NULL;
    ALTER TABLE employees ADD FOREIGN KEY (reports_to) REFERENCES employees(id) ON DELETE SET NULL;
    ALTER TABLE employees ADD FOREIGN KEY (reporting_to) REFERENCES employees(id) ON DELETE SET NULL;

    -- Enhanced Job Applications Table
    ALTER TABLE job_applications ADD COLUMN  application_id VARCHAR(50) UNIQUE;
    ALTER TABLE job_applications ADD COLUMN  resume_path VARCHAR(500);
    ALTER TABLE job_applications ADD COLUMN  cover_letter TEXT;
    ALTER TABLE job_applications ADD COLUMN  expected_salary DECIMAL(10,2);
    ALTER TABLE job_applications ADD COLUMN  availability_date DATE;
    ALTER TABLE job_applications ADD COLUMN  source VARCHAR(100);
    ALTER TABLE job_applications ADD COLUMN  referral_name VARCHAR(255);
    ALTER TABLE job_applications ADD COLUMN  notes TEXT;

    -- Enhanced Interviews Table
    ALTER TABLE interviews ADD COLUMN  interview_id VARCHAR(50) UNIQUE;
    ALTER TABLE interviews ADD COLUMN  interview_type ENUM('phone', 'video', 'in_person', 'panel') DEFAULT 'in_person';
    ALTER TABLE interviews ADD COLUMN  duration_minutes INT;
    ALTER TABLE interviews ADD COLUMN  meeting_link VARCHAR(500);
    ALTER TABLE interviews ADD COLUMN  feedback TEXT;
    ALTER TABLE interviews ADD COLUMN  rating INT;
    ALTER TABLE interviews ADD COLUMN  recommendation ENUM('hire', 'no_hire', 'maybe') DEFAULT 'maybe';

    -- Enhanced Goals Table
    ALTER TABLE goals ADD COLUMN  goal_id VARCHAR(50) UNIQUE;
    ALTER TABLE goals ADD COLUMN  category VARCHAR(100);
    ALTER TABLE goals ADD COLUMN  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium';
    ALTER TABLE goals ADD COLUMN  progress INT DEFAULT 0;
    ALTER TABLE goals ADD COLUMN  milestones JSON;
    ALTER TABLE goals ADD COLUMN  success_criteria TEXT;
    ALTER TABLE goals ADD COLUMN  resources_needed TEXT;
    ALTER TABLE goals ADD COLUMN  potential_obstacles TEXT;

    -- Enhanced Expenses Table
    ALTER TABLE expenses ADD COLUMN  expense_id VARCHAR(50) UNIQUE;
    ALTER TABLE expenses ADD COLUMN  project VARCHAR(255);
    ALTER TABLE expenses ADD COLUMN  vendor VARCHAR(255);
    ALTER TABLE expenses ADD COLUMN  payment_method ENUM('cash', 'card', 'bank_transfer', 'check') DEFAULT 'card';
    ALTER TABLE expenses ADD COLUMN  receipt_path VARCHAR(500);
    ALTER TABLE expenses ADD COLUMN  approved_by INT;
    ALTER TABLE expenses ADD COLUMN  approved_at DATETIME;
    ALTER TABLE expenses ADD COLUMN  rejection_reason TEXT;
    ALTER TABLE expenses ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

    -- Enhanced Payslips Table
    ALTER TABLE payslips ADD COLUMN  payslip_id VARCHAR(50) UNIQUE;
    ALTER TABLE payslips ADD COLUMN  bank_name VARCHAR(255);
    ALTER TABLE payslips ADD COLUMN  account_number VARCHAR(50);
    ALTER TABLE payslips ADD COLUMN  ifsc_code VARCHAR(20);
    ALTER TABLE payslips ADD COLUMN  payment_method ENUM('bank_transfer', 'check', 'cash') DEFAULT 'bank_transfer';
    ALTER TABLE payslips ADD COLUMN  overtime_hours DECIMAL(4,2);
    ALTER TABLE payslips ADD COLUMN  bonus DECIMAL(10,2);
    ALTER TABLE payslips ADD COLUMN  tax DECIMAL(10,2);
    ALTER TABLE payslips ADD COLUMN  provident_fund DECIMAL(10,2);
    ALTER TABLE payslips ADD COLUMN  health_insurance DECIMAL(10,2);
    ALTER TABLE payslips ADD COLUMN  net_salary DECIMAL(10,2);
    ALTER TABLE payslips ADD COLUMN  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending';
    ALTER TABLE payslips ADD COLUMN  paid_at DATETIME;

    -- Additional HRMS Tables

    -- Timesheets Table
    CREATE TABLE timesheets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      timesheet_id VARCHAR(50) UNIQUE,
      project_id INT,
      project_name VARCHAR(255),
      task_description TEXT,
      date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      total_hours DECIMAL(4,2),
      break_hours DECIMAL(4,2),
      overtime_hours DECIMAL(4,2),
      status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
      approved_by INT,
      approved_at DATETIME,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Contracts Table
    CREATE TABLE contracts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      contract_id VARCHAR(50) UNIQUE,
      contract_type ENUM('permanent', 'contract', 'intern', 'consultant') DEFAULT 'permanent',
      start_date DATE NOT NULL,
      end_date DATE,
      salary DECIMAL(10,2),
      currency VARCHAR(3) DEFAULT 'USD',
      working_hours_per_week INT DEFAULT 40,
      probation_period_months INT DEFAULT 3,
      notice_period_days INT DEFAULT 30,
      status ENUM('active', 'expired', 'terminated', 'renewed') DEFAULT 'active',
      document_path VARCHAR(500),
      terms_and_conditions TEXT,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Awards Table
    CREATE TABLE awards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      award_id VARCHAR(50) UNIQUE,
      award_name VARCHAR(255) NOT NULL,
      award_type ENUM('performance', 'achievement', 'recognition', 'milestone') DEFAULT 'achievement',
      description TEXT,
      award_date DATE NOT NULL,
      awarded_by INT NOT NULL,
      certificate_path VARCHAR(500),
      monetary_value DECIMAL(10,2),
      status ENUM('active', 'revoked') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (awarded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Transfers Table
    CREATE TABLE transfers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      transfer_id VARCHAR(50) UNIQUE,
      from_department VARCHAR(100),
      to_department VARCHAR(100),
      from_position VARCHAR(100),
      to_position VARCHAR(100),
      from_location VARCHAR(255),
      to_location VARCHAR(255),
      transfer_date DATE NOT NULL,
      effective_date DATE NOT NULL,
      reason TEXT,
      status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
      approved_by INT,
      approved_at DATETIME,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Resignations Table
    CREATE TABLE resignations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      resignation_id VARCHAR(50) UNIQUE,
      resignation_date DATE NOT NULL,
      last_working_date DATE NOT NULL,
      notice_period_days INT,
      reason TEXT,
      status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
      exit_interview_date DATE,
      exit_interview_notes TEXT,
      handover_notes TEXT,
      clearance_status ENUM('pending', 'completed') DEFAULT 'pending',
      approved_by INT,
      approved_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Promotions Table
    CREATE TABLE promotions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      promotion_id VARCHAR(50) UNIQUE,
      from_position VARCHAR(100),
      to_position VARCHAR(100),
      from_department VARCHAR(100),
      to_department VARCHAR(100),
      from_salary DECIMAL(10,2),
      to_salary DECIMAL(10,2),
      promotion_date DATE NOT NULL,
      effective_date DATE NOT NULL,
      reason TEXT,
      performance_rating DECIMAL(3,1),
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      approved_by INT,
      approved_at DATETIME,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Complaints Table
    CREATE TABLE complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      complainant_id INT NOT NULL,
      complaint_id VARCHAR(50) UNIQUE,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category ENUM('harassment', 'discrimination', 'workplace_issue', 'policy_violation', 'other') DEFAULT 'other',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
      assigned_to INT,
      resolution TEXT,
      resolution_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (complainant_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Warnings Table
    CREATE TABLE warnings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      warning_id VARCHAR(50) UNIQUE,
      warning_type ENUM('verbal', 'written', 'final') DEFAULT 'verbal',
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      warning_date DATE NOT NULL,
      issued_by INT NOT NULL,
      status ENUM('active', 'expired', 'withdrawn') DEFAULT 'active',
      expiry_date DATE,
      acknowledgment_required BOOLEAN DEFAULT TRUE,
      acknowledged_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Terminations Table
    CREATE TABLE terminations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      termination_id VARCHAR(50) UNIQUE,
      termination_type ENUM('voluntary', 'involuntary', 'layoff', 'retirement') DEFAULT 'involuntary',
      termination_date DATE NOT NULL,
      last_working_date DATE NOT NULL,
      reason TEXT,
      notice_period_days INT,
      severance_package DECIMAL(10,2),
      exit_interview_date DATE,
      exit_interview_notes TEXT,
      clearance_status ENUM('pending', 'completed') DEFAULT 'pending',
      approved_by INT,
      approved_at DATETIME,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Holidays Table
    CREATE TABLE holidays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      holiday_id VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      type ENUM('national', 'religious', 'company', 'optional') DEFAULT 'national',
      description TEXT,
      is_recurring BOOLEAN DEFAULT FALSE,
      recurring_pattern JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Events Table
    CREATE TABLE events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      event_id VARCHAR(50) UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      location VARCHAR(255),
      event_type ENUM('meeting', 'training', 'celebration', 'conference', 'other') DEFAULT 'meeting',
      attendees JSON,
      budget DECIMAL(10,2),
      status ENUM('planned', 'confirmed', 'completed', 'cancelled') DEFAULT 'planned',
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Meetings Table
    CREATE TABLE meetings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      meeting_id VARCHAR(50) UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      meeting_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      location VARCHAR(255),
      meeting_type ENUM('team', 'department', 'company', 'client', 'other') DEFAULT 'team',
      attendees JSON,
      agenda TEXT,
      meeting_link VARCHAR(500),
      status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
      minutes TEXT,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Documents Table (Enhanced)
    CREATE TABLE company_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      document_id VARCHAR(50) UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      document_type ENUM('policy', 'procedure', 'form', 'template', 'contract', 'other') DEFAULT 'document',
      category VARCHAR(100),
      file_path VARCHAR(500) NOT NULL,
      file_size INT,
      mime_type VARCHAR(100),
      version VARCHAR(20) DEFAULT '1.0',
      is_public BOOLEAN DEFAULT FALSE,
      access_level ENUM('public', 'internal', 'confidential', 'restricted') DEFAULT 'internal',
      uploaded_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Company Policies Table
    CREATE TABLE company_policies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      policy_id VARCHAR(50) UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      policy_type ENUM('hr', 'it', 'safety', 'code_of_conduct', 'other') DEFAULT 'hr',
      content TEXT NOT NULL,
      effective_date DATE NOT NULL,
      expiry_date DATE,
      version VARCHAR(20) DEFAULT '1.0',
      status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
      approval_required BOOLEAN DEFAULT TRUE,
      approved_by INT,
      approved_at DATETIME,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Messenger Table
    CREATE TABLE messenger (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      message_id VARCHAR(50) UNIQUE,
      sender_id INT NOT NULL,
      recipient_id INT,
      group_id INT,
      subject VARCHAR(255),
      message TEXT NOT NULL,
      message_type ENUM('text', 'file', 'image', 'system') DEFAULT 'text',
      attachment_path VARCHAR(500),
      is_read BOOLEAN DEFAULT FALSE,
      read_at DATETIME,
      is_important BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Email Templates Table
    CREATE TABLE email_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      template_id VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      template_type ENUM('welcome', 'leave_approval', 'leave_rejection', 'payroll', 'announcement', 'other') DEFAULT 'other',
      variables JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Notification Templates Table
    CREATE TABLE notification_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      template_id VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      template_type ENUM('push', 'email', 'sms', 'in_app') DEFAULT 'in_app',
      trigger_event VARCHAR(100),
      variables JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Additional Tables for Timekeeping and Attendance Management

    -- Attendance Policies Table
    CREATE TABLE attendance_policies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      policy_type ENUM('general', 'department', 'employee') NULL,
      department_id INT NULL,
      employee_id INT NULL,
      late_arrival_penalty DECIMAL(5,2) NULL,
      early_departure_penalty DECIMAL(5,2) NULL,
      absent_penalty DECIMAL(5,2) NULL,
      overtime_rate DECIMAL(5,2) NULL,
      max_overtime_hours DECIMAL(4,2) NULL,
      require_approval_for_overtime BOOLEAN NULL,
      allow_remote_work BOOLEAN NULL,
      require_location_tracking BOOLEAN NULL,
      auto_approve_overtime BOOLEAN NULL,
      is_active BOOLEAN NULL,
      company_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Attendance Records Table
    CREATE TABLE attendance_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      check_in TIME NULL,
      check_out TIME NULL,
      work_hours DECIMAL(5,2) NULL,
      overtime_hours DECIMAL(5,2) NULL,
      status ENUM('present', 'absent', 'late', 'partial') NULL,
      check_in_location VARCHAR(255) NULL,
      check_out_location VARCHAR(255) NULL,
      check_in_ip VARCHAR(45) NULL,
      check_out_ip VARCHAR(45) NULL,
      check_in_device TEXT NULL,
      check_out_device TEXT NULL,
      company_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE KEY unique_employee_date (employee_id, date)
    );

    -- Attendance Regulations Table
    CREATE TABLE attendance_regulations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      regulation_type ENUM('general', 'department', 'employee') NULL,
      department_id INT NULL,
      employee_id INT NULL,
      working_hours_per_day DECIMAL(4,2) NULL,
      working_days_per_week INT NULL,
      break_duration_minutes INT NULL,
      grace_period_minutes INT NULL,
      late_penalty_amount DECIMAL(5,2) NULL,
      absent_penalty_amount DECIMAL(5,2) NULL,
      overtime_rate_multiplier DECIMAL(3,2) NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
    );

    -- Shifts Table
    CREATE TABLE shifts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL DEFAULT 1,
      name VARCHAR(100) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      break_duration_minutes INT DEFAULT 0,
      working_hours DECIMAL(4,2) NOT NULL,
      is_night_shift BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Shift Assignments Table
    CREATE TABLE shift_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      shift_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
    );

    -- Employee Contracts Table
    CREATE TABLE employee_contracts (
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

    -- Employee Salary Components Table
    CREATE TABLE employee_salary_components (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_salary_id INT NOT NULL,
      salary_component_id INT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      percentage DECIMAL(5,2) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_salary_id) REFERENCES employee_salaries(id) ON DELETE CASCADE,
      FOREIGN KEY (salary_component_id) REFERENCES salary_components(id) ON DELETE CASCADE
    );

    -- Permissions Table
    CREATE TABLE permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      permission_name VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      module VARCHAR(50) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Role Permissions Table
    CREATE TABLE role_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
      UNIQUE KEY unique_role_permission (role_id, permission_id)
    );

    -- Payroll Runs Table
    CREATE TABLE payroll_runs (
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

    -- Leave Balances Table
    CREATE TABLE leave_balances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      leave_type_id INT NOT NULL,
      year INT NOT NULL,
      total_days INT NOT NULL,
      used_days INT DEFAULT 0,
      remaining_days INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
      UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year)
    );

    -- Leave Policies Table
    CREATE TABLE leave_policies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      max_consecutive_days INT NULL,
      advance_notice_days INT NULL,
      requires_medical_certificate BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Leave Holidays Table
    CREATE TABLE leave_holidays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      type ENUM('national', 'religious', 'company', 'optional') DEFAULT 'national',
      is_recurring BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Projects Table
    CREATE TABLE projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
      budget DECIMAL(15,2),
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Project Assignments Table
    CREATE TABLE project_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      employee_id INT NOT NULL,
      role VARCHAR(100),
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Project Tasks Table
    CREATE TABLE project_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      assigned_to INT,
      status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      due_date DATE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Enhanced User Permissions Table
    ALTER TABLE user_permissions ADD COLUMN is_active BOOLEAN NULL;
    ALTER TABLE user_permissions ADD COLUMN permission_id INT NULL;
    ALTER TABLE user_permissions ADD FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE SET NULL;

    -- Additional Leave Management Tables

    -- Leave Approvals Table (For Multi-level Approval)
    CREATE TABLE leave_approvals (
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

    -- Leave Workflows Table
    CREATE TABLE leave_workflows (
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
    CREATE TABLE leave_notifications (
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

    -- Enhanced Leave Types Table (Additional columns)
    ALTER TABLE leave_types ADD COLUMN code VARCHAR(20) UNIQUE NULL;
    ALTER TABLE leave_types ADD COLUMN description TEXT NULL;
    ALTER TABLE leave_types ADD COLUMN max_consecutive_days INT DEFAULT 0;
    ALTER TABLE leave_types ADD COLUMN requires_documentation BOOLEAN DEFAULT FALSE;
    ALTER TABLE leave_types ADD COLUMN carry_forward BOOLEAN DEFAULT FALSE;
    ALTER TABLE leave_types ADD COLUMN max_carry_forward_days INT DEFAULT 0;
    ALTER TABLE leave_types ADD COLUMN gender_restriction ENUM('all', 'male', 'female') DEFAULT 'all';
    ALTER TABLE leave_types ADD COLUMN min_service_days INT DEFAULT 0;
    ALTER TABLE leave_types ADD COLUMN advance_notice_days INT DEFAULT 0;
    ALTER TABLE leave_types ADD COLUMN color_code VARCHAR(7) DEFAULT '#3B82F6';
    ALTER TABLE leave_types ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

    -- Enhanced Leave Applications Table (Additional columns)
    ALTER TABLE leave_applications ADD COLUMN applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE leave_applications ADD COLUMN cancelled_at DATETIME NULL;
    ALTER TABLE leave_applications ADD COLUMN cancellation_reason TEXT NULL;

    -- Enhanced Leave Balances Table (Additional columns)
    ALTER TABLE leave_balances ADD COLUMN total_allocated INT DEFAULT 0;
    ALTER TABLE leave_balances ADD COLUMN total_approved INT DEFAULT 0;
    ALTER TABLE leave_balances ADD COLUMN total_pending INT DEFAULT 0;
    ALTER TABLE leave_balances ADD COLUMN carry_forward_from_previous INT DEFAULT 0;
    ALTER TABLE leave_balances ADD COLUMN carry_forward_to_next INT DEFAULT 0;

    -- Enhanced Leave Holidays Table (Additional columns)
    ALTER TABLE leave_holidays ADD COLUMN recurring_pattern ENUM('yearly', 'monthly', 'weekly') NULL;
    ALTER TABLE leave_holidays ADD COLUMN description TEXT NULL;
    ALTER TABLE leave_holidays ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

    -- Enhanced Leave Policies Table (Additional columns)
    ALTER TABLE leave_policies ADD COLUMN policy_type ENUM('general', 'department_specific', 'employee_specific') DEFAULT 'general';
    ALTER TABLE leave_policies ADD COLUMN department_id INT NULL;
    ALTER TABLE leave_policies ADD COLUMN employee_id INT NULL;
    ALTER TABLE leave_policies ADD COLUMN leave_type_id INT NOT NULL;
    ALTER TABLE leave_policies ADD COLUMN max_days_per_year INT DEFAULT 0;
    ALTER TABLE leave_policies ADD COLUMN max_consecutive_days INT DEFAULT 0;
    ALTER TABLE leave_policies ADD COLUMN approval_workflow JSON NULL;
    ALTER TABLE leave_policies ADD COLUMN effective_from DATE NOT NULL;
    ALTER TABLE leave_policies ADD COLUMN effective_to DATE NULL;
    ALTER TABLE leave_policies ADD COLUMN created_by INT NOT NULL;
    ALTER TABLE leave_policies ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE;
    ALTER TABLE leave_policies ADD FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
    ALTER TABLE leave_policies ADD FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE;
    ALTER TABLE leave_policies ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

    -- Create Indexes for Performance
    CREATE INDEX idx_leave_applications_employee ON leave_applications(employee_id);
    CREATE INDEX idx_leave_applications_status ON leave_applications(status);
    CREATE INDEX idx_leave_applications_dates ON leave_applications(start_date, end_date);
    CREATE INDEX idx_leave_balances_employee_year ON leave_balances(employee_id, year);
    CREATE INDEX idx_leave_approvals_application ON leave_approvals(leave_application_id);
    CREATE INDEX idx_leave_holidays_company_date ON leave_holidays(company_id, date);
    CREATE INDEX idx_leave_notifications_user ON leave_notifications(user_id, is_read);

    -- =====================================================
    -- INSERT DEFAULT LEAVE TYPES
    -- =====================================================

    INSERT INTO leave_types (company_id, name, code, description, days_allowed, max_consecutive_days, requires_approval, requires_documentation, is_paid, carry_forward, color_code) VALUES
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
-- HR SETUP TABLES
-- =====================================================

-- Document Types Table
CREATE TABLE IF NOT EXISTS document_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Payslip Types Table
CREATE TABLE IF NOT EXISTS payslip_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Allowance Options Table
CREATE TABLE IF NOT EXISTS allowance_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  is_taxable BOOLEAN DEFAULT TRUE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Loan Options Table
CREATE TABLE IF NOT EXISTS loan_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  max_amount DECIMAL(15,2),
  interest_rate DECIMAL(5,2),
  max_duration_months INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Deduction Options Table
CREATE TABLE IF NOT EXISTS deduction_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  is_mandatory BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Goal Types Table
CREATE TABLE IF NOT EXISTS goal_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Competencies Table
CREATE TABLE IF NOT EXISTS competencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  category VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Performance Types Table
CREATE TABLE IF NOT EXISTS performance_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Training Types Table
CREATE TABLE IF NOT EXISTS training_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Job Categories Table
CREATE TABLE IF NOT EXISTS job_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Job Stages Table
CREATE TABLE IF NOT EXISTS job_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  order_index INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Award Types Table
CREATE TABLE IF NOT EXISTS award_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Termination Types Table
CREATE TABLE IF NOT EXISTS termination_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  notice_period_days INT DEFAULT 30,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Expense Types Table
CREATE TABLE IF NOT EXISTS expense_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  requires_approval BOOLEAN DEFAULT TRUE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Income Types Table
CREATE TABLE IF NOT EXISTS income_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  is_taxable BOOLEAN DEFAULT TRUE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Payment Types Table
CREATE TABLE IF NOT EXISTS payment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Contract Types Table
CREATE TABLE IF NOT EXISTS contract_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  duration_months INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =====================================================
-- Additional Features Tables
-- =====================================================

-- Trips table for business travel management
CREATE TABLE IF NOT EXISTS trips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    employee_id INT NOT NULL,
    destination VARCHAR(255) NOT NULL,
    purpose TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    estimated_cost DECIMAL(10,2) DEFAULT 0.00,
    actual_cost DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_company_employee (company_id, employee_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- Announcements table for company-wide announcements
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    target_audience ENUM('all', 'department', 'role', 'specific') DEFAULT 'all',
    target_department_id INT NULL,
    target_role VARCHAR(100) NULL,
    target_user_ids JSON NULL,
    is_published BOOLEAN DEFAULT FALSE,
    expiry_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_company_published (company_id, is_published),
    INDEX idx_priority (priority),
    INDEX idx_expiry (expiry_date)
);

-- Meetings table for meeting management
CREATE TABLE IF NOT EXISTS meetings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    organizer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    meeting_type ENUM('internal', 'external', 'client', 'training', 'review') DEFAULT 'internal',
    department_id INT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    meeting_link VARCHAR(500) NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_company_date (company_id, meeting_date),
    INDEX idx_organizer (organizer_id),
    INDEX idx_status (status)
);

-- Meeting attendees junction table
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    meeting_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('invited', 'accepted', 'declined', 'tentative') DEFAULT 'invited',
    response_date TIMESTAMP NULL,
    attendance_status ENUM('present', 'absent', 'late') NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting_user (meeting_id, user_id),
    INDEX idx_user_meetings (user_id),
    INDEX idx_attendance_status (attendance_status)
);

-- Meeting types table
CREATE TABLE IF NOT EXISTS meeting_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    default_duration INT DEFAULT 60,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_status (company_id, status)
);

-- Meeting rooms table
CREATE TABLE IF NOT EXISTS meeting_rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity INT DEFAULT 10,
    equipment TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_status (company_id, status)
);

-- Training Programs table
CREATE TABLE IF NOT EXISTS training_programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(100),
    cost DECIMAL(10,2) DEFAULT 0.00,
    trainer VARCHAR(255),
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_company_status (company_id, status)
);

-- Training Enrollments table
CREATE TABLE IF NOT EXISTS training_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    employee_id INT NOT NULL,
    program_id INT NOT NULL,
    enrolled_by INT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date DATE,
    status ENUM('enrolled', 'in_progress', 'completed', 'cancelled') DEFAULT 'enrolled',
    grade VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
    FOREIGN KEY (enrolled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employee_program (employee_id, program_id),
    INDEX idx_company_status (company_id, status)
);
