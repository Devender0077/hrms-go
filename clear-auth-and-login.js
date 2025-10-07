#!/usr/bin/env node

/**
 * Clear Authentication and Login Helper Script
 * This script helps resolve authentication issues by clearing auth data
 */

console.log('🔧 HRMS Authentication Helper');
console.log('================================');
console.log('');
console.log('If you\'re seeing "No Permissions Found" or authentication errors, follow these steps:');
console.log('');
console.log('1. 🧹 Clear Browser Storage:');
console.log('   - Open Developer Tools (F12)');
console.log('   - Go to Application tab');
console.log('   - Clear Local Storage and Session Storage');
console.log('   - Or run: node clear-auth.js');
console.log('');
console.log('2. 🔄 Refresh the Page:');
console.log('   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)');
console.log('   - Or close and reopen the browser');
console.log('');
console.log('3. 🔑 Log In Again:');
console.log('   - Go to http://localhost:5173/login');
console.log('   - Use these test credentials:');
console.log('     Email: admin@example.com');
console.log('     Password: (check database or use default)');
console.log('');
console.log('4. ✅ Verify Permissions:');
console.log('   - After login, go to Roles page');
console.log('   - You should see 224 permissions across 19 modules');
console.log('');
console.log('📊 Available Test Users:');
console.log('   - admin@example.com (super_admin)');
console.log('   - employee@example.com (employee)');
console.log('   - jane.smith@hrms.com (employee)');
console.log('   - mike.johnson@hrms.com (employee)');
console.log('   - sarah.wilson@hrms.com (employee)');
console.log('');
console.log('🔍 If issues persist:');
console.log('   - Check browser console for errors');
console.log('   - Verify backend server is running on port 8000');
console.log('   - Check network tab for API request status');
console.log('');
console.log('💡 The permissions system now has 224 comprehensive permissions!');
console.log('   - Dashboard: 4 permissions');
console.log('   - Employees: 12 permissions');
console.log('   - Attendance: 12 permissions');
console.log('   - Leave: 12 permissions');
console.log('   - Payroll: 12 permissions');
console.log('   - Organization: 16 permissions');
console.log('   - Settings: 12 permissions');
console.log('   - Reports: 12 permissions');
console.log('   - Tasks: 12 permissions');
console.log('   - Documents: 12 permissions');
console.log('   - Recruitment: 12 permissions');
console.log('   - Performance: 12 permissions');
console.log('   - Assets: 12 permissions');
console.log('   - Finance: 12 permissions');
console.log('   - Training: 12 permissions');
console.log('   - Calendar: 12 permissions');
console.log('   - Notifications: 12 permissions');
console.log('   - Users: 12 permissions');
console.log('   - Admin: 12 permissions');
console.log('');
console.log('🎉 Total: 224 permissions with full CRUD operations!');
