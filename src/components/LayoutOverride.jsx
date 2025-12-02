import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarOverride from './SidebarOverride';
import Header from './Header';
import PageSkeleton from '@/components/PageSkeleton';

const LayoutOverride = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50/50 overflow-hidden">
      {/* Sidebar */}
      <SidebarOverride 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          {/* Local Suspense prevents the entire app from going white during navigation */}
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default LayoutOverride;