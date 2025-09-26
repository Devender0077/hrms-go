const mysql = require('mysql2/promise');

async function addComprehensiveDemoData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hrmgo'
  });

  try {
    console.log('🚀 Adding comprehensive demo data...\n');

    // 1. Add more Leave Types
    console.log('📋 Adding Leave Types...');
    const leaveTypes = [
      { name: 'Sick Leave', days_allowed: 12, requires_approval: true, is_paid: true },
      { name: 'Personal Leave', days_allowed: 5, requires_approval: true, is_paid: false },
      { name: 'Maternity Leave', days_allowed: 90, requires_approval: true, is_paid: true },
      { name: 'Paternity Leave', days_allowed: 15, requires_approval: true, is_paid: true },
      { name: 'Study Leave', days_allowed: 10, requires_approval: true, is_paid: false }
    ];

    for (const leaveType of leaveTypes) {
      try {
        await connection.execute(
          'INSERT INTO leave_types (name, days_allowed, requires_approval, is_paid, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [leaveType.name, leaveType.days_allowed, leaveType.requires_approval, leaveType.is_paid]
        );
        console.log(`✅ Added leave type: ${leaveType.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Leave type already exists: ${leaveType.name}`);
        } else {
          console.log(`❌ Error adding leave type ${leaveType.name}:`, error.message);
        }
      }
    }

    // 2. Add Leave Policies
    console.log('\n📋 Adding Leave Policies...');
    const leavePolicies = [
      {
        name: 'Annual Leave Policy',
        description: 'Standard annual leave policy for all employees',
        leave_type_id: 1,
        max_days_per_year: 20,
        max_consecutive_days: 10,
        advance_notice_days: 7,
        carry_forward_days: 5,
        requires_approval: true,
        requires_documentation: false,
        is_active: true
      },
      {
        name: 'Sick Leave Policy',
        description: 'Sick leave policy with medical documentation requirement',
        leave_type_id: 2,
        max_days_per_year: 12,
        max_consecutive_days: 5,
        advance_notice_days: 0,
        carry_forward_days: 0,
        requires_approval: true,
        requires_documentation: true,
        is_active: true
      }
    ];

    for (const policy of leavePolicies) {
      try {
        await connection.execute(
          `INSERT INTO leave_policies (
            name, description, leave_type_id, max_days_per_year, max_consecutive_days,
            advance_notice_days, carry_forward_days, requires_approval, requires_documentation,
            is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            policy.name, policy.description, policy.leave_type_id, policy.max_days_per_year,
            policy.max_consecutive_days, policy.advance_notice_days, policy.carry_forward_days,
            policy.requires_approval, policy.requires_documentation, policy.is_active
          ]
        );
        console.log(`✅ Added leave policy: ${policy.name}`);
      } catch (error) {
        console.log(`❌ Error adding leave policy ${policy.name}:`, error.message);
      }
    }

    // 3. Add more Leave Applications
    console.log('\n📋 Adding Leave Applications...');
    const leaveApplications = [
      {
        employee_id: 1,
        leave_type_id: 1,
        start_date: '2025-02-01',
        end_date: '2025-02-05',
        total_days: 5,
        reason: 'Family vacation',
        status: 'approved',
        applied_at: '2025-01-15 10:00:00'
      },
      {
        employee_id: 2,
        leave_type_id: 2,
        start_date: '2025-02-10',
        end_date: '2025-02-12',
        total_days: 3,
        reason: 'Medical appointment',
        status: 'pending',
        applied_at: '2025-01-20 14:30:00'
      },
      {
        employee_id: 3,
        leave_type_id: 1,
        start_date: '2025-03-01',
        end_date: '2025-03-03',
        total_days: 3,
        reason: 'Personal matters',
        status: 'rejected',
        applied_at: '2025-01-25 09:15:00'
      }
    ];

    for (const app of leaveApplications) {
      try {
        await connection.execute(
          `INSERT INTO leave_applications (
            employee_id, leave_type_id, start_date, end_date, total_days,
            reason, status, applied_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            app.employee_id, app.leave_type_id, app.start_date, app.end_date,
            app.total_days, app.reason, app.status, app.applied_at
          ]
        );
        console.log(`✅ Added leave application for employee ${app.employee_id}`);
      } catch (error) {
        console.log(`❌ Error adding leave application:`, error.message);
      }
    }

    // 4. Add more Leave Balances
    console.log('\n📋 Adding Leave Balances...');
    const leaveBalances = [
      { employee_id: 1, leave_type_id: 1, year: 2025, total_days: 20, used_days: 5, remaining_days: 15 },
      { employee_id: 2, leave_type_id: 1, year: 2025, total_days: 20, used_days: 8, remaining_days: 12 },
      { employee_id: 3, leave_type_id: 1, year: 2025, total_days: 20, used_days: 12, remaining_days: 8 },
      { employee_id: 1, leave_type_id: 2, year: 2025, total_days: 12, used_days: 2, remaining_days: 10 },
      { employee_id: 2, leave_type_id: 2, year: 2025, total_days: 12, used_days: 5, remaining_days: 7 }
    ];

    for (const balance of leaveBalances) {
      try {
        await connection.execute(
          `INSERT INTO leave_balances (
            employee_id, leave_type_id, year, total_days, used_days, remaining_days,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            balance.employee_id, balance.leave_type_id, balance.year,
            balance.total_days, balance.used_days, balance.remaining_days
          ]
        );
        console.log(`✅ Added leave balance for employee ${balance.employee_id}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Leave balance already exists for employee ${balance.employee_id}`);
        } else {
          console.log(`❌ Error adding leave balance:`, error.message);
        }
      }
    }

    // 5. Add more Holidays
    console.log('\n📋 Adding Holidays...');
    const holidays = [
      { name: 'Independence Day', date: '2025-08-15', type: 'national', description: 'Indian Independence Day', is_recurring: true, is_active: true },
      { name: 'Gandhi Jayanti', date: '2025-10-02', type: 'national', description: 'Birthday of Mahatma Gandhi', is_recurring: true, is_active: true },
      { name: 'Diwali', date: '2025-10-20', type: 'religious', description: 'Festival of Lights', is_recurring: true, is_active: true },
      { name: 'Christmas', date: '2025-12-25', type: 'religious', description: 'Christmas Day', is_recurring: true, is_active: true },
      { name: 'Company Foundation Day', date: '2025-06-15', type: 'company', description: 'Company anniversary', is_recurring: true, is_active: true }
    ];

    for (const holiday of holidays) {
      try {
        await connection.execute(
          `INSERT INTO leave_holidays (
            name, date, type, description, is_recurring, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            holiday.name, holiday.date, holiday.type, holiday.description,
            holiday.is_recurring, holiday.is_active
          ]
        );
        console.log(`✅ Added holiday: ${holiday.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Holiday already exists: ${holiday.name}`);
        } else {
          console.log(`❌ Error adding holiday ${holiday.name}:`, error.message);
        }
      }
    }

    // 6. Add more Tasks
    console.log('\n📋 Adding Tasks...');
    const tasks = [
      {
        company_id: 1,
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new HRMS system',
        assigned_to: 1,
        assigned_by: 1,
        priority: 'high',
        status: 'pending',
        due_date: '2025-02-15',
        progress: 0,
        tags: '["documentation", "project", "urgent"]',
        estimated_hours: 8,
        project: 'HRMS Development',
        department: 'IT'
      },
      {
        company_id: 1,
        title: 'Review employee contracts',
        description: 'Review and update all employee contracts for compliance',
        assigned_to: 2,
        assigned_by: 1,
        priority: 'medium',
        status: 'in_progress',
        due_date: '2025-02-20',
        progress: 30,
        tags: '["contracts", "compliance", "hr"]',
        estimated_hours: 12,
        project: 'HR Compliance',
        department: 'HR'
      },
      {
        company_id: 1,
        title: 'Update company policies',
        description: 'Review and update company policies and procedures',
        assigned_to: 3,
        assigned_by: 1,
        priority: 'low',
        status: 'pending',
        due_date: '2025-02-25',
        progress: 0,
        tags: '["policies", "procedures", "update"]',
        estimated_hours: 6,
        project: 'Policy Update',
        department: 'HR'
      },
      {
        company_id: 1,
        title: 'Conduct performance reviews',
        description: 'Schedule and conduct quarterly performance reviews',
        assigned_to: 1,
        assigned_by: 2,
        priority: 'high',
        status: 'in_progress',
        due_date: '2025-02-28',
        progress: 60,
        tags: '["performance", "reviews", "quarterly"]',
        estimated_hours: 16,
        project: 'Performance Management',
        department: 'HR'
      }
    ];

    for (const task of tasks) {
      try {
        await connection.execute(
          `INSERT INTO tasks (
            company_id, title, description, assigned_to, assigned_by, priority, status,
            due_date, progress, tags, estimated_hours, project, department, task_id, assignee_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            task.company_id, task.title, task.description, task.assigned_to, task.assigned_by,
            task.priority, task.status, task.due_date, task.progress, task.tags,
            task.estimated_hours, task.project, task.department, `TASK-${Date.now()}`, task.assigned_to
          ]
        );
        console.log(`✅ Added task: ${task.title}`);
      } catch (error) {
        console.log(`❌ Error adding task ${task.title}:`, error.message);
      }
    }

    // 7. Add Performance Reviews
    console.log('\n📋 Adding Performance Reviews...');
    const reviews = [
      {
        employee_id: 1,
        reviewer_id: 2,
        review_period_start: '2024-10-01',
        review_period_end: '2024-12-31',
        overall_rating: 4.5,
        goals_achieved: 8,
        goals_total: 10,
        feedback: 'Excellent performance this quarter. Met most goals and showed great initiative.',
        status: 'completed',
        review_date: '2025-01-15'
      },
      {
        employee_id: 2,
        reviewer_id: 1,
        review_period_start: '2024-10-01',
        review_period_end: '2024-12-31',
        overall_rating: 4.0,
        goals_achieved: 7,
        goals_total: 9,
        feedback: 'Good performance with room for improvement in communication skills.',
        status: 'completed',
        review_date: '2025-01-20'
      },
      {
        employee_id: 3,
        reviewer_id: 1,
        review_period_start: '2024-10-01',
        review_period_end: '2024-12-31',
        overall_rating: 3.5,
        goals_achieved: 6,
        goals_total: 8,
        feedback: 'Satisfactory performance. Needs to improve time management.',
        status: 'pending',
        review_date: '2025-01-25'
      }
    ];

    for (const review of reviews) {
      try {
        await connection.execute(
          `INSERT INTO performance_reviews (
            employee_id, reviewer_id, review_period_start, review_period_end,
            overall_rating, goals_achieved, goals_total, feedback, status, review_date,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            review.employee_id, review.reviewer_id, review.review_period_start,
            review.review_period_end, review.overall_rating, review.goals_achieved,
            review.goals_total, review.feedback, review.status, review.review_date
          ]
        );
        console.log(`✅ Added performance review for employee ${review.employee_id}`);
      } catch (error) {
        console.log(`❌ Error adding performance review:`, error.message);
      }
    }

    console.log('\n🎉 Demo data addition completed!');
    console.log('\n📊 Final Data Count:');
    
    // Check final counts
    const [finalLeaveTypes] = await connection.execute('SELECT COUNT(*) as count FROM leave_types');
    const [finalLeaveApps] = await connection.execute('SELECT COUNT(*) as count FROM leave_applications');
    const [finalLeaveBalances] = await connection.execute('SELECT COUNT(*) as count FROM leave_balances');
    const [finalLeavePolicies] = await connection.execute('SELECT COUNT(*) as count FROM leave_policies');
    const [finalHolidays] = await connection.execute('SELECT COUNT(*) as count FROM leave_holidays');
    const [finalTasks] = await connection.execute('SELECT COUNT(*) as count FROM tasks');
    const [finalReviews] = await connection.execute('SELECT COUNT(*) as count FROM performance_reviews');
    
    console.log(`Leave Types: ${finalLeaveTypes[0].count}`);
    console.log(`Leave Applications: ${finalLeaveApps[0].count}`);
    console.log(`Leave Balances: ${finalLeaveBalances[0].count}`);
    console.log(`Leave Policies: ${finalLeavePolicies[0].count}`);
    console.log(`Holidays: ${finalHolidays[0].count}`);
    console.log(`Tasks: ${finalTasks[0].count}`);
    console.log(`Performance Reviews: ${finalReviews[0].count}`);

  } catch (error) {
    console.error('❌ Error adding demo data:', error);
  } finally {
    await connection.end();
  }
}

addComprehensiveDemoData();
