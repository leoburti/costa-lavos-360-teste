import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import { motion } from 'framer-motion';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const noFilterBarRoutes = [
    '/configuracoes',
    '/apoio',
    '/crm',
    '/ai-chat',
    '/bonificacoes',
    '/tarefas',
    '/manutencao',
    '/admin/delivery-management',
    '/settings'
  ];

  const showFilterBar = !noFilterBarRoutes.some(route => location.pathname.startsWith(route));
  const isConfigPage = location.pathname.startsWith('/configuracoes');

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        {showFilterBar && <FilterBar />}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${isConfigPage || !showFilterBar ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
          <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className={`mx-auto w-full h-full ${showFilterBar ? '' : 'p-4 sm:p-6 lg:p-8'}`}
          >
              <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;