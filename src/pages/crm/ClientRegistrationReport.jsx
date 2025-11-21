import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import DateRangePicker from '@/components/DateRangePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, FileText, Printer, Filter, X } from 'lucide-react';
import RegistrationReport from '@/components/crm/RegistrationReport';
import { useReactToPrint } from 'react-to-print';
import { format, subDays } from 'date-fns';

const ClientRegistrationReport = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sellers, setSellers] = useState([]);
    const [stages, setStages] = useState([]);
    const [filters, setFilters] = useState({
        dateRange: { from: subDays(new Date(), 30), to: new Date() },
        sellerId: '',
        status: '',
    });
    const [selectedReport, setSelectedReport] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const { toast } = useToast();
    const reportComponentRef = useRef();

    useEffect(() => {
        const fetchInitialData = async () => {
            const [sellersRes, stagesRes] = await Promise.all([
                supabase.rpc('get_all_users_with_roles').then(res => res.data.filter(u => u.role === 'Vendedor')),
                supabase.from('crm_stages').select('name').order('order')
            ]);
            setSellers(sellersRes || []);
            setStages(stagesRes.data || []);
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [filters]);

    const fetchReports = async () => {
        setLoading(true);
        const params = {
            p_start_date: format(filters.dateRange.from, 'yyyy-MM-dd'),
            p_end_date: format(filters.dateRange.to, 'yyyy-MM-dd'),
            p_seller_id: filters.sellerId || null,
            p_status: filters.status || null,
        };

        const { data, error } = await supabase.rpc('get_registration_reports', params);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar relatórios', description: error.message });
        } else {
            setReports(data);
        }
        setLoading(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value || '' }));
    };


    const clearFilters = () => {
        setFilters({
            dateRange: { from: subDays(new Date(), 30), to: new Date() },
            sellerId: '',
            status: '',
        });
    }

    const handlePrint = useReactToPrint({
        content: () => reportComponentRef.current,
        documentTitle: `Cadastro_Cliente_${selectedReport?.contact_fantasy_name || 'report'}`
    });

    const viewReport = (report) => {
        setSelectedReport(report);
        setIsReportModalOpen(true);
    };

    return (
        <>
            <Helmet>
                <title>Relatório de Cadastro de Clientes - CRM</title>
                <meta name="description" content="Visualize e imprima os relatórios de cadastro de novos clientes e prospects." />
            </Helmet>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Relatório de Cadastro de Clientes</h1>
                        <p className="text-muted-foreground mt-1">Visualize, imprima ou exporte os relatórios de cadastro.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2">
                         <Filter className="h-5 w-5 text-muted-foreground" />
                         <span className="font-semibold">Filtros:</span>
                    </div>
                    <DateRangePicker date={filters.dateRange} onDateChange={(date) => handleFilterChange('dateRange', date)} />
                    <Select value={filters.sellerId} onValueChange={(value) => handleFilterChange('sellerId', value)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filtrar por Vendedor" />
                        </SelectTrigger>
                        <SelectContent>
                            {sellers.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.full_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filtrar por Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {stages.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2"/>
                        Limpar Filtros
                    </Button>
                </div>

                <div className="border rounded-lg">
                     {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.length > 0 ? (
                                    reports.map(report => (
                                        <TableRow key={report.deal_id}>
                                            <TableCell>{format(new Date(report.deal_created_at), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{report.contact_fantasy_name}</TableCell>
                                            <TableCell>{report.seller_name}</TableCell>
                                            <TableCell>{report.stage_name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => viewReport(report)}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Ver Relatório
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">Nenhum relatório encontrado para os filtros selecionados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent className="max-w-4xl p-0 border-0">
                    <div className="bg-muted p-4 flex justify-between items-center">
                         <DialogHeader>
                            <DialogTitle>Visualizar Relatório de Cadastro</DialogTitle>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir / Exportar PDF
                            </Button>
                        </DialogFooter>
                    </div>
                    <div className="p-4 max-h-[80vh] overflow-y-auto report-scroll">
                       <RegistrationReport ref={reportComponentRef} reportData={selectedReport} />
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container { position: absolute; left: 0; top: 0; width: 100%; }
                }
                .A4-size { width: 21cm; min-height: 29.7cm; margin: auto; }
                .report-scroll::-webkit-scrollbar { width: 8px; }
                .report-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
                .report-scroll::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
                .report-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
            `}</style>
        </>
    );
};

export default ClientRegistrationReport;