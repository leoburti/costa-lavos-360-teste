import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Send, Trash2, PlusCircle, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import useOnClickOutside from '@/hooks/useOnClickOutside';

const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const NewRequestView = ({ onSuccess }) => {
    console.log("NewRequestView renderizando");
    const { toast } = useToast();
    const { user, userContext } = useAuth();

    // Client Search State
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(clientSearchTerm, 300);
    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [isSearchingClients, setIsSearchingClients] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Ref for detecting outside clicks
    const searchRef = useRef(null);
    useOnClickOutside(searchRef, () => setIsDropdownOpen(false));

    // Selected Client State
    const [selectedClient, setSelectedClient] = useState(null);
    const [loadingClientData, setLoadingClientData] = useState(false);

    // Form Data State
    const [motivo, setMotivo] = useState('');
    const [motivosList, setMotivosList] = useState([]);
    const [allProductsList, setAllProductsList] = useState([]);
    const [clientProductsList, setClientProductsList] = useState([]);
    
    // New Product Entry State
    const [newProduct, setNewProduct] = useState({ id: '', name: '', quantity: 1, price: 0 });
    
    // Added Products State
    const [addedProducts, setAddedProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load initial static data (motives, all products)
    useEffect(() => {
        console.log("NewRequestView: useEffect para carregar dados iniciais.");
        const fetchInitialData = async () => {
            try {
                // Remove a consulta de produtos daqui para evitar timeouts iniciais.
                // A lista de produtos será carregada sob demanda após selecionar um cliente.
                const motivosRes = await supabase.from('motivos_bonificacao').select('id, nome').eq('ativo', true);

                if (motivosRes.error) throw motivosRes.error;
                setMotivosList(motivosRes.data || []);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro ao carregar dados iniciais', description: error.message });
            }
        };
        fetchInitialData();
    }, [toast]);
    
    // Search for similar clients as user types
    useEffect(() => {
        if (debouncedSearchTerm.length < 3) {
            setClientSearchResults([]);
            setIsDropdownOpen(false);
            return;
        }

        console.log("NewRequestView: Buscando clientes com termo:", debouncedSearchTerm);
        const searchClients = async () => {
            setIsSearchingClients(true);
            const { data, error } = await supabase
                .from('bd-cl')
                .select('"Cliente", "Loja", "Nome", "N Fantasia", "Nome Supervisor"')
                .or(`"N Fantasia".ilike.%${debouncedSearchTerm}%, "Nome".ilike.%${debouncedSearchTerm}%`)
                .limit(10);
            
            console.log("Query de busca executada:", {
                from: 'bd-cl',
                select: '"Cliente", "Loja", "Nome", "N Fantasia", "Nome Supervisor"',
                or: `"N Fantasia".ilike.%${debouncedSearchTerm}%, "Nome".ilike.%${debouncedSearchTerm}%`,
            });
            
            if (error) {
                console.error("Erro na busca de clientes:", error);
                toast({ variant: "destructive", title: "Erro na busca", description: error.message });
                setClientSearchResults([]);
                setIsDropdownOpen(false);
            } else {
                console.log("Dados brutos retornados:", data);
                const uniqueClients = Array.from(new Map(data.map(c => 
                    [c['N Fantasia'] || c['Nome'], {
                        codigo: c['Cliente'],
                        loja: c['Loja'],
                        nome: c['Nome'],
                        nome_fantasia: c['N Fantasia'],
                        supervisor: c['Nome Supervisor'],
                    }]
                )).values());
                console.log("Resultados da busca (processados):", uniqueClients);
                setClientSearchResults(uniqueClients);
                setIsDropdownOpen(uniqueClients.length > 0);
            }
            setIsSearchingClients(false);
        };

        searchClients();
    }, [debouncedSearchTerm, toast]);

    const handleSelectClient = async (client) => {
        setIsDropdownOpen(false);
        setClientSearchTerm(client.nome_fantasia || client.nome);
        setSelectedClient(client);
        setLoadingClientData(true);
        setAddedProducts([]);
        setNewProduct({ id: '', name: '', quantity: 1, price: 0 });

        try {
            const requestBody = {
                cliente_codigo: client.codigo,
                cliente_loja: client.loja,
                nome_fantasia: client.nome_fantasia || client.nome, // Adiciona nome_fantasia aqui
            };
            console.log('Invocando get-bonificacao-data com:', requestBody);
            
            const { data, error } = await supabase.functions.invoke('get-bonificacao-data', {
                body: requestBody,
            });
            if (error) throw error;
            
            const clientSpecificProducts = data.produtos || [];
            
            if (clientSpecificProducts.length > 0) {
                 setClientProductsList(clientSpecificProducts);
                 toast({ title: 'Cliente Selecionado!', description: `Dados para ${client.nome_fantasia || client.nome} carregados.` });
            } else {
                 // Se não vier produtos do cliente, busca todos como fallback
                 const { data: allProdsData, error: allProdsError } = await supabase
                    .from('bd-cl')
                    .select('"Produto", "Descricao", "Valor Unitario"')
                    .not('"Produto"', 'is', null)
                    .not('"Descricao"', 'is', null)
                    .limit(1000)
                    .order('"Descricao"', { ascending: true });

                 if (allProdsError) throw allProdsError;
                 
                 const uniqueProducts = Array.from(new Map(allProdsData.map(p => [
                    p['Produto'],
                    { id: p['Produto'], name: p['Descricao'], price: p['Valor Unitario'] || 0 }
                ])).values());
                
                 setClientProductsList(uniqueProducts);
                 setAllProductsList(uniqueProducts);
                 toast({ variant: 'default', title: 'Aviso', description: 'Cliente sem histórico de compras. Exibindo lista geral de produtos.' });
            }

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: error.message });
            setClientProductsList([]); // Limpa em caso de erro
        } finally {
            setLoadingClientData(false);
        }
    };


    const handleProductSelect = (productId) => {
        const product = clientProductsList.find(p => String(p.id) === String(productId));
        if (product) {
            setNewProduct({ id: product.id, name: product.name, price: product.price || 0, quantity: 1 });
        }
    };

    const handleAddProduct = () => {
        if (!newProduct.id) {
            toast({ variant: 'destructive', title: 'Selecione um produto' });
            return;
        }
        if (addedProducts.some(p => p.id === newProduct.id)) {
            toast({ variant: 'warning', title: 'Produto já adicionado' });
            return;
        }
        setAddedProducts(prev => [...prev, { ...newProduct }]);
        setNewProduct({ id: '', name: '', quantity: 1, price: 0 });
    };

    const handleRemoveProduct = (productId) => {
        setAddedProducts(prev => prev.filter(p => p.id !== productId));
    };
    
    const totalBonification = useMemo(() => {
        return addedProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    }, [addedProducts]);

    const handleSubmit = async () => {
        if (!motivo || !selectedClient || addedProducts.length === 0) {
            toast({ variant: 'destructive', title: 'Formulário incompleto', description: 'É necessário um cliente, motivo e ao menos um produto.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const productsToSubmit = addedProducts.map(p => ({ id: p.id, name: p.name, quantity: p.quantity, price: p.price }));
            const { error } = await supabase.from('bonification_requests').insert({
                user_id: user.id,
                seller_name: userContext.fullName || 'N/A',
                supervisor_name: selectedClient.supervisor || 'N/A',
                client_id: `${selectedClient.codigo}-${selectedClient.loja}`,
                client_name: selectedClient.nome_fantasia || selectedClient.nome,
                products_json: productsToSubmit,
                total_amount: totalBonification,
                motivos: [motivo],
            });

            if (error) throw error;
            toast({ title: 'Solicitação enviada com sucesso!' });
            setClientSearchTerm('');
            setSelectedClient(null);
            setAddedProducts([]);
            setMotivo('');
            setClientProductsList([]);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao enviar', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleInputChange = (e) => {
        console.log("Input value:", e.target.value);
        setClientSearchTerm(e.target.value);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nova Solicitação de Bonificação</CardTitle>
                <CardDescription>Busque um cliente para iniciar uma nova solicitação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="relative" ref={searchRef}>
                    <Label htmlFor="client-search">Nome Fantasia do Cliente</Label>
                    <div className="flex items-center">
                        <Search className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="client-search" 
                          placeholder="Digite para buscar um cliente..." 
                          value={clientSearchTerm} 
                          onChange={handleInputChange}
                          onFocus={() => setIsDropdownOpen(clientSearchResults.length > 0)}
                          className="pl-10" 
                        />
                         {isSearchingClients && <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin" />}
                    </div>
                    {isDropdownOpen && clientSearchResults.length > 0 && (
                        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
                            <CardContent className="p-2">
                                {clientSearchResults.map((client, index) => (
                                    <div key={`${client.codigo}-${index}`} onMouseDown={() => handleSelectClient(client)} className="p-2 hover:bg-muted rounded-md cursor-pointer text-sm">
                                        <p className="font-semibold">{client.nome_fantasia || client.nome}</p>
                                        <p className="text-xs text-muted-foreground">{client.nome}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {(selectedClient || loadingClientData) && (
                    <div className="space-y-6 pt-4 border-t animate-in fade-in duration-500">
                        {loadingClientData ? (
                             <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : (
                        <>
                        <div className="space-y-2">
                            <Label htmlFor="motivo">Motivo</Label>
                            <Select value={motivo} onValueChange={setMotivo}>
                                <SelectTrigger id="motivo"><SelectValue placeholder="Selecione um motivo..." /></SelectTrigger>
                                <SelectContent>
                                    {motivosList.map(r => <SelectItem key={r.id} value={r.nome}>{r.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="border rounded-lg p-4 space-y-4">
                            <Label>Adicionar Produto</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select value={newProduct.id} onValueChange={handleProductSelect}>
                                    <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                                    <SelectContent>
                                        {(clientProductsList.length > 0 ? clientProductsList : allProductsList).map(p => <SelectItem key={p.id} value={String(p.id)}>{p.id} - {p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input type="number" placeholder="Quantidade" value={newProduct.quantity} onChange={(e) => setNewProduct(p => ({...p, quantity: Number(e.target.value)}))} min="1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input disabled placeholder="Valor Unitário" value={formatCurrency(newProduct.price)} />
                                <Input disabled placeholder="Valor Total" value={formatCurrency(newProduct.price * newProduct.quantity)} />
                            </div>
                            <Button onClick={handleAddProduct} variant="outline" className="w-full">
                                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Produto
                            </Button>
                        </div>

                        {addedProducts.length > 0 && (
                            <div className="space-y-2">
                                <Label>Produtos na Solicitação</Label>
                                <ScrollArea className="h-48 border rounded-md">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead className="w-24 text-center">Qtd.</TableHead><TableHead className="w-32 text-right">Total</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {addedProducts.map(p => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="font-medium">{p.name}</TableCell>
                                                    <TableCell className="text-center">{p.quantity}</TableCell>
                                                    <TableCell className="text-right font-mono">{formatCurrency(p.price * p.quantity)}</TableCell>
                                                    <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                                <div className="text-right font-bold text-lg">Total Geral: {formatCurrency(totalBonification)}</div>
                            </div>
                        )}
                        
                        <div className="flex justify-end">
                            <Button onClick={handleSubmit} disabled={isSubmitting || addedProducts.length === 0 || !motivo}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Enviar Solicitação
                            </Button>
                        </div>
                        </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default NewRequestView;