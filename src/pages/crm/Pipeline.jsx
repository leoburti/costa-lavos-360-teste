
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { 
  DndContext, 
  closestCorners, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor, 
  DragOverlay,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { DealCard } from '@/components/crm/DealCard';
import { LoadingState } from '@/components/common';

// Fetch Stages and Deals from Supabase
const usePipelineData = () => {
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stagesRes, dealsRes] = await Promise.all([
        supabase.from('crm_stages').select('*').order('order', { ascending: true }),
        supabase.from('crm_deals').select('*, crm_contacts(fantasy_name, corporate_name)')
      ]);

      if (stagesRes.error) throw stagesRes.error;
      if (dealsRes.error) throw dealsRes.error;

      setStages(stagesRes.data);
      setDeals(dealsRes.data);
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar pipeline.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { stages, deals, setDeals, loading, refresh: fetchData };
};

const CrmPipeline = () => {
  const { stages, deals, setDeals, loading } = usePipelineData();
  const [activeId, setActiveId] = useState(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeDealId = active.id;
    const overStageId = over.id; // Dropping on a column container which has stage ID

    // Find the deal
    const deal = deals.find(d => d.id === activeDealId);
    if (!deal || deal.stage_id === overStageId) return;

    // Optimistic Update
    const oldStageId = deal.stage_id;
    setDeals(prev => prev.map(d => d.id === activeDealId ? { ...d, stage_id: overStageId } : d));

    // Persist
    try {
      const { error } = await supabase
        .from('crm_deals')
        .update({ stage_id: overStageId })
        .eq('id', activeDealId);

      if (error) throw error;
      toast({ title: 'Negócio movido', description: 'Estágio atualizado com sucesso.' });
    } catch (error) {
      // Rollback
      setDeals(prev => prev.map(d => d.id === activeDealId ? { ...d, stage_id: oldStageId } : d));
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível mover o negócio.' });
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 h-full flex flex-col">
      <Helmet><title>Pipeline | CRM</title></Helmet>
      <PageHeader 
        title="Pipeline de Vendas" 
        actions={<Button onClick={() => {/* Open Add Modal */}}><Plus className="mr-2 h-4 w-4"/>Novo Negócio</Button>}
      />
      
      <div className="flex-1 overflow-x-auto mt-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max pb-4">
            {stages.map(stage => (
              <KanbanColumn 
                key={stage.id} 
                stage={stage} 
                deals={deals.filter(d => d.stage_id === stage.id)} 
              />
            ))}
          </div>
          <DragOverlay>
            {activeId ? <DealCard deal={deals.find(d => d.id === activeId)} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

// Inline Column Component
const KanbanColumn = ({ stage, deals }) => {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <div ref={setNodeRef} className="w-80 bg-slate-50 rounded-lg p-4 flex flex-col h-full border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-700">{stage.name}</h3>
        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{deals.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {deals.map(deal => <DraggableDealCard key={deal.id} deal={deal} />)}
      </div>
    </div>
  );
};

const DraggableDealCard = ({ deal }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: deal.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DealCard deal={deal} />
    </div>
  );
};

export default CrmPipeline;
