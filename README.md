# 🏢 HRMS HUI v2.7.0 (hrms-go)

A modern Human Resource Management System (HRMS) combining a Vite + React TypeScript frontend with a Node.js (Express) backend and MySQL. This repository contains the frontend HUI (v2) and a modular backend under `src/backend` with migrations and demo data.

## ✨ Latest Updates (v2.7.0)

### **💬 Real-Time Messenger with Group Messaging**
- **Direct Messaging**: One-on-one conversations with real-time delivery
  - Real-time updates via Pusher WebSocket
  - Read receipts with double-check marks
  - Unread message counts
  - Message history and search
  - Online status indicators
  - Auto-scroll to latest messages
- **Group Messaging**: Team-based communication
  - 6 group types: Team Lead, Management, Accounts, HR, Department, Custom
  - Create and manage message groups
  - Add/remove members (admin-only controls)
  - Group-based message visibility
  - Real-time notifications to all group members
  - Member count and unread tracking
  - Color-coded group type badges
- **HR System Setup Integration**
  - Global enable/disable messenger toggle
  - Create and manage groups from HR setup
  - View group statistics and member lists
  - Checkbox-based member selection
  - Group type information cards
- **16 New API Endpoints**: Complete REST API for messaging and groups
- **Security**: Permission-based access, group membership verification, admin controls

### **📡 Real-Time Integrations System (v2.6.0)**
- **Pusher Integration**: Real-time push notifications with WebSocket support
  - Auto-connect when enabled in settings
  - User-specific and broadcast channels
  - Connection status tracking
  - Test connection functionality
- **Slack Integration**: Team notifications via webhooks
  - Send messages to Slack channels
  - Test connection with actual message
  - Configurable channel targeting
- **Microsoft Teams Integration**: Enterprise communication
  - Adaptive card notifications
  - Webhook-based messaging
  - Test connection with formatted cards
- **Zoom Integration**: Video meeting API support
  - API key validation
  - Meeting creation ready
  - Auto-create meetings option
- **Google Calendar**: Event synchronization
  - OAuth2 credential validation
  - Leave request sync
  - Meeting sync
- **Google Drive**: File storage integration
  - OAuth2 credential validation
  - Folder management
  - Document storage ready
- **Twilio**: SMS notifications (SDK installed, ready for implementation)
- **SendGrid**: Email service (SDK installed, ready for implementation)
- **AWS S3**: Cloud file storage (SDK installed, ready for implementation)

### **💾 Enhanced Settings Persistence**
- **Fixed Settings Not Persisting**: All settings now save with category column
- **Proper JSON Parsing**: Integration objects (Pusher, Teams, etc.) load correctly
- **Real-Time Updates**: Settings apply immediately without page refresh
- **Toast Notifications**: Visual feedback on every save ("Settings Saved" / "Save Failed")
- **Database Optimization**: Improved query performance with proper indexing

### **🎨 UI/UX Improvements**
- **Removed Duplicate Sections**: Cleaned up duplicate Pusher and Microsoft Teams cards
- **Test Connection Buttons**: All integrations have functional test buttons
- **Loading States**: Spinners and loading indicators for all async operations
- **Success/Error Messages**: Visual feedback with icons (green checkmark / red X)
- **Cleaner Interface**: Removed unnecessary borders and shadows

### **📦 Backend Enhancements**
- **20 Modular Routes**: Expanded from 17 to 20 API modules (including Messenger)
- **Integration Services**: Unified service layer for all integrations
- **Messenger Service**: Complete messaging backend with groups
- **Test Endpoints**: API endpoints for testing each integration
- **Error Handling**: Comprehensive error handling with detailed logging
- **SDK Installation**: All required SDKs installed and configured

### **Previous Updates (v2.5.2)**

### **🎨 UI/UX Improvements**
- **Cleaner Design**: Removed drop shadows and borders from sidebar and navbar for a modern, flat design
- **Better Visual Hierarchy**: Improved focus on content with less visual noise
- **Consistent Styling**: Unified design language across all components

### **🐛 Critical Bug Fixes**
- **Fixed Attendance Records API**: Resolved 500 error when loading attendance records
  - Added role-based filtering (admins see all, employees see only their own)
  - Fixed employee record lookup for users without employee records
  - Returns empty array instead of error for users without records
- **Fixed Audit Logs API**: Registered audit-logs routes in server.js (was causing 404 errors)
- **Improved Error Handling**: Better error messages and graceful fallbacks

### **Previous Updates (v2.5.1)**

### **🚀 Universal Deployment System**
- **Automated Database Setup**: Comprehensive `setup-database.js` script that runs all migrations and seeds data
- **One-Command Deployment**: `deploy.sh` script for VPS/Cloud deployment with zero manual configuration
- **Docker Support**: Complete Docker and Docker Compose configuration for containerized deployment
- **PM2 Integration**: Production-ready PM2 ecosystem configuration for process management
- **Environment Templates**: `.env.example` files for easy configuration
- **Migration Tracking**: Automatic migration tracking to prevent duplicate runs
- **Universal Compatibility**: Works on Local, VPS, AWS, DigitalOcean, Linode, Google Cloud, Azure

### **💾 Enhanced Database Management**
- **Automatic Seeding**: Default users, permissions, and settings created automatically
- **Smart Migration System**: Tracks executed migrations and skips duplicates
- **Verification System**: Post-setup verification to ensure all tables and data exist
- **Rollback Safety**: Safe migration system that continues even if individual migrations fail
- **Comprehensive Permissions**: 50+ permissions seeded automatically with role assignments

### **📖 Complete Documentation**
- **DEPLOYMENT.md**: Comprehensive deployment guide for all environments
- **Step-by-Step Instructions**: Detailed guides for Local, VPS, Cloud, and Docker deployments
- **Troubleshooting Section**: Common issues and solutions
- **PM2 Commands**: Complete reference for process management

### **Previous Updates (v2.5.0)**

### **🌍 Internationalization & Localization**
- **Multi-Language Support**: Full translation support for 10 languages (English, Hindi, Spanish, French, German, Chinese, Arabic, Portuguese, Russian, Japanese)
- **Comprehensive Translation Dictionary**: 100+ translated strings covering navigation, common actions, and UI elements
- **Language Selector**: Quick language switcher in top navbar and settings page with flag icons
- **Real-Time Translation**: Instant UI translation when language is changed
- **Fallback System**: Graceful fallback to English for missing translations
- **Currency Support**: Added Indian Rupee (₹) and 9 other currencies with auto-populated symbols
- **Timezone Support**: Added IST (India Standard Time) and 10 other timezones

### **⚙️ Enhanced Settings**
- **Logo & Favicon Upload**: Upload and preview company logo and favicon with file validation
- **Enhanced Color Picker**: Visual color swatches with live preview for primary color selection
- **New Integrations**: Added Pusher, Microsoft Teams, Twilio (SMS), AWS S3, and Google Drive
- **Fixed Integration Toggles**: All enable/disable switches now work correctly

### **🗓️ Advanced Holiday Management**
- **Country-Wise Holidays**: Pre-populated with 24 government holidays (14 India + 11 USA)
- **Smart Grouping**: Duplicate holidays across countries displayed in single row with multiple country tags
- **Country Filtering**: Filter holidays by India, USA, or Global
- **Statistics Dashboard**: Visual cards showing holiday counts by country and type
- **Recurring Holidays**: Fixed display of recurring holidays in attendance muster

### **📊 Attendance & Timekeeping**
- **Fixed Date Format Issues**: Attendance records now display correctly with proper date matching
- **Weekend Detection**: Timezone-safe weekend detection (Saturday & Sunday)
- **Holiday Integration**: All holidays including recurring ones now display in attendance muster
- **Duplicate Rules Cleanup**: Removed duplicate attendance calculation rules

### **🔔 Notifications**
- **Removed Mock Data**: Cleaned up dummy notifications
- **Real-Time Ready**: System prepared for real notification events
- **7-Day Retention**: Auto-cleanup of notifications older than 7 days

### **📱 Mobile & Responsive Design**
- **Permission-Based Mobile Navigation**: Mobile sidebar now filters pages by user permissions
- **Shared Navigation Config**: Single source of truth for desktop and mobile navigation
- **Touch-Optimized UI**: Large buttons, smooth animations, and mobile-friendly interactions
- **Responsive Breakpoints**: Seamless experience across all screen sizes
- **Dynamic Branding**: Mobile sidebar displays company logo and name from settings

### **🐛 Bug Fixes**
- **Fixed Settings Page**: Settings now save immediately when changed (no more lost edits!)
- **Fixed Translation System**: Proper translation implementation with comprehensive dictionaries
- Fixed integration toggle switches not saving
- Fixed holidays API 500 errors
- Fixed weekend display showing wrong days
- Fixed attendance data not reflecting after updates
- Fixed server management scripts
- Fixed translation context initialization and fallback system
- Fixed mobile sidebar `require()` error in ES modules
- Improved error handling across the application

## 🚀 Quick Setup (Recommended)

### Local Development

```bash
# Make the setup script executable
chmod +x setup-project.sh

# Run the complete setup
./setup-project.sh

# Start both servers
./start-servers.sh

# Stop both servers
./stop-servers.sh
```

### Production Deployment (VPS/Cloud)

```bash
# One-command deployment
chmod +x deploy.sh && ./deploy.sh
```

### Docker Deployment

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

📖 **Documentation:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide for all environments
- [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) - How to use the translation system
- [SEARCH_GUIDE.md](SEARCH_GUIDE.md) - Search implementation guide
- [FIXES_SUMMARY.md](FIXES_SUMMARY.md) - All fixes and troubleshooting

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

### ⏰ **Advanced Attendance Management**
- Monthly attendance grid view
- Dynamic holiday integration from leave system
- Configurable weekend settings
- Real-time attendance status calculation
- Attendance muster with visual indicators
- Status legend (Present, Absent, Half Day, Late, Early Leave, On Leave, Holiday, Weekend)

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
- `GET /api/v1/timekeeping/monthly-muster` - Get monthly attendance data with holidays and weekends
- `GET /api/v1/timekeeping/attendance-records` - Get attendance records with location and IP
- `PUT /api/v1/timekeeping/:id` - Update attendance record
- `POST /api/v1/timekeeping` - Create attendance record
- `POST /api/v1/timekeeping/check-in` - Employee check-in (stores location & IP)
- `POST /api/v1/timekeeping/check-out` - Employee check-out (stores location & IP)

### HR System Setup
- `GET /api/v1/hr-setup/weekend-configs` - Get weekend configurations
- `POST /api/v1/hr-setup/weekend-configs` - Create weekend configuration
- `PUT /api/v1/hr-setup/weekend-configs/:id` - Update weekend configuration
- `DELETE /api/v1/hr-setup/weekend-configs/:id` - Delete weekend configuration
- `GET /api/v1/hr-setup/attendance-rules` - Get attendance calculation rules
- `POST /api/v1/hr-setup/attendance-rules` - Create attendance rule
- `PUT /api/v1/hr-setup/attendance-rules/:id` - Update attendance rule
- `DELETE /api/v1/hr-setup/attendance-rules/:id` - Delete attendance rule

### Settings
- `GET /api/v1/settings` - Get all settings (with category grouping)
- `PUT /api/v1/settings/:category/:key` - Update specific setting
- `GET /api/v1/settings/export` - Export settings
- `POST /api/v1/settings/import` - Import settings

### Integrations
- `POST /api/v1/pusher/test` - Test Pusher connection
- `POST /api/v1/integrations/slack/test` - Test Slack webhook
- `POST /api/v1/integrations/teams/test` - Test Microsoft Teams webhook
- `POST /api/v1/integrations/zoom/test` - Test Zoom API credentials
- `POST /api/v1/integrations/google-calendar/test` - Test Google Calendar OAuth
- `POST /api/v1/integrations/google-drive/test` - Test Google Drive OAuth
- `POST /api/v1/integrations/twilio/test` - Test Twilio SMS credentials
- `POST /api/v1/integrations/sendgrid/test` - Test SendGrid email API
- `POST /api/v1/integrations/s3/test` - Test AWS S3 connection
- `POST /api/v1/integrations/notify` - Send notification to all enabled channels

### Messenger (NEW in v2.7.0)
- `GET /api/v1/messenger/conversations` - List all conversations
- `GET /api/v1/messenger/messages/:userId` - Get message history with user
- `POST /api/v1/messenger/send` - Send direct message
- `PUT /api/v1/messenger/read/:messageId` - Mark message as read
- `GET /api/v1/messenger/unread-count` - Get unread count
- `GET /api/v1/messenger/users` - Get all users for messaging
- `DELETE /api/v1/messenger/:messageId` - Delete message
- `GET /api/v1/messenger/groups` - List user's groups
- `POST /api/v1/messenger/groups` - Create message group
- `GET /api/v1/messenger/groups/:id` - Get group details
- `PUT /api/v1/messenger/groups/:id` - Update group
- `DELETE /api/v1/messenger/groups/:id` - Delete group
- `POST /api/v1/messenger/groups/:id/send` - Send message to group
- `GET /api/v1/messenger/groups/:id/messages` - Get group messages
- `POST /api/v1/messenger/groups/:id/members` - Add group member
- `DELETE /api/v1/messenger/groups/:id/members/:userId` - Remove group member

### Leave Management
- `GET /api/v1/leave/applications` - Get leave applications
- `POST /api/v1/leave/applications` - Create leave application
- `PUT /api/v1/leave/applications/:id` - Update leave application
- `GET /api/v1/leave/holidays` - Get holidays by country
- `POST /api/v1/leave/holidays` - Create holiday
- `PUT /api/v1/leave/holidays/:id` - Update holiday
- `DELETE /api/v1/leave/holidays/:id` - Delete holiday

### Payroll
- `GET /api/v1/payroll/salaries` - Get salary information
- `POST /api/v1/payroll/salaries` - Create salary record
- `GET /api/v1/payroll/payslips` - Get payslips

### Audit Logs
- `GET /api/v1/audit-logs` - Get audit logs with pagination and filtering

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

### Version 2.7.0 (Current)
- ✅ **Real-Time Messenger System**: Direct messaging and group conversations
- ✅ **Group Messaging**: 6 group types (Team Lead, Management, Accounts, HR, Department, Custom)
- ✅ **Pusher Integration**: Real-time message delivery and notifications
- ✅ **HR Setup Integration**: Enable/disable messenger, manage groups
- ✅ **16 Messenger Endpoints**: Complete REST API for messaging
- ✅ **2 New Database Tables**: message_groups, message_group_members
- ✅ **3 New Permissions**: messenger.view, groups.create, groups.manage
- ✅ **Group Administration**: Admin-only controls for member management
- ✅ **Fixed Leave Reports API**: Corrected malformed API calls
- ✅ **Updated Database Seeder**: Added messenger permissions and settings
- ✅ **20 Backend Modules**: Expanded API with messenger module

### Version 2.6.0
- ✅ **Real-Time Integration System**: Pusher, Slack, Teams, Zoom, Google Calendar/Drive
- ✅ **Fixed Settings Persistence**: All settings now save with category and persist after refresh
- ✅ **Toast Notifications**: Visual feedback on every settings change
- ✅ **Test Connection Buttons**: Functional test buttons for all integrations
- ✅ **Removed Duplicates**: Cleaned up duplicate Pusher and Microsoft Teams sections
- ✅ **Enhanced Database Queries**: Proper JSON parsing and category-based loading
- ✅ **Attendance Location Tracking**: Check-in/check-out now stores location coordinates and IP address
- ✅ **19 Backend Modules**: Expanded API with integration endpoints
- ✅ **SDK Installation**: All integration SDKs installed (Slack, Teams, Twilio, SendGrid, AWS, etc.)

### Version 2.5.2
- ✅ **Fixed Attendance Records API**: Resolved 500 error with proper SQL query
- ✅ **Fixed Audit Logs**: Registered audit-logs routes
- ✅ **UI Cleanup**: Removed drop shadows and borders for modern flat design
- ✅ **Check-in/Check-out Logic**: Fixed button states to reflect actual attendance status

### Version 2.5.1
- ✅ **Universal Deployment**: One-command deployment for VPS/Cloud/Docker
- ✅ **Automated Database Setup**: Comprehensive setup-database.js with seeding
- ✅ **PM2 Integration**: Production-ready process management
- ✅ **Docker Support**: Complete containerization with docker-compose

### Version 2.5.0
- ✅ **Multi-Language Support**: 10 languages with comprehensive translations
- ✅ **Holiday Management**: Country-wise holidays (India + USA)
- ✅ **Enhanced Settings**: Logo/favicon upload, color picker, integrations
- ✅ **Mobile Responsive**: Permission-based mobile navigation

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

### **🎨 UI/UX Enhancements (v2.5.0)**
- **Modern Sidebar Design**: Gradient backgrounds, frosted glass effect, and custom scrollbar
- **Enhanced Navigation**: Rounded buttons with glow effects and smooth animations
- **Responsive Mobile View**: Permission-based navigation matching desktop experience
- **Transparent Layout Option**: Toggle for transparent sidebar and navbar
- **Color Swatches**: Visual color picker with 8 preset colors

## 🎯 Roadmap

- [x] Multi-language support (10 languages)
- [x] Mobile responsive design
- [x] Real-time notifications framework (Pusher)
- [x] Integration system (Slack, Teams, Zoom, Google, Twilio, SendGrid, AWS S3)
- [x] Settings persistence and real-time updates
- [x] Attendance tracking with location and IP logging
- [x] Toast notifications system
- [ ] Mobile app development (iOS/Android)
- [ ] Advanced reporting dashboard with AI insights
- [ ] Integration with external HR systems (ADP, Workday, etc.)
- [ ] Advanced workflow automation
- [ ] Biometric attendance integration
- [ ] Advanced analytics and predictive insights
- [ ] Complete OAuth2 flows for Google integrations
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] SMS and Email notification automation

---

## 🎉 Acknowledgments

Built with ❤️ using modern web technologies and best practices. Special thanks to all contributors and the open-source community.

**HRMS HUI v2** - Empowering organizations with modern HR management solutions.