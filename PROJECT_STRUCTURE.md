# 🏗️ HRMS Project Structure & Standards

## 📋 Project Overview
This document defines the standardized structure and patterns for the HRMS project to ensure consistency, maintainability, and scalability.

## 🎯 Core Principles

### 1. **Modular Architecture**
- Break large files into smaller, focused components
- Single Responsibility Principle for all modules
- Consistent file naming conventions

### 2. **Security First**
- Input validation on all endpoints
- Proper authentication and authorization
- SQL injection prevention
- XSS protection

### 3. **Industry Standards**
- RESTful API design
- Proper error handling
- Consistent response formats
- Comprehensive logging

## 📁 Frontend Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (buttons, inputs, etc.)
│   ├── forms/           # Form components
│   ├── tables/          # Data table components
│   ├── modals/          # Modal components
│   └── layout/          # Layout components
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── employees/      # Employee management
│   ├── hr-setup/       # HR configuration
│   └── reports/        # Reporting pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── contexts/           # React contexts
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── constants/          # Application constants
```

## 🔧 Backend Structure

```
src/backend/
├── routes/             # API route handlers
├── controllers/        # Business logic controllers
├── models/            # Data models
├── middleware/        # Express middleware
├── services/          # Business services
├── utils/             # Utility functions
├── validators/        # Input validation
├── migrations/        # Database migrations
└── config/            # Configuration files
```

## 📝 File Naming Conventions

### Frontend
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useUserData.ts`)
- **Services**: camelCase (e.g., `userService.ts`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)

### Backend
- **Routes**: kebab-case (e.g., `user-routes.js`)
- **Controllers**: camelCase (e.g., `userController.js`)
- **Models**: camelCase (e.g., `userModel.js`)
- **Services**: camelCase (e.g., `userService.js`)

## 🎨 Component Patterns

### 1. **Page Component Structure**
```typescript
// Standard page component pattern
import React from 'react';
import { PageHeader } from '@/components/layout';
import { DataTable } from '@/components/tables';
import { usePageData } from '@/hooks';

export default function PageName() {
  const { data, loading, error } = usePageData();
  
  return (
    <div className="page-container">
      <PageHeader title="Page Title" />
      <DataTable data={data} loading={loading} />
    </div>
  );
}
```

### 2. **Hook Pattern**
```typescript
// Standard hook pattern
import { useState, useEffect } from 'react';
import { apiService } from '@/services';

export function usePageData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await apiService.getData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}
```

### 3. **Service Pattern**
```typescript
// Standard service pattern
import { apiRequest } from '@/utils/api';

export const entityService = {
  getAll: () => apiRequest('/entities'),
  getById: (id: string) => apiRequest(`/entities/${id}`),
  create: (data: any) => apiRequest('/entities', { method: 'POST', body: data }),
  update: (id: string, data: any) => apiRequest(`/entities/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiRequest(`/entities/${id}`, { method: 'DELETE' }),
};
```

## 🔒 Security Standards

### 1. **Input Validation**
- Validate all inputs on both frontend and backend
- Use proper validation libraries
- Sanitize user inputs

### 2. **Authentication**
- JWT tokens with proper expiration
- Secure password hashing (bcrypt)
- Rate limiting on auth endpoints

### 3. **Authorization**
- Role-based access control (RBAC)
- Permission-based component rendering
- API endpoint protection

## 📊 Database Standards

### 1. **Table Naming**
- Use plural nouns (e.g., `users`, `employees`)
- Consistent naming conventions
- Proper foreign key relationships

### 2. **Migration Management**
- Sequential migration files
- Rollback capabilities
- Data integrity checks

## 🚀 Performance Standards

### 1. **Frontend**
- Lazy loading for routes
- Component memoization
- Efficient state management

### 2. **Backend**
- Database query optimization
- Proper indexing
- Caching strategies

## 📋 Code Quality Standards

### 1. **TypeScript**
- Strict type checking
- Proper interface definitions
- No `any` types

### 2. **Error Handling**
- Consistent error responses
- Proper error logging
- User-friendly error messages

### 3. **Testing**
- Unit tests for utilities
- Integration tests for APIs
- Component testing

## 🔄 Development Workflow

### 1. **Branch Strategy**
- Feature branches for new development
- Pull request reviews
- Automated testing

### 2. **Code Review**
- Security review checklist
- Performance considerations
- Documentation updates

## 📚 Documentation Standards

### 1. **Code Documentation**
- JSDoc for functions
- README files for modules
- API documentation

### 2. **User Documentation**
- Feature guides
- Troubleshooting guides
- API reference

---

This structure ensures consistency, maintainability, and scalability across the entire HRMS project.

