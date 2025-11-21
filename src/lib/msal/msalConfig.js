/**
 * Configuration for MSAL (Microsoft Authentication Library).
 * Uses environment variables directly to avoid dependencies on Supabase client during initialization.
 */

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || 'dummy-client-id', // Fallback for development
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin, // Automatically uses the current origin
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read", "Calendars.ReadWrite", "Tasks.ReadWrite"]
};