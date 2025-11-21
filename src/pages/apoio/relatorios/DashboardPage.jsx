import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirects old commercial dashboard route to the new Support Dashboard
export default function DashboardPage() {
  return <Navigate to="/apoio/relatorios/dashboard-apoio" replace />;
}