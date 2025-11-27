import React from 'react';
import { Navigate } from 'react-router-dom';

const ChamadosAbertosPage = () => {
  return <Navigate to="/admin/apoio/chamados/todos?status=aberto" replace />;
};

export default ChamadosAbertosPage;