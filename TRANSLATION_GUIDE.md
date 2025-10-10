# 🌍 Translation System Guide - i18next

## ✅ **Translation System is Now Using i18next!**

The HRMS application now uses **i18next**, the industry-standard internationalization framework. This provides:
- ✅ Automatic language detection
- ✅ Persistent language preference
- ✅ Professional translation workflow
- ✅ Better performance and caching
- ✅ Easier maintenance with JSON files

---

## 🎯 How Translation Works

### 1. **i18next Configuration** 
- **File**: `src/i18n/config.ts`
- **Provider**: Initialized in `main.tsx`
- **Languages**: 5 languages supported (English, Hindi, Spanish, French, German)
- **Storage**: Persists to localStorage automatically

### 2. **Translation Files** (JSON Format)
- **Location**: `src/i18n/locales/`
  - `en.json` - English (590+ keys, 100% complete)
  - `hi.json` - Hindi (590+ keys, 100% complete)
  - `es.json` - Spanish (170+ keys, 30% complete)
  - `fr.json` - French (170+ keys, 30% complete)
  - `de.json` - German (170+ keys, 30% complete)

### 3. **Translation Context** (Backward Compatibility)
- **File**: `src/contexts/translation-context.tsx`
- **Purpose**: Wraps i18next for backward compatibility
- **Benefit**: Existing components work without changes

---

## 📝 How to Add Translation to Components

### Method 1: Using the Context (Recommended for Existing Code)
```typescript
import { useTranslation } from '../contexts/translation-context';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Method 2: Using i18next Directly (For New Code)
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

Both methods work identically!

---

## 📖 Available Translation Keys

### Common Actions:
```typescript
t('common.save')         // "Save" / "सहेजें"
t('common.cancel')       // "Cancel" / "रद्द करें"
t('common.delete')       // "Delete" / "हटाएं"
t('common.edit')         // "Edit" / "संपादित करें"
t('common.view')         // "View" / "देखें"
t('common.add')          // "Add" / "जोड़ें"
t('common.search')       // "Search" / "खोजें"
t('common.filter')       // "Filter" / "फ़िल्टर"
```

### Navigation Items:
```typescript
t('nav.dashboard')       // "Dashboard" / "डैशबोर्ड"
t('nav.employees')       // "Employees" / "कर्मचारी"
t('nav.attendance')      // "Attendance" / "उपस्थिति"
t('nav.leave')           // "Leave" / "अवकाश"
t('nav.payroll')         // "Payroll" / "वेतन"
t('nav.settings')        // "Settings" / "सेटिंग्स"
```

### Dashboard:
```typescript
t('dashboard.title')           // "Dashboard"
t('dashboard.totalEmployees')  // "Total Employees"
t('dashboard.activeEmployees') // "Active Employees"
t('dashboard.onLeave')         // "On Leave"
```

### Employees:
```typescript
t('employees.title')       // "Employees"
t('employees.addEmployee') // "Add Employee"
t('employees.firstName')   // "First Name"
t('employees.lastName')    // "Last Name"
t('employees.email')       // "Email"
t('employees.phone')       // "Phone"
```

---

## 🌐 How Users Change Language

### Method 1: Top Navbar (Primary)
1. Click the language selector in top right
2. Select language from dropdown
3. UI updates immediately

### Method 2: Settings Page
1. Go to Settings → Localization
2. Select language from dropdown
3. Click Save

### Method 3: Programmatically
```typescript
import { useTranslation } from '../contexts/translation-context';

const { setLanguage } = useTranslation();
setLanguage('hi'); // Switch to Hindi
```

---

## 🔧 Adding New Translations

### 1. Add to Translation Files
Edit `src/i18n/locales/en.json`:
```json
{
  "myNewFeature": {
    "title": "My New Feature",
    "description": "This is a new feature",
    "saveButton": "Save Changes"
  }
}
```

Edit `src/i18n/locales/hi.json`:
```json
{
  "myNewFeature": {
    "title": "मेरी नई सुविधा",
    "description": "यह एक नई सुविधा है",
    "saveButton": "परिवर्तन सहेजें"
  }
}
```

### 2. Use in Component
```typescript
const { t } = useTranslation();

<h1>{t('myNewFeature.title')}</h1>
<p>{t('myNewFeature.description')}</p>
<Button>{t('myNewFeature.saveButton')}</Button>
```

---

## 🎨 Best Practices

### 1. Use Nested Keys
```json
{
  "employees": {
    "title": "Employees",
    "add": "Add Employee",
    "edit": "Edit Employee",
    "delete": "Delete Employee"
  }
}
```

### 2. Group by Feature
- `common.*` - Shared across app
- `nav.*` - Navigation items
- `employees.*` - Employee-specific
- `dashboard.*` - Dashboard-specific
- `attendance.*` - Attendance-specific

### 3. Use Descriptive Keys
```typescript
// ✅ Good
t('employees.addNewEmployee')

// ❌ Bad
t('btn1')
```

### 4. Keep Translations Consistent
- Use the same terms across the app
- Maintain consistent terminology
- Keep translations short and clear

---

## 🔍 Debugging Translation

### Check Current Language:
```typescript
const { language } = useTranslation();
console.log('Current language:', language);
```

### Check Translation Output:
```typescript
const { t } = useTranslation();
console.log('Dashboard:', t('dashboard.title'));
```

### Check if Key Exists:
If a key is missing, i18next will return the key itself as a fallback.

---

## 📊 Translation Coverage

### Currently Translated Pages:
- ✅ Dashboard (40%)
- ✅ Users (80%)
- ✅ Roles (60%)
- ✅ Employees (HeroSection 100%)
- ✅ Announcements (100%)
- ✅ SearchBar (100%)
- ✅ DataTable (100%)
- ✅ Version History (100%)

### Remaining Pages (~43 pages):
- Organization pages
- Timekeeping pages
- Leave pages
- Payroll pages
- Settings pages
- HR Setup pages
- Other pages

---

## 🚀 Migration Guide

### Old System (No Longer Used):
```typescript
// ❌ OLD - Don't use these files anymore
import { translations } from '../locales/translations';
// Files deleted: src/locales/*.ts
```

### New System (i18next):
```typescript
// ✅ NEW - Use this
import { useTranslation } from '../contexts/translation-context';
// OR
import { useTranslation } from 'react-i18next';
```

Both work identically!

---

## ✨ What's Different Now?

### Before (Custom System):
- Manual context management
- TypeScript translation objects
- Limited functionality
- Hard to maintain

### After (i18next):
- ✅ Industry standard
- ✅ JSON translation files
- ✅ Automatic language detection
- ✅ Persistent preferences
- ✅ Better performance
- ✅ Easy to maintain
- ✅ Professional workflow

---

## 📖 Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- Project Guide: `I18NEXT_GUIDE.md`

---

## 🎯 Quick Reference

### Import Hook:
```typescript
import { useTranslation } from '../contexts/translation-context';
```

### Use in Component:
```typescript
const { t, language, setLanguage } = useTranslation();
```

### Translate Text:
```typescript
<h1>{t('page.title')}</h1>
<Button>{t('common.save')}</Button>
<Input label={t('form.firstName')} placeholder={t('form.enterName')} />
```

### Change Language:
```typescript
setLanguage('hi'); // Hindi
setLanguage('en'); // English
setLanguage('es'); // Spanish
setLanguage('fr'); // French
setLanguage('de'); // German
```

---

**Translation system is now using i18next!** 🎉

All existing components automatically use i18next through the backward-compatible translation context.
