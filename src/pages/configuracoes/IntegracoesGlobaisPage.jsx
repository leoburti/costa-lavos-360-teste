import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const IntegracoesGlobaisPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState([]);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_integracoes_apis').select('*');
      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id, currentStatus) => {
      try {
          const { error } = await supabase.from('apoio_integracoes_apis').update({ ativo: !currentStatus }).eq('id', id);
          if (error) throw error;
          setIntegrations(prev => prev.map(i => i.id === id ? { ...i, ativo: !currentStatus } : i));
          toast({ title: "Status atualizado" });
      } catch (error) {
          toast({ variant: "destructive", title: "Erro", description: error.message });
      }
  };

  return (
    <>
      <Helmet><title>Integrações - Configurações</title></Helmet>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Integrações e API</h2>
                <p className="text-muted-foreground">Conecte ferramentas externas e gerencie chaves de API.</p>
            </div>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Integração
            </Button>
        </div>

        <ConfiguracaoGrupo titulo="Conexões Ativas" descricao="Serviços externos conectados ao sistema.">
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : integrations.length > 0 ? (
                <div className="grid gap-4">
                    {integrations.map(integ => (
                        <div key={integ.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center font-bold text-primary">
                                    {integ.nome_integracao.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{integ.nome_integracao}</h4>
                                        <Badge variant={integ.ativo ? "success" : "secondary"}>{integ.ativo ? "Ativo" : "Inativo"}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{integ.url_base || 'URL não definida'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Switch checked={integ.ativo} onCheckedChange={() => toggleIntegration(integ.id, integ.ativo)} />
                                <Button variant="ghost" size="icon"><SettingsIcon className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                    Nenhuma integração configurada.
                </div>
            )}
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo titulo="Webhooks" descricao="Configure notificações HTTP para eventos do sistema.">
            <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-4">Nenhum webhook configurado.</p>
                <Button variant="outline" size="sm">Adicionar Webhook</Button>
            </div>
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

const SettingsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
)

export default IntegracoesGlobaisPage;