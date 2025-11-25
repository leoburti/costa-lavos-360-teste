
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Search, Building, CheckCircle, Users, PanelLeft, PanelLeftOpen, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import RelationshipDashboard from '@/components/crm/RelationshipDashboard';
import ContactForm from '@/components/crm/ContactForm';

const NewContactDialog = ({ open, onOpenChange, onSave }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Relacionamento</DialogTitle>
                    <DialogDescription>Adicione um novo contato para iniciar o relacionamento.</DialogDescription>
                </DialogHeader>
                <ContactForm 
                    onSaveSuccess={(data) => {
                        onSave(data);
                        onOpenChange(false);
                    }} 
                />
            </DialogContent>
        </Dialog>
    );
};

const ContactSelector = ({ contacts, onSelect, currentSelection, loading, onNewContact, className }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

    const filteredContacts = useMemo(() => {
        if (!searchTerm) return contacts;
        const lowerTerm = searchTerm.toLowerCase();
        return contacts.filter(c => 
            (c.fantasy_name && c.fantasy_name.toLowerCase().includes(lowerTerm)) ||
            (c.corporate_name && c.corporate_name.toLowerCase().includes(lowerTerm))
        );
    }, [contacts, searchTerm]);

    return (
        <div className={cn("bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 w-full shrink-0", className)}>
            <div className="p-4 space-y-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Contatos
                    </h2>
                    <Button size="sm" onClick={() => setIsNewDialogOpen(true)} className="h-8 px-2 shadow-sm">
                        <Plus className="h-4 w-4 mr-1" /> Novo
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="h-9 pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-2">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-40 p-8 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                            <span className="text-xs">Carregando lista...</span>
                        </div>
                    ) : filteredContacts.length > 0 ? (
                        <div className="space-y-1">
                            {filteredContacts.map(contact => {
                                const isSelected = currentSelection === contact.id;
                                return (
                                    <button
                                        key={contact.id}
                                        onClick={() => onSelect(contact.id)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 group border",
                                            isSelected 
                                                ? 'bg-primary/5 border-primary/30 shadow-sm ring-1 ring-primary/20' 
                                                : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors text-sm font-bold", 
                                            isSelected ? "bg-primary text-primary-foreground shadow-md" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm"
                                        )}>
                                            {contact.fantasy_name ? contact.fantasy_name.substring(0, 2).toUpperCase() : <Building className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={cn("font-semibold text-sm truncate leading-tight", isSelected ? "text-primary" : "text-slate-700")}>
                                                {contact.fantasy_name || 'Sem Nome'}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate mt-0.5">
                                                {contact.corporate_name || 'Sem Razão Social'}
                                            </div>
                                        </div>
                                        {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0 animate-in fade-in zoom-in" />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-slate-400 p-8 py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 m-2">
                            {searchTerm ? "Nenhum contato encontrado." : "Sua lista está vazia."}
                        </div>
                    )}
                </div>
            </ScrollArea>
            
            <NewContactDialog 
                open={isNewDialogOpen} 
                onOpenChange={setIsNewDialogOpen} 
                onSave={async (data) => {
                    await onNewContact(data);
                }}
            />
        </div>
    );
};

const PlaceholderMessage = ({ onToggleSidebar }) => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/30 animate-in fade-in duration-500 relative">
        {/* Toggle button for when sidebar is closed but no contact is selected (desktop edge case) */}
        {onToggleSidebar && (
            <div className="absolute top-4 left-4">
                <Button variant="outline" size="sm" onClick={onToggleSidebar} className="gap-2">
                    <PanelLeft className="h-4 w-4" />
                    Mostrar Contatos
                </Button>
            </div>
        )}
        
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl transform scale-150"></div>
            <div className="relative h-24 w-24 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-slate-50">
                <Users className="h-10 w-10 text-primary" />
            </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Selecione um Relacionamento</h3>
        <p className="text-slate-500 max-w-md leading-relaxed">
            Escolha um contato na lista lateral para visualizar o dashboard completo, histórico de interações e oportunidades comerciais.
        </p>
    </div>
);

const CommercialRelationship = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('crm_contacts')
                .select('id, fantasy_name, corporate_name')
                .order('fantasy_name');
            if (error) throw error;
            setContacts(data || []);
        } catch (error) {
            console.error("Fetch contacts error:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar a lista de contatos.' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleNewContact = async () => {
        await fetchContacts();
        toast({ title: 'Lista atualizada', description: 'Novos contatos disponíveis.' });
    };

    const handleDeleteContact = async (id) => {
        try {
            const { error } = await supabase.from('crm_contacts').delete().eq('id', id);
            if (error) throw error;

            toast({ title: 'Sucesso', description: 'Relacionamento excluído.' });
            setSelectedContact(null);
            setIsSidebarOpen(true); // Reopen list if contact deleted
            fetchContacts();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao excluir', description: 'Verifique se existem dados vinculados.' });
        }
    };

    const handleSelectContact = (id) => {
        setSelectedContact(id);
        // Auto hide sidebar on selection for better focus
        // On mobile it's mandatory, on desktop it's a good focus mode
        setIsSidebarOpen(false); 
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <>
            <Helmet>
                <title>Relacionamento Comercial - CRM</title>
                <meta name="description" content="Gerencie interações e histórico comercial de seus clientes." />
            </Helmet>
            <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-slate-100 dark:bg-black relative">
                
                {/* Sidebar Container */}
                <div 
                    className={cn(
                        "transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30",
                        // Mobile: Absolute, full width/height
                        "absolute inset-0 md:relative md:inset-auto",
                        // Visibility Control
                        isSidebarOpen 
                            ? "translate-x-0 w-full md:w-[350px] md:translate-x-0" 
                            : "-translate-x-full w-full md:w-0 md:translate-x-0 md:overflow-hidden md:border-r-0 opacity-0 md:opacity-100" 
                            // opacity-0 on mobile when hidden to prevent interaction, though translate should handle it
                    )}
                >
                    <ContactSelector 
                        contacts={contacts} 
                        onSelect={handleSelectContact} 
                        currentSelection={selectedContact} 
                        loading={loading} 
                        onNewContact={handleNewContact}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 h-full overflow-hidden relative bg-white dark:bg-slate-900 shadow-2xl md:rounded-tl-[2rem] border-l border-slate-200/50 ml-[-1px] z-10">
                    {selectedContact ? (
                        <RelationshipDashboard 
                            key={selectedContact} 
                            contactId={selectedContact} 
                            onDeleteContact={handleDeleteContact}
                            onToggleSidebar={toggleSidebar}
                            isSidebarOpen={isSidebarOpen}
                        />
                    ) : (
                        <PlaceholderMessage 
                            onToggleSidebar={!isSidebarOpen ? toggleSidebar : null}
                        />
                    )}
                </main>
            </div>
        </>
    );
};

export default CommercialRelationship;
