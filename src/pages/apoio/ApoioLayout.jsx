import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';

const ApoioLayout = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Comodato', path: '/admin/apoio/comodato' },
    { label: 'Chamados', path: '/admin/apoio/chamados' },
    { label: 'Agenda', path: '/admin/apoio/agenda' },
    { label: 'Manutenção', path: '/admin/apoio/manutencao-equipamentos' },
    { label: 'Geolocalização', path: '/admin/apoio/geolocalizacao' },
    { label: 'Relatórios', path: '/admin/apoio/relatorios' },
    { label: 'Personas', path: '/admin/apoio/personas' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <Helmet>
        <title>Módulo de Apoio</title>
        <meta name="description" content="Módulo central para gestão de comodato, chamados, agenda e mais." />
      </Helmet>
      
      <div className="bg-white border-b px-6 py-3 sticky top-0 z-10">
        <nav className="flex space-x-1 overflow-x-auto pb-1 md:pb-0">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-100" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ApoioLayout;