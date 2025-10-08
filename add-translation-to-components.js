#!/usr/bin/env node

/**
 * Script to add translation imports to all React components
 * Run: node add-translation-to-components.js
 */

const fs = require('fs');
const path = require('path');

const componentsToUpdate = [
  'src/components/dashboard/SuperAdminDashboard.tsx',
  'src/components/dashboard/CompanyAdminDashboard.tsx',
  'src/components/dashboard/EmployeeDashboard.tsx',
  'src/pages/employees.tsx',
  'src/pages/users.tsx',
  'src/pages/roles.tsx',
  'src/pages/timekeeping/attendance-refactored.tsx',
  'src/pages/leave/holidays.tsx',
  'src/components/employees/EmployeeTable.tsx',
  'src/components/employees/EmployeeFilters.tsx',
];

console.log('🌍 Adding translation support to components...\n');

componentsToUpdate.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} (not found)`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has useTranslation import
    if (content.includes('useTranslation')) {
      console.log(`✓ ${filePath} already has translation`);
      return;
    }
    
    // Add import after other React imports
    const importRegex = /(import.*from ['"]react['"];?\n)/;
    if (importRegex.test(content)) {
      content = content.replace(
        importRegex,
        `$1import { useTranslation } from '../contexts/translation-context';\n`
      );
      
      // Add hook usage in component
      const componentRegex = /(export default function \w+.*\{[\s\n]*)/;
      if (componentRegex.test(content)) {
        content = content.replace(
          componentRegex,
          `$1  const { t } = useTranslation();\n  `
        );
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${filePath}`);
    } else {
      console.log(`⚠️  Could not update ${filePath} (no React import found)`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
  }
});

console.log('\n✅ Translation support added to components!');
console.log('\n📝 Next steps:');
console.log('1. Review the changes');
console.log('2. Replace hardcoded text with t() calls');
console.log('3. Example: "Dashboard" → {t("Dashboard")}');
console.log('4. Test by changing language in navbar\n');
