# 📊 DATABASE TABLES USAGE GUIDE

## 🎯 SETTINGS TABLES (IMPORTANT!)

### **1. `settings` ✅ ACTIVE - USE THIS ONE**
**Structure:**
```sql
- id, company_id, category, setting_key, setting_value, 
  setting_type, is_public, description, created_at, updated_at
- HAS category column ✅
- Records: 122
```

**Used In:**
- ✅ `src/backend/routes/settings.routes.js` - Main settings API
- ✅ `src/backend/services/pusher.service.js` - Pusher initialization
- ✅ `src/backend/services/integrations.service.js` - All integrations
- ✅ Frontend: `src/pages/settings/index.tsx` via API

**Data Format:**
```sql
category = 'company', setting_key = 'name', setting_value = 'HRMS Company'
category = 'general', setting_key = 'siteName', setting_value = 'HRMS HUI V2'
category = 'integration', setting_key = 'pusher', setting_value = '{"enabled":false,...}'
```

---

### **2. `system_settings` ⚠️ LEGACY - BEING PHASED OUT**
**Structure:**
```sql
- id, company_id, setting_key, setting_value, created_at, updated_at
- NO category column ❌
- Records: 118
```

**Used In:**
- ❌ `src/backend/seed-default-settings.js` - OLD seeding script (don't use)
- ⚠️ Some old migrations reference it

**Data Format:**
```sql
setting_key = 'general.siteName', setting_value = 'HRMS HUI V2'
setting_key = 'company.name', setting_value = 'HRMS Company'
```

**Status:** Data migrated to `settings` table. Can be dropped after verification.

---

### **3. `cache_settings` ❌ NOT USED**
**Status:** Empty table, not referenced in code. Can be dropped.

---

### **4. `seo_settings` ❌ NOT USED**
**Status:** Empty table, not referenced in code. Can be dropped.

---

### **5. `chatgpt_settings` ❌ NOT USED**
**Status:** Empty table, not referenced in code. Can be dropped.

---

### **6. `cookie_consent_settings` ❌ NOT USED**
**Status:** Empty table, not referenced in code. Can be dropped.

---

## 📋 CORE TABLES (ACTIVE)

### **Users & Authentication**
| Table | Used In | Purpose |
|-------|---------|---------|
| `users` | `src/backend/routes/user.routes.js` | System users (login, roles) |
| `roles` | `src/backend/routes/roles.routes.js` | User roles (super_admin, hr, etc.) |
| `permissions` | `src/backend/routes/permissions.routes.js` | Permission definitions |
| `role_permissions` | `src/backend/routes/roles.routes.js` | Role-permission mappings |
| `user_permissions` | `src/backend/routes/user.routes.js` | User-specific permissions |
| `user_roles` | `src/backend/routes/user.routes.js` | User-role mappings |

### **Company Structure**
| Table | Used In | Purpose |
|-------|---------|---------|
| `companies` | `src/backend/routes/company.routes.js` | Company master data |
| `branches` | `src/backend/routes/branch.routes.js` | Company branches |
| `departments` | `src/backend/routes/department.routes.js` | Departments |
| `designations` | `src/backend/routes/designation.routes.js` | Job designations |

### **Employees**
| Table | Used In | Purpose |
|-------|---------|---------|
| `employees` | `src/backend/routes/employee.routes.js` | Employee master data |
| `employee_documents` | `src/backend/routes/document.routes.js` | Employee documents |
| `employee_salaries` | `src/backend/routes/payroll.routes.js` | Salary information |
| `employee_education` | `src/backend/routes/employee.routes.js` | Education history |
| `employee_experience` | `src/backend/routes/employee.routes.js` | Work experience |
| `employee_skills` | `src/backend/routes/employee.routes.js` | Skills |
| `employee_certifications` | `src/backend/routes/employee.routes.js` | Certifications |
| `employee_emergency_contacts` | `src/backend/routes/employee.routes.js` | Emergency contacts |
| `employee_family` | `src/backend/routes/employee.routes.js` | Family details |

### **Attendance & Time Tracking**
| Table | Used In | Purpose |
|-------|---------|---------|
| `attendance` | `src/backend/routes/attendance.routes.js` | Daily attendance records |
| `attendance_records` | `src/backend/routes/attendance.routes.js` | Attendance history |
| `attendance_calculation_rules` | `src/backend/routes/hr-setup.routes.js` | Attendance rules |
| `attendance_policies` | `src/backend/routes/attendance.routes.js` | Attendance policies |
| `shifts` | `src/backend/routes/shift.routes.js` | Work shifts |
| `shift_assignments` | `src/backend/routes/shift.routes.js` | Employee shift assignments |
| `weekend_configs` | `src/backend/routes/hr-setup.routes.js` | Weekend configuration |
| `timesheets` | `src/backend/routes/timesheet.routes.js` | Timesheet entries |

### **Leave Management**
| Table | Used In | Purpose |
|-------|---------|---------|
| `leave_types` | `src/backend/routes/leave.routes.js` | Leave type definitions |
| `leave_applications` | `src/backend/routes/leave.routes.js` | Leave requests |
| `leave_approvals` | `src/backend/routes/leave.routes.js` | Leave approvals |
| `leave_balances` | `src/backend/routes/leave.routes.js` | Leave balance tracking |
| `leave_holidays` | `src/backend/routes/leave.routes.js` | Holiday calendar |
| `leave_policies` | `src/backend/routes/leave.routes.js` | Leave policies |
| `leave_workflows` | `src/backend/routes/leave.routes.js` | Approval workflows |

### **Payroll**
| Table | Used In | Purpose |
|-------|---------|---------|
| `payroll` | `src/backend/routes/payroll.routes.js` | Payroll master |
| `payroll_runs` | `src/backend/routes/payroll.routes.js` | Payroll processing runs |
| `payroll_payslips` | `src/backend/routes/payroll.routes.js` | Generated payslips |
| `payroll_components` | `src/backend/routes/payroll.routes.js` | Salary components |
| `payroll_deductions` | `src/backend/routes/payroll.routes.js` | Deductions |
| `salary_components` | `src/backend/routes/payroll.routes.js` | Component definitions |
| `allowance_options` | `src/backend/routes/payroll.routes.js` | Allowance types |
| `deduction_options` | `src/backend/routes/payroll.routes.js` | Deduction types |
| `loan_options` | `src/backend/routes/payroll.routes.js` | Loan types |

### **Recruitment**
| Table | Used In | Purpose |
|-------|---------|---------|
| `jobs` | `src/backend/routes/job.routes.js` | Job postings |
| `job_postings` | `src/backend/routes/job.routes.js` | Job listings |
| `job_applications` | `src/backend/routes/job.routes.js` | Applications |
| `job_stages` | `src/backend/routes/job.routes.js` | Recruitment stages |
| `candidates` | `src/backend/routes/candidate.routes.js` | Candidate profiles |
| `interviews` | `src/backend/routes/interview.routes.js` | Interview schedules |
| `interview_schedules` | `src/backend/routes/interview.routes.js` | Interview details |

### **Performance Management**
| Table | Used In | Purpose |
|-------|---------|---------|
| `performance_reviews` | `src/backend/routes/performance.routes.js` | Performance reviews |
| `performance_cycles` | `src/backend/routes/performance.routes.js` | Review cycles |
| `performance_goals` | `src/backend/routes/performance.routes.js` | Performance goals |
| `performance_ratings` | `src/backend/routes/performance.routes.js` | Ratings |
| `goals` | `src/backend/routes/goal.routes.js` | Goal definitions |
| `goal_tracking` | `src/backend/routes/goal.routes.js` | Goal progress |
| `goal_updates` | `src/backend/routes/goal.routes.js` | Goal updates |

### **Training**
| Table | Used In | Purpose |
|-------|---------|---------|
| `training_programs` | `src/backend/routes/training.routes.js` | Training programs |
| `training_sessions` | `src/backend/routes/training.routes.js` | Training sessions |
| `training_enrollments` | `src/backend/routes/training.routes.js` | Employee enrollments |
| `training_participants` | `src/backend/routes/training.routes.js` | Session participants |
| `training_types` | `src/backend/routes/training.routes.js` | Training categories |

### **Documents**
| Table | Used In | Purpose |
|-------|---------|---------|
| `documents` | `src/backend/routes/document.routes.js` | Document master |
| `document_types` | `src/backend/routes/document.routes.js` | Document categories |
| `document_categories` | `src/backend/routes/document.routes.js` | Document classification |
| `document_versions` | `src/backend/routes/document.routes.js` | Version control |
| `offer_letters` | `src/backend/routes/document.routes.js` | Offer letters |
| `joining_letters` | `src/backend/routes/document.routes.js` | Joining letters |
| `noc_letters` | `src/backend/routes/document.routes.js` | NOC letters |
| `experience_certificates` | `src/backend/routes/document.routes.js` | Experience certificates |

### **Assets**
| Table | Used In | Purpose |
|-------|---------|---------|
| `assets` | `src/backend/routes/asset.routes.js` | Asset master |
| `asset_categories` | `src/backend/routes/asset.routes.js` | Asset categories |
| `asset_assignments` | `src/backend/routes/asset.routes.js` | Asset assignments |

### **Projects & Tasks**
| Table | Used In | Purpose |
|-------|---------|---------|
| `projects` | `src/backend/routes/project.routes.js` | Project master |
| `project_assignments` | `src/backend/routes/project.routes.js` | Project team |
| `project_tasks` | `src/backend/routes/project.routes.js` | Project tasks |
| `tasks` | `src/backend/routes/task.routes.js` | Task master |
| `task_comments` | `src/backend/routes/task.routes.js` | Task comments |

### **Communication**
| Table | Used In | Purpose |
|-------|---------|---------|
| `announcements` | `src/backend/routes/announcement.routes.js` | Company announcements |
| `messages` | `src/backend/routes/message.routes.js` | Internal messaging |
| `messenger` | `src/backend/routes/message.routes.js` | Messenger data |
| `notifications` | `src/backend/routes/notification.routes.js` | User notifications |
| `notification_templates` | `src/backend/routes/notification.routes.js` | Notification templates |
| `email_templates` | `src/backend/routes/email.routes.js` | Email templates |

### **Meetings & Calendar**
| Table | Used In | Purpose |
|-------|---------|---------|
| `meetings` | `src/backend/routes/meeting.routes.js` | Meeting master |
| `meeting_attendees` | `src/backend/routes/meeting.routes.js` | Meeting participants |
| `meeting_rooms` | `src/backend/routes/meeting.routes.js` | Meeting rooms |
| `calendar_events` | `src/backend/routes/calendar.routes.js` | Calendar events |
| `events` | `src/backend/routes/event.routes.js` | Event master |

### **Employee Lifecycle**
| Table | Used In | Purpose |
|-------|---------|---------|
| `promotions` | `src/backend/routes/promotion.routes.js` | Promotions |
| `transfers` | `src/backend/routes/transfer.routes.js` | Transfers |
| `resignations` | `src/backend/routes/resignation.routes.js` | Resignations |
| `terminations` | `src/backend/routes/termination.routes.js` | Terminations |
| `warnings` | `src/backend/routes/warning.routes.js` | Warnings |
| `complaints` | `src/backend/routes/complaint.routes.js` | Complaints |
| `awards` | `src/backend/routes/award.routes.js` | Awards |

### **Expenses**
| Table | Used In | Purpose |
|-------|---------|---------|
| `expenses` | `src/backend/routes/expense.routes.js` | Expense claims |
| `expense_categories` | `src/backend/routes/expense.routes.js` | Expense categories |
| `expense_types` | `src/backend/routes/expense.routes.js` | Expense types |

### **Integrations**
| Table | Used In | Purpose |
|-------|---------|---------|
| `google_calendar_integrations` | `src/backend/routes/integrations.routes.js` | Google Calendar sync |
| `webhooks` | `src/backend/routes/webhook.routes.js` | Webhook configurations |
| `webhook_logs` | `src/backend/routes/webhook.routes.js` | Webhook execution logs |
| `api_keys` | `src/backend/routes/api.routes.js` | API key management |

### **System & Audit**
| Table | Used In | Purpose |
|-------|---------|---------|
| `audit_logs` | `src/backend/routes/audit-logs.routes.js` | System audit trail |
| `migrations` | `src/backend/server.js` | Migration tracking |
| `reports` | `src/backend/routes/report.routes.js` | Generated reports |

### **Miscellaneous**
| Table | Used In | Purpose |
|-------|---------|---------|
| `holidays` | `src/backend/routes/leave.routes.js` | Holiday master (old) |
| `chatgpt_conversations` | Not used | Legacy |
| `file_uploads` | `src/backend/routes/upload.routes.js` | File upload tracking |

---

## 🔧 RECOMMENDATION: CLEANUP NEEDED

### **Tables to DROP (Not Used):**
```sql
DROP TABLE IF EXISTS cache_settings;
DROP TABLE IF EXISTS seo_settings;
DROP TABLE IF EXISTS chatgpt_settings;
DROP TABLE IF EXISTS cookie_consent_settings;
```

### **Tables to KEEP but PHASE OUT:**
```sql
-- Keep for now, but migrate all code to use 'settings' table
-- After verification, can drop system_settings
```

### **Migration Script Created:**
- ✅ `src/backend/migrate-settings-data.js` - Migrated 118 records from system_settings → settings

---

## 📊 CURRENT STATUS

**Active Settings Table:** `settings` (122 records)
- ✅ All backend code updated to use this table
- ✅ Has category column
- ✅ Properly structured
- ✅ All data migrated

**Legacy Settings Table:** `system_settings` (118 records)
- ⚠️ Data migrated to settings table
- ⚠️ Can be dropped after verification
- ⚠️ No category column

**Unused Settings Tables:** 4 tables
- ❌ `cache_settings` - Empty, not used
- ❌ `seo_settings` - Empty, not used
- ❌ `chatgpt_settings` - Empty, not used
- ❌ `cookie_consent_settings` - Empty, not used

---

## ✅ VERIFICATION COMMANDS

```bash
# Check settings table
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "USE hrmgo_hero; SELECT COUNT(*) FROM settings;"

# Check company settings
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "USE hrmgo_hero; SELECT * FROM settings WHERE category = 'company';"

# Check integration settings
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "USE hrmgo_hero; SELECT * FROM settings WHERE category = 'integration';"
```

---

## 🎯 FINAL RECOMMENDATION

**Use ONLY the `settings` table for all application settings.**

**Structure:**
```sql
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,      -- ✅ HAS THIS
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string','number','boolean','json'),
  is_public BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (company_id, category, setting_key)
);
```

**All code now uses this table exclusively!** ✅
