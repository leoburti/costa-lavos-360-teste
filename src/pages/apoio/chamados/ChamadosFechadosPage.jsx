import React from 'react';
import { Navigate } from 'react-router-dom';

const ChamadosFechadosPage = () => {
  return <Navigate to="/admin/apoio/chamados/todos?status=fechado" replace />;
};

export default ChamadosFechadosPage;