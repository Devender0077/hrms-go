import { useState, useEffect } from 'react';
    import { format, addDays, subDays } from 'date-fns';
    
    export const useDashboardData = () => {
      const [isLoading, setIsLoading] = useState(true);
      const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        openPositions: 0
      });
      const [employeeStats, setEmployeeStats] = useState({
        departments: {
          IT: 0,
          HR: 0,
          Finance: 0,
          Marketing: 0,
          Operations: 0
        },
        designations: {},
        genderDistribution: {
          male: 0,
          female: 0,
          other: 0
        }
      });
      const [attendanceData, setAttendanceData] = useState([]);
      const [leaveData, setLeaveData] = useState([]);
      const [recentEmployees, setRecentEmployees] = useState([]);
      const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
      const [upcomingHolidays, setUpcomingHolidays] = useState([]);
      const [announcements, setAnnouncements] = useState([]);
      const [tasks, setTasks] = useState([]);
      
      useEffect(() => {
        const fetchDashboardData = async () => {
          try {
            setIsLoading(true);
            
            // In a real implementation, these would be API calls
            // For now, we'll use mock data
            
            // Mock stats
            setStats({
              totalEmployees: 42,
              presentToday: 35,
              onLeave: 5,
              openPositions: 8
            });
            
            // Mock employee stats
            setEmployeeStats({
              departments: {
                IT: 15,
                HR: 8,
                Finance: 7,
                Marketing: 6,
                Operations: 6
              },
              designations: {
                'Software Engineer': 10,
                'HR Manager': 2,
                'HR Executive': 6,
                'Finance Manager': 2,
                'Accountant': 5,
                'Marketing Manager': 2,
                'Marketing Executive': 4,
                'Operations Manager': 2,
                'Operations Executive': 4,
                'System Administrator': 5
              },
              genderDistribution: {
                male: 24,
                female: 17,
                other: 1
              }
            });
            
            // Mock attendance data for the last 30 days
            const attendanceData = Array.from({ length: 30 }, (_, i) => {
              const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
              const totalEmployees = 42;
              const present = Math.floor(Math.random() * 10) + 30; // Random between 30-40
              const absent = totalEmployees - present;
              
              return {
                date,
                present,
                absent
              };
            });
            setAttendanceData(attendanceData);
            
            // Mock leave data for the last 6 months
            const leaveData = [
              { name: 'Jan', approved: 12, pending: 3, rejected: 1 },
              { name: 'Feb', approved: 9, pending: 2, rejected: 2 },
              { name: 'Mar', approved: 15, pending: 4, rejected: 0 },
              { name: 'Apr', approved: 10, pending: 5, rejected: 3 },
              { name: 'May', approved: 8, pending: 2, rejected: 1 },
              { name: 'Jun', approved: 14, pending: 3, rejected: 2 }
            ];
            setLeaveData(leaveData);
            
            // Mock recent employees
            const recentEmployees = [
              { first_name: 'Sarah', last_name: 'Johnson', designation: 'HR Manager', joining_date: '2023-06-15' },
              { first_name: 'Michael', last_name: 'Smith', designation: 'Software Engineer', joining_date: '2023-06-10' },
              { first_name: 'Emily', last_name: 'Davis', designation: 'Accountant', joining_date: '2023-06-05' },
              { first_name: 'David', last_name: 'Wilson', designation: 'Marketing Manager', joining_date: '2023-06-01' }
            ];
            setRecentEmployees(recentEmployees);
            
            // Mock upcoming birthdays
            const upcomingBirthdays = [
              { first_name: 'John', last_name: 'Doe', date: '2023-07-15', days_away: 'In 3 days' },
              { first_name: 'Jane', last_name: 'Smith', date: '2023-07-20', days_away: 'In 8 days' },
              { first_name: 'Robert', last_name: 'Johnson', date: '2023-07-25', days_away: 'In 13 days' }
            ];
            setUpcomingBirthdays(upcomingBirthdays);
            
            // Mock upcoming holidays
            const upcomingHolidays = [
              { name: 'Independence Day', date: '2023-07-04', days_away: 'Tomorrow' },
              { name: 'Labor Day', date: '2023-09-04', days_away: 'In 60 days' },
              { name: 'Thanksgiving', date: '2023-11-23', days_away: 'In 140 days' }
            ];
            setUpcomingHolidays(upcomingHolidays);
            
            // Mock announcements
            const announcements = [
              { 
                title: 'Company Picnic', 
                description: 'Annual company picnic will be held on July 15th at Central Park. All employees and their families are invited.', 
                priority: 'medium', 
                posted_by: 'HR Department', 
                date: '2023-06-25' 
              },
              { 
                title: 'Office Renovation', 
                description: 'The office will undergo renovation from July 10th to July 20th. Please work from home during this period.', 
                priority: 'high', 
                posted_by: 'Admin', 
                date: '2023-06-20' 
              },
              { 
                title: 'New Health Insurance Policy', 
                description: 'We have updated our health insurance policy. Please check your email for details.', 
                priority: 'low', 
                posted_by: 'HR Department', 
                date: '2023-06-15' 
              }
            ];
            setAnnouncements(announcements);
            
            // Mock tasks
            const tasks = [
              { 
                title: 'Complete Project Proposal', 
                description: 'Finish the project proposal for the new client and submit it for review.', 
                status: 'in_progress', 
                priority: 'high', 
                project: 'Client Onboarding', 
                due_date: '2023-07-05' 
              },
              { 
                title: 'Review Budget Report', 
                description: 'Review the Q2 budget report and provide feedback.', 
                status: 'todo', 
                priority: 'medium', 
                project: 'Finance', 
                due_date: '2023-07-10' 
              },
              { 
                title: 'Update Employee Handbook', 
                description: 'Update the employee handbook with the new policies.', 
                status: 'completed', 
                priority: 'low', 
                project: 'HR', 
                due_date: '2023-06-30' 
              }
            ];
            setTasks(tasks);
            
          } catch (error) {
            console.error('Error fetching dashboard data:', error);
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchDashboardData();
      }, []);
      
      return {
        isLoading,
        stats,
        employeeStats,
        attendanceData,
        leaveData,
        recentEmployees,
        upcomingBirthdays,
        upcomingHolidays,
        announcements,
        tasks
      };
    };
