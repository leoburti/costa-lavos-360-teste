import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, RefreshCw, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EquipmentForm from './EquipmentForm';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();
  const [totalCount, setTotalCount] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);

  const fetchEquipment = useCallback(async (isManualRefresh = false) => {
    setLoading(true);

    try {
      let query = supabase
        .from('equipment')
        .select(`
          id, nome, modelo, fabricante, ativo_fixo, serial, local, status,
          family_id,
          equipment_families ( nome )
        `, { count: 'exact' })
        .order('nome', { ascending: true })
        .limit(100); // Limit to prevent large payload issues

      if (debouncedSearchTerm) {
        const orFilter = `nome.ilike.%${debouncedSearchTerm}%,ativo_fixo.ilike.%${debouncedSearchTerm}%,serial.ilike.%${debouncedSearchTerm}%,equipment_families.nome.ilike.%${debouncedSearchTerm}%`;
        query = query.or(orFilter);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setEquipment(data);
      setTotalCount(count);

      if (isManualRefresh) {
        toast({ title: "Lista atualizada!", description: `${count} equipamentos encontrados.` });
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({ variant: 'destructive', title: 'Erro ao buscar equipamentos', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast, debouncedSearchTerm]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleOpenForm = (equip = null) => {
    setCurrentEquipment(equip);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentEquipment(null);
  };
  
  const handleSaveSuccess = () => {
    handleCloseForm();
    fetchEquipment();
  };

  const handleDelete = async (equipmentId) => {
    const { error } = await supabase.from('equipment').delete().eq('id', equipmentId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir equipamento', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Equipamento excluído.' });
      fetchEquipment();
    }
  };

  const statusVariant = (status) => {
    switch (status) {
      case 'ativo': return 'success';
      case 'inativo': return 'destructive';
      case 'em_manutencao': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex sm:flex-row flex-col sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Catálogo de Equipamentos</CardTitle>
                <CardDescription>
                    {loading ? 'Carregando equipamentos...' : `Exibindo ${equipment.length} de ${totalCount} registros.`}
                </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchEquipment(true)} disabled={loading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
              </Button>
              <Button size="sm" onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar ao Catálogo
              </Button>
            </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, família, ativo fixo ou serial..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Família</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
              ) : equipment.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">{debouncedSearchTerm ? `Nenhum equipamento para "${debouncedSearchTerm}".` : "Nenhum equipamento encontrado."}</TableCell></TableRow>
              ) : (
                equipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="font-bold">{item.nome}</div>
                      <div className="text-xs text-muted-foreground">Ativo: {item.ativo_fixo || 'N/A'} | Serial: {item.serial || 'N/A'}</div>
                    </TableCell>
                    <TableCell>{item.equipment_families?.nome || 'N/A'}</TableCell>
                    <TableCell><Badge variant={statusVariant(item.status)}>{item.status || 'N/A'}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="icon" onClick={() => handleOpenForm(item)}><Edit className="h-4 w-4" /></Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação excluirá o equipamento "{item.nome}" do catálogo. Manutenções associadas não serão excluídas. Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {isFormOpen && <EquipmentForm equipment={currentEquipment} onSave={handleSaveSuccess} onCancel={handleCloseForm} />}
      </CardContent>
    </Card>
  );
};

export default EquipmentList;