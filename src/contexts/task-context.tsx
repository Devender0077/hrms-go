import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignee: string;
  assigneeId: string;
  dueDate: string;
  progress: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
  project?: string;
  department?: string;
}

interface TaskCounts {
  all: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

interface TaskContextType {
  tasks: Task[];
  taskCounts: TaskCounts;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  refreshTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Sample tasks data - in real app, this would come from API
  const sampleTasks: Task[] = [
    {
      id: 1,
      title: "Complete project proposal",
      description: "Draft and finalize the Q1 project proposal document",
      priority: "high",
      status: "in_progress",
      assignee: "John Doe",
      assigneeId: "user-1",
      dueDate: "2025-01-20",
      progress: 75,
      tags: ["project", "documentation"],
      createdAt: "2025-01-10",
      updatedAt: "2025-01-15",
      estimatedHours: 8,
      actualHours: 6,
      project: "Q1 Planning",
      department: "Engineering"
    },
    {
      id: 2,
      title: "Review employee performance",
      description: "Conduct quarterly performance reviews for team members",
      priority: "medium",
      status: "pending",
      assignee: "Jane Smith",
      assigneeId: "user-2",
      dueDate: "2025-01-25",
      progress: 0,
      tags: ["hr", "review"],
      createdAt: "2025-01-12",
      updatedAt: "2025-01-12",
      estimatedHours: 12,
      project: "Performance Management",
      department: "HR"
    },
    {
      id: 3,
      title: "Update system documentation",
      description: "Update API documentation and user guides",
      priority: "low",
      status: "completed",
      assignee: "Mike Johnson",
      assigneeId: "user-3",
      dueDate: "2025-01-15",
      progress: 100,
      tags: ["documentation", "api"],
      createdAt: "2025-01-08",
      updatedAt: "2025-01-15",
      estimatedHours: 6,
      actualHours: 5,
      project: "Documentation Update",
      department: "Engineering"
    },
    {
      id: 4,
      title: "Client meeting preparation",
      description: "Prepare presentation and materials for client meeting",
      priority: "urgent",
      status: "in_progress",
      assignee: "Sarah Wilson",
      assigneeId: "user-4",
      dueDate: "2025-01-18",
      progress: 60,
      tags: ["client", "presentation"],
      createdAt: "2025-01-14",
      updatedAt: "2025-01-16",
      estimatedHours: 4,
      actualHours: 2.5,
      project: "Client Relations",
      department: "Sales"
    },
    {
      id: 5,
      title: "Code review and testing",
      description: "Review pull requests and run comprehensive tests",
      priority: "high",
      status: "pending",
      assignee: "David Brown",
      assigneeId: "user-5",
      dueDate: "2025-01-22",
      progress: 0,
      tags: ["development", "testing"],
      createdAt: "2025-01-13",
      updatedAt: "2025-01-13",
      estimatedHours: 10,
      project: "Feature Development",
      department: "Engineering"
    }
  ];

  useEffect(() => {
    // Load tasks from localStorage or API
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(sampleTasks);
      localStorage.setItem('tasks', JSON.stringify(sampleTasks));
    }
  }, []);

  const calculateTaskCounts = (): TaskCounts => {
    return {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    };
  };

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const refreshTasks = () => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const taskCounts = calculateTaskCounts();

  const value: TaskContextType = {
    tasks,
    taskCounts,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
