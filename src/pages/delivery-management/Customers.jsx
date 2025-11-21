import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CustomersManagement = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRows, setEditingRows] = useState({});

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('bd-cl')
        .select('ID, Nome, "N Fantasia", rota, saldo_caixas, usa_caixas, Cliente, Loja, "Nome Grp Cliente"')
        .not('"Nome Grp Cliente"', 'eq', 'FUNCIONARIOS')
        .order('"N Fantasia"', { ascending: true, nullsFirst: false });

      if (clientsError) throw clientsError;

      const uniqueClients = Array.from(new Map(clientsData.map(item => [item.Cliente + item.Loja, item])).values())
        .map(client => ({
            ...client,
            nome: client['N Fantasia'] || client.Nome,
            id: `${client.Cliente}-${client.Loja}`
        }));

      const { data: routesData, error: routesError } = await supabase
        .from('rotas')
        .select('id, nome')
        .order('nome', { ascending: true });
        
      if (routesError) throw routesError;
      
      setClients(uniqueClients);
      setRoutes(routesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar dados',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const filteredClients = useMemo(() => {
    if (!debouncedSearchTerm) {
      return clients;
    }
    return clients.filter(client =>
      client.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [clients, debouncedSearchTerm]);

  const handleInputChange = (clientId, field, value) => {
    setEditingRows(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        [field]: value,
      }
    }));
  };

  const handleSave = async (clientId) => {
    const editedData = editingRows[clientId];
    if (!editedData) return;

    setLoading(true);
    try {
      const currentClient = clients.find(c => c.id === clientId);
      const updatePayload = {};

      if (editedData.rota !== undefined && editedData.rota !== currentClient.rota) {
        updatePayload.rota = editedData.rota;
      }
      if (editedData.saldo_caixas !== undefined && String(editedData.saldo_caixas) !== String(currentClient.saldo_caixas)) {
        updatePayload.saldo_caixas = parseInt(editedData.saldo_caixas, 10);
      }
      if (editedData.usa_caixas !== undefined && editedData.usa_caixas !== currentClient.usa_caixas) {
        updatePayload.usa_caixas = editedData.usa_caixas;
      }

      if (Object.keys(updatePayload).length === 0) {
        toast({ title: 'Nenhuma alteração para salvar.' });
        setEditingRows(prev => {
            const newEditingRows = { ...prev };
            delete newEditingRows[clientId];
            return newEditingRows;
        });
        setLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('bd-cl')
        .update(updatePayload)
        .eq('Cliente', currentClient.Cliente)
        .eq('Loja', currentClient.Loja);

      if (error) throw error;

      toast({ title: `Cliente ${currentClient.nome} atualizado com sucesso!` });
      
      setClients(prevClients => prevClients.map(c => 
        c.id === clientId ? { ...c, ...updatePayload } : c
      ));
      setEditingRows(prev => {
          const newEditingRows = { ...prev };
          delete newEditingRows[clientId];
          return newEditingRows;
      });

    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar cliente',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Gerenciamento de Clientes</title>
        <meta name="description" content="Página para gerenciamento de clientes da logística." />
      </Helmet>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Gerenciamento de Clientes</CardTitle>
                <CardDescription>Visualize e edite as configurações logísticas dos seus clientes.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && clients.length === 0 ? (
               <div className="flex h-64 items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead className="text-center">Saldo de Caixas</TableHead>
                    <TableHead className="text-center">Usa Caixas?</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const isEditing = !!editingRows[client.id];
                    const currentData = {
                        rota: client.rota,
                        saldo_caixas: client.saldo_caixas,
                        usa_caixas: client.usa_caixas,
                        ...editingRows[client.id]
                    }

                    return (
                    <TableRow key={client.id} className={isEditing ? "bg-accent/50" : ""}>
                      <TableCell className="font-medium">{client.nome}</TableCell>
                      <TableCell>
                        <Select
                          value={currentData.rota || ''}
                          onValueChange={(value) => handleInputChange(client.id, 'rota', value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sem rota" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value={null}>Sem rota</SelectItem>
                             {routes.map(route => (
                                <SelectItem key={route.id} value={route.nome}>{route.nome}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={currentData.saldo_caixas ?? ''}
                          onChange={(e) => handleInputChange(client.id, 'saldo_caixas', e.target.value)}
                          className="w-24 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                         <div className="flex justify-center items-center h-full">
                            <Switch
                                checked={!!currentData.usa_caixas}
                                onCheckedChange={(checked) => handleInputChange(client.id, 'usa_caixas', checked)}
                            />
                         </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSave(client.id)}
                          disabled={!isEditing || loading}
                          variant={isEditing ? 'success' : 'ghost'}
                        >
                          {loading && isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          <span className="ml-2">Salvar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
            )}
            {filteredClients.length === 0 && !loading && (
                 <div className="text-center p-8 text-muted-foreground">
                    Nenhum cliente encontrado com os filtros atuais.
                 </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CustomersManagement;