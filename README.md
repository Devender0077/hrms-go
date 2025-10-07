# 🏢 HRMS HUI v2 (hrms-go)

A modern Human Resource Management System (HRMS) combining a Vite + React TypeScript frontend with a Node.js (Express) backend and MySQL. This repository contains the frontend HUI (v2) and a modular backend under `src/backend` with migrations and demo data.

## 🚀 Quick Setup (Recommended)

Use our automated setup script for consistent installation across different environments:

```bash
# Make the setup script executable
chmod +x setup-project.sh

# Run the complete setup
./setup-project.sh

# Start the backend server
./setup-project.sh start-backend
```

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MySQL 8.0+** - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Manual Installation

### 1. Clone and Setup
```bash
git clone <repository-url>
cd hrms_hui_v2
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd src/backend
npm install
cd ../..
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hrmgo_hero;"

# Run migrations (automated)
cd src/backend
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigrations() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '', // Update with your MySQL password
    database: 'hrmgo_hero'
  });
  
  try {
    const migrationFiles = fs.readdirSync('./migrations').filter(file => file.endsWith('.js'));
    console.log('Running', migrationFiles.length, 'migrations...');
    
    for (const file of migrationFiles) {
      console.log('Running:', file);
      const migration = require('./migrations/' + file);
      await migration.up(pool);
    }
    
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await pool.end();
  }
}

runMigrations();
"
cd ../..
```

### 4. Environment Configuration
```bash
# Create backend environment file
cat > src/backend/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hrmgo_hero

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:3000
EOF
```

### 5. Start the Application
```bash
# Terminal 1: Start backend server
cd src/backend
node server.js

# Terminal 2: Start frontend development server
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1/health
- **API Documentation**: http://localhost:8000/api/v1

## 🔐 Default Login Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Super Admin** | admin@example.com | admin123 | Full system access |
| **Company Admin** | company@example.com | company123 | Company-wide management |
| **HR Manager** | hr@example.com | hr123 | HR operations |
| **Manager** | manager@example.com | manager123 | Team management |
| **Employee** | employee@example.com | employee123 | Basic employee access |

## 🏗️ Project Structure

```
hrms_hui_v2/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Shared components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── employees/      # Employee management
│   │   ├── hr-setup/       # HR system setup
│   │   └── ui/             # UI components
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── employees/      # Employee pages
│   │   ├── timekeeping/    # Timekeeping pages
│   │   └── training/       # Training pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── contexts/           # React contexts
│   ├── utils/              # Utility functions
│   └── backend/            # Node.js backend
│       ├── routes/         # API routes
│       ├── migrations/     # Database migrations
│       ├── models/         # Database models
│       └── server.js       # Main server file
├── public/                 # Static assets
├── setup-project.sh       # Automated setup script
└── package.json           # Frontend dependencies
```

## 🔧 Key Features

### 📊 **Dashboard & Analytics**
- Real-time dashboard with key metrics
- Role-based dashboard views
- Interactive charts and statistics

### 👥 **Employee Management**
- Complete employee lifecycle management
- Employee documents and contracts
- Salary management and history
- Performance tracking

### 🕒 **Timekeeping & Attendance**
- **Attendance Muster**: Daily attendance tracking with status codes (P, A, L, H, R, O, D, ?)
- **Attendance Calculation Rules**: Configurable rules for half-day, full-day, present, absent, etc.
- Shift management and policies
- Time tracking and regularization

### 🏖️ **Leave Management**
- Leave applications and approvals
- Leave balances and policies
- Holiday management
- Leave reports and analytics

### 💰 **Payroll System**
- Salary components management
- Payslip generation
- Payroll reports
- Expense management

### 🎯 **Performance Management**
- Goal setting and tracking
- Performance reviews
- Competency management
- 360-degree feedback

### 🎓 **Training & Development**
- Training programs and sessions
- Employee training tracking
- Skill development plans
- Training reports

### 📈 **Recruitment**
- Job postings and management
- Candidate tracking
- Interview scheduling
- Recruitment analytics

### 🏢 **Organization Management**
- Department and designation setup
- Branch management
- Organization chart
- Role and permission management

### 📊 **Reports & Analytics**
- Comprehensive reporting system
- Custom report generation
- Data export capabilities
- Real-time analytics

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout

### Employees
- `GET /api/v1/employees` - Get all employees
- `POST /api/v1/employees` - Create employee
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Timekeeping
- `GET /api/v1/timekeeping/muster` - Get attendance muster
- `PUT /api/v1/timekeeping/:id` - Update attendance record
- `POST /api/v1/timekeeping` - Create attendance record

### Leave Management
- `GET /api/v1/leave/applications` - Get leave applications
- `POST /api/v1/leave/applications` - Create leave application
- `PUT /api/v1/leave/applications/:id` - Update leave application

### Payroll
- `GET /api/v1/payroll/salaries` - Get salary information
- `POST /api/v1/payroll/salaries` - Create salary record
- `GET /api/v1/payroll/payslips` - Get payslips

### HR Setup
- `GET /api/v1/hr-setup/attendance-rules` - Get attendance calculation rules
- `POST /api/v1/hr-setup/attendance-rules` - Create attendance rule
- `PUT /api/v1/hr-setup/attendance-rules/:id` - Update attendance rule

## 🛠️ Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd src/backend
node server.js       # Start development server
npm test            # Run tests (if available)
```

### Database Management
```bash
# Run migrations
./setup-project.sh migrate

# Check database connection
./setup-project.sh check
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check MySQL is running
   mysql -u root -e "SELECT 1;"
   
   # Update database credentials in src/backend/.env
   ```

2. **Port Already in Use**
   ```bash
   # Kill existing processes
   pkill -f "node server.js"
   
   # Or change port in src/backend/.env
   PORT=8001
   ```

3. **Permission Errors**
   ```bash
   # Fix file permissions
   chmod +x setup-project.sh
   chmod -R 755 src/
   ```

4. **Missing Dependencies**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   
   cd src/backend
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Role Permission Update Errors**
   ```bash
   # Check backend server is running
   curl http://localhost:8000/api/v1/health
   
   # Restart backend server
   cd src/backend
   node server.js
   ```

6. **Attendance Muster Not Loading**
   ```bash
   # Verify attendance tables exist
   mysql -u root -p hrmgo_hero -e "SHOW TABLES LIKE 'attendance%';"
   
   # Run attendance migration
   cd src/backend
   node migrations/20241201_create_attendance_tables.js
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Proprietary License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

## 📝 Changelog

### Version 2.4.4
- ✅ **Fixed SQL errors** in role permissions update
- ✅ **Added Attendance Muster** with daily tracking and status codes
- ✅ **Implemented Attendance Calculation Rules** for configurable attendance logic
- ✅ **Enhanced sidebar navigation** with proper permission filtering
- ✅ **Created automated setup script** for consistent environment setup
- ✅ **Fixed API endpoint routing** for attendance and timekeeping
- ✅ **Improved error handling** and user feedback
- ✅ **Added comprehensive documentation** and troubleshooting guide

### Version 2.4.0
- Added comprehensive permission system (224 permissions)
- Implemented role-based access control
- Enhanced user management with detailed permissions
- Fixed form population issues across HR setup modules
- Improved database schema with proper relationships
- Added dynamic version management
- Enhanced UI consistency across all modules

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting dashboard
- [ ] Integration with external HR systems
- [ ] Multi-language support
- [ ] Advanced workflow automation
- [ ] Real-time notifications
- [ ] Advanced analytics and AI insights

---

## 🎉 Acknowledgments

Built with ❤️ using modern web technologies and best practices. Special thanks to all contributors and the open-source community.

**HRMS HUI v2** - Empowering organizations with modern HR management solutions.