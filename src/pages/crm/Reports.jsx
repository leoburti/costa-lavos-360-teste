import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
    LineChart, Line, FunnelChart, Funnel, LabelList 
} from 'recharts';
import { Download, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import PageSkeleton from '@/components/PageSkeleton';
import ReportFilters from '@/components/crm/reports/ReportFilters';
import { formatCurrency, formatDate } from '@/lib/utils';

const Reports = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [deals, setDeals] = useState([]);
    const [stages, setStages] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Filter State
    const [period, setPeriod] = useState('this_month');
    const [dateRange, setDateRange] = useState({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });
    const [selectedSeller, setSelectedSeller] = useState('all');

    useEffect(() => {
        updateDateRange(period);
    }, [period]);

    const updateDateRange = (periodType) => {
        const now = new Date();
        let range = { from: now, to: now };

        switch (periodType) {
            case 'this_month':
                range = { from: startOfMonth(now), to: endOfMonth(now) };
                break;
            case 'last_month':
                const lastMonth = subMonths(now, 1);
                range = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
                break;
            case 'this_quarter':
                range = { from: startOfQuarter(now), to: endOfQuarter(now) };
                break;
            case 'this_year':
                range = { from: startOfYear(now), to: endOfYear(now) };
                break;
            case 'custom':
                return; // Don't update state, let user pick
            default:
                break;
        }
        setDateRange(range);
    };

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            fetchReportData();
        }
    }, [dateRange, selectedSeller]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch Stages
            const { data: stagesData, error: stagesError } = await supabase
                .from('crm_stages')
                .select('*')
                .order('order', { ascending: true });
            
            if (stagesError) throw stagesError;
            setStages(stagesData);

            // 2. Fetch Users (Sellers)
            // Fetching from 'users' table assuming it's public view or similar accessible table
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, full_name');
            
            if (usersError) console.warn("Could not fetch users, might be restricted", usersError);
            setUsers(usersData || []);

            // 3. Fetch Deals
            let query = supabase
                .from('crm_deals')
                .select(`
                    *,
                    crm_contacts ( fantasy_name, corporate_name ),
                    crm_stages ( name, order )
                `)
                .gte('created_at', dateRange.from.toISOString())
                .lte('created_at', dateRange.to.toISOString());

            if (selectedSeller !== 'all') {
                query = query.eq('owner_id', selectedSeller);
            }

            const { data: dealsData, error: dealsError } = await query;
            
            if (dealsError) throw dealsError;
            setDeals(dealsData);

        } catch (error) {
            console.error('Error fetching report data:', error);
            toast({
                title: 'Erro ao carregar dados',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // --- Calculations ---

    const funnelData = useMemo(() => {
        // Calculate "Throughput Funnel"
        // Count deals currently in each stage or past it
        if (!stages.length) return [];

        return stages.map(stage => {
            // Count deals that are in this stage OR in a later stage (higher order)
            // This assumes a linear flow which is a standard approximation for snapshot reporting
            const count = deals.filter(d => {
                const dealStageOrder = d.crm_stages?.order || 0;
                return dealStageOrder >= stage.order;
            }).length;

            return {
                name: stage.name,
                value: count,
                fill: `hsl(var(--primary) / ${1 - (stage.order * 0.15)})`
            };
        }).filter(d => d.value > 0);
    }, [deals, stages]);

    const conversionData = useMemo(() => {
        if (funnelData.length < 2) return [];
        const data = [];
        for (let i = 0; i < funnelData.length - 1; i++) {
            const current = funnelData[i];
            const next = funnelData[i + 1];
            const rate = current.value > 0 ? ((next.value / current.value) * 100).toFixed(1) : 0;
            data.push({
                stage: `${current.name} -> ${next.name}`,
                rate: parseFloat(rate)
            });
        }
        return data;
    }, [funnelData]);

    const avgTicketData = useMemo(() => {
        const grouped = {};
        
        deals.forEach(deal => {
            const ownerId = deal.owner_id;
            const ownerName = users.find(u => u.id === ownerId)?.full_name || 'Desconhecido';
            
            if (!grouped[ownerId]) grouped[ownerId] = { name: ownerName, total: 0, count: 0 };
            grouped[ownerId].total += Number(deal.value || 0);
            grouped[ownerId].count += 1;
        });

        return Object.values(grouped).map(g => ({
            name: g.name,
            avg: g.count > 0 ? (g.total / g.count) : 0,
            total: g.total
        })).sort((a, b) => b.avg - a.avg);
    }, [deals, users]);

    const kpis = useMemo(() => {
        const totalDeals = deals.length;
        const totalValue = deals.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
        const avgTicket = totalDeals > 0 ? totalValue / totalDeals : 0;
        const wonDeals = deals.filter(d => d.status === 'Ganho' || d.crm_stages?.name === 'Ganho').length;
        const winRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : 0;

        return { totalDeals, totalValue, avgTicket, winRate };
    }, [deals]);

    // --- Exports ---

    const exportPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Relatório de Performance CRM', 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Período: ${formatDate(dateRange.from)} a ${formatDate(dateRange.to)}`, 14, 30);
        
        // KPIs
        doc.text(`Total de Negócios: ${kpis.totalDeals}`, 14, 40);
        doc.text(`Valor Total: ${formatCurrency(kpis.totalValue)}`, 14, 46);
        doc.text(`Ticket Médio: ${formatCurrency(kpis.avgTicket)}`, 14, 52);
        doc.text(`Taxa de Conversão Geral: ${kpis.winRate}%`, 14, 58);

        // Table
        const tableColumn = ["Título", "Cliente", "Fase", "Valor", "Vendedor", "Data Criação"];
        const tableRows = deals.map(deal => [
            deal.title,
            deal.crm_contacts?.fantasy_name || 'N/A',
            deal.crm_stages?.name || 'N/A',
            formatCurrency(deal.value || 0),
            users.find(u => u.id === deal.owner_id)?.full_name || 'N/A',
            formatDate(deal.created_at)
        ]);

        doc.autoTable({
            startY: 65,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save(`crm_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
        toast({ title: "PDF Gerado", description: "O download do relatório foi iniciado." });
    };

    const exportCSV = () => {
        const headers = ["ID,Título,Cliente,Fase,Valor,Vendedor,Data Criação"];
        const rows = deals.map(deal => [
            deal.id,
            `"${deal.title.replace(/"/g, '""')}"`,
            `"${(deal.crm_contacts?.fantasy_name || '').replace(/"/g, '""')}"`,
            deal.crm_stages?.name || '',
            deal.value || 0,
            users.find(u => u.id === deal.owner_id)?.full_name || '',
            deal.created_at
        ].join(","));

        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `crm_deals_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "CSV Gerado", description: "O arquivo Excel/CSV foi baixado." });
    };

    if (loading) return <PageSkeleton />;

    return (
        <div className="p-6 space-y-6 h-full flex flex-col bg-slate-50/50">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios & Análises</h1>
                    <p className="text-slate-500 mt-1">Acompanhe a performance do funil, vendedores e métricas de conversão.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchReportData}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
                    </Button>
                    <Button variant="outline" onClick={exportCSV}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                    </Button>
                    <Button variant="default" onClick={exportPDF}>
                        <FileText className="mr-2 h-4 w-4" /> PDF
                    </Button>
                </div>
            </div>

            <ReportFilters 
                period={period} 
                setPeriod={setPeriod} 
                dateRange={dateRange} 
                setDateRange={setDateRange}
                users={users}
                selectedSeller={selectedSeller}
                setSelectedSeller={setSelectedSeller}
                onClear={() => {
                    setPeriod('this_month');
                    setSelectedSeller('all');
                }}
            />

            {/* KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.totalDeals}</div>
                        <p className="text-xs text-muted-foreground">no período selecionado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                        <span className="font-bold text-emerald-600">$</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(kpis.totalValue)}</div>
                        <p className="text-xs text-muted-foreground">em pipeline</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <span className="font-bold text-blue-600">AVG</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(kpis.avgTicket)}</div>
                        <p className="text-xs text-muted-foreground">por oportunidade</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Vitória</CardTitle>
                        <span className="font-bold text-orange-600">%</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.winRate}%</div>
                        <p className="text-xs text-muted-foreground">deals ganhos / total</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard Visual</TabsTrigger>
                    <TabsTrigger value="detailed">Dados Detalhados</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Funnel Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Funil de Vendas (Snapshot)</CardTitle>
                                <CardDescription>Volume de deals acumulados por etapa</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px] flex items-center justify-center">
                                {funnelData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <FunnelChart>
                                            <RechartsTooltip formatter={(val) => [val, 'Deals']} />
                                            <Funnel
                                                dataKey="value"
                                                data={funnelData}
                                                isAnimationActive
                                            >
                                                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                                            </Funnel>
                                        </FunnelChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-muted-foreground">Sem dados para o funil</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ticket Medio por Vendedor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Médio por Vendedor</CardTitle>
                                <CardDescription>Comparativo de valor médio de venda</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                {avgTicketData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={avgTicketData} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" tickFormatter={(val) => `R$${val/1000}k`} />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                                            <Bar dataKey="avg" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Ticket Médio" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados de vendedores</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Conversion Rates */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Taxas de Conversão entre Etapas</CardTitle>
                            <CardDescription>Probabilidade de avanço de uma fase para a próxima</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {conversionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={conversionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="stage" />
                                        <YAxis unit="%" domain={[0, 100]} />
                                        <RechartsTooltip formatter={(val) => `${val}%`} />
                                        <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} name="Conversão" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">Dados insuficientes para cálculo de conversão</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="detailed">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhamento de Oportunidades</CardTitle>
                            <CardDescription>Lista completa de negócios no período</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Fase</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Vendedor</TableHead>
                                            <TableHead>Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deals.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                    Nenhum negócio encontrado.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            deals.map((deal) => (
                                                <TableRow key={deal.id}>
                                                    <TableCell className="font-medium">{deal.title}</TableCell>
                                                    <TableCell>{deal.crm_contacts?.fantasy_name || deal.crm_contacts?.corporate_name || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{deal.crm_stages?.name}</Badge>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(deal.value)}</TableCell>
                                                    <TableCell>
                                                        {users.find(u => u.id === deal.owner_id)?.full_name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>{formatDate(deal.created_at)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Reports;