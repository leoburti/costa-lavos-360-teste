import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Plus, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  getClientesComodato, 
  updateAptoComodato, 
  syncClientesComodatoFromBdClInv,
  autoMarkAptoComodato 
} from '@/services/apoioSyncService';

const ClientesComodatoPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientesComodato(statusFilter);
      setClientes(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar clientes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const runInitialSyncAndFetch = useCallback(async () => {
    setSyncing(true);
    setLoading(true);
    toast({
      title: 'Sincronizando clientes...',
      description: 'Buscando e atualizando a lista de clientes. Por favor, aguarde.',
    });
    try {
      // 1. Sync clients from external source/inventory
      const result = await syncClientesComodatoFromBdClInv();
      if (result.error) {
        throw new Error(result.error);
      }

      // 2. Auto-mark clients as "Apto" if they exist in inventory
      const autoMarkResult = await autoMarkAptoComodato();
      
      if (!autoMarkResult.success) {
        console.warn('Aviso na marcação automática:', autoMarkResult.message);
        // Inform user about partial success if auto-mark fails (e.g. timeout)
        toast({
            title: 'Sincronização Parcial',
            description: `Clientes sincronizados, mas a verificação de aptidão automática falhou: ${autoMarkResult.message}. Tente recarregar.`,
            variant: 'warning'
        });
      } else {
        toast({
            title: 'Sincronização Concluída',
            description: `${result.processed || 0} clientes processados. ${autoMarkResult.updated_count || 0} marcados como aptos.`,
            variant: 'success'
        });
      }

    } catch (error) {
      toast({
        title: 'Erro na Sincronização',
        description: `Não foi possível sincronizar os clientes. Exibindo dados locais. Erro: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
      await fetchData();
    }
  }, [fetchData, toast]);

  useEffect(() => {
    runInitialSyncAndFetch();
  }, [runInitialSyncAndFetch]);

  const handleAptoComodatoChange = async (clienteId, newValue) => {
    const originalValue = clientes.find(c => c.id === clienteId)?.apto_comodato;

    setClientes(prevClientes =>
      prevClientes.map(c =>
        c.id === clienteId ? { ...c, apto_comodato: newValue } : c
      )
    );

    const { success, message } = await updateAptoComodato(clienteId, newValue);
    toast({
      title: success ? 'Status atualizado' : 'Erro ao atualizar',
      description: message,
      variant: success ? 'default' : 'destructive',
    });

    if (!success) {
      setClientes(prevClientes =>
        prevClientes.map(c =>
          c.id === clienteId ? { ...c, apto_comodato: originalValue } : c
        )
      );
    }
  };

  // Deduplicação no nível do componente (Garantia extra)
  const uniqueClientes = useMemo(() => {
    const map = new Map();
    clientes.forEach(c => {
        const key = (c.nome_fantasia || c.razao_social || '').trim().toLowerCase();
        if (!key) return;
        
        if (!map.has(key)) {
            map.set(key, c);
        } else {
            // Se houver duplicata no estado, mantém o mais recente (ou o primeiro se sem data)
            const existing = map.get(key);
            const existingDate = existing.data_atualizacao ? new Date(existing.data_atualizacao).getTime() : 0;
            const currentDate = c.data_atualizacao ? new Date(c.data_atualizacao).getTime() : 0;
            
            if (currentDate > existingDate) {
                map.set(key, c);
            }
        }
    });
    return Array.from(map.values()).sort((a, b) => {
        const nameA = (a.nome_fantasia || a.razao_social || '').toLowerCase();
        const nameB = (b.nome_fantasia || b.razao_social || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });
  }, [clientes]);

  const filteredClientes = useMemo(() => {
    return uniqueClientes.filter(cliente =>
      (cliente.nome_fantasia?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (cliente.razao_social?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (cliente.cnpj?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [uniqueClientes, searchTerm]);

  const getStatusVariant = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'ativo') return 'success';
    if (statusLower === 'inativo') return 'outline';
    return 'destructive';
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="container mx-auto p-6 bg-background text-foreground">
      <Helmet>
        <title>Clientes em Comodato - Apoio</title>
        <meta name="description" content="Gerencie os clientes em regime de comodato." />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Clientes em Comodato</h1>
          {(loading || syncing) && <RefreshCw className="h-6 w-6 animate-spin text-primary" />}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/apoio/comodato/clientes/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={loading || syncing}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading || syncing}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status do Contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(loading || syncing) ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Status Contrato</TableHead>
                <TableHead className="text-center">Apto Comodato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      <Link to={`/apoio/comodato/clientes/${cliente.id}/estoque`} className="hover:underline text-primary">
                        {cliente.nome_fantasia || cliente.razao_social}
                      </Link>
                    </TableCell>
                    <TableCell>{cliente.cnpj}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(cliente.status_contrato)}>
                        {formatStatus(cliente.status_contrato)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <ThumbsDown className={`h-5 w-5 text-red-400 ${!cliente.apto_comodato ? 'text-red-600 font-bold' : ''}`} />
                        <Switch
                          checked={cliente.apto_comodato}
                          onCheckedChange={(checked) => handleAptoComodatoChange(cliente.id, checked)}
                          aria-label="Apto para comodato"
                        />
                        <ThumbsUp className={`h-5 w-5 text-green-400 ${cliente.apto_comodato ? 'text-green-600 font-bold' : ''}`} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/apoio/comodato/clientes/${cliente.id}/editar`}>
                        <Button variant="outline" size="sm">Editar</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        Nenhum cliente encontrado.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ClientesComodatoPage;