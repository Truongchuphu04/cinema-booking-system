import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Custom hook for API calls with loading and error handling
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
      toast.error(err.message || 'An error occurred');
      throw err;
    }
  }, []);

  return { loading, error, callApi, setError };
};

// Custom hook for fetching data with automatic loading states
export const useFetch = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      toast.error(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook for mutations (create, update, delete)
export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (apiFunction, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      successMessage = 'Operation completed successfully',
      errorMessage = 'Operation failed'
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || errorMessage;
      setError(errorMsg);
      setLoading(false);
      
      if (onError) {
        onError(err);
      }
      
      toast.error(errorMsg);
      throw err;
    }
  }, []);

  return { loading, error, mutate, setError };
};

// Custom hook for real-time data with WebSocket or polling
export const useRealTimeData = (apiFunction, interval = 30000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await apiFunction();
      setData(result);
      setError(null);
      
      if (loading) {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      
      if (loading) {
        setLoading(false);
        toast.error(err.message || 'Failed to fetch data');
      }
    }
  }, dependencies);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for optimistic updates
export const useOptimisticUpdate = (initialData) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const optimisticUpdate = useCallback(async (updateFunction, revertFunction, apiFunction) => {
    const previousData = data;
    setLoading(true);
    setError(null);

    // Apply optimistic update
    setData(updateFunction(data));

    try {
      // Call API
      const result = await apiFunction();
      
      // If API returns updated data, use it
      if (result) {
        setData(result);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      // Revert optimistic update on error
      setData(revertFunction ? revertFunction(previousData) : previousData);
      setError(err.message || 'Update failed');
      setLoading(false);
      toast.error(err.message || 'Update failed');
      throw err;
    }
  }, [data]);

  return { data, loading, error, optimisticUpdate, setData };
};