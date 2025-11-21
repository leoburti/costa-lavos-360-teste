import React from 'react';
import { Navigate } from 'react-router-dom';

// This component now redirects to the new Dashboard which acts as the main hub
export default function ApoioRelatoriosPage() {
  return <Navigate to="/apoio/relatorios/dashboard-apoio" replace />;
}