import { useState, useEffect } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface Expense {
  id: number;
  employee_id: number;
  employee_name?: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  status: "pending" | "approved" | "rejected";
  receipt_path?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useAuthenticatedAPI();

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/expenses');
      // Handle both array response and object with data property
      const data = Array.isArray(response) ? response : (response.data || []);
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData: Partial<Expense>) => {
    try {
      setError(null);
      const result = await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
      await loadExpenses(); // Reload expenses after creation
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      console.error('Error creating expense:', err);
      throw err;
    }
  };

  const updateExpense = async (id: number, expenseData: Partial<Expense>) => {
    try {
      setError(null);
      const result = await apiRequest(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
      await loadExpenses(); // Reload expenses after update
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      console.error('Error updating expense:', err);
      throw err;
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      setError(null);
      const result = await apiRequest(`/expenses/${id}`, {
        method: 'DELETE',
      });
      await loadExpenses(); // Reload expenses after deletion
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      console.error('Error deleting expense:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return {
    expenses,
    loading,
    error,
    loadExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
