// This file is obsolete and will no longer be used in the new navigation structure.
import React from 'react';
import { Navigate } from 'react-router-dom';

const ChamadosEmAndamentoPage = () => {
  return <Navigate to="/apoio/chamados/todos?status=em_andamento" replace />;
};

export default ChamadosEmAndamentoPage;