import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const UserAccessContext = createContext(null);

export const UserAccessProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [accessScope, setAccessScope] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const fetchAccessScope = useCallback(async () => {
    if (!session) {
      setAccessScope(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_access_scope');
      if (error) throw error;
      setAccessScope(data);
    } catch (error) {
      console.error("Error fetching user access scope:", error);
      setAccessScope(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchAccessScope();
  }, [fetchAccessScope]);

  const applyRlsFilter = useCallback((queryBuilder, options = {}) => {
    const { 
      supervisorCol = '"Nome Supervisor"', 
      sellerCol = '"Nome Vendedor"' 
    } = options;

    if (!accessScope) {
      return queryBuilder.limit(0);
    }
    
    const { tipo_vinculo, vinculo_comercial, scoped_sellers } = accessScope;

    if (tipo_vinculo === 'supervisor') {
      const allSellers = [vinculo_comercial, ...(scoped_sellers || [])];
      return queryBuilder.in(sellerCol, allSellers);
    } else if (tipo_vinculo === 'vendedor') {
      return queryBuilder.eq(sellerCol, vinculo_comercial);
    } else {
      const isAdmin = accessScope.role === 'Nivel 1' || accessScope.role === 'Admin' || accessScope.role === 'Nivel 5';
      if (isAdmin) {
        return queryBuilder;
      } else {
        return queryBuilder.limit(0);
      }
    }
  }, [accessScope]);

  const logAccess = useCallback(async (action, entity, entity_id, payload = {}) => {
    if (!session) return;
    try {
      await supabase.from('audit_logs').insert({
        user_id: session.user.id,
        action,
        entity,
        entity_id,
        payload
      });
    } catch(error) {
      console.error("Failed to write to audit log:", error);
    }
  }, [session]);

  const value = useMemo(() => ({
    accessScope,
    loading,
    applyRlsFilter,
    logAccess,
    refetch: fetchAccessScope
  }), [accessScope, loading, applyRlsFilter, logAccess, fetchAccessScope]);

  return (
    <UserAccessContext.Provider value={value}>
      {children}
    </UserAccessContext.Provider>
  );
};