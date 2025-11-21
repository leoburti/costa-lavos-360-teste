import React, { createContext, useState, useContext, useCallback } from 'react';

const PageActionContext = createContext(null);

export const usePageActions = () => {
  const context = useContext(PageActionContext);
  if (!context) {
    throw new Error('usePageActions must be used within a PageActionProvider');
  }
  return context;
};

export const PageActionProvider = ({ children }) => {
  const [actions, setActions] = useState(null);

  const setPageActions = useCallback((actionNode) => {
    setActions(actionNode);
  }, []);

  const clearPageActions = useCallback(() => {
    setActions(null);
  }, []);

  const value = {
    actions,
    setPageActions,
    clearPageActions,
  };

  return (
    <PageActionContext.Provider value={value}>
      {children}
    </PageActionContext.Provider>
  );
};