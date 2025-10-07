#!/usr/bin/env node

/**
 * Clear Authentication Data Script
 * This script clears all authentication data from localStorage and sessionStorage
 * Use this when you're experiencing authentication issues
 */

console.log('🧹 Clearing authentication data...');

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  console.log('✅ Cleared localStorage');
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('user');
  console.log('✅ Cleared sessionStorage');
}

console.log('🎉 Authentication data cleared successfully!');
console.log('📝 Please refresh your browser and log in again.');