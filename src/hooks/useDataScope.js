import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

export const useDataScope = () => {
  const { user, userContext } = useAuth();
  const [scope, setScope] = useState({
    loading: true,
    role: 'guest', // 'admin', 'supervisor', 'seller', 'guest'
    userId: null, // Internal apoio_usuarios ID
    teamId: null,
    isSupervisor: false,
    filters: {} // Ready-to-use filters for Supabase queries
  });

  useEffect(() => {
    const fetchScope = async () => {
      if (!user) {
        setScope(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Fetch scope details from RPC
        const { data, error } = await supabase.rpc('get_current_user_scope');
        
        if (error) throw error;

        const { user_id, role, equipe_id, is_supervisor } = data;
        
        let computedRole = 'seller'; // Default
        if (role === 'Nivel 1' || role === 'Admin') computedRole = 'admin';
        else if (is_supervisor || role === 'Supervisor') computedRole = 'supervisor';

        let filters = {};
        if (computedRole === 'seller') {
          filters = { vendedor_id: user_id }; // Example filter key
        } else if (computedRole === 'supervisor') {
          filters = { supervisor_id: user_id }; // Example filter key
        }

        setScope({
          loading: false,
          role: computedRole,
          userId: user_id,
          teamId: equipe_id,
          isSupervisor: is_supervisor,
          filters
        });

      } catch (err) {
        console.error("Error fetching data scope:", err);
        // Fallback to context if RPC fails
        setScope({
            loading: false,
            role: userContext?.role === 'Nivel 1' ? 'admin' : 'seller',
            userId: null,
            teamId: null,
            isSupervisor: false,
            filters: {}
        });
      }
    };

    fetchScope();
  }, [user, userContext]);

  return scope;
};