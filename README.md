# 🏢 HRMS GO - Human Resource Management System

A comprehensive, modern Human Resource Management System built with React, TypeScript, and HeroUI. This system provides complete HR functionality from employee onboarding to performance management.

## ✨ Features

### 🎯 Core HR Management
- **Employee Management** - Complete employee lifecycle management
- **Department & Designation Management** - Organizational structure management
- **Branch Management** - Multi-location support
- **User Management** - Role-based access control
- **Organization Chart** - Interactive organizational hierarchy

### ⏰ Time & Attendance
- **Attendance Tracking** - Location-based check-in/out with IP tracking
- **Leave Management** - Comprehensive leave request and approval system
- **Timesheet Management** - Project-based time tracking
- **Holiday Management** - Company holiday calendar

### 💰 Payroll & Finance
- **Payroll Management** - Complete payroll processing with PDF generation
- **Expense Management** - Employee expense claims and approvals
- **Salary Management** - Salary components and calculations
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
- **HeroUI** - Modern UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Context** - State management

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

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hrms-go.git
   cd hrms-go
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=HRMS GO
VITE_APP_VERSION=1.0.0
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── settings/       # Settings components
│   └── sidebar.tsx     # Navigation sidebar
├── contexts/           # React contexts for state management
│   ├── auth-context.tsx
│   └── task-context.tsx
├── database/           # Database schema and migrations
│   └── schema.sql
├── layouts/            # Layout components
│   └── dashboard-layout.tsx
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── organization/   # Organization management
│   ├── reports/        # Report pages
│   └── settings/       # Settings pages
├── services/           # API services and utilities
│   ├── api-service.ts
│   ├── document-service.ts
│   └── face-recognition-service.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - Theme switching capability
- **Modern UI** - Clean, professional interface
- **Interactive Charts** - Data visualization with Recharts
- **Smooth Animations** - Framer Motion animations
- **Accessibility** - WCAG compliant design

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📊 Database Schema

The system includes a comprehensive database schema with 70+ tables covering:

- **User Management** - Users, roles, permissions
- **Employee Data** - Complete employee information
- **Time Tracking** - Attendance, leave, timesheets
- **Payroll** - Salary, benefits, deductions
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
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=HRMS GO
VITE_APP_VERSION=1.0.0
```

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

## 🙏 Acknowledgments

- HeroUI for the amazing component library
- React team for the excellent framework
- All contributors and testers

---

**Built with ❤️ for modern HR management**