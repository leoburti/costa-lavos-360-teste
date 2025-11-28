import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { handleAuthError } from '@/services/authService';

const SupabaseAuthContext = createContext();

export function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Permissions state
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [canAccessCRM, setCanAccessCRM] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Helper for delayed retry
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fetch additional user details (Role, Permissions) with Retry Logic
  const fetchUserDetails = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUserRole(null);
      setUserPermissions({});
      setCanAccessCRM(false);
      return;
    }

    // Attempt to fetch for max 30 seconds or 3 tries
    let attempt = 0;
    const maxRetries = 3;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        // Use AbortController for database timeout
        const controller = new AbortController();
        // Aumentado o tempo para 10 segundos
        const timeoutId = setTimeout(() => controller.abort('Timeout'), 10000); 

        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role', { p_user_id: currentUser.id })
          .abortSignal(controller.signal)
          .single();

        clearTimeout(timeoutId);

        if (roleError) {
          if (roleError.name === 'AbortError' && attempt < maxRetries - 1) {
            console.warn(`Attempt ${attempt + 1} timed out. Retrying...`);
            attempt++;
            await wait(1500); // Wait longer before retry
            continue;
          }
          throw roleError;
        }

        if (roleData) {
          setUserRole(roleData.role);
          setUserPermissions(roleData.module_permissions || {});
          setCanAccessCRM(roleData.can_access_crm || false);
          success = true;
        } else {
            // This case handles when the RPC returns null/empty, which means no role is found.
            // It's not a connection error, but a data configuration issue.
            console.warn(`User ${currentUser.id} has no role defined in the database. Assigning default 'Sem Permissão'.`);
            setUserRole('Sem Permissão');
            setUserPermissions({});
            setCanAccessCRM(false);
            success = true; // Mark as success to stop retries.
        }

      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed fetching user details:`, error.message);
        attempt++;
        if (attempt < maxRetries) {
            await wait(1500);
        } else {
            setAuthError(error.message);
        }
      }
    }

    if (!success) {
      console.warn('All attempts to fetch user details failed. Using fallback permissions.');
      setUserRole('Sem Permissão');
      setUserPermissions({});
      setCanAccessCRM(false);
    }
  }, []);


  useEffect(() => {
    let mounted = true;

    // 1. Check active session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
            handleAuthError(error);
            throw error;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            await fetchUserDetails(currentSession.user);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          if (event === 'SIGNED_IN') {
             setLoading(true);
             await fetchUserDetails(newSession.user);
             setLoading(false);
          } else if (event === 'TOKEN_REFRESHED') {
             // On token refresh, just update details without a loading spinner
             fetchUserDetails(newSession.user);
          }
        } else {
          setUserRole(null);
          setUserPermissions({});
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserDetails]);

  // Global timeout safety: Ensure loading never sticks for more than 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          console.warn("Forcefully disabling loading state due to global timeout.");
          return false;
        }
        return currentLoading;
      });
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  // Auth Actions
  const signIn = useCallback(async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    setUserRole(null);
    setUserPermissions({});
    setUser(null);
    setSession(null);
    localStorage.clear(); // Clear local state on explicit logout
    return supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    return supabase.auth.updateUser({ password: newPassword });
  }, []);

  // Diagnostic Helper
  const checkHealth = useCallback(async () => {
    const results = {
      auth: !!user,
      database: false,
      role: userRole,
      latency: 0
    };
    
    const start = performance.now();
    try {
      const { count, error } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
      if (!error) results.database = true;
    } catch (e) {
      console.error("Health check failed", e);
    }
    results.latency = Math.round(performance.now() - start);
    
    return results;
  }, [user, userRole]);

  // Helper to check permissions
  const hasPermission = useCallback((module, action) => {
    if (!userRole) return false; 
    const r = userRole.toLowerCase();
    if (r === 'nivel 1' || r === 'admin' || r === 'nível 1' || r === 'nivel 5' || r === 'nível 5') return true; 
    
    if (!userPermissions) return false;
    if (!userPermissions[module]) return false;
    if (Array.isArray(userPermissions[module])) {
        return userPermissions[module].includes('*') || userPermissions[module].includes(action);
    }
    return false;
  }, [userRole, userPermissions]);

  // Construct the userContext object expected by consumers (Sidebar, etc)
  const userContext = useMemo(() => {
    if (!user) return null;
    return {
        role: userRole,
        permissions: userPermissions,
        modulePermissions: userPermissions,
        canAccessCrm: canAccessCRM,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
        email: user.email,
        id: user.id
    };
  }, [user, userRole, userPermissions, canAccessCRM]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    authError,
    userRole,
    userPermissions,
    hasPermission,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    checkHealth,
    userContext 
  }), [
    user, 
    session, 
    loading, 
    authError,
    userRole, 
    userPermissions, 
    hasPermission, 
    signIn, 
    signOut, 
    resetPassword, 
    updatePassword,
    checkHealth,
    userContext
  ]);

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// Export alias for backward compatibility
export const useSupabaseAuth = useAuth;