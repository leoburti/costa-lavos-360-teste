
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, RotateCcw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Import Sub-components
import GeneralTab from './settings/GeneralTab';
import RatesTab from './settings/RatesTab';
import SchedulesTab from './settings/SchedulesTab';
import RegionsTab from './settings/RegionsTab';
import NotificationsTab from './settings/NotificationsTab';
import IntegrationsTab from './settings/IntegrationsTab';

const SETTING_KEY_PREFIX = 'delivery_settings_';

const DeliverySettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Unified State
  const [settings, setSettings] = useState({
    general: {},
    rates: { rates: [] },
    schedules: { schedules: {} },
    regions: { regions: [] },
    notifications: { channels: {}, templates: {} },
    integrations: { integrations: [] }
  });

  // --- Fetch Data ---
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('configuracoes')
          .select('chave, valor')
          .like('chave', `${SETTING_KEY_PREFIX}%`);

        if (error) throw error;

        const newSettings = { ...settings };
        
        // Parse JSON values from DB
        data?.forEach(item => {
          const key = item.chave.replace(SETTING_KEY_PREFIX, '');
          try {
            // If key matches one of our state keys, update it
            if (newSettings[key] !== undefined) {
               // Value is text in DB, need to parse
               const parsed = JSON.parse(item.valor);
               newSettings[key] = parsed;
            }
          } catch (e) {
            console.warn(`Failed to parse setting: ${item.chave}`, e);
          }
        });

        setSettings(newSettings);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar configurações." });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // --- Save Data ---
  const handleSave = async () => {
    setSaving(true);
    try {
      const upsertData = Object.keys(settings).map(key => ({
        chave: `${SETTING_KEY_PREFIX}${key}`,
        valor: JSON.stringify(settings[key]),
        tipo: 'json',
        descricao: `Configurações de ${key} do módulo de entregas`
      }));

      const { error } = await supabase
        .from('configuracoes')
        .upsert(upsertData, { onConflict: 'chave' });

      if (error) throw error;

      toast({ title: "Sucesso", description: "Configurações salvas com sucesso!" });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar configurações." });
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers for child updates ---
  const updateSection = (section, newData) => {
    setSettings(prev => ({
      ...prev,
      [section]: newData
    }));
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;

  return (
    <>
      <Helmet>
        <title>Configurações de Entregas | Admin</title>
      </Helmet>
      
      <div className="space-y-6 p-2 md:p-6 max-w-[1600px] mx-auto pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#6B2C2C]">Configurações de Entregas</h1>
            <p className="text-muted-foreground text-sm">Gerencie parâmetros globais, tarifas e integrações.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} title="Recarregar">
              <RotateCcw className="h-4 w-4 mr-2" /> Restaurar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#6B2C2C] hover:bg-[#5a2323] text-white min-w-[120px]">
              {saving ? <LoadingSpinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="rates">Tarifas</TabsTrigger>
            <TabsTrigger value="schedules">Horários</TabsTrigger>
            <TabsTrigger value="regions">Regiões</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralTab data={settings.general} onChange={(d) => updateSection('general', d)} />
          </TabsContent>

          <TabsContent value="rates">
            <RatesTab data={settings.rates} onChange={(d) => updateSection('rates', d)} />
          </TabsContent>

          <TabsContent value="schedules">
            <SchedulesTab data={settings.schedules} onChange={(d) => updateSection('schedules', d)} />
          </TabsContent>

          <TabsContent value="regions">
            <RegionsTab data={settings.regions} onChange={(d) => updateSection('regions', d)} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab data={settings.notifications} onChange={(d) => updateSection('notifications', d)} />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsTab data={settings.integrations} onChange={(d) => updateSection('integrations', d)} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default DeliverySettings;
