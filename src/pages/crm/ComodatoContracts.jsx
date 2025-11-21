import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, FileText, Printer, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import ComodatoContract from '@/components/crm/ComodatoContract';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ComodatoContracts = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const { toast } = useToast();
    const contractRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => contractRef.current,
    });

    const fetchContracts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('crm_comodato_contracts')
            .select(`
                id,
                created_at,
                deal_id,
                contract_data,
                crm_contacts (fantasy_name),
                crm_deals (title)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar contratos', description: error.message });
        } else {
            setContracts(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const viewContract = (contract) => {
        const dealData = {
            ...contract.crm_deals,
            crm_contacts: contract.contract_data.client
        };
        setSelectedContract(dealData);
        setIsViewModalOpen(true);
    };

    const handleDeleteContract = async (contractId) => {
        const { error } = await supabase.from('crm_comodato_contracts').delete().eq('id', contractId);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao deletar contrato', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Contrato deletado.' });
            fetchContracts();
        }
    };

    return (
        <>
            <Helmet>
                <title>Contratos de Comodato - CRM</title>
                <meta name="description" content="Gerencie os contratos de comodato gerados." />
            </Helmet>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Contratos de Comodato</h1>
                
                <div className="border rounded-lg">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data de Geração</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Negócio</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contracts.length > 0 ? (
                                    contracts.map(contract => (
                                        <TableRow key={contract.id}>
                                            <TableCell>{format(new Date(contract.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                                            <TableCell>{contract.crm_contacts?.fantasy_name}</TableCell>
                                            <TableCell>{contract.crm_deals?.title}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => viewContract(contract)}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Visualizar
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Deletar
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta ação não pode ser desfeita. Isso irá deletar permanentemente o registro do contrato.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteContract(contract.id)}>
                                                                Deletar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">Nenhum contrato encontrado.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>Visualizar Contrato de Comodato</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                        <ComodatoContract deal={selectedContract} ref={contractRef} />
                    </div>
                    <DialogFooter className="p-4 border-t bg-muted/40">
                        <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ComodatoContracts;