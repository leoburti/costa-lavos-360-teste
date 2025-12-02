import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { useCRMMock } from '@/hooks/useCRMMock';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const COLUMNS = [
  { id: 'prospeccao', title: 'Prospecção' },
  { id: 'qualificacao', title: 'Qualificação' },
  { id: 'proposta', title: 'Proposta' },
  { id: 'negociacao', title: 'Negociação' },
  { id: 'fechado', title: 'Fechado' }
];

const CrmPipeline = () => {
  const navigate = useNavigate();
  const { deals, updateDealStage, loading } = useCRMMock();
  // Local state to optimistically update UI for drag and drop smoothness
  const [localDeals, setLocalDeals] = useState(null);

  // Sync local state with mock data when loaded
  React.useEffect(() => {
    if (deals && !localDeals) {
      setLocalDeals(deals);
    }
  }, [deals, localDeals]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    // Find new column from over container (the droppable id is the column id)
    // Note: dnd-kit sortable strategy might return item id as over.id if dropped on item
    // We need to determine the target column.
    
    let newStage = over.id;
    
    // If dropped on a card, find that card's stage
    const overDeal = localDeals.find(d => d.id === over.id);
    if (overDeal) {
        newStage = overDeal.stage;
    } else if (!COLUMNS.some(c => c.id === over.id)) {
        // Not a column, not a deal? safeguard
        return;
    }

    const deal = localDeals.find(d => d.id === activeId);
    
    if (deal && deal.stage !== newStage) {
        // Optimistic update
        const updatedDeals = localDeals.map(d => 
            d.id === activeId ? { ...d, stage: newStage } : d
        );
        setLocalDeals(updatedDeals);
        
        // Actual update
        updateDealStage(activeId, newStage);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/crm/negocios/${id}`);
  };

  return (
    <div className="flex flex-col h-full p-6 animate-in fade-in duration-500">
      <Helmet><title>Pipeline de Vendas | Costa Lavos</title></Helmet>
      
      <div className="flex-none">
        <PageHeader 
            title="Pipeline de Vendas" 
            description="Gerencie o funil de oportunidades e estágios de negociação."
            breadcrumbs={[{ label: 'CRM', path: '/crm/dashboard' }, { label: 'Pipeline' }]}
            actions={
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Negócio
            </Button>
            }
        />
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        {loading || !localDeals ? (
            <div className="flex gap-4 h-full">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-80 h-full bg-slate-50 rounded-xl border border-slate-200 p-4">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <Skeleton className="h-24 w-full mb-3 rounded-lg" />
                        <Skeleton className="h-24 w-full mb-3 rounded-lg" />
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-[calc(100vh-220px)] min-h-[500px]">
                <KanbanBoard 
                    columns={COLUMNS} 
                    deals={localDeals} 
                    onDragEnd={handleDragEnd}
                    onCardClick={handleCardClick}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default CrmPipeline;