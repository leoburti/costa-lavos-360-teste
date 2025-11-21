import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';

const PrivacidadePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profileVisibility: true,
    activityStatus: true,
    dataSharing: false,
    searchEngineIndexing: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setLoading(true);
    // Mock save
    setTimeout(() => {
        setLoading(false);
        toast({ title: "Configurações salvas", description: "Suas preferências de privacidade foram atualizadas." });
    }, 1000);
  };

  return (
    <>
      <Helmet><title>Privacidade - Configurações</title></Helmet>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Privacidade e Dados</h2>
                <p className="text-muted-foreground">Controle quem pode ver suas informações e como seus dados são usados.</p>
            </div>
            <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar
            </Button>
        </div>

        <ConfiguracaoGrupo titulo="Visibilidade" descricao="Gerencie o que os outros podem ver sobre você.">
          <ConfiguracaoSwitch
            label="Perfil Público na Empresa"
            descricao="Permitir que outros colaboradores vejam seu perfil completo."
            checked={settings.profileVisibility}
            onCheckedChange={() => handleToggle('profileVisibility')}
          />
          <ConfiguracaoSwitch
            label="Status de Atividade"
            descricao="Mostrar quando você está online."
            checked={settings.activityStatus}
            onCheckedChange={() => handleToggle('activityStatus')}
          />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo titulo="Dados e Compartilhamento" descricao="Controle o uso de seus dados.">
          <ConfiguracaoSwitch
            label="Compartilhamento de Dados de Uso"
            descricao="Permitir coleta de dados anônimos para melhoria do sistema."
            checked={settings.dataSharing}
            onCheckedChange={() => handleToggle('dataSharing')}
          />
        </ConfiguracaoGrupo>
        
        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
            <h4 className="text-destructive font-semibold mb-2">Zona de Perigo</h4>
            <p className="text-sm text-muted-foreground mb-4">Ações irreversíveis relacionadas à sua conta.</p>
            <Button variant="destructive" size="sm">Solicitar Exclusão de Conta</Button>
        </div>
      </div>
    </>
  );
};

export default PrivacidadePage;