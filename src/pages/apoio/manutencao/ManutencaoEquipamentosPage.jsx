
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wrench, Plus, Filter, Search, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MaintenanceForm from '@/components/manutencao/MaintenanceForm';

const ManutencaoEquipamentosPage = () => {
  const [activeTab, setActiveTab] = useState('preventiva');
  const [loading, setLoading] = useState(true);
  const [maintenances, setMaintenances] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  // Fixed: Memoized fetch function with minimal dependencies to prevent infinite loops
  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select(`
          id,
          data_inicio,
          status,
          tipo,
          tecnico,
          equipment:equipment_id(nome, serial)
        `)
        .eq('tipo', activeTab)
        .order('data_inicio', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMaintenances(data || []);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      // Avoid calling toast here if possible to prevent potential loops if toast is unstable
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const handleSaveSuccess = useCallback(() => {
    setIsFormOpen(false);
    fetchMaintenances();
    toast({ title: "Sucesso", description: "Manutenção registrada com sucesso." });
  }, [fetchMaintenances, toast]);

  if (isFormOpen) {
    return (
      <div className="p-6 pb-20 animate-in fade-in duration-500">
         <MaintenanceForm 
            onCancel={() => setIsFormOpen(false)} 
            onSaveSuccess={handleSaveSuccess}
         />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20 animate-in fade-in duration-500">
      <Helmet>
        <title>Manutenção de Equipamentos | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Wrench className="h-8 w-8 text-primary" />
            Manutenção de Equipamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as manutenções preventivas e corretivas da frota.
          </p>
        </div>
        <Button className="shadow-sm" onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Manutenção
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="preventiva">Preventiva</TabsTrigger>
          <TabsTrigger value="corretiva">Corretiva</TabsTrigger>
        </TabsList>
        
        <Card className="border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por serial ou técnico..." className="pl-9 bg-white" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="icon" className="bg-white">
                        <Filter className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            <div className="relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-semibold">Equipamento</TableHead>
                            <TableHead className="font-semibold">Data Início</TableHead>
                            <TableHead className="font-semibold">Técnico</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="text-right font-semibold">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {maintenances.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertTriangle className="h-8 w-8 text-slate-300" />
                                        <p>Nenhuma manutenção encontrada para este filtro.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            maintenances.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{item.equipment?.nome || 'Equipamento Desconhecido'}</div>
                                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.equipment?.serial || 'S/N'}</div>
                                    </TableCell>
                                    <TableCell>
                                        {item.data_inicio ? new Date(item.data_inicio).toLocaleDateString('pt-BR') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {item.tecnico ? item.tecnico.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="text-sm">{item.tecnico || 'Não atribuído'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="outline" 
                                            className={
                                                item.status === 'concluido' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                item.status === 'em_andamento' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-slate-100 text-slate-700 border-slate-200'
                                            }
                                        >
                                            {item.status ? item.status.replace('_', ' ') : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-primary">
                                            Detalhes
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
      </Tabs>
    </div>
  );
};

export default ManutencaoEquipamentosPage;
