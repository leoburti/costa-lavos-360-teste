import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useNotificacoes } from '@/hooks/useNotificacoes';

const PreferenciasPage = () => {
  const { fetchPreferencias, updatePreferencias } = useNotificacoes();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    tipos_config: {
      atribuicao: true,
      mudanca_status: true,
      comentario: true,
      agendamento: true,
      sistema: true
    }
  });

  useEffect(() => {
    const load = async () => {
      const data = await fetchPreferencias();
      if (data) {
        setPrefs({
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          sms_enabled: data.sms_enabled,
          tipos_config: { ...prefs.tipos_config, ...data.tipos_config }
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTypeToggle = (type) => {
    setPrefs(prev => ({
      ...prev,
      tipos_config: { ...prev.tipos_config, [type]: !prev.tipos_config[type] }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updatePreferencias(prefs);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
      <Helmet><title>Preferências de Notificação</title></Helmet>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Preferências</h1>
          <p className="text-muted-foreground">Gerencie como e quando você deseja ser notificado.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Canais de Notificação</CardTitle>
            <CardDescription>Escolha por onde deseja receber alertas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>E-mail</Label>
                <p className="text-sm text-muted-foreground">Receber notificações importantes por e-mail.</p>
              </div>
              <Switch checked={prefs.email_enabled} onCheckedChange={() => handleToggle('email_enabled')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push (Navegador)</Label>
                <p className="text-sm text-muted-foreground">Alertas instantâneos no navegador.</p>
              </div>
              <Switch checked={prefs.push_enabled} onCheckedChange={() => handleToggle('push_enabled')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS</Label>
                <p className="text-sm text-muted-foreground">Receber alertas críticos via SMS.</p>
              </div>
              <Switch checked={prefs.sms_enabled} onCheckedChange={() => handleToggle('sms_enabled')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Notificação</CardTitle>
            <CardDescription>Selecione quais eventos geram notificações.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Atribuição de Chamados</Label>
              <Switch checked={prefs.tipos_config.atribuicao} onCheckedChange={() => handleTypeToggle('atribuicao')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mudança de Status</Label>
              <Switch checked={prefs.tipos_config.mudanca_status} onCheckedChange={() => handleTypeToggle('mudanca_status')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Novos Comentários</Label>
              <Switch checked={prefs.tipos_config.comentario} onCheckedChange={() => handleTypeToggle('comentario')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Agendamentos e Eventos</Label>
              <Switch checked={prefs.tipos_config.agendamento} onCheckedChange={() => handleTypeToggle('agendamento')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Avisos do Sistema</Label>
              <Switch checked={prefs.tipos_config.sistema} onCheckedChange={() => handleTypeToggle('sistema')} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving} className="ml-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" /> Salvar Preferências
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default PreferenciasPage;