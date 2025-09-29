import { useState, useEffect } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface PerformanceReview {
  id: number;
  employee_id: number;
  employee_name?: string;
  reviewer_id: number;
  reviewer_name?: string;
  cycle_id: number;
  review_period_start: string;
  review_period_end: string;
  overall_rating: number;
  goals_rating: number;
  skills_rating: number;
  teamwork_rating: number;
  communication_rating: number;
  leadership_rating: number;
  comments: string;
  strengths: string;
  areas_for_improvement: string;
  development_plan: string;
  status: "draft" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export const usePerformanceReviews = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useAuthenticatedAPI();

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/performance/reviews');
      // Handle both array response and object with data property
      const data = Array.isArray(response) ? response : (response.data || []);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance reviews');
      console.error('Error loading performance reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: Partial<PerformanceReview>) => {
    try {
      setError(null);
      const result = await apiRequest('/performance/reviews', {
        method: 'POST',
        body: reviewData,
      });
      await loadReviews(); // Reload reviews after creation
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create performance review');
      console.error('Error creating performance review:', err);
      throw err;
    }
  };

  const updateReview = async (id: number, reviewData: Partial<PerformanceReview>) => {
    try {
      setError(null);
      const result = await apiRequest(`/performance/reviews/${id}`, {
        method: 'PUT',
        body: reviewData,
      });
      await loadReviews(); // Reload reviews after update
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update performance review');
      console.error('Error updating performance review:', err);
      throw err;
    }
  };

  const deleteReview = async (id: number) => {
    try {
      setError(null);
      const result = await apiRequest(`/performance/reviews/${id}`, {
        method: 'DELETE',
      });
      await loadReviews(); // Reload reviews after deletion
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete performance review');
      console.error('Error deleting performance review:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return {
    reviews,
    loading,
    error,
    loadReviews,
    createReview,
    updateReview,
    deleteReview,
  };
};
