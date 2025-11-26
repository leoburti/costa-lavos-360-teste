
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useDebounce } from './useDebounce';

export const useClientSearch = (searchTerm) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const searchClients = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setClients([]);
        return;
      }

      setIsLoading(true);
      try {
        // Use the safe RPC function which handles searching correctly
        const { data, error } = await supabase.rpc('search_clients_safe', {
          p_search_term: debouncedSearchTerm
        });

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Error searching clients:', error);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchClients();
  }, [debouncedSearchTerm]);

  return { clients, isLoading };
};
