
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wrench, Package, History, ClipboardList, ArrowLeft } from 'lucide-react';

import EquipmentInventoryList from '@/components/manutencao/EquipmentInventoryList';
import EquipmentList from '@/components/manutencao/EquipmentList';
import EquipmentHistory from '@/components/manutencao/EquipmentHistory';
import MaintenanceForm from '@/components/manutencao/MaintenanceForm';

const ManutencaoEquipamentosPage = () => {
  const [activeTab, setActiveTab] = useState('inventario');
  const [selectedEquipmentForMaintenance, setSelectedEquipmentForMaintenance] = useState(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const handleStartMaintenance = (equipment) => {
    setSelectedEquipmentForMaintenance(equipment);
    setShowMaintenanceForm(true);
  };

  const handleMaintenanceSuccess = () => {
    setShowMaintenanceForm(false);
    setSelectedEquipmentForMaintenance(null);
    // Switch to history tab to show the new record
    setActiveTab('historico');
  };

  const handleCancelMaintenance = () => {
    setShowMaintenanceForm(false);
    setSelectedEquipmentForMaintenance(null);
  };

  if (showMaintenanceForm) {
    return (
      <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
        <Helmet><title>Nova Manutenção - Apoio</title></Helmet>
        
        {/* Header for Form View */}
        <div className="flex items-center gap-4 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancelMaintenance}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Nova Solicitação</h1>
        </div>

        <div className="max-w-5xl mx-auto">
          <MaintenanceForm 
            equipmentToEdit={selectedEquipmentForMaintenance} 
            onSaveSuccess={handleMaintenanceSuccess}
            onCancel={handleCancelMaintenance}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <Helmet><title>Manutenção de Equipamentos - Apoio</title></Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manutenção de Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie o inventário, catálogo e ordens de serviço de manutenção.</p>
        </div>
        <Button 
          onClick={() => setShowMaintenanceForm(true)} 
          className="bg-primary hover:bg-primary/90 shadow-sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Manutenção
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white p-1 border rounded-lg shadow-sm h-auto flex flex-wrap">
          <TabsTrigger value="inventario" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
            <ClipboardList className="h-4 w-4" /> Inventário em Campo
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
            <Package className="h-4 w-4" /> Catálogo de Equipamentos
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
            <History className="h-4 w-4" /> Histórico de Manutenções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventario" className="space-y-4 animate-in fade-in-50">
          <EquipmentInventoryList onStartMaintenance={handleStartMaintenance} />
        </TabsContent>

        <TabsContent value="catalogo" className="space-y-4 animate-in fade-in-50">
          <EquipmentList />
        </TabsContent>

        <TabsContent value="historico" className="space-y-4 animate-in fade-in-50">
          <EquipmentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManutencaoEquipamentosPage;
