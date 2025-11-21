
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const PageSkeleton = () => {
  return (
    <div className="space-y-6 w-full p-1 animate-in fade-in duration-300">
      {/* Header Area Skeleton - Mimics the real header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-md bg-slate-200/50" />
          <Skeleton className="h-4 w-96 rounded-md bg-slate-100" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32 rounded-md bg-slate-200/50" />
          <Skeleton className="h-10 w-10 rounded-md bg-slate-200/50" />
        </div>
      </div>

      {/* Filter Bar Skeleton - If present */}
      <div className="hidden md:flex w-full h-16 bg-white rounded-lg border border-slate-100 items-center px-4 gap-4">
         <Skeleton className="h-10 flex-1 rounded-md bg-slate-100" />
         <Skeleton className="h-10 flex-1 rounded-md bg-slate-100" />
         <Skeleton className="h-10 flex-1 rounded-md bg-slate-100" />
         <Skeleton className="h-10 w-24 rounded-md bg-slate-200" />
      </div>

      {/* KPI Cards Skeleton - Exact Grid Match */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-slate-100" />
              <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
            </div>
            <Skeleton className="h-8 w-32 bg-slate-200" />
            <Skeleton className="h-3 w-16 bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton - Split View */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-[500px]">
        <div className="col-span-4 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
           <div className="flex justify-between mb-6">
             <Skeleton className="h-6 w-48 bg-slate-200" />
             <Skeleton className="h-8 w-24 bg-slate-100" />
           </div>
           <Skeleton className="w-full h-[350px] bg-slate-50 rounded-lg" />
        </div>
        <div className="col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
           <Skeleton className="h-6 w-48 bg-slate-200 mb-6" />
           <div className="space-y-4">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="flex items-center gap-4">
                 <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
                 <div className="space-y-2 flex-1">
                   <Skeleton className="h-4 w-full bg-slate-100" />
                   <Skeleton className="h-3 w-2/3 bg-slate-50" />
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
