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
- **Migration System** - Comprehensive database migration management
- **API-First Design** - RESTful APIs with proper error handling
- **Type Safety** - Full TypeScript implementation
- **Security** - JWT authentication, role-based permissions, audit logging
- **Global Settings** - Dynamic theming, maintenance mode, debug mode
- **Advanced Search** - Real-time search with keyboard shortcuts and smart suggestions

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

### Super Admin
- **Email**: admin@hrms.com
- **Password**: admin123

### Company Admin
- **Email**: company@hrms.com
- **Password**: company123

### Employee
- **Email**: employee@hrms.com
- **Password**: employee123

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