/**
 * Clear Authentication Data Script
 * Run this script in your browser console to clear all authentication data
 */

console.log('🧹 Clearing authentication data...');

// Clear localStorage
localStorage.removeItem('authToken');
localStorage.removeItem('user');
localStorage.removeItem('rememberMe');

// Clear sessionStorage
sessionStorage.removeItem('authToken');
sessionStorage.removeItem('user');
sessionStorage.removeItem('rememberMe');

console.log('✅ Authentication data cleared successfully!');
console.log('🔄 Please refresh the page and log in again.');

// Optional: Auto refresh
// window.location.reload();
