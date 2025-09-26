import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Mock authentication token (you might need to get a real one)
const AUTH_TOKEN = 'your-auth-token-here';

async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function addLeaveTestData() {
  console.log('🚀 Starting to add leave management test data via API...\n');

  // 1. Add Leave Types
  console.log('📝 Adding Leave Types...');
  const leaveTypes = [
    {
      name: 'Annual Leave',
      code: 'ANNUAL',
      description: 'Regular vacation leave for employees',
      max_days_per_year: 21,
      max_consecutive_days: 14,
      requires_approval: true,
      requires_documentation: false,
      is_paid: true,
      carry_forward: true,
      max_carry_forward_days: 5,
      gender_restriction: 'all',
      min_service_days: 0,
      advance_notice_days: 7,
      color_code: '#3B82F6',
      is_active: true
    },
    {
      name: 'Sick Leave',
      code: 'SICK',
      description: 'Leave for illness or medical appointments',
      max_days_per_year: 12,
      max_consecutive_days: 3,
      requires_approval: false,
      requires_documentation: true,
      is_paid: true,
      carry_forward: false,
      max_carry_forward_days: 0,
      gender_restriction: 'all',
      min_service_days: 0,
      advance_notice_days: 0,
      color_code: '#EF4444',
      is_active: true
    },
    {
      name: 'Maternity Leave',
      code: 'MATERNITY',
      description: 'Leave for new mothers',
      max_days_per_year: 90,
      max_consecutive_days: 90,
      requires_approval: true,
      requires_documentation: true,
      is_paid: true,
      carry_forward: false,
      max_carry_forward_days: 0,
      gender_restriction: 'female',
      min_service_days: 365,
      advance_notice_days: 30,
      color_code: '#EC4899',
      is_active: true
    },
    {
      name: 'Paternity Leave',
      code: 'PATERNITY',
      description: 'Leave for new fathers',
      max_days_per_year: 15,
      max_consecutive_days: 15,
      requires_approval: true,
      requires_documentation: true,
      is_paid: true,
      carry_forward: false,
      max_carry_forward_days: 0,
      gender_restriction: 'male',
      min_service_days: 365,
      advance_notice_days: 30,
      color_code: '#8B5CF6',
      is_active: true
    },
    {
      name: 'Personal Leave',
      code: 'PERSONAL',
      description: 'Leave for personal matters',
      max_days_per_year: 5,
      max_consecutive_days: 3,
      requires_approval: true,
      requires_documentation: false,
      is_paid: false,
      carry_forward: false,
      max_carry_forward_days: 0,
      gender_restriction: 'all',
      min_service_days: 90,
      advance_notice_days: 3,
      color_code: '#F59E0B',
      is_active: true
    },
    {
      name: 'Emergency Leave',
      code: 'EMERGENCY',
      description: 'Leave for family emergencies',
      max_days_per_year: 3,
      max_consecutive_days: 3,
      requires_approval: false,
      requires_documentation: true,
      is_paid: true,
      carry_forward: false,
      max_carry_forward_days: 0,
      gender_restriction: 'all',
      min_service_days: 0,
      advance_notice_days: 0,
      color_code: '#DC2626',
      is_active: true
    }
  ];

  for (const leaveType of leaveTypes) {
    const result = await apiRequest('/leave/types', 'POST', leaveType);
    if (result.success) {
      console.log(`✅ Added leave type: ${leaveType.name}`);
    } else {
      console.log(`❌ Failed to add leave type: ${leaveType.name} - ${result.message}`);
    }
  }

  // 2. Add Leave Policies
  console.log('\n📜 Adding Leave Policies...');
  const leavePolicies = [
    {
      name: 'General Leave Policy',
      description: 'Standard leave policy for all employees',
      policy_type: 'general',
      leave_type_id: 1,
      max_days_per_year: 21,
      max_consecutive_days: 14,
      requires_approval: true,
      approval_workflow: {
        levels: [
          { role: 'manager', required: true },
          { role: 'hr', required: false }
        ]
      },
      is_active: true,
      effective_from: '2025-01-01'
    },
    {
      name: 'Sick Leave Policy',
      description: 'Policy for sick leave and medical appointments',
      policy_type: 'general',
      leave_type_id: 2,
      max_days_per_year: 12,
      max_consecutive_days: 3,
      requires_approval: false,
      approval_workflow: {
        levels: [
          { role: 'self', required: true }
        ]
      },
      is_active: true,
      effective_from: '2025-01-01'
    }
  ];

  for (const policy of leavePolicies) {
    const result = await apiRequest('/leave/policies', 'POST', policy);
    if (result.success) {
      console.log(`✅ Added leave policy: ${policy.name}`);
    } else {
      console.log(`❌ Failed to add leave policy: ${policy.name} - ${result.message}`);
    }
  }

  // 3. Add Holidays
  console.log('\n🎉 Adding Holidays...');
  const holidays = [
    {
      name: 'New Year\'s Day',
      date: '2025-01-01',
      type: 'national',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'New Year celebration',
      is_active: true
    },
    {
      name: 'Martin Luther King Jr. Day',
      date: '2025-01-20',
      type: 'national',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'Federal holiday honoring MLK Jr.',
      is_active: true
    },
    {
      name: 'Presidents\' Day',
      date: '2025-02-17',
      type: 'national',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'Federal holiday honoring US Presidents',
      is_active: true
    },
    {
      name: 'Memorial Day',
      date: '2025-05-26',
      type: 'national',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'Federal holiday honoring fallen soldiers',
      is_active: true
    },
    {
      name: 'Independence Day',
      date: '2025-07-04',
      type: 'national',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'US Independence Day',
      is_active: true
    },
    {
      name: 'Labor Day',
      date: '2025-09-01',
      type: 'national',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'Federal holiday honoring workers',
      is_active: true
    },
    {
      name: 'Thanksgiving Day',
      date: '2025-11-27',
      type: 'national',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'Thanksgiving celebration',
      is_active: true
    },
    {
      name: 'Christmas Day',
      date: '2025-12-25',
      type: 'national',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'Christmas celebration',
      is_active: true
    },
    {
      name: 'Company Anniversary',
      date: '2025-06-15',
      type: 'company',
      is_recurring: true,
      recurring_pattern: 'yearly',
      description: 'Company founding anniversary',
      is_active: true
    },
    {
      name: 'Floating Holiday',
      date: '2025-12-31',
      type: 'floating',
      is_recurring: false,
      recurring_pattern: null,
      description: 'Employee floating holiday',
      is_active: true
    }
  ];

  for (const holiday of holidays) {
    const result = await apiRequest('/leave/holidays', 'POST', holiday);
    if (result.success) {
      console.log(`✅ Added holiday: ${holiday.name}`);
    } else {
      console.log(`❌ Failed to add holiday: ${holiday.name} - ${result.message}`);
    }
  }

  // 4. Add Leave Applications
  console.log('\n📋 Adding Leave Applications...');
  const leaveApplications = [
    {
      employee_id: 1,
      leave_type_id: 1,
      start_date: '2025-02-15',
      end_date: '2025-02-17',
      total_days: 3,
      reason: 'Family vacation to visit relatives',
      emergency_contact: '+1-555-0123'
    },
    {
      employee_id: 2,
      leave_type_id: 2,
      start_date: '2025-01-20',
      end_date: '2025-01-20',
      total_days: 1,
      reason: 'Doctor appointment for annual checkup',
      emergency_contact: '+1-555-0124'
    },
    {
      employee_id: 3,
      leave_type_id: 1,
      start_date: '2025-03-10',
      end_date: '2025-03-14',
      total_days: 5,
      reason: 'Spring break vacation with family',
      emergency_contact: '+1-555-0125'
    },
    {
      employee_id: 4,
      leave_type_id: 6,
      start_date: '2025-01-22',
      end_date: '2025-01-22',
      total_days: 1,
      reason: 'Family emergency - need to attend to sick parent',
      emergency_contact: '+1-555-0126'
    },
    {
      employee_id: 5,
      leave_type_id: 5,
      start_date: '2025-02-05',
      end_date: '2025-02-05',
      total_days: 1,
      reason: 'Personal matter - court appearance',
      emergency_contact: '+1-555-0127'
    }
  ];

  for (const app of leaveApplications) {
    const result = await apiRequest('/leave/applications', 'POST', app);
    if (result.success) {
      console.log(`✅ Added leave application for employee ${app.employee_id}`);
    } else {
      console.log(`❌ Failed to add leave application for employee ${app.employee_id} - ${result.message}`);
    }
  }

  // 5. Add Leave Balances
  console.log('\n📊 Adding Leave Balances...');
  const leaveBalances = [
    {
      employee_id: 1,
      leave_type_id: 1,
      year: 2025,
      total_allocated: 21,
      total_used: 3,
      total_approved: 3,
      total_pending: 0,
      carry_forward_from_previous: 0
    },
    {
      employee_id: 2,
      leave_type_id: 2,
      year: 2025,
      total_allocated: 12,
      total_used: 1,
      total_approved: 1,
      total_pending: 0,
      carry_forward_from_previous: 0
    },
    {
      employee_id: 3,
      leave_type_id: 1,
      year: 2025,
      total_allocated: 21,
      total_used: 0,
      total_approved: 0,
      total_pending: 5,
      carry_forward_from_previous: 0
    }
  ];

  for (const balance of leaveBalances) {
    const result = await apiRequest('/leave/balances/adjust', 'POST', balance);
    if (result.success) {
      console.log(`✅ Added leave balance for employee ${balance.employee_id}`);
    } else {
      console.log(`❌ Failed to add leave balance for employee ${balance.employee_id} - ${result.message}`);
    }
  }

  console.log('\n🎉 Leave management test data addition completed!');
  console.log('\n📊 Summary:');
  console.log(`   • ${leaveTypes.length} Leave Types`);
  console.log(`   • ${leavePolicies.length} Leave Policies`);
  console.log(`   • ${holidays.length} Holidays`);
  console.log(`   • ${leaveApplications.length} Leave Applications`);
  console.log(`   • ${leaveBalances.length} Leave Balances`);
}

// Run the script
addLeaveTestData();
