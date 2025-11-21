
import React from 'react';
import { Navigate } from 'react-router-dom';

const ChamadosResolvidosPage = () => {
  return <Navigate to="/admin/apoio/chamados/todos?status=resolvido" replace />;
};

export default ChamadosResolvidosPage;
