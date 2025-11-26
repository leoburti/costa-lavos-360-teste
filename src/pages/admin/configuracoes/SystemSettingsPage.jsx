
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Save, Settings, Database, Globe } from 'lucide-react';

const SystemSettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Mock state for system settings
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    debugLogging: true,
    systemName: 'Costa Lavos 360',
    supportEmail: 'suporte@costalavos.com',
    sessionTimeout: 30
  });

  useEffect(() => {
    console.log('[SystemSettingsPage] Settings loaded');
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setLoading(true);
    console.log('[SystemSettingsPage] Saving settings:', settings);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configurações Salvas",
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Configurações do Sistema | Admin | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Parâmetros globais e controle de ambiente.
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" /> 
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Geral
            </CardTitle>
            <CardDescription>Informações básicas da aplicação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">Nome do Sistema</Label>
              <Input 
                id="systemName" 
                value={settings.systemName} 
                onChange={(e) => handleChange('systemName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input 
                id="supportEmail" 
                value={settings.supportEmail} 
                onChange={(e) => handleChange('supportEmail', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Ambiente
            </CardTitle>
            <CardDescription>Controle de disponibilidade e sessões.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                <p className="text-sm text-muted-foreground">Bloqueia o acesso para usuários não-admin.</p>
              </div>
              <Switch 
                id="maintenance-mode" 
                checked={settings.maintenanceMode}
                onCheckedChange={() => handleToggle('maintenanceMode')}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
              <Input 
                id="sessionTimeout" 
                type="number" 
                value={settings.sessionTimeout} 
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Diagnóstico & Logs
            </CardTitle>
            <CardDescription>Ferramentas para desenvolvedores e suporte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="debug-logging">Logs de Debug Detalhados</Label>
                <p className="text-sm text-muted-foreground">Habilita logs verbose no console e serviços de monitoramento.</p>
              </div>
              <Switch 
                id="debug-logging" 
                checked={settings.debugLogging}
                onCheckedChange={() => handleToggle('debugLogging')}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 px-6 py-4 border-t flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Versão do Sistema: 1.0.0 (Build 2025.11.26)</p>
            <Button variant="outline" size="sm">Ver Logs do Sistema</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
