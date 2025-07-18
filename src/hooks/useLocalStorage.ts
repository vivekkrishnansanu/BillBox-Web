import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        console.log(`📦 useLocalStorage: No data found for "${key}", using initial value`);
        return initialValue;
      }
      const parsed = JSON.parse(item);
      console.log(`📦 useLocalStorage: Loaded "${key}" from localStorage`);
      return parsed;
    } catch (error) {
      console.error(`❌ useLocalStorage: Error loading "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      console.log(`📦 useLocalStorage: Setting "${key}" to:`, valueToStore);
      setStoredValue(valueToStore);
      
      // Check if we're setting to initial/empty value
      const isEmptyArray = Array.isArray(valueToStore) && valueToStore.length === 0;
      const isEmptyObject = typeof valueToStore === 'object' && valueToStore !== null && Object.keys(valueToStore).length === 0;
      const isInitialValue = JSON.stringify(valueToStore) === JSON.stringify(initialValue);
      
      if (isEmptyArray || isEmptyObject || isInitialValue) {
        // Remove from localStorage if it's empty/initial value
        console.log(`📦 useLocalStorage: Removing "${key}" from localStorage (empty/initial value)`);
        window.localStorage.removeItem(key);
      } else {
        // Save to localStorage
        console.log(`📦 useLocalStorage: Saving "${key}" to localStorage`);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`❌ useLocalStorage: Error setting "${key}":`, error);
    }
  };

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        if (e.newValue !== null) {
          try {
            const parsed = JSON.parse(e.newValue);
            console.log(`📦 useLocalStorage: Storage event - updating "${key}"`);
            setStoredValue(parsed);
          } catch (error) {
            console.error(`❌ useLocalStorage: Error parsing storage event for "${key}":`, error);
          }
        } else {
          // Key was removed, reset to initial value
          console.log(`📦 useLocalStorage: Storage event - "${key}" was removed, resetting to initial`);
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
}