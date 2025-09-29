import { useState, useEffect } from 'react';
import { assetsAPI } from '../services/api-service';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface Asset {
  id: number;
  name: string;
  category?: string;
  description?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  assigned_to?: number;
  location?: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  first_name?: string;
  last_name?: string;
  employee_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useAuthenticatedAPI();

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await assetsAPI.getAll();
      // Handle both array response and object with data property
      const data = Array.isArray(response) ? response : (response.data || []);
      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async (assetData: Partial<Asset>) => {
    try {
      setError(null);
      const result = await assetsAPI.create(assetData);
      await loadAssets(); // Reload assets after creation
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset');
      console.error('Error creating asset:', err);
      throw err;
    }
  };

  const updateAsset = async (id: number, assetData: Partial<Asset>) => {
    try {
      setError(null);
      const result = await assetsAPI.update(id, assetData);
      await loadAssets(); // Reload assets after update
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset');
      console.error('Error updating asset:', err);
      throw err;
    }
  };

  const deleteAsset = async (id: number) => {
    try {
      setError(null);
      const result = await assetsAPI.delete(id);
      await loadAssets(); // Reload assets after deletion
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
      console.error('Error deleting asset:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  return {
    assets,
    loading,
    error,
    loadAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  };
};
