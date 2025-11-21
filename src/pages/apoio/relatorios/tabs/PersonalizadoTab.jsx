import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Trash2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apoioRelatoriosService } from '@/services/apoioRelatoriosService';
import { exportToPDF } from '@/utils/geoExportUtils';
import ChamadosTab from './ChamadosTab';
import TecnicosTab from './TecnicosTab';
import EquipamentosTab from './EquipamentosTab';

export default function PersonalizadoTab({ dashboardData }) {
  const { toast } = useToast();
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState(null);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [loading, setLoading] = useState(false);

  const availableWidgets = [
    { id: 'chamados_evolucao', label: 'Evolução Diária de Chamados', component: ChamadosTab, dataKey: 'chamados' },
    { id: 'chamados_status', label: 'Chamados por Status', component: ChamadosTab, dataKey: 'chamados' },
    { id: 'tecnicos_produtividade', label: 'Produtividade da Equipe', component: TecnicosTab, dataKey: 'tecnicos' },
    { id: 'equipamentos_status', label: 'Status Geral dos Equipamentos', component: EquipamentosTab, dataKey: 'equipamentos' },
  ];

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      const data = await apoioRelatoriosService.getDashboardsPersonalizados();
      setDashboards(data || []);
    } catch (error) {
      console.error("Erro ao carregar dashboards", error);
    }
  };

  const handleSaveDashboard = async () => {
    if (!newDashboardName) {
      toast({ variant: "destructive", title: "Erro", description: "Nome do dashboard é obrigatório." });
      return;
    }
    if (selectedWidgets.length === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione pelo menos um widget." });
      return;
    }

    setLoading(true);
    try {
      await apoioRelatoriosService.salvarDashboardPersonalizado(newDashboardName, selectedWidgets);
      toast({ title: "Sucesso", description: "Dashboard salvo com sucesso!" });
      setNewDashboardName('');
      loadDashboards();
    } catch (error) {
      console.error("Erro ao salvar dashboard", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar dashboard." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDashboard = async () => {
    if (!selectedDashboardId) return;
    
    setLoading(true);
    try {
      await apoioRelatoriosService.deletarDashboardPersonalizado(selectedDashboardId);
      toast({ title: "Sucesso", description: "Dashboard excluído com sucesso!" });
      setSelectedDashboardId(null);
      setSelectedWidgets([]);
      loadDashboards();
    } catch (error) {
      console.error("Erro ao deletar dashboard", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir dashboard." });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDashboard = (id) => {
    const dash = dashboards.find(d => d.id === id);
    if (dash) {
      setSelectedDashboardId(id);
      setSelectedWidgets(dash.widgets || []);
    }
  };

  const toggleWidget = (widgetId) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) ? prev.filter(id => id !== widgetId) : [...prev, widgetId]
    );
  };

  const handleExport = () => {
    exportToPDF(`Dashboard Personalizado - ${newDashboardName || 'Export'}`, ['Widget'], selectedWidgets.map(w => [w]));
    toast({ title: "Exportação", description: "Exportação iniciada." });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Dashboards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3 space-y-2">
              <Label>Carregar Dashboard Salvo</Label>
              <Select value={selectedDashboardId} onValueChange={handleLoadDashboard}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {dashboards.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.nome_dashboard}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDeleteDashboard} disabled={!selectedDashboardId || loading}>
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={selectedWidgets.length === 0}>
                <Download className="w-4 h-4 mr-2" /> Exportar
              </Button>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <Label className="mb-2 block">Criar Novo / Editar</Label>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <Input 
                  placeholder="Nome do Dashboard" 
                  value={newDashboardName} 
                  onChange={(e) => setNewDashboardName(e.target.value)} 
                />
              </div>
              <Button onClick={handleSaveDashboard} disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> Salvar Layout
              </Button>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <Label className="mb-4 block">Selecione os Gráficos (Widgets)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableWidgets.map(widget => (
                <div key={widget.id} className="flex items-center space-x-2 border p-3 rounded-md">
                  <Checkbox 
                    id={widget.id} 
                    checked={selectedWidgets.includes(widget.id)}
                    onCheckedChange={() => toggleWidget(widget.id)}
                  />
                  <Label htmlFor={widget.id} className="cursor-pointer">{widget.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Visualização</h3>
        {selectedWidgets.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhum widget selecionado. Selecione acima para visualizar.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {selectedWidgets.map(widgetId => {
              const widgetDef = availableWidgets.find(w => w.id === widgetId);
              if (!widgetDef) return null;
              
              const Component = widgetDef.component;
              const data = dashboardData[widgetDef.dataKey];

              return (
                <div key={widgetId} className="border rounded-lg p-4 bg-white">
                  <h4 className="font-medium mb-4">{widgetDef.label}</h4>
                  <Component data={data} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}