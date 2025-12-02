import { useState, useEffect } from 'react';

/**
 * Hook para debouncing de valores.
 * Útil para inputs de busca para evitar requisições excessivas.
 * 
 * @param {any} value - O valor a ser observado.
 * @param {number} delay - O atraso em milissegundos (padrão: 500ms).
 * @returns {any} - O valor com debounce aplicado.
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}