import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarMenu from '@/components/SidebarMenu'; // Updated to use the new SidebarMenu
import Header from '@/components/Header';
import PageSkeleton from '@/components/PageSkeleton';
import { Toaster } from '@/components/ui/toaster';

/**
 * Enterprise App Layout (Updated)
 * Uses the new JSON-configured SidebarMenu for consistent navigation.
 */
const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* New Data-Driven Sidebar */}
      <SidebarMenu 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Wrapper */}
      <div 
        className={
          `flex-1 flex flex-col h-full min-w-0 relative transition-all duration-300 ease-in-out
           ${sidebarCollapsed ? 'md:ml-[70px]' : 'md:ml-64'} 
           ml-0`
        }
      >
        
        {/* Header (Passes mobile sidebar control) */}
        <Header setSidebarOpen={setMobileOpen} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-0 bg-slate-50/50">
          <div className="min-h-full">
            <Suspense fallback={<div className="p-6"><PageSkeleton /></div>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
};

export default AppLayout;