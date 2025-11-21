// This file is obsolete and will no longer be used in the new navigation structure.
import React from 'react';
import { Navigate } from 'react-router-dom';

const ChamadosResolvidosPage = () => {
  return <Navigate to="/apoio/chamados/todos?status=resolvido" replace />;
};

export default ChamadosResolvidosPage;