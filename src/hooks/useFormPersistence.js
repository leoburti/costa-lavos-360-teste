import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Hook to automatically save/restore React Hook Form values
export const useFormPersistence = (formKey, methods) => {
  const [savedData, setSavedData] = useLocalStorage(`form_${formKey}`, {});
  const { watch, reset } = methods;
  const values = watch();

  // Restore data on mount
  useEffect(() => {
    if (savedData && Object.keys(savedData).length > 0) {
      reset(savedData);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save data on change
  useEffect(() => {
    // Debounce could be added here if needed for very large forms
    const timeout = setTimeout(() => {
        setSavedData(values);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [values, setSavedData]);

  // Function to clear saved data (e.g. on successful submit)
  const clearSavedData = () => {
    setSavedData({});
    // Optional: also clear from localStorage directly to be safe
    window.localStorage.removeItem(`form_${formKey}`);
  };

  return { clearSavedData };
};