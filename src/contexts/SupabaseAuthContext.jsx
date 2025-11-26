
import React, { createContext, useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { handleAuthError, logout, signIn as authSignInService } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { queryClient } from '@/lib/queryClient';

export const SupabaseAuthContext = createContext();

export const SupabaseAuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const CACHE_KEY = 'costa_lavos_user_context';

  // Initialize userContext from LocalStorage to prevent flickering/loss on refresh
  const [userContext, setUserContext] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      return parsed;
    } catch (error) {
      console.error("Failed to parse user context from cache", error);
      return null;
    }
  });

  // Use a ref to track userContext to avoid dependency loops in useCallback
  const userContextRef = useRef(userContext);
  useEffect(() => {
    userContextRef.current = userContext;
  }, [userContext]);

  const fetchingRef = useRef(false);

  // Optimized fetchUserContext - Stable reference (no dependencies)
  const fetchUserContext = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUserContext(null);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check cache using ref to avoid dependency loop
    const currentContext = userContextRef.current;
    if (currentContext && currentContext.id === sessionUser.id) {
        const now = new Date().getTime();
        const age = now - (currentContext.lastUpdated || 0);
        // 5 minutes cache
        if (age < 1000 * 60 * 5) {
            return currentContext;
        }
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const { data, error } = await supabase.rpc('get_user_role', { p_user_id: sessionUser.id });

      if (error) {
        console.error('[AuthContext] RPC Error:', error);
        // If RPC fails but we have a session, don't crash everything, just give basic role
        console.warn('Falling back to default permissions due to RPC error');
      }

      // --- Fetch Apoio Internal Profile ---
      let apoioId = null;
      let apoioProfile = null;
      try {
          const { data: apoioData } = await supabase
              .from('apoio_usuarios')
              .select('id, nome, email, equipe_id, supervisor_id')
              .eq('auth_id', sessionUser.id)
              .maybeSingle();
          
          if (apoioData) {
              apoioProfile = apoioData;
              apoioId = apoioData.id;
          }
      } catch (apoioError) {
          console.error("[AuthContext] Error fetching apoio profile:", apoioError);
      }

      let contextData;

      if (data && data.length > 0) {
        const profile = data[0];
        const rawRole = profile.role || 'Sem Permissão';
        const roleLower = rawRole.toLowerCase();
        const isAdmin = ['admin', 'nivel 1', 'nível 1', 'nivel 5', 'nível 5', 'super admin'].includes(roleLower);
        const isSupervisor = ['supervisor', 'nivel 3', 'nível 3', 'gerente'].includes(roleLower);
        const isSeller = ['vendedor', 'seller', 'nivel 2', 'nível 2'].includes(roleLower);

        let teamMembers = [];
        if (isSupervisor && apoioId) {
            try {
                const { data: teamData } = await supabase
                    .from('apoio_usuarios')
                    .select('auth_id')
                    .eq('supervisor_id', apoioId);
                
                if (teamData) {
                    teamMembers = teamData.map(t => t.auth_id).filter(Boolean);
                }
            } catch (scopeError) {
                console.error("[AuthContext] Error fetching team scope:", scopeError);
            }
        }

        contextData = {
          id: sessionUser.id,
          email: sessionUser.email,
          fullName: sessionUser.user_metadata?.full_name || 'Usuário',
          role: rawRole,
          canAccessCrm: profile.can_access_crm || false,
          modulePermissions: profile.module_permissions || {},
          supervisorName: profile.supervisor_name,
          sellerName: profile.seller_name,
          approvalRoles: profile.approval_roles || {},
          vendorId: profile.vendor_id,
          supervisorId: profile.supervisor_id,
          teamMembers: teamMembers,
          apoioId,
          apoioProfile,
          isSeller,
          isSupervisor,
          isAdmin, 
          lastUpdated: new Date().getTime()
        };
      } else {
        // Default Fallback for when get_user_role returns empty or fails
        contextData = {
            id: sessionUser.id,
            email: sessionUser.email,
            fullName: sessionUser.user_metadata?.full_name || 'Usuário',
            role: 'Sem Permissão',
            canAccessCrm: false,
            modulePermissions: {},
            supervisorName: null,
            sellerName: null,
            vendorId: null,
            supervisorId: null,
            teamMembers: [],
            apoioId,
            apoioProfile,
            isSeller: false,
            isSupervisor: false,
            isAdmin: false,
            approvalRoles: {},
            lastUpdated: new Date().getTime()
        };
      }

      setUserContext(contextData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(contextData));
      return contextData;

    } catch (error) {
      console.error("[AuthContext] Fatal error in fetchUserContext:", error.message);
      // Only clear if we have absolutely nothing
      if (!userContextRef.current) {
          // Don't logout immediately on fetch error to prevent loops, 
          // just set context to null which might trigger re-login or error page naturally
          setUserContext(null);
          localStorage.removeItem(CACHE_KEY);
      }
      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, []); 

  const forceRoleRefetch = useCallback(async () => {
    if (user) {
      setLoading(true);
      fetchingRef.current = false;
      await fetchUserContext(user);
      setLoading(false);
    }
  }, [user, fetchUserContext]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
            handleAuthError(error);
            if (mounted) setLoading(false);
            return;
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            // Wait for context fetch before finishing loading to prevent guard redirects
            await fetchUserContext(initialSession.user);
          } else {
            setUserContext(null);
            localStorage.removeItem(CACHE_KEY);
          }
        }
      } catch (e) {
        console.error("Auth initialization error", e);
        handleAuthError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === 'TOKEN_REFRESHED') {
            setSession(newSession);
            return;
        }

        setSession(newSession);
        const sessionUser = newSession?.user ?? null;
        setUser(sessionUser);
        
        if (sessionUser) {
             // For SIGNED_IN, we should wait. For others, maybe not blocking.
             if (event === 'SIGNED_IN' || !userContextRef.current) {
                 // Keep loading true if we are fetching context for the first time in this flow
                 if (!userContextRef.current) setLoading(true);
                 
                 await fetchUserContext(sessionUser);
                 
                 if (!userContextRef.current) setLoading(false);
             }
        } else if (event === 'SIGNED_OUT') {
            setUserContext(null);
            localStorage.removeItem(CACHE_KEY);
            queryClient.clear();
            setLoading(false);
        } else {
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
  
  // Memoize value to prevent context consumers from re-rendering when nothing changes
  const value = useMemo(() => ({
    session,
    user,
    userContext,
    userRole: userContext?.role,
    loading,
    signOut: async () => {
        localStorage.removeItem(CACHE_KEY);
        setUserContext(null);
        queryClient.clear();
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
  }), [session, user, userContext, loading, forceRoleRefetch, toast]);

  // Only show full screen loader if specifically loading AND no cache exists
  if (loading && !session && !userContext) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><LoadingSpinner message="Inicializando sistema..." /></div>;
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

export const useSupabaseAuth = useAuth;
