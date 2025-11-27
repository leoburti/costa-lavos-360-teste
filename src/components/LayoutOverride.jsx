import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarOverride from '@/components/SidebarOverride';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

const LayoutOverride = ({ children }) => {
  // State for sidebar collapse (desktop)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      console.error("Error reading sidebar state", e);
      return false;
    }
  });

  // State for mobile sidebar
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    } catch (e) {
      console.error("Error saving sidebar state", e);
    }
  }, [isCollapsed]);

  // Define routes where FilterBar should NOT appear (avoid duplication with Header filters)
  const noFilterBarRoutes = [
    '/configuracoes',
    '/apoio',
    '/admin/apoio',
    '/crm',
    '/ai-chat',
    '/bonificacoes',
    '/tarefas',
    '/manutencao',
    '/admin/delivery-management',
    '/settings',
    '/login',
    '/auth',
    // Commercial Dashboard & Analytics (Header already handles filters for these)
    '/dashboard',
    '/analitico',
    '/analise',
    '/visao-360',
    '/curva-abc',
    '/calculo-rfm',
    '/tendencia-vendas',
    '/baixo-desempenho',
    '/produtos-bonificados',
    '/performance-bonificados',
    '/movimentacao-equipamentos',
    '/equipamentos-em-campo',
    '/raio-x'
  ];
  
  const showFilterBar = !noFilterBarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <SidebarOverride 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
          {/* Header - Handles Navigation, User Profile AND Global Filters for Dashboard */}
          <Header setSidebarOpen={setMobileOpen} />
          
          {/* Filter Bar - Only shown for pages that need extra/legacy filtering not in Header */}
          {showFilterBar && <FilterBar />}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 p-4 md:p-6 scroll-smooth">
            {/* Page Transition Animation */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="mx-auto max-w-7xl space-y-6"
            >
               {children || <Outlet />}
            </motion.div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LayoutOverride;