import { useState, useEffect, useCallback, useRef } from 'react';

// Robust LocalStorage Hook with event listener for tab sync
export const useLocalStorage = (key, initialValue) => {
  // Use a ref to store the initial value to avoid re-running effects if a new object is passed
  const initialValueRef = useRef(initialValue);

  // Helper to read from storage
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValueRef.current;
    }
  }, [key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState(readValue);
  
  // Keep a ref of the current value to use in setValue without adding it to dependencies
  const storedValueRef = useRef(storedValue);
  
  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
    }

    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Dispatch a custom event so other hooks can update
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key]); // setValue is now stable because it only depends on key

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== e.oldValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    // Listen for custom event for same-tab updates
    const handleCustomEvent = () => {
      try {
        // Read directly from storage to check if we really need to update
        // This prevents loops where this hook triggered the event itself
        const rawValue = window.localStorage.getItem(key);
        if (rawValue) {
            const newValue = JSON.parse(rawValue);
            // Only update if structurally different to avoid render loops
            if (JSON.stringify(newValue) !== JSON.stringify(storedValueRef.current)) {
                setStoredValue(newValue);
            }
        }
      } catch (e) {
        // Fallback
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomEvent);
    };
  }, [key]);

  return [storedValue, setValue];
};