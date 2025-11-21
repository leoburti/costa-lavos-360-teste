
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { handleAuthError, logout, signIn as authSignInService } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';

export const SupabaseAuthContext = createContext();

export const SupabaseAuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Cache Key for LocalStorage
  const CACHE_KEY = 'costa_lavos_user_context';

  // Initialize userContext from LocalStorage to prevent white screen/flicker on refresh
  const [userContext, setUserContext] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Failed to parse user context from cache", error);
      return null;
    }
  });

  // Ref to avoid multiple simultaneous fetches
  const fetchingRef = useRef(false);

  const fetchUserContext = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUserContext(null);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Prevent duplicate fetches if one is already in progress for the same user
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      // Check if we have a valid cache to use immediately while revalidating
      // This allows "stale-while-revalidate" behavior
      
      const { data, error } = await supabase.rpc('get_user_role', { p_user_id: sessionUser.id });

      if (error) {
        throw new Error(`Error fetching user role: ${error.message}`);
      }

      let contextData;

      if (data && data.length > 0) {
        const profile = data[0];
        contextData = {
          fullName: sessionUser.user_metadata?.full_name || 'Usuário',
          role: profile.role || 'Sem Permissão',
          canAccessCrm: profile.can_access_crm || false,
          modulePermissions: profile.module_permissions || {},
          supervisorName: profile.supervisor_name,
          sellerName: profile.seller_name,
          approvalRoles: profile.approval_roles || {},
          lastUpdated: new Date().getTime()
        };
      } else {
        contextData = {
            fullName: sessionUser.user_metadata?.full_name || 'Usuário',
            role: 'Sem Permissão',
            canAccessCrm: false,
            modulePermissions: {},
            supervisorName: null,
            sellerName: null,
            approvalRoles: {},
            lastUpdated: new Date().getTime()
        };
      }

      // Update State and Cache
      setUserContext(contextData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(contextData));
      return contextData;

    } catch (error) {
      console.error("[AuthContext] Fatal error in fetchUserContext:", error.message);
      // If API fails but we have cache, keep using cache (graceful degradation)
      if (!userContext) {
          handleAuthError(error);
          setUserContext(null);
          localStorage.removeItem(CACHE_KEY);
      }
      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, [userContext]); // userContext dependency is safe here as we check logic inside

  const forceRoleRefetch = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchUserContext(user);
      setLoading(false);
    }
  }, [user, fetchUserContext]);

  // Initial Session Check
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            // If we don't have context or if we want to ensure freshness, fetch it
            // We fetch in background to not block UI if cache exists
            if (!userContext) {
                await fetchUserContext(initialSession.user);
            } else {
                fetchUserContext(initialSession.user); // Background revalidate
            }
          } else {
            setUserContext(null);
            localStorage.removeItem(CACHE_KEY);
          }
        }
      } catch (e) {
        console.error("Auth initialization error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          const sessionUser = newSession?.user ?? null;
          setUser(sessionUser);
          
          if (sessionUser) {
             // Re-fetch context on auth state change (e.g. token refresh or login)
             await fetchUserContext(sessionUser);
          } else {
            setUserContext(null);
            localStorage.removeItem(CACHE_KEY);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  
  const value = {
    session,
    user,
    userContext,
    userRole: userContext?.role,
    loading,
    signOut: async () => {
        localStorage.removeItem(CACHE_KEY);
        setUserContext(null);
        await logout();
    },
    signIn: async (email, password) => {
        const { error } = await authSignInService(email, password);
        if (error) {
            toast({
                title: 'Erro de Login',
                description: 'E-mail ou senha inválidos. Por favor, tente novamente.',
                variant: 'destructive'
            })
        }
        return { error };
    },
    forceRoleRefetch,
  };

  // Optimized Loading State: Only show full spinner if we have absolutely no data (no session OR (session exists but no context yet))
  // If we have a userContext from cache, we render children immediately to prevent white screen.
  if (loading && !session && !userContext) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><LoadingSpinner message="Inicializando..." /></div>;
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// Export alias for compatibility
export const useSupabaseAuth = useAuth;
