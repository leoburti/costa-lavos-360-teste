import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wrench, Package, History, ClipboardList } from 'lucide-react';

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
    // Optionally refresh lists or switch to history tab
    setActiveTab('historico');
  };

  const handleCancelMaintenance = () => {
    setShowMaintenanceForm(false);
    setSelectedEquipmentForMaintenance(null);
  };

  if (showMaintenanceForm) {
    return (
      <div className="p-6 space-y-6">
        <Helmet><title>Nova Manutenção - Apoio</title></Helmet>
        <MaintenanceForm 
          equipmentToEdit={selectedEquipmentForMaintenance} 
          onSaveSuccess={handleMaintenanceSuccess}
          onCancel={handleCancelMaintenance}
        />
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
        <Button onClick={() => setShowMaintenanceForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Manutenção
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white p-1 border rounded-lg shadow-sm h-auto flex flex-wrap">
          <TabsTrigger value="inventario" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Inventário em Campo
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Catálogo de Equipamentos
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Histórico de Manutenções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventario" className="space-y-4">
          <EquipmentInventoryList onStartMaintenance={handleStartMaintenance} />
        </TabsContent>

        <TabsContent value="catalogo" className="space-y-4">
          <EquipmentList />
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <EquipmentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManutencaoEquipamentosPage;