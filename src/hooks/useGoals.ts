import { useState, useEffect } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface Goal {
  id: number;
  employee_id: number;
  employee_name?: string;
  title: string;
  description?: string;
  category: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date: string;
  end_date: string;
  status: "not_started" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useAuthenticatedAPI();

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/goals');
      // Handle both array response and object with data property
      const data = Array.isArray(response) ? response : (response.data || []);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Partial<Goal>) => {
    try {
      setError(null);
      const result = await apiRequest('/goals', {
        method: 'POST',
        body: goalData,
      });
      await loadGoals(); // Reload goals after creation
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      console.error('Error creating goal:', err);
      throw err;
    }
  };

  const updateGoal = async (id: number, goalData: Partial<Goal>) => {
    try {
      setError(null);
      const result = await apiRequest(`/goals/${id}`, {
        method: 'PUT',
        body: goalData,
      });
      await loadGoals(); // Reload goals after update
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      console.error('Error updating goal:', err);
      throw err;
    }
  };

  const deleteGoal = async (id: number) => {
    try {
      setError(null);
      const result = await apiRequest(`/goals/${id}`, {
        method: 'DELETE',
      });
      await loadGoals(); // Reload goals after deletion
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      console.error('Error deleting goal:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  };
};
