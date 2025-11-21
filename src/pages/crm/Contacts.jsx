import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Search, Building, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ContactForm from '@/components/crm/ContactForm';

const ContactDetailsDialog = ({ contact, open, onOpenChange, onContactUpdated }) => {
    if (!contact) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{contact.fantasy_name}</DialogTitle>
                    <DialogDescription>{contact.corporate_name}</DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
                   <ContactForm contactData={contact} onSaveSuccess={() => { onOpenChange(false); onContactUpdated(); }} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

const CRMContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const { toast } = useToast();

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('crm_contacts').select('*').order('created_at', { ascending: false });
        if (searchTerm) {
            query = query.or(`corporate_name.ilike.%${searchTerm}%,fantasy_name.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%,representative_name.ilike.%${searchTerm}%`);
        }
        const { data, error } = await query;

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar contatos', description: error.message });
        } else {
            setContacts(data);
        }
        setLoading(false);
    }, [toast, searchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchContacts();
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm, fetchContacts]);

    const handleRowClick = (contact) => {
        setSelectedContact(contact);
        setIsDetailsOpen(true);
    };
    
    const handleDeleteContact = async (contactId) => {
        const { error } = await supabase.from('crm_contacts').delete().eq('id', contactId);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao deletar contato', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Contato deletado.' });
            fetchContacts();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <Helmet>
                <title>Contatos - CRM</title>
                <meta name="description" content="Gerencie seus contatos e clientes." />
            </Helmet>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestão de Contatos</h2>
                    <p className="text-muted-foreground">Centralize e gerencie as informações dos seus clientes.</p>
                </div>
                <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Novo Contato
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Contato (PJ)</DialogTitle>
                            <DialogDescription>Insira as informações da empresa.</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
                            <ContactForm onSaveSuccess={() => { setIsAddContactOpen(false); fetchContacts(); }} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome, razão social, CNPJ ou representante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-96 bg-background"
                />
            </div>

            <div className="flex-1 overflow-auto border rounded-lg">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0">
                            <TableRow>
                                <TableHead>Nome Fantasia</TableHead>
                                <TableHead>Razão Social</TableHead>
                                <TableHead>CNPJ</TableHead>
                                <TableHead>Contato Principal</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contacts.length > 0 ? (
                                contacts.map(contact => (
                                    <TableRow key={contact.id} onClick={() => handleRowClick(contact)} className="cursor-pointer hover:bg-muted/20">
                                        <TableCell className="font-medium py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border">
                                                    <Building className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                {contact.fantasy_name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground py-3">{contact.corporate_name || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground py-3">{contact.cnpj || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{contact.representative_name}</span>
                                                <span className="text-xs">{contact.representative_email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-3" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleRowClick(contact)}>Ver / Editar</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteContact(contact.id)}>Deletar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        Nenhum contato encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
            <ContactDetailsDialog contact={selectedContact} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} onContactUpdated={fetchContacts} />
        </div>
    );
};

export default CRMContacts;