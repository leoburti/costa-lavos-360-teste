import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Loader2, Calendar as CalendarIcon, Download, FileText, BarChart2, Archive, Search, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDebounce } from '@/hooks/useDebounce';
import { generatePDF } from '@/utils/pdfGenerator'; // New utility import
import ProtocolDetailReport from '@/components/delivery/ProtocolDetailReport';
import SyntheticReport from '@/components/delivery/SyntheticReport';
import BoxBalanceReport from '@/components/delivery/BoxBalanceReport';
import { Badge } from '@/components/ui/badge';
import { useFilters } from '@/contexts/FilterContext';

// Tab 1: Individual Protocols
const IndividualProtocolsTab = () => {
    const [date, setDate] = useState(new Date());
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { toast } = useToast();
    
    // Ref for the hidden report container
    const reportRef = useRef(null);
    const [printingProtocol, setPrintingProtocol] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchProtocols = useCallback(async (selectedDate) => {
        if (!selectedDate) return;
        setLoading(true);
        try {
            const startDate = startOfDay(selectedDate).toISOString();
            const endDate = endOfDay(selectedDate).toISOString();

            let query = supabase
                .from('entregas')
                .select('*, motoristas(nome)')
                .gte('data_entrega', startDate)
                .lte('data_entrega', endDate)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            setProtocols(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar protocolos', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchProtocols(date);
    }, [fetchProtocols, date]);

    const handleDateSelect = (selectedDate) => {
        setDate(selectedDate);
    }
    
    // Callback to be passed to useReactToPrint
    const onAfterPrint = useCallback(() => {
        setPrintingProtocol(null);
        setIsDownloading(false);
        toast({ title: "Sucesso", description: "PDF gerado e pronto para download." });
    }, [toast]);

    const onPrintError = useCallback(() => {
        setPrintingProtocol(null);
        setIsDownloading(false);
        toast({ variant: 'destructive', title: "Erro", description: "Falha ao gerar o PDF." });
    }, [toast]);

    const handleDownloadPDF = (protocol) => {
        if (isDownloading) return;
        setIsDownloading(true);
        setPrintingProtocol(protocol);
    };

    useEffect(() => {
        if (printingProtocol && reportRef.current && isDownloading) {
            // Trigger print now that the state is updated and component rendered
            const generateAndDownload = async () => {
                try {
                    const filename = `Protocolo_${printingProtocol.venda_num_docto || 'Entrega'}_${format(new Date(), 'ddMMyyyy')}.pdf`;
                    await generatePDF(reportRef.current, filename);
                    onAfterPrint();
                } catch (error) {
                    console.error("PDF Generation Error:", error);
                    onPrintError();
                }
            };
            // Use timeout to ensure images are loaded
            setTimeout(generateAndDownload, 1000);
        }
    }, [printingProtocol, isDownloading, onAfterPrint, onPrintError]);


    const filteredProtocols = useMemo(() => {
        if (!debouncedSearchTerm) return protocols;
        return protocols.filter(p => {
            const term = debouncedSearchTerm.toLowerCase();
            return (
                p.cliente_nome?.toLowerCase().includes(term) ||
                p.venda_num_docto?.toLowerCase().includes(term) ||
                p.recebedor_nome?.toLowerCase().includes(term)
            );
        });
    }, [protocols, debouncedSearchTerm]);
    
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus locale={ptBR} />
                    </PopoverContent>
                </Popover>
                 <div className="relative w-full sm:w-auto sm:flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por cliente, NF ou recebedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                <Button onClick={() => fetchProtocols(date)} disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />} Atualizar
                </Button>
            </div>

            {loading && <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            
            {!loading && filteredProtocols.length === 0 && (
                <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Nenhum protocolo encontrado</AlertTitle>
                    <AlertDescription>Não há protocolos para a data e/ou busca selecionada.</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                {filteredProtocols.map(protocol => (
                    <Card key={protocol.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        NF: {protocol.venda_num_docto}
                                        <Badge variant={protocol.status === 'Concluído' ? 'success' : 'secondary'} className="ml-2">
                                            {protocol.status}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>{protocol.cliente_nome}</CardDescription>
                                </div>
                                 <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(protocol)} disabled={isDownloading}>
                                    {isDownloading && printingProtocol?.id === protocol.id ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4 mr-2" /> 
                                    )}
                                    Baixar PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <p><strong>Motorista:</strong> {protocol.motoristas?.nome || 'N/A'}</p>
                                <p><strong>Recebedor:</strong> {protocol.recebedor_nome || 'N/A'}</p>
                                <p><strong>Data:</strong> {format(new Date(protocol.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                             </div>
                             {protocol.observacoes && (
                                 <div className="bg-muted/30 p-2 rounded-md">
                                     <p><strong>Observações:</strong> {protocol.observacoes}</p>
                                 </div>
                             )}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                {protocol.assinatura_digital && (
                                    <div>
                                        <p className="font-semibold mb-1">Assinatura:</p>
                                        <img src={protocol.assinatura_digital} alt="Assinatura" className="h-24 w-full object-contain border rounded-md bg-muted" loading="lazy" />
                                    </div>
                                )}
                                {protocol.foto_comprovante && (
                                    <div>
                                        <p className="font-semibold mb-1">Canhoto:</p>
                                        <img src={protocol.foto_comprovante} alt="Canhoto" className="h-24 w-full object-cover border rounded-md" loading="lazy" />
                                    </div>
                                )}
                                {protocol.fotos?.map((foto, i) => (
                                    <div key={i}>
                                        <p className="font-semibold mb-1">{`Foto ${i+1}:`}</p>
                                        <img src={foto} alt={`Foto ${i+1}`} className="h-24 w-full object-cover border rounded-md" loading="lazy" />
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {/* Hidden Report Component for Generation */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '210mm' }}>
                {printingProtocol && <ProtocolDetailReport ref={reportRef} protocol={printingProtocol} />}
            </div>
        </div>
    );
};


// Tab 2: Synthetic Report
const SyntheticReportTab = () => {
    const { filters } = useFilters();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef(null);
    const { toast } = useToast();

    const generateReport = useCallback(async () => {
        if (!filters.dateRange?.from || !filters.dateRange?.to) {
            toast({ variant: 'destructive', title: 'Período inválido.' });
            return;
        }
        setLoading(true);
        try {
             const startDate = startOfDay(filters.dateRange.from).toISOString();
            const endDate = endOfDay(filters.dateRange.to).toISOString();

            const { data, error } = await supabase
                .from('entregas')
                .select('data_entrega, caixas_entregues, caixas_recolhidas')
                .gte('data_entrega', startDate)
                .lte('data_entrega', endDate);

            if (error) throw error;
            
            const aggregated = data.reduce((acc, curr) => {
                const date = format(new Date(curr.data_entrega), 'yyyy-MM-dd');
                if (!acc[date]) {
                    acc[date] = { totalDeliveries: 0, boxesDelivered: 0, boxesCollected: 0 };
                }
                acc[date].totalDeliveries += 1;
                acc[date].boxesDelivered += curr.caixas_entregues || 0;
                acc[date].boxesCollected += curr.caixas_recolhidas || 0;
                return acc;
            }, {});
            
            setReportData(aggregated);

        } catch(error) {
            toast({ variant: 'destructive', title: 'Erro ao gerar relatório', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [filters.dateRange, toast]);

    const handleDownloadPDF = async () => {
        if (isDownloading || !reportData) return;
        setIsDownloading(true);
        try {
            await generatePDF(reportRef.current, `Relatorio_Sintetico_${format(new Date(), 'ddMMyyyy')}.pdf`);
            toast({ title: "Sucesso", description: "Relatório baixado com sucesso!" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro", description: "Falha ao baixar PDF." });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <DateRangePicker />
                <Button onClick={generateReport} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar Relatório"}
                </Button>
                {reportData && Object.keys(reportData).length > 0 && (
                     <Button variant="outline" onClick={handleDownloadPDF} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />} Baixar PDF
                    </Button>
                )}
            </div>

            {loading && <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            
            {reportData && Object.keys(reportData).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Relatório Sintético</CardTitle>
                        <CardDescription>Resumo das entregas no período selecionado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Total de Entregas</TableHead>
                                    <TableHead className="text-right">Caixas Entregues</TableHead>
                                    <TableHead className="text-right">Caixas Recolhidas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(reportData).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dailyData]) => (
                                    <TableRow key={date}>
                                        <TableCell>{format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                        <TableCell className="text-right">{dailyData.totalDeliveries}</TableCell>
                                        <TableCell className="text-right">{dailyData.boxesDelivered}</TableCell>
                                        <TableCell className="text-right">{dailyData.boxesCollected}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {!loading && reportData && Object.keys(reportData).length === 0 && (
                <Alert>
                    <BarChart2 className="h-4 w-4" />
                    <AlertTitle>Nenhum dado encontrado</AlertTitle>
                    <AlertDescription>Não há registros de saldo de caixas para o período selecionado.</AlertDescription>
                </Alert>
            )}
             {/* Hidden container for generation */}
             <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '210mm' }}>
                <SyntheticReport ref={reportRef} data={reportData} dateRange={filters.dateRange} />
            </div>
        </div>
    );
};

// Tab 3: Box Balance
const BoxBalanceTab = () => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { toast } = useToast();
    
    const reportRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchBalances = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bd-cl')
                .select('"N Fantasia", saldo_caixas')
                .not('saldo_caixas', 'is', null)
                .order('saldo_caixas', { ascending: false });
            
            if (error) throw error;
            setBalances(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar saldos', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    React.useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    const handleDownloadPDF = async () => {
        if (isDownloading || filteredBalances.length === 0) return;
        setIsDownloading(true);
        try {
            await generatePDF(reportRef.current, `Saldo_Caixas_${format(new Date(), 'ddMMyyyy')}.pdf`);
            toast({ title: "Sucesso", description: "Relatório baixado com sucesso!" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro", description: "Falha ao baixar PDF." });
        } finally {
            setIsDownloading(false);
        }
    };

    const filteredBalances = useMemo(() => {
        if (!debouncedSearchTerm) return balances;
        return balances.filter(b => 
            b['N Fantasia']?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [balances, debouncedSearchTerm]);

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between gap-4">
                <Input 
                    placeholder="Buscar por cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Button variant="outline" onClick={handleDownloadPDF} disabled={loading || filteredBalances.length === 0 || isDownloading}>
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />} Baixar PDF
                </Button>
            </div>
            
            {loading ? (
                 <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filteredBalances.length > 0 ? (
                <Card>
                    <CardHeader><CardTitle>Saldo de Caixas por Cliente</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente (N Fantasia)</TableHead>
                                    <TableHead className="text-right">Saldo de Caixas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBalances.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item['N Fantasia']}</TableCell>
                                        <TableCell className="text-right font-medium">{item.saldo_caixas}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                 <Alert>
                    <Archive className="h-4 w-4" />
                    <AlertTitle>Nenhum saldo encontrado</AlertTitle>
                    <AlertDescription>Não há registros de saldo de caixas ou sua busca não retornou resultados.</AlertDescription>
                </Alert>
            )}

            {/* Hidden container for generation */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '210mm' }}>
                <BoxBalanceReport ref={reportRef} data={filteredBalances} />
            </div>
        </div>
    );
}

const DeliveryReports = () => {
    return (
        <>
            <Helmet>
                <title>Relatórios de Entregas</title>
                <meta name="description" content="Página para geração e visualização de relatórios de entregas." />
            </Helmet>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Relatórios de Entregas</h1>
                    <p className="text-muted-foreground">Analise e exporte dados sobre as operações de entrega.</p>
                </div>
                
                <Tabs defaultValue="individual">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="individual"><FileText className="h-4 w-4 mr-2"/>Protocolos Individuais</TabsTrigger>
                        <TabsTrigger value="synthetic"><BarChart2 className="h-4 w-4 mr-2"/>Relatório Sintético</TabsTrigger>
                        <TabsTrigger value="balance"><Archive className="h-4 w-4 mr-2"/>Saldo de Caixas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="individual" className="mt-4">
                        <IndividualProtocolsTab />
                    </TabsContent>
                    <TabsContent value="synthetic" className="mt-4">
                        <SyntheticReportTab />
                    </TabsContent>
                    <TabsContent value="balance" className="mt-4">
                        <BoxBalanceTab />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
};

export default DeliveryReports;