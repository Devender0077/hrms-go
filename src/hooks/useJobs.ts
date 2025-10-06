import { useState, useEffect } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  employment_type: "full_time" | "part_time" | "contract" | "internship";
  experience_level: "entry" | "mid" | "senior" | "executive";
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits?: string;
  status: "draft" | "published" | "closed" | "cancelled";
  posted_date: string;
  closing_date?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useAuthenticatedAPI();

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/jobs');
      // Handle both array response and object with data property
      const data = Array.isArray(response) ? response : (response.data || []);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Partial<Job>) => {
    try {
      setError(null);
      const result = await apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
      await loadJobs(); // Reload jobs after creation
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      console.error('Error creating job:', err);
      throw err;
    }
  };

  const updateJob = async (id: number, jobData: Partial<Job>) => {
    try {
      setError(null);
      const result = await apiRequest(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });
      await loadJobs(); // Reload jobs after update
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
      console.error('Error updating job:', err);
      throw err;
    }
  };

  const deleteJob = async (id: number) => {
    try {
      setError(null);
      const result = await apiRequest(`/jobs/${id}`, {
        method: 'DELETE',
      });
      await loadJobs(); // Reload jobs after deletion
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      console.error('Error deleting job:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    loadJobs,
    createJob,
    updateJob,
    deleteJob,
  };
};