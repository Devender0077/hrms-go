# 🏢 HRMS GO - Human Resource Management System

A comprehensive, modern Human Resource Management System built with React, TypeScript, and HeroUI. This system provides complete HR functionality from employee onboarding to performance management with a clean, production-ready codebase.

## ✨ Features

### 🎯 Core HR Management
- **Employee Management** - Complete employee lifecycle management with reporting hierarchy
- **Department & Designation Management** - Organizational structure management
- **Branch Management** - Multi-location support
- **User Management** - Role-based access control with granular permissions
- **Organization Chart** - Interactive organizational hierarchy with modern UI components

### ⏰ Time & Attendance
- **Attendance Tracking** - Location-based check-in/out with IP tracking
- **Leave Management** - Comprehensive leave request and approval system
- **Timesheet Management** - Project-based time tracking
- **Holiday Management** - Company holiday calendar
- **Shift Management** - Flexible shift scheduling and assignments
- **Attendance Policies** - Configurable attendance rules and regulations

### 💰 Payroll & Finance
- **Payroll Management** - Complete payroll processing with PDF generation
- **Salary Components** - Flexible salary component management (earnings, deductions)
- **Employee Salaries** - Individual salary management with component calculations
- **Payslips** - Automated payslip generation and distribution
- **Expense Management** - Employee expense claims and approvals
- **Financial Reports** - Income vs Expense, Account statements

### 🎯 Recruitment
- **Job Postings** - Job creation and management
- **Candidate Management** - Application tracking and resume management
- **Interview Scheduling** - Interview calendar and feedback system
- **Recruitment Dashboard** - Complete recruitment pipeline

### 📊 Performance Management
- **Goal Setting** - Employee goal tracking and milestones
- **Performance Reviews** - Comprehensive review system
- **360-Degree Feedback** - Multi-source performance evaluation
- **Performance Analytics** - Performance metrics and insights

### 🏢 Asset Management
- **Asset Tracking** - Complete asset inventory management
- **Asset Assignments** - Employee asset assignments and tracking
- **Maintenance Scheduling** - Asset maintenance and warranty tracking
- **Asset Reports** - Asset utilization and depreciation reports

### 📋 Reports & Analytics
- **Income vs Expense Reports** - Financial performance analysis
- **Monthly Attendance Reports** - Attendance patterns and trends
- **Leave Reports** - Leave utilization and patterns
- **Payroll Reports** - Salary and compensation analysis
- **Timesheet Reports** - Project time tracking and productivity
- **Account Statements** - Financial transaction history

### ⚙️ System Administration
- **Settings Management** - Comprehensive system configuration
- **Role & Permission Management** - Granular access control
- **Audit Logging** - Complete system activity tracking
- **Document Management** - Company document and policy management
- **HR System Setup** - System configuration and setup

### 🔐 Security & Compliance
- **Role-Based Access Control** - Granular permission system
- **Audit Trail** - Complete activity logging
- **Data Encryption** - Secure data handling
- **Compliance Reporting** - Regulatory compliance features

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **HeroUI** - Modern UI component library with custom theme
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Context** - State management

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database management
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

### Libraries & Integrations
- **Iconify** - Comprehensive icon library
- **Papa Parse** - CSV parsing and generation
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas conversion
- **Recharts** - Data visualization and charts
- **React Org Chart** - Organization chart visualization

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- MySQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Devender0077/hrms-go.git
   cd hrms-go
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Database Setup**
   - Create a MySQL database named `hrmgo_hero`
   - Update database credentials in `src/backend/.env`

4. **Start the backend server**
   ```bash
   cd src/backend
   node server.js
   ```

5. **Start the frontend development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Setup

Create a `.env` file in `src/backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hrmgo_hero
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=8000
NODE_ENV=development
```

## 📁 Project Structure

```
src/
├── backend/              # Backend server and API
│   ├── server.js         # Main server file
│   ├── .env              # Environment variables
│   └── migrations/       # Database migrations
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── employees/       # Employee management components
│   ├── organization/    # Organization components
│   ├── payroll/         # Payroll components
│   ├── settings/        # Settings components
│   └── sidebar.tsx      # Navigation sidebar
├── contexts/            # React contexts for state management
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   └── task-context.tsx
├── hooks/               # Custom React hooks
│   ├── useAssets.ts
│   ├── useEmployees.ts
│   ├── usePayroll.ts
│   └── usePermissions.ts
├── layouts/             # Layout components
│   └── dashboard-layout.tsx
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── employees/       # Employee management pages
│   ├── organization/    # Organization management
│   ├── payroll/         # Payroll management
│   ├── reports/         # Report pages
│   └── settings/        # Settings pages
├── services/            # API services and utilities
│   ├── api-service.ts
│   ├── auth-service.ts
│   └── document-service.ts
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Light/Dark Theme** - Toggle between light and dark modes
- **Modern UI** - Clean, professional interface with HeroUI components
- **Interactive Charts** - Data visualization with Recharts
- **Smooth Animations** - Framer Motion animations
- **Accessibility** - WCAG compliant design
- **Consistent Theming** - Unified color palette and design system

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📊 Database Schema

The system includes a comprehensive database schema with 70+ tables covering:

- **User Management** - Users, roles, permissions
- **Employee Data** - Complete employee information with reporting hierarchy
- **Time Tracking** - Attendance, leave, timesheets, shifts
- **Payroll** - Salary components, employee salaries, payslips
- **Assets** - Asset inventory and assignments
- **Performance** - Goals, reviews, feedback
- **Recruitment** - Jobs, candidates, interviews
- **System** - Settings, audit logs, notifications

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
# Database Configuration
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_NAME=hrmgo_hero
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=8000
NODE_ENV=production
```

## 🧹 Recent Updates

### Project Cleanup (Latest)
- ✅ Removed 27+ unnecessary test files and documentation
- ✅ Fixed salary components API endpoints and calculations
- ✅ Fixed employee salaries calculations
- ✅ Updated API request format consistency
- ✅ Clean project structure for production readiness
- ✅ Added new organization chart components
- ✅ Added new custom hooks for expenses, goals, interviews, performance reviews
- ✅ Added new payroll pages and components
- ✅ Implemented consistent theming across all pages

### Key Improvements
- **API Consistency** - Standardized API request format across all components
- **Calculation Fixes** - Fixed salary and payroll calculations
- **UI Consistency** - Unified theming and component styling
- **Code Quality** - Removed test files and improved code organization
- **Performance** - Optimized API calls and data fetching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with external HR systems
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] API documentation
- [ ] Unit and integration tests
- [ ] Performance optimization
- [ ] Security enhancements

## 🙏 Acknowledgments

- HeroUI for the amazing component library
- React team for the excellent framework
- All contributors and testers
- The open-source community

---

**Built with ❤️ for modern HR management**

*Last updated: January 2025*