import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useEquipmentMock } from '@/hooks/useEquipmentMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { History, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

const EquipamentosHistorico = () => {
  const { id } = useParams();
  const { getEquipmentById, getHistoryByEquipmentId } = useEquipmentMock();
  const [equipment, setEquipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('todos');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const eq = await getEquipmentById(id);
        const hist = await getHistoryByEquipmentId(id);
        setEquipment(eq);
        setHistory(hist);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getEquipmentById, getHistoryByEquipmentId]);

  const filteredHistory = history.filter(item => 
    filterType === 'todos' || item.action.toLowerCase().includes(filterType.toLowerCase())
  );

  if (loading) return <div className="p-6"><Skeleton className="h-96 w-full" /></div>;
  if (!equipment) return <div className="p-6">Equipamento não encontrado.</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Histórico - {equipment.name} | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title={`Histórico: ${equipment.name}`}
        description="Registro completo de atividades e movimentações."
        breadcrumbs={[
            { label: 'Equipamentos', path: '/equipamentos' }, 
            { label: equipment.name, path: `/equipamentos/${id}` },
            { label: 'Histórico' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 h-fit border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-sm uppercase text-slate-500">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de Ação</label>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="movimentado">Movimentação</SelectItem>
                                <SelectItem value="manutenção">Manutenção</SelectItem>
                                <SelectItem value="status">Alteração de Status</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle>Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">Nenhum registro encontrado para este filtro.</div>
                ) : (
                    <Timeline>
                        {filteredHistory.map((item, idx) => (
                            <TimelineItem 
                                key={item.id}
                                date={formatDate(item.date, "dd MMM yyyy, HH:mm")}
                                title={item.action}
                                description={
                                    <span>
                                        <span className="font-semibold text-primary">{item.user}</span> - {item.description}
                                    </span>
                                }
                                icon={History}
                                color={
                                    item.action.includes('Manutenção') ? 'bg-amber-500' : 
                                    item.action.includes('Movimentado') ? 'bg-purple-500' : 
                                    'bg-blue-500'
                                }
                                align="left"
                            />
                        ))}
                    </Timeline>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EquipamentosHistorico;