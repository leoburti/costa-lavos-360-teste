// This file is obsolete and will no longer be used in the new navigation structure.
// I am keeping it to avoid errors, but it can be removed in a future cleanup.
import React from 'react';
import { Navigate } from 'react-router-dom';

const ChamadosPage = () => {
  // Redirects to the new main page for "Chamados"
  return <Navigate to="/apoio/chamados/todos" replace />;
};

export default ChamadosPage;