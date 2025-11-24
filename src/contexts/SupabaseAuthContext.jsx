
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
      console.group('[AuthContext] Loading Permissions & Scope');
      console.log(`[AuthContext] Fetching for user email: ${sessionUser.email} (ID: ${sessionUser.id})`);
      
      const rpcStart = performance.now();
      // Call the updated RPC that returns merged permissions (Persona + User overrides)
      const { data, error } = await supabase.rpc('get_user_role', { p_user_id: sessionUser.id });
      const rpcEnd = performance.now();
      
      console.log(`[AuthContext] RPC 'get_user_role' executed in ${(rpcEnd - rpcStart).toFixed(2)}ms`);

      if (error) {
        console.error('[AuthContext] RPC Error:', error);
        throw new Error(`Error fetching user role: ${error.message}`);
      }

      // --- Fetch Apoio Internal Profile (CRITICAL FOR FOREIGN KEYS) ---
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
              console.log(`[AuthContext] Apoio Profile found: ${apoioId}`);
          } else {
              console.warn(`[AuthContext] No Apoio Profile found for Auth ID: ${sessionUser.id}`);
          }
      } catch (apoioError) {
          console.error("[AuthContext] Error fetching apoio profile:", apoioError);
      }

      let contextData;

      if (data && data.length > 0) {
        const profile = data[0];
        
        // Normalize role for comparison
        const rawRole = profile.role || 'Sem Permissão';
        const roleLower = rawRole.toLowerCase();
        
        // Strict Admin Logic: Includes variations of Admin and Level 1/5
        const isAdmin = ['admin', 'nivel 1', 'nível 1', 'nivel 5', 'nível 5', 'super admin'].includes(roleLower);
        
        // Supervisor Logic: 'Supervisor', 'Nivel 2', 'Nivel 3', 'Gerente'
        const isSupervisor = ['supervisor', 'nivel 3', 'nível 3', 'gerente'].includes(roleLower);
        
        // Seller Logic
        const isSeller = ['vendedor', 'seller', 'nivel 2', 'nível 2'].includes(roleLower);

        console.log(`[AuthContext] Profile Loaded. Role: ${rawRole} (Admin: ${isAdmin}, Supervisor: ${isSupervisor}, Seller: ${isSeller})`);
        console.log(`[AuthContext] Active Permissions:`, Object.keys(profile.module_permissions || {}).filter(k => profile.module_permissions[k]));
        
        // --- Team Scope Fetching for Supervisors ---
        let teamMembers = [];
        if (isSupervisor && apoioId) {
            try {
                // Get all users who have this user as their supervisor
                const { data: teamData } = await supabase
                    .from('apoio_usuarios')
                    .select('auth_id')
                    .eq('supervisor_id', apoioId);
                
                if (teamData) {
                    // Map to array of auth_ids, filtering out any nulls
                    teamMembers = teamData.map(t => t.auth_id).filter(Boolean);
                    console.log(`[AuthContext] Team members loaded: ${teamMembers.length}`);
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
          // Vital: Use the merged permissions from the RPC
          modulePermissions: profile.module_permissions || {},
          supervisorName: profile.supervisor_name,
          sellerName: profile.seller_name,
          approvalRoles: profile.approval_roles || {},
          // Scoping IDs
          vendorId: profile.vendor_id,
          supervisorId: profile.supervisor_id,
          teamMembers: teamMembers, // List of auth_ids for the team
          // Internal IDs
          apoioId, // <--- EXPOSED ID FOR FOREIGN KEYS
          apoioProfile,
          // Helper flags
          isSeller,
          isSupervisor,
          isAdmin, 
          lastUpdated: new Date().getTime()
        };
      } else {
        console.warn(`[AuthContext] No profile found for user ${sessionUser.id}, using defaults.`);
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
            apoioId, // Still try to provide this if found
            apoioProfile,
            isSeller: false,
            isSupervisor: false,
            isAdmin: false,
            approvalRoles: {},
            lastUpdated: new Date().getTime()
        };
      }

      console.log('[AuthContext] Final User Context:', contextData);
      console.groupEnd();

      // Update State and Cache
      setUserContext(contextData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(contextData));
      return contextData;

    } catch (error) {
      console.error("[AuthContext] Fatal error in fetchUserContext:", error.message);
      console.groupEnd();
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
            // Always fetch fresh context on app init to ensure roles are up to date
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
      async (_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          const sessionUser = newSession?.user ?? null;
          setUser(sessionUser);
          
          if (sessionUser) {
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
