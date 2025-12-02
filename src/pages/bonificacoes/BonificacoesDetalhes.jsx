import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/common';
import { ArrowLeft, Edit2, X } from 'lucide-react';
import { BonificacoesForm } from './components/BonificacoesForm';

export default function BonificacoesDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: details, loading, error, retry } = useAnalyticalData(
    'get_bonificacoes_details',
    { p_bonificacao_id: id },
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar bonificação',
          description: err.message,
          variant: 'destructive',
        });
      },
    }
  );

  const bonificacao = Array.isArray(details) ? details[0] : details;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{bonificacao?.bonificacao_name || 'Bonificação'}</h1>
            <p className="text-gray-600">{bonificacao?.type}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'destructive' : 'default'}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <BonificacoesForm bonificacao={bonificacao} onSave={() => setIsEditing(false)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-semibold">{bonificacao?.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percentual</p>
                  <p className="font-semibold">{bonificacao?.percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{bonificacao?.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data de Início</p>
                  <p className="font-semibold">
                    {bonificacao?.start_date ? new Date(bonificacao.start_date).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Acumulado</p>
                  <p className="font-semibold">R$ {Number(bonificacao?.total_accumulated || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Período Atual</p>
                  <p className="font-semibold">R$ {Number(bonificacao?.current_period || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Meta</p>
                  <p className="font-semibold">R$ {Number(bonificacao?.target || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}