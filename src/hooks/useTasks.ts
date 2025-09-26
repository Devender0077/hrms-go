import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { taskAPI } from '../services/api-service';
import { addToast } from '@heroui/react';

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
  // Additional database fields
  company_id?: number;
  assigned_to?: number;
  assigned_by?: number;
  task_id?: string;
  assignee_id?: string;
  assignee_name?: string;
  assignee_email?: string;
  first_name?: string;
  last_name?: string;
  completed_at?: string;
}

interface TaskCounts {
  all: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { makeAuthenticatedRequest, isAuthenticated, isLoading: authLoading } = useAuthenticatedAPI();

  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await makeAuthenticatedRequest(
        async () => {
          const response = await taskAPI.getAll();
          // Map backend response to frontend Task interface
          const fetchedTasks: Task[] = response.data.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            assignee: task.first_name ? `${task.first_name} ${task.last_name}` : 'N/A',
            assigneeId: task.assigned_to,
            dueDate: task.due_date,
            progress: task.progress,
            tags: task.tags ? (() => {
              try {
                // Try to parse as JSON first
                return JSON.parse(task.tags);
              } catch {
                // If JSON parsing fails, treat as comma-separated string
                return task.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
              }
            })() : [],
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            estimatedHours: task.estimated_hours,
            actualHours: task.actual_hours,
            project: task.project,
            department: task.department,
            // Additional database fields
            company_id: task.company_id,
            assigned_to: task.assigned_to,
            assigned_by: task.assigned_by,
            task_id: task.task_id,
            assignee_id: task.assignee_id,
            assignee_name: task.assignee_name,
            assignee_email: task.assignee_email,
            first_name: task.first_name,
            last_name: task.last_name,
            completed_at: task.completed_at,
          }));
          setTasks(fetchedTasks || []);
        },
        {
          onError: (error) => {
            console.error('Error loading tasks:', error);
            setError('Failed to load tasks');
            setTasks([]);
          }
        }
      );
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, makeAuthenticatedRequest]);

  const addTask = useCallback(async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await makeAuthenticatedRequest(
        async () => {
          await taskAPI.create(newTask);
          addToast({
            title: "Success",
            description: "Task created successfully",
            color: "success"
          });
          await loadTasks(); // Reload tasks
        },
        {
          onError: (error) => {
            console.error('Error adding task:', error);
            addToast({
              title: "Error",
              description: "Failed to create task",
              color: "danger"
            });
          }
        }
      );
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }, [isAuthenticated, makeAuthenticatedRequest, loadTasks]);

  const updateTask = useCallback(async (id: number, updates: Partial<Task>) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await makeAuthenticatedRequest(
        async () => {
          await taskAPI.update(id, updates);
          addToast({
            title: "Success",
            description: "Task updated successfully",
            color: "success"
          });
          await loadTasks(); // Reload tasks
        },
        {
          onError: (error) => {
            console.error('Error updating task:', error);
            addToast({
              title: "Error",
              description: "Failed to update task",
              color: "danger"
            });
          }
        }
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, [isAuthenticated, makeAuthenticatedRequest, loadTasks]);

  const deleteTask = useCallback(async (id: number) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await makeAuthenticatedRequest(
        async () => {
          await taskAPI.delete(id);
          addToast({
            title: "Success",
            description: "Task deleted successfully",
            color: "success"
          });
          await loadTasks(); // Reload tasks
        },
        {
          onError: (error) => {
            console.error('Error deleting task:', error);
            addToast({
              title: "Error",
              description: "Failed to delete task",
              color: "danger"
            });
          }
        }
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, [isAuthenticated, makeAuthenticatedRequest, loadTasks]);

  const calculateTaskCounts = useCallback((): TaskCounts => {
    return {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    };
  }, [tasks]);

  // Load tasks when authentication state changes
  useEffect(() => {
    if (!authLoading) {
      loadTasks();
    }
  }, [authLoading, loadTasks]);

  return {
    tasks,
    taskCounts: calculateTaskCounts(),
    loading,
    error,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    isAuthenticated,
    isLoading: authLoading
  };
};
