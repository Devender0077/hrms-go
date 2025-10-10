# 🚀 HRMS System - Complete HR Management Solution

**Version:** 3.5.0  
**Last Updated:** October 10, 2025

A comprehensive, modern Human Resource Management System built with React, TypeScript, Node.js, and MySQL.

---

## ✨ Features

### 🎯 Core Modules
- **Dashboard** - Role-based dashboards with real-time analytics
- **Employee Management** - Complete employee lifecycle management
- **Attendance & Time Tracking** - Biometric integration, check-in/out, overtime
- **Leave Management** - Leave requests, approvals, balance tracking
- **Payroll** - Salary processing, payslips, tax management
- **Performance Management** - Goals, reviews, appraisals
- **Recruitment** - Job postings, candidates, interviews
- **Document Management** - Employee documents, expiry tracking
- **Organization Structure** - Departments, branches, designations

### 🔐 Security & Authentication
- **Face Recognition** - AI-powered facial recognition login
- **Role-Based Access Control** - 5 roles (super_admin, company_admin, hr_manager, manager, employee)
- **JWT Authentication** - Secure token-based authentication
- **Audit Logs** - Complete system activity tracking
- **Permissions System** - 255 granular permissions

### 🌍 Internationalization
- **10 Languages** - English, Hindi, Spanish, French, German, Chinese, Arabic, Portuguese, Russian, Japanese
- **358+ Translation Keys** - Comprehensive translation coverage
- **i18next Integration** - Industry-standard i18n framework
- **100% Hindi Translation** - Complete native language support

### 🎨 UI/UX
- **HeroUI Components** - Modern, accessible component library
- **Dark/Light Mode** - Theme switching with custom branding
- **Responsive Design** - Mobile-first, works on all devices
- **Framer Motion** - Smooth animations and transitions
- **Custom Illustrations** - 85+ SVG illustrations

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first CSS
- **HeroUI** - Component library
- **i18next** - Internationalization
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Face-api.js** - Face recognition
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL/MariaDB** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin support

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MySQL 8+ or MariaDB 10+
- Git

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Devender0077/hrms-go.git
cd hrms-go
```

2. **Install dependencies:**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd src/backend
npm install
cd ../..
```

3. **Configure database:**
```bash
# Create database
mysql -u root -p
CREATE DATABASE hrmgo_hero;
EXIT;

# Run migrations
cd src/backend
node migrations/run-all-migrations.js
```

4. **Configure environment:**
```bash
# Backend .env
cd src/backend
cp .env.example .env
# Edit .env with your database credentials
```

5. **Start the application:**
```bash
# Start backend server
cd src/backend
node server.js &

# Start frontend (in new terminal)
cd ../..
npm run dev
```

6. **Access the application:**
```
Frontend: http://localhost:5173
Backend API: http://localhost:8000
```

---

## 🔑 Default Credentials

### Super Admin
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** super_admin

### Company Admin
- **Email:** company@example.com
- **Password:** company123
- **Role:** company_admin

### HR Manager
- **Email:** hr@example.com
- **Password:** hr123
- **Role:** hr_manager

---

## 📊 Super Admin Dashboard

### Dashboard Sections (9 Comprehensive Sections):

1. **Organization Overview** - 8 summary cards with trends
   - Total Employees, Departments, Branches, Attendance Rate
   - Active Users, Designations, Monthly Joinees, Monthly Exits

2. **Payroll & Finance Summary**
   - Total monthly payroll, salary disbursement status
   - Pending payslips, quick payroll management

3. **Attendance & Leave Insights**
   - Daily attendance breakdown (Present/Absent/Leave/Remote)
   - Late check-ins, pending leave requests

4. **Employee Management Insights**
   - New joinees, exiting employees, pending approvals

5. **System & Module Overview**
   - Active/disabled modules, database size
   - Last backup, system uptime

6. **Security & Audit Logs**
   - Successful/failed logins, system changes
   - Quick access to audit logs

7. **Recent Activities**
   - Latest 5 audit log entries
   - Real-time from API

8. **Quick Actions (8 Shortcuts)**
   - Add Employee, Add Branch, Generate Payroll, Sync Attendance
   - Manage Users, Manage Roles, System Settings, Export Reports

9. **System Alerts & Notifications**
   - System updates, backup status, pending approvals

---

## 🛠️ Development

### Backend Development
```bash
# Restart backend after route changes
./restart-backend.sh

# Or manually:
cd src/backend
pkill -f "node.*server.js"
node server.js &
```

### Frontend Development
```bash
# Frontend auto-reloads with Vite
npm run dev
```

### Database Migrations
```bash
cd src/backend
node migrations/[migration-file].js
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/face-login` - Face recognition login
- `POST /auth/logout` - User logout

#### Dashboard
- `GET /dashboard/super-admin` - Super admin statistics
- `GET /dashboard/company-admin` - Company admin statistics
- `GET /dashboard/employee` - Employee statistics

#### Audit Logs
- `GET /audit-logs` - Get audit logs (paginated)
- `GET /audit-logs/stats` - Get audit statistics
- `POST /audit-logs` - Create audit log entry

#### Users & Roles
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `GET /roles` - Get all roles
- `GET /permissions` - Get all permissions

---

## 🎨 Customization

### Theme & Branding
- Navigate to **Settings → Appearance**
- Customize colors, logo, and theme
- Changes apply system-wide

### Language
- Navigate to **Settings → Localization**
- Select from 10 available languages
- Changes apply immediately

---

## 🔧 Troubleshooting

### Backend Issues

**404 Not Found:**
- Restart backend server: `./restart-backend.sh`

**403 Forbidden:**
- Logout and login to refresh JWT token

**500 Internal Server Error:**
- Check backend logs: `tail -f src/backend/server.log`

### Frontend Issues

**Old Code Loading:**
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or use Incognito mode

**Translation Not Working:**
- Check language setting in Settings → Localization
- Verify i18n files are loaded

---

## 📝 Important Notes

### Role System
- **super_admin** - System administrator (full access)
- **company_admin** - Company administrator
- **hr_manager** - HR manager
- **manager** - Department manager
- **employee** - Regular employee

### After Updates
- **Backend changes:** Restart backend server
- **Frontend changes:** Auto-reloads with Vite
- **Database changes:** Run migrations
- **Role changes:** Logout and login

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues, questions, or contributions:
- **GitHub:** https://github.com/Devender0077/hrms-go
- **Issues:** https://github.com/Devender0077/hrms-go/issues

---

## 🎉 Recent Updates (v3.5.0)

### October 10, 2025
- ✅ Complete Super Admin Dashboard redesign
- ✅ Added 9 comprehensive dashboard sections
- ✅ Created backend APIs for dashboard and audit logs
- ✅ Fixed role mapping bug (super_admin → admin)
- ✅ Integrated real-time data from database
- ✅ Added 15+ functional navigation buttons
- ✅ Enhanced security and audit features
- ✅ Improved error handling and loading states
- ✅ Added Quick Actions shortcuts
- ✅ Added System Alerts & Notifications

---

**Built with ❤️ for modern HR management**
