# 🏢 HRMS HUI v2 - Enterprise HR Management System

A comprehensive, modern Human Resource Management System built with React, TypeScript, Node.js, and MySQL. Features a modular architecture, role-based access control, and a beautiful responsive UI with advanced search functionality and dynamic theming.

## ✨ Features

### 🎯 Core HR Modules
- **Employee Management** - Complete employee lifecycle management
- **User Management** - Role-based access control with permissions
- **Organization Chart** - Interactive hierarchical organization view
- **Leave Management** - Comprehensive leave tracking and approval workflows
- **Attendance & Timekeeping** - Time tracking with shift management
- **Payroll Processing** - Salary management and payslip generation
- **Recruitment** - Job postings, candidate management, and interviews
- **Task Management** - Project and task assignment system
- **Performance Reviews** - Goal setting and performance evaluation
- **Asset Management** - Company asset tracking and assignments
- **Expense Management** - Employee expense tracking and approval
- **Document Management** - Centralized document storage and management
- **Calendar & Events** - Company calendar with event management
- **Reports & Analytics** - Comprehensive reporting dashboard
- **Version History** - Complete release notes and version tracking

### 🎨 Modern UI/UX
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode** - Beautiful theme switching with system preference detection
- **Modern Components** - Built with HeroUI and TailwindCSS
- **Animations** - Smooth transitions and micro-interactions
- **Accessibility** - WCAG compliant with keyboard navigation support
- **Advanced Search** - Real-time search with keyboard shortcuts (Ctrl/Cmd + K)
- **Smart Notifications** - Interactive notification system with unread counts
- **Dynamic Theming** - Color customization that applies across the entire application

### 🏗️ Technical Architecture
- **Modular Backend** - 23 focused route modules with clean separation
- **Modular Database** - Schema split into domain-specific files with migration system
- **Migration System** - Comprehensive database migration management with 83+ migrations
- **API-First Design** - RESTful APIs with proper error handling
- **Type Safety** - Full TypeScript implementation
- **Security** - JWT authentication, role-based permissions, audit logging
- **Global Settings** - Dynamic theming, maintenance mode, debug mode
- **Advanced Search** - Real-time search with keyboard shortcuts and smart suggestions
- **Demo Data System** - Comprehensive sample data for testing and development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hrms_hui_v2
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd src/backend
   npm install
   cd ../..
   ```

3. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE hrmgo_hero;"
   
   # Run migrations (recommended)
   cd src/backend/migrations
   node migration-manager.js up
   
   # OR load all schemas
   cd src/database
   node load-schemas.js load all
   ```

4. **Environment Configuration**
   ```bash
   # Backend environment
   cd src/backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the application**
   ```bash
   # Start backend server
   cd src/backend
   npm start
   
   # Start frontend (in new terminal)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:8000

## 📁 Project Structure

```
hrms_hui_v2/
├── src/
│   ├── backend/                 # Node.js backend
│   │   ├── routes/             # 23 modular route files
│   │   ├── migrations/         # Database migration system
│   │   │   ├── migrations/     # Sequential migration files
│   │   │   └── migration-manager.js
│   │   └── server.cjs          # Main server
│   ├── components/             # React components
│   │   ├── common/             # Shared components (SearchBar, NotificationDropdown)
│   │   ├── settings/           # Settings-specific components
│   │   └── layouts/            # Layout components
│   ├── contexts/               # React contexts (Settings, Auth, Theme)
│   ├── pages/                  # Application pages
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API services
│   ├── utils/                  # Utility functions
│   └── assets/                 # Static assets (images, lottie animations)
├── Documentation/              # Comprehensive guides
└── README.md                   # This file
```

## 🛠️ Development Tools

### Database Management
```bash
# Check migration status
node migration-manager.js status

# Run pending migrations
node migration-manager.js up

# Rollback migration
node migration-manager.js down <migration-name>

# Load specific schema
node load-schemas.js load 01_core_tables

# Load all schemas
node load-schemas.js load all
```

### Available Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
npm start            # Start production server
npm run dev          # Start with nodemon
```

## 🔐 Default Credentials

The following default users are created automatically when you run the migrations:

### Super Admin (Primary Login)
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Super Administrator with full system access (224 permissions)
- **Database Role**: super_admin (mapped to admin in frontend)

### Company Admin
- **Email**: company@hrms.com
- **Password**: company123
- **Role**: Company Administrator with company-level access

### Employee
- **Email**: employee@hrms.com
- **Password**: employee123
- **Role**: Standard employee with basic access

> **Note**: The primary login for testing is `admin@example.com` with password `admin123`. This user has complete super admin access with all 224 permissions assigned. Additional test users may exist in the database for development purposes.

## 📊 Demo Data

The system includes comprehensive demo data for testing and development:

### Core HR Data
- **Sample Employees**: 10+ employees with complete profiles and face recognition data
- **Departments & Designations**: Pre-configured organizational structure
- **Attendance Records**: Sample attendance data with check-in/check-out times
- **Tasks & Calendar Events**: Sample tasks, projects, and calendar events
- **System Settings**: Pre-configured application settings with dynamic theming

### Leave & Payroll
- **Leave Applications**: Sample leave requests, approvals, and balances
- **Leave Types & Policies**: Complete leave management setup
- **Payroll Components**: Salary structures, deductions, and payslips
- **Payroll Records**: Sample payroll data with calculations

### Recruitment & Performance
- **Job Postings**: Sample job openings and descriptions
- **Candidates**: Complete candidate profiles and applications
- **Interviews**: Interview schedules and feedback
- **Performance Reviews**: Goal setting and performance evaluations
- **Performance Ratings**: Detailed performance assessments

### Training & Development
- **Training Programs**: Comprehensive training courses and materials
- **Training Sessions**: Scheduled training events and enrollments
- **Training Enrollments**: Employee training participation records

### Asset & Document Management
- **Assets**: Company equipment and asset assignments
- **Asset Categories**: Organized asset classification system
- **Documents**: Sample company documents and policies
- **Document Types**: Categorized document management
- **Employee Documents**: Individual employee document records

### Employee Lifecycle
- **Warnings**: Disciplinary actions and warnings
- **Resignations**: Employee resignation records
- **Terminations**: Termination documentation and procedures
- **Transfers**: Employee transfer requests and approvals
- **Complaints**: Workplace complaint management

### Meetings & Communications
- **Meeting Types**: Various meeting categories and templates
- **Meeting Rooms**: Conference rooms and facilities
- **Meetings**: Scheduled meetings with attendees
- **Messages**: Internal communication system
- **Notifications**: System notifications and alerts

### Audit & Reports
- **Audit Logs**: Complete system activity tracking
- **Reports**: Pre-configured report templates
- **Webhooks**: Integration endpoints and event logs
- **System Logs**: Comprehensive system monitoring

All demo data is automatically loaded when running migrations and provides a complete testing environment.

## 🔐 Permission System

The HRMS includes a comprehensive permission system with 224 detailed permissions across 19 modules:

### Permission Modules
- **Dashboard** (2 permissions): View Dashboard, Export Dashboard
- **Admin** (12 permissions): Backup, Database, Security, Logs, Audit, Settings, etc.
- **Employees** (12 permissions): View, Create, Edit, Delete, Manage, Reports, etc.
- **Attendance** (12 permissions): View, Create, Edit, Delete, Regularization, Reports, etc.
- **Leave** (12 permissions): View, Create, Edit, Delete, Approve, Reports, etc.
- **Payroll** (12 permissions): View, Create, Edit, Delete, Process, Reports, etc.
- **Recruitment** (12 permissions): View, Create, Edit, Delete, Manage, Reports, etc.
- **Tasks** (12 permissions): View, Create, Edit, Delete, Assign, Reports, etc.
- **Performance** (12 permissions): View, Create, Edit, Delete, Review, Reports, etc.
- **Assets** (12 permissions): View, Create, Edit, Delete, Assign, Reports, etc.
- **Expenses** (12 permissions): View, Create, Edit, Delete, Approve, Reports, etc.
- **Documents** (12 permissions): View, Create, Edit, Delete, Manage, Reports, etc.
- **Calendar** (12 permissions): View, Create, Edit, Delete, Manage, Reports, etc.
- **Meetings** (12 permissions): View, Create, Edit, Delete, Schedule, Reports, etc.
- **Training** (12 permissions): View, Create, Edit, Delete, Enroll, Reports, etc.
- **Reports** (12 permissions): View, Create, Edit, Delete, Export, Analytics, etc.
- **Settings** (12 permissions): View, Create, Edit, Delete, Manage, Configure, etc.
- **Organization** (12 permissions): View, Create, Edit, Delete, Manage, Reports, etc.
- **Timekeeping** (12 permissions): View, Create, Edit, Delete, Manage, Reports, etc.

### Role Hierarchy
1. **Super Admin** (`admin@example.com`): Full access to all 224 permissions
2. **Company Admin**: Company-level permissions
3. **HR Manager**: HR-specific permissions
4. **Manager**: Team management permissions
5. **Employee**: Basic access permissions

### Permission Management
- **Roles Page**: Manage permissions for each role
- **Select All**: Bulk permission assignment
- **Module-based**: Permissions organized by functional modules
- **Real-time Updates**: Permission changes take effect immediately

## 📝 Recent Updates (v2.3.0)

### ✨ New Features
- **Comprehensive Permission System**: 224 detailed permissions covering all CRUD operations
- **Role-Based Access Control**: Complete permission management with role assignment
- **Enhanced Authentication**: Fixed login system with proper role mapping
- **Permission Management UI**: Interactive roles page with permission assignment
- **Select All Functionality**: Bulk permission selection for efficient management
- **Version History Page**: Complete release notes and version tracking system
- **Enhanced Search**: Advanced search with keyboard shortcuts (Ctrl/Cmd + K)
- **Smart Notifications**: Interactive notification system with unread counts
- **Dynamic System Status**: Real-time system status and version display in sidebar
- **Comprehensive Demo Data**: Complete sample data across all HR modules
- **Advanced Audit System**: Comprehensive audit logging and reporting
- **Webhook Integration**: Event-driven webhook system for external integrations

### 🐛 Bug Fixes
- **Authentication System**: Fixed login issues and role mapping problems
- **Permission Checking**: Resolved "Access Denied" errors for super admin users
- **Roles Page**: Fixed "No Permissions Found" error in permission management
- **API Endpoints**: Corrected permission API endpoints and data structure
- **Frontend Permission Logic**: Fixed usePermissions hook to properly handle admin role
- **Database Permissions**: Assigned all 224 permissions to super admin role
- **Modal Functionality**: Fixed permission modal loading and selection
- **API Connection**: Resolved ERR_CONNECTION_REFUSED errors
- **Settings Context**: Fixed undefined settings errors
- **Auth Service**: Corrected permission fetching and token handling
- Fixed API errors across all pages
- Resolved employee data fetching issues (404 errors)
- Fixed settings persistence problems
- Corrected database migration issues
- Fixed search bar input blocking
- Resolved notification dropdown errors
- Fixed system settings table creation
- Fixed all console errors and warnings
- Resolved database foreign key constraint issues
- Fixed webhook log foreign key errors

### 🔧 Improvements
- **Permission Architecture**: Complete permission system with 19 modules and 224 permissions
- **Role Management**: Enhanced role-based access control with proper permission assignment
- **Authentication Flow**: Improved login process with proper role mapping
- **Database Structure**: Enhanced permissions and role_permissions tables
- **Frontend Security**: Better permission checking and access control
- **User Experience**: Fixed all access denied issues for super admin users
- **API Performance**: Optimized permission loading and caching
- **Error Handling**: Better error messages and user feedback
- **Debug Logging**: Added comprehensive logging for troubleshooting
- Better error handling and user feedback
- Improved database structure and migrations (83+ migrations)
- Enhanced security with proper authentication
- Optimized API performance
- Better mobile user experience
- Comprehensive demo data system across all modules
- Complete employee lifecycle management
- Advanced asset management system
- Meeting and calendar management
- Document management with version control
- Notification templates and messaging system
- Audit logs and system reports
- Webhook management and logging

## 📊 System Requirements

### Minimum Requirements
- **RAM**: 4GB
- **Storage**: 2GB free space
- **CPU**: 2 cores
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Recommended Requirements
- **RAM**: 8GB+
- **Storage**: 5GB+ free space
- **CPU**: 4+ cores
- **Browser**: Latest version

## 🏗️ Architecture

### Backend Architecture
- **Express.js** - Web framework
- **MySQL** - Primary database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin requests

### Frontend Architecture
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **HeroUI** - Component library
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation

### Database Architecture
- **Modular Schema** - 8 domain-specific files
- **Migration System** - Version-controlled changes
- **Foreign Keys** - Data integrity
- **Indexes** - Performance optimization
- **Audit Logging** - Change tracking

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hrmgo_hero

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=8000
NODE_ENV=development
```

### Customization
- **Themes**: Modify `src/contexts/theme-context.tsx`
- **API Endpoints**: Update `src/config/api-config.ts`
- **Routes**: Modify `src/config/routes.ts`
- **Permissions**: Update database permissions table

## 📈 Performance

### Optimizations
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - WebP format with fallbacks
- **Caching** - API response caching
- **Database Indexing** - Optimized queries
- **Bundle Analysis** - Regular bundle size monitoring

### Monitoring
- **Error Tracking** - Comprehensive error logging
- **Performance Metrics** - Response time monitoring
- **Database Monitoring** - Query performance tracking
- **User Analytics** - Usage pattern analysis

## 🧪 Testing

### Test Coverage
- **Unit Tests** - Component and utility testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user journey testing
- **Performance Tests** - Load and stress testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd src/backend
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
cd src/backend
npm start
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up -d
```

### Environment Setup
- **Production Database** - Configure production MySQL
- **Environment Variables** - Set production values
- **SSL Certificate** - Configure HTTPS
- **Domain Configuration** - Set up domain and DNS

## 📚 Documentation

### Available Guides
- **[Implementation Plan](IMPLEMENTATION_PLAN.md)** - Development roadmap
- **[Server Refactoring Guide](SERVER_REFACTORING_GUIDE.md)** - Backend architecture
- **[Modular Routes Complete](MODULAR_ROUTES_COMPLETE.md)** - API documentation
- **[HR Setup Guide](HR_SETUP_COMPLETION_GUIDE.md)** - HR configuration
- **[Migration Checklist](MIGRATION_CHECKLIST.md)** - Database migration guide
- **[Database Setup](DATABASE_SETUP.md)** - Database configuration
- **[Modular Database System](MODULAR_DATABASE_SYSTEM.md)** - Database architecture
- **[Accessibility Guide](ACCESSIBILITY.md)** - Accessibility compliance

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- **TypeScript** - Strict type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation** - Check the guides in the Documentation folder
- **Issues** - Report bugs and request features
- **Discussions** - Ask questions and share ideas

### Contact
- **Email**: support@hrms.com
- **Documentation**: [Project Documentation](Documentation/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

## 🎉 Acknowledgments

Built with ❤️ using modern web technologies and best practices. Special thanks to all contributors and the open-source community.

**HRMS HUI v2** - Empowering organizations with modern HR management solutions.