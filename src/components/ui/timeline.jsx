import React from 'react';
import { cn } from '@/lib/utils';

const Timeline = ({ children, className }) => {
  return (
    <div className={cn("space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent", className)}>
      {children}
    </div>
  );
};

const TimelineItem = ({ date, title, description, icon: Icon, align = 'left', color = 'bg-blue-500' }) => {
  const isLeft = align === 'left';
  
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      {/* Icon */}
      <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-white", color)}>
        {Icon ? <Icon className="w-5 h-5" /> : <div className="w-3 h-3 bg-white rounded-full" />}
      </div>
      
      {/* Card */}
      <div className={cn("w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200", isLeft ? "md:mr-auto" : "md:ml-auto")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <span className="font-bold text-slate-900">{title}</span>
          <time className="text-xs font-medium text-slate-500 uppercase">{date}</time>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export { Timeline, TimelineItem };