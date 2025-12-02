import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useCRMMock } from '@/hooks/useCRMMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, Calendar, User, Download } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const CrmContratoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContractById } = useCRMMock();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getContractById(id);
      setContract(data);
      setLoading(false);
    };
    load();
  }, [id, getContractById]);

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
  if (!contract) return <div className="p-6">Contrato não encontrado.</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Contrato {contract.client} | CRM</title></Helmet>

      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crm/contratos')}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
            title={`Contrato: ${contract.client}`} 
            description={`Tipo: ${contract.type}`}
            className="pb-0"
            actions={
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
            }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-slate-500 block">Valor Total</span>
                        <span className="text-lg font-bold">{formatCurrency(contract.value)}</span>
                    </div>
                    <div>
                        <span className="text-sm text-slate-500 block">Status</span>
                        <Badge variant={contract.status === 'ativo' ? 'success' : 'secondary'} className="capitalize">
                            {contract.status}
                        </Badge>
                    </div>
                    <div>
                        <span className="text-sm text-slate-500 block">Início de Vigência</span>
                        <span className="font-medium">{formatDate(contract.startDate)}</span>
                    </div>
                    <div>
                        <span className="text-sm text-slate-500 block">Fim de Vigência</span>
                        <span className="font-medium">{formatDate(contract.endDate)}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-sm text-slate-500 block">Responsável</span>
                        <span className="font-medium flex items-center gap-2"><User className="h-4 w-4" /> {contract.owner}</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Documentos e Anexos</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                        <p className="font-medium text-slate-900">Contrato_Assinado_v1.pdf</p>
                        <p className="text-xs text-slate-500">Adicionado em {formatDate(contract.startDate)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrmContratoDetalhes;