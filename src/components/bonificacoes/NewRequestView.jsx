
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Send, Trash2, ArrowLeft } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormStatePersistence } from '@/hooks/useFormStatePersistence';
import { PersistenceStatus } from '@/components/PersistenceStatus';
import { MultiSelect } from '@/components/ui/multi-select';

const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const bonificationReasons = [
    { value: 'Comercial', label: 'Comercial' },
    { value: 'Equipamento', label: 'Equipamento' },
    { value: 'Institucional', label: 'Institucional' },
    { value: 'Logística', label: 'Logística' },
    { value: 'Marketing', label: 'Marketing' },
];

const NewRequestView = ({ onSuccess }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    
    const { formData, handleChange, status, lastSaved, clearDraft } = useFormStatePersistence('bonificacao_new_request', {
        selectedClient: null,
        selectedProducts: [],
        clientSupervisor: '',
        clientSeller: '',
        monthlyLimit: 0,
        motivos: [],
    });

    const { selectedClient, selectedProducts, clientSupervisor, clientSeller, monthlyLimit, motivos } = formData;

    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    
    const [allProducts, setAllProducts] = useState([]);
    const [loadingAllProducts, setLoadingAllProducts] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const debouncedProductSearchTerm = useDebounce(productSearchTerm, 300);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingClients(true);
            try {
                const { data: clientsData, error: clientsError } = await supabase
                    .from('bd-cl')
                    .select('Cliente, Loja, "N Fantasia", "Nome Supervisor", "Nome Vendedor"')
                    .not('"N Fantasia"', 'is', null)
                    .not('"Nome Grp Cliente"', 'eq', 'FUNCIONARIOS')
                    .order('"N Fantasia"', { ascending: true });

                if (clientsError) throw clientsError;

                const uniqueClients = Array.from(new Map(clientsData.map(item => [`${item.Cliente}-${item.Loja}`, { 
                    value: `${item.Cliente}-${item.Loja}`, 
                    label: item['N Fantasia'],
                    supervisor: item['Nome Supervisor'],
                    seller: item['Nome Vendedor'],
                }])).values());
                setClients(uniqueClients);
                
                setLoadingAllProducts(true);
                const { data: productsData, error: productsError } = await supabase.from('bd-cl').select('Produto, Descricao, "Valor Unitario"');
                if(productsError) throw productsError;
                const uniqueProducts = Array.from(new Map(productsData.map(p => [p.Produto, { id: p.Produto, name: p.Descricao, price: p['Valor Unitario'] }])).values());
                setAllProducts(uniqueProducts);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro ao carregar dados iniciais', description: error.message });
            } finally {
                setLoadingClients(false);
                setLoadingAllProducts(false);
            }
        };
        fetchInitialData();
    }, [toast]);
    
    const handleClientSelect = async (client) => {
        let newMonthlyLimit = 0;
        try {
            const { data: settingsData } = await supabase.from('bonification_settings').select('monthly_limit_percentage').eq('id', 1).single();
            const limitPercentage = settingsData?.monthly_limit_percentage || 2;
            
            const lastMonth = subMonths(new Date(), 1);
            const { data: salesData } = await supabase.rpc('get_revenue_for_validation', {
                p_start_date: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
                p_end_date: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
                p_exclude_employees: true,
                p_supervisors: null, p_sellers: null, p_customer_groups: null, p_regions: null, 
                p_clients: [client.label], 
                p_search_term: null
            });
            
            newMonthlyLimit = (salesData * limitPercentage) / 100;

        } catch (error) {
            console.error(error);
            newMonthlyLimit = 0;
        }

        handleChange('selectedClient', client);
        handleChange('clientSupervisor', client.supervisor);
        handleChange('clientSeller', client.seller);
        handleChange('monthlyLimit', newMonthlyLimit);
    };
    
    const handleAddProduct = (product) => {
        if (!selectedProducts.find(p => p.id === product.id)) {
            handleChange('selectedProducts', [...selectedProducts, { ...product, quantity: 1, editablePrice: product.price }]);
        }
        setProductSearchTerm('');
    };

    const handleUpdateProduct = (productId, field, value) => {
        const updatedProducts = selectedProducts.map(p => {
            if (p.id === productId) {
                const numericValue = parseFloat(value);
                if (field === 'quantity' && numericValue > 0) {
                    return { ...p, quantity: parseInt(value) };
                }
                if (field === 'editablePrice' && numericValue >= 0) {
                    return { ...p, editablePrice: numericValue };
                }
            }
            return p;
        });
        handleChange('selectedProducts', updatedProducts);
    };

    const handleRemoveProduct = (productId) => {
        handleChange('selectedProducts', selectedProducts.filter(p => p.id !== productId));
    };

    const handleClearClient = () => {
        handleChange('selectedClient', null);
        handleChange('selectedProducts', []);
        handleChange('monthlyLimit', 0);
    };

    const totalBonification = useMemo(() => {
        return (selectedProducts || []).reduce((acc, p) => acc + (p.editablePrice * p.quantity), 0);
    }, [selectedProducts]);

    const filteredClients = useMemo(() => {
        if (!clientSearchTerm) return clients;
        return clients.filter(c => c.label.toLowerCase().includes(clientSearchTerm.toLowerCase()));
    }, [clients, clientSearchTerm]);

    const filteredProducts = useMemo(() => {
        if (!debouncedProductSearchTerm) return [];
        return allProducts.filter(p => 
            p.name.toLowerCase().includes(debouncedProductSearchTerm.toLowerCase())
        ).slice(0, 50);
    }, [allProducts, debouncedProductSearchTerm]);


    const handleSubmit = async () => {
        if (!selectedClient || selectedProducts.length === 0 || motivos.length === 0) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Selecione um motivo, um cliente e ao menos um produto.' });
            return;
        }

        setIsSubmitting(true);
        
        const productsToSubmit = selectedProducts.map(p => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            price: p.editablePrice
        }));

        try {
            const { error: requestError } = await supabase
                .from('bonification_requests')
                .insert({
                    user_id: user.id,
                    client_id: selectedClient.value,
                    client_name: selectedClient.label,
                    supervisor_name: clientSupervisor,
                    seller_name: clientSeller,
                    products_json: productsToSubmit,
                    total_amount: totalBonification,
                    motivos: motivos,
                });

            if (requestError) throw requestError;

            toast({ title: 'Solicitação enviada com sucesso!', description: `Sua solicitação foi registrada e está sendo processada.` });
            
            clearDraft(); // Clear storage

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('[DEBUG] Error inserting bonification request:', error);
            toast({ variant: 'destructive', title: 'Erro ao criar solicitação', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Nova Solicitação de Bonificação</CardTitle>
                        <CardDescription>Preencha os motivos e selecione um cliente para iniciar.</CardDescription>
                    </div>
                    <PersistenceStatus status={status} lastSaved={lastSaved} />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <MultiSelect
                            label="Motivo(s) da Bonificação"
                            options={bonificationReasons}
                            selected={motivos}
                            onChange={(newMotivos) => handleChange('motivos', newMotivos)}
                            placeholder="Selecione um ou mais motivos"
                        />
                    </div>

                    {!selectedClient ? (
                        <div className="space-y-2">
                             <Label htmlFor="client-search">Buscar Cliente</Label>
                             <Input 
                                id="client-search" 
                                placeholder="Digite o nome fantasia..." 
                                value={clientSearchTerm}
                                onChange={e => setClientSearchTerm(e.target.value)}
                                disabled={motivos.length === 0}
                             />
                             {motivos.length === 0 && <p className="text-xs text-muted-foreground">Selecione um motivo para habilitar a busca de clientes.</p>}
                             <ScrollArea className="h-72 border rounded-md mt-2">
                                {loadingClients && motivos.length > 0 ? (
                                    <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
                                ) : filteredClients.length > 0 && motivos.length > 0 ? (
                                    filteredClients.map(client => (
                                        <div key={client.value} onClick={() => handleClientSelect(client)} className="p-2 hover:bg-muted cursor-pointer text-sm">
                                            {client.label}
                                        </div>
                                    ))
                                ) : <div className="p-4 text-center text-sm text-muted-foreground">Nenhum cliente para exibir.</div>
                                }
                             </ScrollArea>
                        </div>
                    ) : (
                         <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Cliente</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-semibold">{selectedClient.label}</p>
                                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleClearClient}>Trocar</Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm">Supervisor</CardTitle></CardHeader>
                                    <CardContent><p className="font-semibold">{clientSupervisor || 'N/A'}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm">Vendedor</CardTitle></CardHeader>
                                    <CardContent><p className="font-semibold">{clientSeller || 'N/A'}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm">Limite Cliente (2%)</CardTitle></CardHeader>
                                    <CardContent><p className="font-semibold">{formatCurrency(monthlyLimit)}</p></CardContent>
                                </Card>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="product-search">Adicionar Produto</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="product-search"
                                        placeholder="Buscar produto..."
                                        value={productSearchTerm}
                                        onChange={e => setProductSearchTerm(e.target.value)}
                                    />
                                </div>
                                {debouncedProductSearchTerm && (
                                    <ScrollArea className="h-40 border rounded-md">
                                        {loadingAllProducts ? (
                                            <div className="p-4 text-center"><Loader2 className="h-4 w-4 animate-spin inline-block"/></div>
                                        ) : filteredProducts.length > 0 ? (
                                            filteredProducts.map(product => (
                                                <div key={product.id} onClick={() => handleAddProduct(product)} className="p-2 hover:bg-muted cursor-pointer text-sm">
                                                    {product.name}
                                                </div>
                                            ))
                                        ) : <div className="p-4 text-sm text-center">Nenhum produto encontrado.</div>}
                                    </ScrollArea>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold">Produtos da Bonificação</h4>
                                <ScrollArea className="h-64 border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Produto</TableHead>
                                                <TableHead className="w-28">Quantidade</TableHead>
                                                <TableHead className="w-36">Valor Unit.</TableHead>
                                                <TableHead className="w-36 text-right">Subtotal</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(selectedProducts || []).length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum produto adicionado.</TableCell></TableRow>
                                            ) : (
                                                selectedProducts.map((p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-medium">{p.name}</TableCell>
                                                        <TableCell>
                                                            <Input type="number" min="1" value={p.quantity} onChange={(e) => handleUpdateProduct(p.id, 'quantity', e.target.value)} className="h-8"/>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input type="number" step="0.01" value={p.editablePrice} onChange={(e) => handleUpdateProduct(p.id, 'editablePrice', e.target.value)} className="h-8"/>
                                                        </TableCell>
                                                        <TableCell className="text-right">{formatCurrency(p.editablePrice * p.quantity)}</TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(p.id)}>
                                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                            <div className="text-right font-bold text-lg">
                                Total: {formatCurrency(totalBonification)}
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleSubmit} disabled={isSubmitting || !selectedClient || selectedProducts.length === 0}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Enviar Solicitação
                                </Button>
                            </div>
                         </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default NewRequestView;
