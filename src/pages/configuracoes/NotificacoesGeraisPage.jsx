import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, Save } from 'lucide-react';

const NotificacoesGeraisPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    tipos_config: {
        vendas: true,
        apoio: true,
        agenda: true,
        sistema: true
    }
  });

  useEffect(() => {
    if (user) {
      fetchPrefs();
    }
  }, [user]);

  const fetchPrefs = async () => {
    try {
      const { data, error } = await supabase
        .from('apoio_notificacoes_preferencias')
        .select('*')
        .eq('usuario_id', user.id)
        .maybeSingle(); // Changed from .single() to .maybeSingle() to handle 0 rows gracefully

      if (error) throw error;

      if (data) {
        setPrefs({
            email_enabled: data.email_enabled,
            push_enabled: data.push_enabled,
            sms_enabled: data.sms_enabled,
            tipos_config: data.tipos_config || { vendas: true, apoio: true, agenda: true, sistema: true }
        });
      }
      // If no data, we just keep the default state
    } catch (error) {
      console.error("Error fetching prefs:", error);
      // Optional: toast error if it's not just a "no rows" issue, but maybeSingle handles the common case
    }
  };

  const handleToggle = (key, isType = false) => {
    if (isType) {
        setPrefs(prev => ({
            ...prev,
            tipos_config: { ...prev.tipos_config, [key]: !prev.tipos_config[key] }
        }));
    } else {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_notificacao_preferencias', {
        p_usuario_id: user.id,
        p_email: prefs.email_enabled,
        p_push: prefs.push_enabled,
        p_sms: prefs.sms_enabled,
        p_tipos: prefs.tipos_config
      });

      if (error) throw error;
      toast({ title: "Preferências salvas", description: "Suas configurações de notificação foram atualizadas." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Notificações - Configurações</title></Helmet>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Notificações</h2>
                <p className="text-muted-foreground">Escolha como e quando você quer ser notificado.</p>
            </div>
            <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Preferências
            </Button>
        </div>

        <ConfiguracaoGrupo titulo="Canais de Comunicação" descricao="Por onde você deseja receber alertas.">
          <ConfiguracaoSwitch
            label="Email"
            descricao="Receber resumos e alertas importantes por email."
            checked={prefs.email_enabled}
            onCheckedChange={() => handleToggle('email_enabled')}
          />
          <ConfiguracaoSwitch
            label="Push Notifications"
            descricao="Notificações no navegador e dispositivos móveis."
            checked={prefs.push_enabled}
            onCheckedChange={() => handleToggle('push_enabled')}
          />
          <ConfiguracaoSwitch
            label="SMS"
            descricao="Alertas críticos via mensagem de texto."
            checked={prefs.sms_enabled}
            onCheckedChange={() => handleToggle('sms_enabled')}
          />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo titulo="Tipos de Notificação" descricao="Selecione os tópicos de seu interesse.">
           <ConfiguracaoSwitch
            label="Vendas e Comercial"
            descricao="Novos pedidos, metas atingidas, clientes em risco."
            checked={prefs.tipos_config.vendas}
            onCheckedChange={() => handleToggle('vendas', true)}
          />
          <ConfiguracaoSwitch
            label="Apoio e Chamados"
            descricao="Atualizações de tickets, manutenções e suporte."
            checked={prefs.tipos_config.apoio}
            onCheckedChange={() => handleToggle('apoio', true)}
          />
          <ConfiguracaoSwitch
            label="Agenda e Compromissos"
            descricao="Lembretes de reuniões e visitas."
            checked={prefs.tipos_config.agenda}
            onCheckedChange={() => handleToggle('agenda', true)}
          />
          <ConfiguracaoSwitch
            label="Sistema e Segurança"
            descricao="Atualizações da plataforma e alertas de segurança."
            checked={prefs.tipos_config.sistema}
            onCheckedChange={() => handleToggle('sistema', true)}
          />
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default NotificacoesGeraisPage;