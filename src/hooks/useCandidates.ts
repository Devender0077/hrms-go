import { useState, useEffect } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  experience_years?: number;
  current_salary?: number;
  expected_salary?: number;
  notice_period?: string;
  resume_path?: string;
  status: "applied" | "screening" | "interview" | "offered" | "hired" | "rejected";
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useAuthenticatedAPI();

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/candidates');
      // Handle both array response and object with data property
      const data = Array.isArray(response) ? response : (response.data || []);
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCandidate = async (candidateData: Partial<Candidate>) => {
    try {
      setError(null);
      const result = await apiRequest('/candidates', {
        method: 'POST',
        body: JSON.stringify(candidateData),
      });
      await loadCandidates(); // Reload candidates after creation
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create candidate');
      console.error('Error creating candidate:', err);
      throw err;
    }
  };

  const updateCandidate = async (id: number, candidateData: Partial<Candidate>) => {
    try {
      setError(null);
      const result = await apiRequest(`/candidates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(candidateData),
      });
      await loadCandidates(); // Reload candidates after update
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update candidate');
      console.error('Error updating candidate:', err);
      throw err;
    }
  };

  const deleteCandidate = async (id: number) => {
    try {
      setError(null);
      const result = await apiRequest(`/candidates/${id}`, {
        method: 'DELETE',
      });
      await loadCandidates(); // Reload candidates after deletion
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete candidate');
      console.error('Error deleting candidate:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  return {
    candidates,
    loading,
    error,
    loadCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
  };
};