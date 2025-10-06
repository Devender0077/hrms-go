import { useState, useEffect } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface Interview {
  id: number;
  job_application_id: number;
  candidate_name?: string;
  position?: string;
  interviewer_id: number;
  interviewer_name?: string;
  interview_type: "phone" | "video" | "in_person" | "technical" | "panel";
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
  feedback?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useAuthenticatedAPI();

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/interviews');
      // Handle both array response and object with data property
      const data = Array.isArray(response) ? response : (response.data || []);
      setInterviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interviews');
      console.error('Error loading interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInterview = async (interviewData: Partial<Interview>) => {
    try {
      setError(null);
      const result = await apiRequest('/interviews', {
        method: 'POST',
        body: JSON.stringify(interviewData),
      });
      await loadInterviews(); // Reload interviews after creation
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interview');
      console.error('Error creating interview:', err);
      throw err;
    }
  };

  const updateInterview = async (id: number, interviewData: Partial<Interview>) => {
    try {
      setError(null);
      const result = await apiRequest(`/interviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(interviewData),
      });
      await loadInterviews(); // Reload interviews after update
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update interview');
      console.error('Error updating interview:', err);
      throw err;
    }
  };

  const deleteInterview = async (id: number) => {
    try {
      setError(null);
      const result = await apiRequest(`/interviews/${id}`, {
        method: 'DELETE',
      });
      await loadInterviews(); // Reload interviews after deletion
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interview');
      console.error('Error deleting interview:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  return {
    interviews,
    loading,
    error,
    loadInterviews,
    createInterview,
    updateInterview,
    deleteInterview,
  };
};
