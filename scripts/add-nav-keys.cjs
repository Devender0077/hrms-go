#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Navigation keys to add to all language files
const navKeys = {
  "Main": "Main",
  "Dashboard": "Dashboard",
  "Messenger": "Messenger",
  "Announcements": "Announcements",
  "Calendar": "Calendar",
  "Tasks": "Tasks",
  "Organization Chart": "Organization Chart",
  "HR Management": "HR Management",
  "Employees": "Employees",
  "Employee Documents": "Employee Documents",
  "Employee Salaries": "Employee Salaries",
  "Employee Contracts": "Employee Contracts",
  "Departments": "Departments",
  "Designations": "Designations",
  "Branches": "Branches",
  "Timekeeping": "Timekeeping",
  "Attendance": "Attendance",
  "Attendance Muster": "Attendance Muster",
  "Time Tracking": "Time Tracking",
  "Leave Management": "Leave Management",
  "Leave Overview": "Leave Overview",
  "Leave Applications": "Leave Applications",
  "Leave Types": "Leave Types",
  "Holidays": "Holidays",
  "Leave Policies": "Leave Policies",
  "Leave Balances": "Leave Balances",
  "Recruitment": "Recruitment",
  "Jobs": "Jobs",
  "Candidates": "Candidates",
  "Interviews": "Interviews",
  "Performance": "Performance",
  "Goals": "Goals",
  "Reviews": "Reviews",
  "Training": "Training",
  "Training Programs": "Training Programs",
  "Training Sessions": "Training Sessions",
  "Employee Training": "Employee Training",
  "Employee Lifecycle": "Employee Lifecycle",
  "Awards": "Awards",
  "Promotions": "Promotions",
  "Warnings": "Warnings",
  "Resignations": "Resignations",
  "Terminations": "Terminations",
  "Transfers": "Transfers",
  "Complaints": "Complaints",
  "Payroll": "Payroll",
  "Payroll Overview": "Payroll Overview",
  "Payslips": "Payslips",
  "Salary Components": "Salary Components",
  "Reports": "Reports",
  "Attendance Reports": "Attendance Reports",
  "Leave Reports": "Leave Reports",
  "Payroll Reports": "Payroll Reports",
  "Assets": "Assets",
  "Asset Assignments": "Asset Assignments",
  "Documents": "Documents",
  "Media & Content": "Media & Content",
  "Media Library": "Media Library",
  "Landing Page": "Landing Page",
  "Communication": "Communication",
  "Trips": "Trips",
  "Meetings": "Meetings",
  "System Setup": "System Setup",
  "HR System Setup": "HR System Setup",
  "Version History": "Version History",
  "Administration": "Administration",
  "Users": "Users",
  "Roles": "Roles",
  "Audit Logs": "Audit Logs",
  "Profile": "Profile"
};

const localesDir = path.join(__dirname, '../src/i18n/locales');
const languages = ['es', 'fr', 'de', 'zh', 'ar', 'pt', 'ru', 'ja'];

languages.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  
  try {
    // Read existing file
    const content = fs.readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(content);
    
    // Add navigation keys
    Object.keys(navKeys).forEach(key => {
      if (!translations[key]) {
        translations[key] = navKeys[key]; // Use English as fallback
      }
    });
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
    console.log(`✅ Updated ${lang}.json with navigation keys`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✅ All language files updated!');
console.log('Navigation keys added to: es, fr, de, zh, ar, pt, ru, ja');
console.log('\nThese languages will use English for navigation items.');
console.log('You can translate them to native languages later.');

