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

-- Trip expenses table for detailed expense tracking
CREATE TABLE IF NOT EXISTS trip_expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    receipt_url VARCHAR(500),
    date_incurred DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_trip_category (trip_id, category),
    INDEX idx_date_incurred (date_incurred)
);

-- Announcement views tracking
CREATE TABLE IF NOT EXISTS announcement_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    announcement_id INT NOT NULL,
    user_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_announcement_user_view (announcement_id, user_id),
    INDEX idx_user_views (user_id),
    INDEX idx_viewed_at (viewed_at)
);

-- Meeting minutes table
CREATE TABLE IF NOT EXISTS meeting_minutes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    meeting_id INT NOT NULL,
    created_by INT NOT NULL,
    content TEXT NOT NULL,
    action_items JSON,
    decisions JSON,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_meeting_minutes (meeting_id)
);

-- Insert default permissions for new features
INSERT IGNORE INTO permissions (module, permission_name, permission_description) VALUES
-- Trips permissions
('trips', 'trips.view', 'View trips'),
('trips', 'trips.create', 'Create trips'),
('trips', 'trips.edit', 'Edit trips'),
('trips', 'trips.delete', 'Delete trips'),
('trips', 'trips.approve', 'Approve trips'),

-- Announcements permissions
('announcements', 'announcements.view', 'View announcements'),
('announcements', 'announcements.create', 'Create announcements'),
('announcements', 'announcements.edit', 'Edit announcements'),
('announcements', 'announcements.delete', 'Delete announcements'),
('announcements', 'announcements.publish', 'Publish announcements'),

-- Meetings permissions
('meetings', 'meetings.view', 'View meetings'),
('meetings', 'meetings.create', 'Create meetings'),
('meetings', 'meetings.edit', 'Edit meetings'),
('meetings', 'meetings.delete', 'Delete meetings'),
('meetings', 'meetings.attend', 'Attend meetings'),
('meetings', 'meetings.minutes', 'Create meeting minutes');

-- Default data will be inserted through the application
