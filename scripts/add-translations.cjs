#!/usr/bin/env node

/**
 * Translation Helper Script
 * Helps identify pages that need translation and shows what needs to be done
 */

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');

// Find all .tsx files
function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check if file uses translation
function usesTranslation(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes('useTranslation');
}

// Main
const allFiles = getAllTsxFiles(pagesDir);
const filesWithTranslation = allFiles.filter(usesTranslation);
const filesWithoutTranslation = allFiles.filter(f => !usesTranslation(f));

console.log('=== Translation Coverage Report ===\n');
console.log(`Total Pages: ${allFiles.length}`);
console.log(`With Translation: ${filesWithTranslation.length} (${Math.round(filesWithTranslation.length / allFiles.length * 100)}%)`);
console.log(`Without Translation: ${filesWithoutTranslation.length}\n`);

console.log('=== Pages Needing Translation ===\n');
filesWithoutTranslation.forEach((file, index) => {
  const relativePath = file.replace(path.join(__dirname, '../'), '');
  console.log(`${index + 1}. ${relativePath}`);
});

console.log('\n=== How to Add Translation ===\n');
console.log('1. Import the hook:');
console.log('   import { useTranslation } from "../contexts/translation-context";\n');
console.log('2. Use in component:');
console.log('   const { t } = useTranslation();\n');
console.log('3. Replace hardcoded text:');
console.log('   <h1>Dashboard</h1> → <h1>{t("dashboard.title")}</h1>');
console.log('   <Button>Save</Button> → <Button>{t("common.save")}</Button>\n');

// Output to file as well
const reportPath = path.join(__dirname, '../TRANSLATION_REPORT.txt');
const report = `Translation Coverage Report
Generated: ${new Date().toISOString()}

Total Pages: ${allFiles.length}
With Translation: ${filesWithTranslation.length} (${Math.round(filesWithTranslation.length / allFiles.length * 100)}%)
Without Translation: ${filesWithoutTranslation.length}

Pages Needing Translation:
${filesWithoutTranslation.map((file, index) => {
  const relativePath = file.replace(path.join(__dirname, '../'), '');
  return `${index + 1}. ${relativePath}`;
}).join('\n')}

Priority Pages (Do These First):
1. src/pages/calendar.tsx - High usage
2. src/pages/organization/departments.tsx - Core HR feature
3. src/pages/organization/designations.tsx - Core HR feature
4. src/pages/organization/branches.tsx - Core HR feature
5. src/pages/leave/applications.tsx - High usage
6. src/pages/leave/holidays.tsx - High usage
7. src/pages/timekeeping/attendance.tsx - High usage
8. src/pages/payroll.tsx - Core feature
9. src/pages/auth/login.tsx - Critical
10. src/pages/auth/register.tsx - Critical
`;

fs.writeFileSync(reportPath, report);
console.log(`\nReport saved to: TRANSLATION_REPORT.txt`);

