import React, { useState } from 'react';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/common';
import { Save, X } from 'lucide-react';
import { ConfigurationForm } from './components/ConfigurationForm';

export default function BonificacoesConfiguracao() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: configResult, loading, error, retry } = useAnalyticalData(
    'get_bonificacoes_config',
    {},
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar configuração',
          description: err.message,
          variant: 'destructive',
        });
      },
    }
  );

  const config = Array.isArray(configResult) ? configResult[0] : configResult;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Configuração de Bonificações</h1>
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
              <Save className="h-4 w-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <ConfigurationForm config={config} onSave={() => setIsEditing(false)} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Percentuais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600">Percentual Base</p>
                    <p className="text-2xl font-bold">{config?.base_percentage}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600">Percentual Máximo</p>
                    <p className="text-2xl font-bold">{config?.max_percentage}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Períodos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600">Período de Cálculo</p>
                    <p className="text-lg font-semibold capitalize">{config?.calculation_period}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600">Data de Pagamento</p>
                    <p className="text-lg font-semibold capitalize">{config?.payment_date}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}