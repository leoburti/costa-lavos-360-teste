import React, { useState } from 'react';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/common';
import { Save, X } from 'lucide-react';
import { CrmConfigForm } from './components/CrmConfigForm';

export default function CrmConfiguracao() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: configResult, loading, error, retry } = useAnalyticalData(
    'get_crm_config',
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

  // Data usually comes as an array from Supabase RPC
  const config = Array.isArray(configResult) ? configResult[0] : configResult;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Configuração CRM</h1>
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
        <CrmConfigForm config={config} onSave={() => setIsEditing(false)} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estágios do Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Estágios Atuais</p>
                  <div className="flex flex-wrap gap-2">
                    {config?.stages?.map((stage, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 rounded text-sm border">
                        {stage}
                      </span>
                    )) || <span className="text-gray-400 italic">Nenhum estágio configurado</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campos Personalizados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Campos Ativos</p>
                  <p className="font-semibold">
                    {Array.isArray(config?.custom_fields) ? config.custom_fields.length : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}