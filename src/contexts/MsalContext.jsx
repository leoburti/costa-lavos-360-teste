import React, { createContext, useContext } from 'react';

export const MsalContext = createContext(null);

export const MsalProvider = ({ msalInstance, children }) => {
  return (
    <MsalContext.Provider value={msalInstance}>
      {children}
    </MsalContext.Provider>
  );
};

export const useMsal = () => {
  const context = useContext(MsalContext);
  if (!context) {
    throw new Error('useMsal must be used within a MsalProvider');
  }
  return context;
};