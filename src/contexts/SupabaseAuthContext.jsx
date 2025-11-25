
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { handleAuthError, logout, signIn as authSignInService } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { queryClient } from '@/lib/queryClient'; // Import to clear cache on logout

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
      // Optional: check if cache is expired (e.g. > 24h)
      // const now = new Date().getTime();
      // if (now - parsed.lastUpdated > 1000 * 60 * 60 * 24) return null;
      return parsed;
    } catch (error) {
      console.error("Failed to parse user context from cache", error);
      return null;
    }
  });

  const fetchingRef = useRef(false);

  // Optimized fetchUserContext
  const fetchUserContext = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUserContext(null);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // If we already have context for this user and it's recent (< 5 min), skip fetch
    // This prevents redundant fetches on "minimizing/restoring" tabs
    if (userContext && userContext.id === sessionUser.id) {
        const now = new Date().getTime();
        const age = now - (userContext.lastUpdated || 0);
        if (age < 1000 * 60 * 5) {
            console.log('[AuthContext] Using cached context (fresh)');
            return userContext;
        }
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      // console.log(`[AuthContext] Fetching for user email: ${sessionUser.email}`);
      
      const { data, error } = await supabase.rpc('get_user_role', { p_user_id: sessionUser.id });

      if (error) {
        console.error('[AuthContext] RPC Error:', error);
        throw new Error(`Error fetching user role: ${error.message}`);
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
        // Default Fallback
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
      if (!userContext) {
          handleAuthError(error);
          setUserContext(null);
          localStorage.removeItem(CACHE_KEY);
      }
      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, [userContext]); 

  const forceRoleRefetch = useCallback(async () => {
    if (user) {
      setLoading(true);
      // Force fetch by clearing ref check conceptually
      fetchingRef.current = false;
      await fetchUserContext(user);
      setLoading(false);
    }
  }, [user, fetchUserContext]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            await fetchUserContext(initialSession.user);
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
      async (event, newSession) => {
        if (!mounted) return;

        // Ignore TOKEN_REFRESHED to prevent unnecessary state updates/refetches
        if (event === 'TOKEN_REFRESHED') {
            // console.log('Token refreshed silently');
            setSession(newSession); // Update session tokens only
            return;
        }

        setSession(newSession);
        const sessionUser = newSession?.user ?? null;
        setUser(sessionUser);
        
        if (sessionUser) {
             if (event === 'SIGNED_IN' || !userContext) {
                 await fetchUserContext(sessionUser);
             }
        } else if (event === 'SIGNED_OUT') {
            setUserContext(null);
            localStorage.removeItem(CACHE_KEY);
            queryClient.clear(); // Clear all React Query cache on logout
        }
        setLoading(false);
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
  };

  // Prevent white screen during initial loading if we have no session OR no context
  // But if we have persisted context, show app immediately while checking session in bg
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
