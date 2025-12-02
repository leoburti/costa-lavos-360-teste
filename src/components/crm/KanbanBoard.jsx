import React from 'react';
import {
  DndContext,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const SortableCard = ({ deal, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
      <Card 
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-4 border-l-primary"
        onClick={() => onClick && onClick(deal.id)}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-tight">{deal.title}</h4>
          </div>
          <div className="text-xs text-slate-500 font-medium">{deal.company}</div>
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 text-sm">{formatCurrency(deal.value)}</span>
            <Avatar className="h-6 w-6 text-[10px]">
                <AvatarFallback>{deal.owner.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Column = ({ id, title, deals, totalValue, onCardClick }) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200 min-w-[280px] w-80">
      <div className="p-3 border-b border-slate-100 bg-white/50 rounded-t-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
          <Badge variant="secondary" className="text-xs rounded-full px-2 h-5">{deals.length}</Badge>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {formatCurrency(totalValue)}
        </div>
      </div>
      <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto min-h-[150px]">
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <SortableCard key={deal.id} deal={deal} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const KanbanBoard = ({ columns, deals, onDragEnd, onCardClick }) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const [activeId, setActiveId] = React.useState(null);
  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={({active}) => setActiveId(active.id)}
      onDragEnd={(event) => { setActiveId(null); onDragEnd(event); }}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4 px-1">
        {columns.map((col) => {
          const colDeals = deals.filter(d => d.stage === col.id);
          const total = colDeals.reduce((acc, curr) => acc + curr.value, 0);
          return (
            <Column 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              deals={colDeals} 
              totalValue={total}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeDeal ? <div className="opacity-90 rotate-2 scale-105"><SortableCard deal={activeDeal} /></div> : null}
      </DragOverlay>
    </DndContext>
  );
};