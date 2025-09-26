import { useState, useEffect } from 'react';
import { jobsAPI } from '../services/api-service';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface Job {
  id: number;
  title: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  location?: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  vacancies: number;
  closing_date?: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  department_id?: number;
  designation_id?: number;
  department_name?: string;
  designation_name?: string;
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
      const data = await jobsAPI.getAll();
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
      const result = await jobsAPI.create(jobData);
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
      const result = await jobsAPI.update(id, jobData);
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
      const result = await jobsAPI.delete(id);
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
