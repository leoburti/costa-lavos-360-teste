import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, List, Package, History, Warehouse } from 'lucide-react';
import AdminFamilies from '@/components/manutencao/AdminFamilies';
import EquipmentList from '@/components/manutencao/EquipmentList';
import MaintenanceForm from '@/components/manutencao/MaintenanceForm';
import EquipmentHistory from '@/components/manutencao/EquipmentHistory';
import EquipmentInventoryList from '@/components/manutencao/EquipmentInventoryList';
import { useToast } from "@/components/ui/use-toast";

const Manutencao = () => {
  const [activeTab, setActiveTab] = React.useState("registrar");
  const [maintenanceItem, setMaintenanceItem] = React.useState(null);
  const { toast } = useToast();

  const handleSaveSuccess = () => {
    toast({ title: "Sucesso!", description: "Registro de manutenção salvo." });
    setActiveTab("historico");
    setMaintenanceItem(null); // Clear the item after saving
  };
  
  const handleCancel = () => {
    setActiveTab("inventario");
    setMaintenanceItem(null); // Clear the item on cancel
  };

  const handleStartMaintenance = (item) => {
    setMaintenanceItem(item);
    setActiveTab("registrar");
  }

  return (
    <>
      <Helmet>
        <title>Manutenção de Equipamentos - Costa Lavos</title>
        <meta name="description" content="Módulo completo para gestão de manutenção de equipamentos." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manutenção de Equipamentos</h1>
          <p className="text-muted-foreground mt-2">Gerencie famílias, equipamentos, registros de manutenção e histórico.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="registrar"><Wrench className="w-4 h-4 mr-2" />Registrar</TabsTrigger>
            <TabsTrigger value="inventario"><Warehouse className="w-4 h-4 mr-2" />Inventário</TabsTrigger>
            <TabsTrigger value="historico"><History className="w-4 h-4 mr-2" />Histórico</TabsTrigger>
            <TabsTrigger value="equipamentos"><Package className="w-4 h-4 mr-2" />Equipamentos</TabsTrigger>
            <TabsTrigger value="familias"><List className="w-4 h-4 mr-2" />Famílias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registrar" className="mt-6">
            <MaintenanceForm 
                key={maintenanceItem ? maintenanceItem.Chave_ID : 'new'}
                equipmentToEdit={maintenanceItem}
                onSaveSuccess={handleSaveSuccess} 
                onCancel={handleCancel}
            />
          </TabsContent>
          <TabsContent value="inventario" className="mt-6">
            <EquipmentInventoryList onStartMaintenance={handleStartMaintenance} />
          </TabsContent>
          <TabsContent value="historico" className="mt-6">
             <EquipmentHistory />
          </TabsContent>
          <TabsContent value="familias" className="mt-6">
            <AdminFamilies />
          </TabsContent>
          <TabsContent value="equipamentos" className="mt-6">
            <EquipmentList />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Manutencao;