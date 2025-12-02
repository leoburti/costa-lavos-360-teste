import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useCRMMock } from '@/hooks/useCRMMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Calendar, DollarSign, Percent, Target } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const CrmNegocioDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDealById } = useCRMMock();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getDealById(id);
      setDeal(data);
      setLoading(false);
    };
    load();
  }, [id, getDealById]);

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
  if (!deal) return <div className="p-6">Negócio não encontrado.</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>{deal.title} | CRM</title></Helmet>

      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crm/negocios')}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
            title={deal.title} 
            description={`Oportunidade com ${deal.company}`}
            className="pb-0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle>Detalhes do Negócio</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500"><DollarSign className="h-4 w-4" /> Valor Estimado</div>
                            <div className="text-xl font-bold text-slate-900">{formatCurrency(deal.value)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500"><Target className="h-4 w-4" /> Estágio Atual</div>
                            <Badge variant="outline" className="text-sm capitalize px-3 py-1">{deal.stage}</Badge>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500"><Percent className="h-4 w-4" /> Probabilidade</div>
                            <div className="text-xl font-bold text-slate-900">{deal.probability}%</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500"><Calendar className="h-4 w-4" /> Fechamento Previsto</div>
                            <div className="text-lg font-medium text-slate-800">{formatDate(deal.closingDate)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500"><User className="h-4 w-4" /> Responsável</div>
                            <div className="text-lg font-medium text-slate-800">{deal.owner}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="border-slate-200 shadow-sm h-[300px]">
                <CardHeader><CardTitle>Timeline de Atividades</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground border-dashed border-2 rounded-lg m-6">
                    <p>Timeline de interações em desenvolvimento...</p>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle>Contato Principal</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {deal.contactName ? deal.contactName.substring(0,2).toUpperCase() : 'CN'}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{deal.contactName}</p>
                            <p className="text-sm text-slate-500">{deal.company}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/crm/contatos/${deal.contactId}`)}>
                        Ver Perfil Completo
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default CrmNegocioDetalhes;