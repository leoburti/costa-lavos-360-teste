import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, FileText, Loader2 } from "lucide-react";
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import ComodatoContract from '@/components/crm/ComodatoContract';

const ComodatoContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_comodato_contracts')
        .select(`
          id,
          created_at,
          contract_data,
          contact:crm_contacts(corporate_name),
          deal:crm_deals(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contratos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchContracts();
    return () => abortController.abort();
  }, [fetchContracts]);

  const handleContractCreated = () => {
    setIsFormOpen(false);
    fetchContracts();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Contratos de Comodato</h2>
          <p className="text-muted-foreground mt-1">Gerencie os contratos gerados para seus clientes.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Contrato
        </Button>
      </div>

      {isFormOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>Gerar Novo Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <ComodatoContract onCancel={() => setIsFormOpen(false)} onSuccess={handleContractCreated} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Oportunidade</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum contrato encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contact?.corporate_name || 'N/A'}</TableCell>
                        <TableCell>{contract.deal?.title || 'N/A'}</TableCell>
                        <TableCell>{new Date(contract.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" /> Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComodatoContracts;