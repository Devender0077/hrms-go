/**
 * Browser Storage Clear Script
 * Run this in your browser console to clear all authentication data
 */

console.log('🧹 Clearing browser storage...');

// Clear localStorage
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Clear cookies (if any)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ cookies cleared');

// Clear any cached data
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
  console.log('✅ cache cleared');
}

console.log('🎉 All storage cleared! Please refresh the page and login again.');
console.log('📝 If you still see issues, try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');