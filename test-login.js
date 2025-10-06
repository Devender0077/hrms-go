/**
 * Test Login Script
 * Run this in your browser console to test login functionality
 */

console.log('🧪 Testing login functionality...');

// Test data
const testCredentials = {
  email: 'admin@example.com',
  password: 'password123'
};

// Test login
async function testLogin() {
  try {
    console.log('📤 Sending login request...');
    
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('🔑 Token received:', data.data?.token ? 'Yes' : 'No');
      console.log('👤 User data:', data.data?.user);
      
      // Store token for testing
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('💾 Token stored in localStorage');
      }
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('🚨 Login test error:', error);
  }
}

// Test API call with token
async function testApiCall() {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('❌ No token found. Please run testLogin() first.');
      return;
    }
    
    console.log('📤 Testing API call with token...');
    
    const response = await fetch('http://localhost:8000/api/v1/tasks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      console.log('✅ API call successful!');
      const data = await response.json();
      console.log('📊 Response data:', data);
    } else {
      console.log('❌ API call failed:', response.status, response.statusText);
      const errorData = await response.json();
      console.log('📝 Error details:', errorData);
    }
  } catch (error) {
    console.error('🚨 API test error:', error);
  }
}

// Run tests
console.log('🚀 Starting login tests...');
testLogin().then(() => {
  setTimeout(() => {
    testApiCall();
  }, 1000);
});

console.log('📝 Available functions:');
console.log('  - testLogin() - Test login functionality');
console.log('  - testApiCall() - Test API call with token');
