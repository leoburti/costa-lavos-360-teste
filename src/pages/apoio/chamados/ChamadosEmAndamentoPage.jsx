
import React from 'react';
import { Navigate } from 'react-router-dom';

const ChamadosEmAndamentoPage = () => {
  return <Navigate to="/admin/apoio/chamados/todos?status=em_andamento" replace />;
};

export default ChamadosEmAndamentoPage;
