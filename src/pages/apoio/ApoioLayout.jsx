import React from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ApoioLayout = () => {
  // Horizontal navigation removed to avoid duplication with Sidebar
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <Helmet>
        <title>Módulo de Apoio</title>
        <meta name="description" content="Módulo central para gestão de comodato, chamados, agenda e mais." />
      </Helmet>
      
      {/* Duplicate navigation bar removed */}

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ApoioLayout;