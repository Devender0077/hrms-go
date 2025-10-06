/**
 * Frontend Authentication Reset Script
 * Run this in your browser console to completely reset authentication
 */

console.log('🔄 Resetting frontend authentication...');

// 1. Clear all storage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage cleared');

// 2. Clear any cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies cleared');

// 3. Clear cache
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
  console.log('✅ Cache cleared');
}

// 4. Test login with new token
async function testLogin() {
  try {
    console.log('🧪 Testing login...');
    
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@hrmgo.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      
      // Store the new token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('💾 New token stored');
      
      // Test API call
      const apiResponse = await fetch('http://localhost:8000/api/v1/tasks', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (apiResponse.ok) {
        console.log('✅ API call successful!');
        console.log('🎉 Authentication is working! Refreshing page...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        console.log('❌ API call failed:', apiResponse.status);
      }
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('🚨 Error:', error);
  }
}

// Run the test
testLogin();

console.log('📝 Instructions:');
console.log('1. Wait for the test to complete');
console.log('2. The page will automatically refresh');
console.log('3. You should be able to use the application normally');
