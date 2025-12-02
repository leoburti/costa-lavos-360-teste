import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useEquipmentMock } from '@/hooks/useEquipmentMock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Edit, 
  History, 
  FileText, 
  Wrench, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Tag, 
  Box 
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Timeline, TimelineItem } from '@/components/ui/timeline';

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="p-2 bg-white border border-slate-100 rounded-md shadow-sm text-slate-500">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-slate-900 mt-0.5">{value || '-'}</p>
    </div>
  </div>
);

const EquipamentosDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEquipmentById, getHistoryByEquipmentId } = useEquipmentMock();
  const [equipment, setEquipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const eq = await getEquipmentById(id);
        const hist = await getHistoryByEquipmentId(id);
        setEquipment(eq);
        setHistory(hist);
      } catch (err) {
        console.error(err);
        navigate('/equipamentos'); // Redirect on error
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, getEquipmentById, getHistoryByEquipmentId, navigate]);

  if (loading) return (
    <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-64 col-span-2" />
            <Skeleton className="h-64 col-span-1" />
        </div>
    </div>
  );

  if (!equipment) return null;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>{equipment.name} | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title={equipment.name}
        description={`Série: ${equipment.serial} | Modelo: ${equipment.model}`}
        breadcrumbs={[
            { label: 'Equipamentos', path: '/equipamentos' }, 
            { label: 'Detalhes' }
        ]}
        actions={
          <Button onClick={() => navigate(`/equipamentos/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle>Visão Geral</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <DetailRow icon={Tag} label="Tipo" value={equipment.type} />
                        <DetailRow icon={Box} label="Marca" value={equipment.brand} />
                        <DetailRow icon={MapPin} label="Localização" value={equipment.location} />
                        <DetailRow icon={Calendar} label="Data Aquisição" value={formatDate(equipment.acquisitionDate)} />
                        <DetailRow icon={DollarSign} label="Valor" value={formatCurrency(equipment.value)} />
                        <DetailRow icon={Wrench} label="Garantia Até" value={formatDate(equipment.warrantyExpiration)} />
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Descrição</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {equipment.description || "Nenhuma descrição fornecida."}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Histórico e Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="historico">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="historico">Linha do Tempo</TabsTrigger>
                            <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
                            <TabsTrigger value="documentos">Documentos</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="historico">
                            <Timeline>
                                {history.map((item, idx) => (
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
                                        color="bg-blue-500"
                                        align={idx % 2 === 0 ? 'left' : 'right'}
                                    />
                                ))}
                            </Timeline>
                            <div className="mt-6 text-center">
                                <Button variant="outline" onClick={() => navigate(`/equipamentos/${id}/historico`)}>
                                    Ver Histórico Completo
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="manutencoes">
                            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                                <Wrench className="h-12 w-12 mb-3 opacity-20" />
                                <p>Nenhuma manutenção registrada recentemente.</p>
                                <Button variant="link" className="mt-2">Registrar Manutenção</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="documentos">
                            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                                <FileText className="h-12 w-12 mb-3 opacity-20" />
                                <p>Nenhum documento anexado.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>

        {/* Right Column - Status & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Status Atual</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center p-6 pt-0">
                    <div className="mb-4">
                        {equipment.status === 'ativo' && <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />}
                        {equipment.status === 'manutencao' && <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse" />}
                        {equipment.status === 'inativo' && <div className="w-4 h-4 bg-slate-400 rounded-full" />}
                    </div>
                    <Badge className={`mb-2 text-sm px-3 py-1 ${
                        equipment.status === 'ativo' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                        equipment.status === 'manutencao' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                        'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}>
                        {equipment.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground">Última atualização: {formatDate(new Date().toISOString())}</p>
                </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                    <img 
                        src={equipment.image} 
                        alt={equipment.name} 
                        className="w-full h-48 object-cover rounded-lg mb-4 border border-slate-200"
                    />
                    <div className="text-xs text-center text-slate-400">Imagem ilustrativa do ativo</div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default EquipamentosDetalhes;