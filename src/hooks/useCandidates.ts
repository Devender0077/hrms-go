import { useState, useEffect } from 'react';
import { candidatesAPI } from '../services/api-service';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface Candidate {
  id: number;
  job_posting_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  resume: string;
  cover_letter?: string;
  status: 'new' | 'screening' | 'interview' | 'testing' | 'offer' | 'hired' | 'rejected';
  source?: string;
  job_title?: string;
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
      const data = await candidatesAPI.getAll();
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
      const result = await candidatesAPI.create(candidateData);
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
      const result = await candidatesAPI.update(id, candidateData);
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
      const result = await candidatesAPI.delete(id);
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
