import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { MsalProvider, useMsal } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "@/lib/msal/msalConfig";
import { useUserAccess } from '@/hooks/useUserAccess';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserAccessProvider } from '@/contexts/UserAccessContext';
import { signIn, signOut as signOutUtil } from '@/utils/auth';

const msalInstance = new PublicClientApplication(msalConfig);

const SupabaseAuthContext = createContext(null);

const SupabaseAuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { instance, accounts } = useMsal();
  
  const { data: userAccess, isLoading: isAccessLoading } = useUserAccess(user?.id);

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Combine user auth data with database profile data (userAccess)
  const enrichedUser = useMemo(() => {
    if (!user) return null;
    return {
        ...user,
        ...userAccess, // Merges role, level, permissions from DB
        // Fallback for role if not in DB yet
        role: userAccess?.role || user.role || 'user',
        // Ensure fullName exists for UI
        fullName: userAccess?.nome || user.user_metadata?.full_name || user.email
    };
  }, [user, userAccess]);

  const value = useMemo(() => ({
    session,
    user: enrichedUser,
    userContext: enrichedUser, // Alias for compatibility with existing components
    userAccess,
    loading: loading || isAccessLoading,
    signIn, 
    signOut: async () => {
      await signOutUtil();
      if (accounts.length > 0) {
        await instance.logoutPopup();
      }
    },
  }), [session, enrichedUser, userAccess, loading, isAccessLoading, accounts, instance]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><LoadingSpinner message="Carregando..." /></div>;
  }
  
  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const CombinedAuthProvider = ({ children }) => (
  <MsalProvider instance={msalInstance}>
    <UserAccessProvider>
      <SupabaseAuthProvider>
        {children}
      </SupabaseAuthProvider>
    </UserAccessProvider>
  </MsalProvider>
);

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a CombinedAuthProvider");
  }
  return context;
};