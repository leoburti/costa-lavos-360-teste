
import React from 'react';
import Dashboard from '@/pages/Dashboard';
import { Helmet } from 'react-helmet-async';

const DashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard Comercial | Costa Lavos 360°</title>
        <meta name="description" content="Visão geral do desempenho comercial" />
      </Helmet>
      <div className="w-full h-full">
        <Dashboard />
      </div>
    </>
  );
};

export default DashboardPage;
