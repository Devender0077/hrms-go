# 🏢 HRMS HUI v2 (hrms-go)

A modern Human Resource Management System (HRMS) combining a Vite + React TypeScript frontend with a Node.js (Express) backend and MySQL. This repository contains the frontend HUI (v2) and a modular backend under `src/backend` with migrations and demo data.

Current status (2025-10-07)

- Frontend: feature-rich and mostly complete — responsive UI, role-based navigation, dynamic theming, advanced search, notifications, and most HR pages implemented.
- Backend: working REST APIs for core modules (authentication, employees, leaves, attendance, payroll, recruitment, tasks, assets, reports). Migrations and demo data are available. Some backend endpoints and tests are still in active development.
- Demo data & migrations: included; multiple migrations (80+) and schema loaders are present to bootstrap a development DB.

Highlights & Key Features

- Core HR modules: Employees, Leave, Attendance, Payroll, Recruitment, Tasks, Performance Reviews, Assets, Expenses, Documents, Calendar/Meetings, Reports.
- Role-based access control with a detailed permission model (Super Admin, Company Admin, HR Manager, Manager, Employee).
- Modern frontend: React 18 + TypeScript, Vite, TailwindCSS, HeroUI components, Framer Motion animations.
- Backend: Node.js + Express, MySQL, JWT auth, modular route organization, migration scripts, file uploads.
- Demo data system: sample employees, departments, attendance, payroll, job postings, candidates, tasks, and more — useful for development and QA.

Quick start (development)

Prerequisites

- Node.js 18+ (or compatible)
- MySQL 8+
- npm (or yarn)

1. Clone

```bash
git clone <repository-url>
cd hrms_hui_v2
```

2. Install frontend dependencies

```bash
npm install
```

3. Install backend dependencies

```bash
cd src/backend
npm install
```

4. Database setup

Create a development database (adjust user/host as needed):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hrmgo_hero;"
```

Run migrations / load demo data (from `src/backend`):

```bash
# from repo root
cd src/backend
node migrations/migration-manager.js up
```

Alternative: if you prefer schema loader (from repo root):

```bash
node ../../src/database/load-schemas.js load all
```

5. Environment

Copy example env and edit values in `src/backend`:

```bash
cd src/backend
cp .env.example .env
# edit .env and set DB credentials, JWT_SECRET, PORT, etc.
```

6. Start servers

Frontend (project root):

```bash
npm run dev
```

Backend (new terminal, from `src/backend`):

```bash
npm run dev   # or `npm start` for production start
```

Default local URLs

- Frontend: http://localhost:5174 (Vite) — port may vary based on your machine
- Backend API: http://localhost:8000 (configurable via `.env`)

Project structure (top-level)

```
hrms_hui_v2/
├── src/
│   ├── backend/            # Express backend, routes, migrations, server
│   ├── components/         # React UI components
│   ├── contexts/           # React contexts (auth, settings, theme)
│   ├── hooks/              # Custom hooks
│   ├── pages/              # App pages (employees, payroll, reports, ...)
│   ├── services/           # API clients and helpers
+│   ├── utils/              # Utility functions
│   └── assets/             # Static assets (images, lottie, icons)
├── public/                 # Public assets
├── plugins/                # Custom Vite/Babel plugins used by the frontend
├── package.json            # Frontend scripts & dependencies (root)
└── README.md               # This file
```

Environment variables (backend `src/backend/.env`)

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

Default credentials (development/demo)

- Super Admin: `admin@example.com` / `admin123` (full access)
- Company Admin: `company@example.com` / `company123`
- HR Manager: `hr@example.com` / `hr123`
- Manager: `manager@example.com` / `manager123`
- Employee: `employee@example.com` / `employee123`

Testing & Scripts

- Frontend: `npm run dev`, `npm run build`, `npm run preview`
- Backend (in `src/backend`): `npm run dev` (nodemon), `npm start`
- Migration helpers: `node migrations/migration-manager.js up|down|status`

What's implemented (short)

- Employee lifecycle: profiles, documents, transfers, warnings, terminations
- Attendance & timekeeping: check-in/out, shifts, regularizations
- Leave management: applications, approvals, balances
- Payroll: components, salary records, payslip generation
- Recruitment: jobs, candidates, interviews
- Tasks & performance: tasks, goals, reviews
- Assets & inventory: asset assignment and tracking
- Documents: versioned document storage and types
- Calendar & meetings: event scheduling and rooms
- Reports & audit logs: activity tracking and report templates

Known status & next steps

- Stable dev build for frontend; backend largely functional but still being hardened.
- Remaining/ongoing work:
  - Add/expand automated tests (unit, integration, E2E)
  - Harden error handling and edge-case coverage on some backend endpoints
  - Add Docker Compose for easy local orchestration
  - CI pipeline (GitHub Actions) for lint/test/build on PRs

Contributing

- Fork, create a feature branch, add tests, follow existing TypeScript + ESLint + Prettier rules, and open a PR.

License

- MIT — see `LICENSE`.

Support & Contacts

- For issues and feature requests, use GitHub Issues on the repository.
- Documentation lives under `Documentation/` and several guide files in the repo.

Thanks for using and contributing to HRMS HUI v2 — a modern, modular HR platform. If you'd like, I can also:

- Add a short developer checklist (ports, env vars, common troubleshooting)
- Create a Docker Compose file to run MySQL + backend + frontend locally
- Generate a concise architecture diagram or onboarding guide

---

_Generated/updated: 2025-10-07_

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
