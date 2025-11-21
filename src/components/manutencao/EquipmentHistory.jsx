import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar as CalendarIcon, FileDown, AlertTriangle, PackageSearch } from 'lucide-react';

const statusMapping = {
  'Em Andamento': { label: 'Em Andamento', variant: 'warning' },
  'Concluído': { label: 'Concluído', variant: 'success' },
  'Rascunho': { label: 'Rascunho', variant: 'secondary' }
};

const MaintenanceRecordForPDF = React.forwardRef(({ record }, ref) => {
    return (
        <div ref={ref} className="p-8 bg-white text-black" style={{ width: '800px' }}>
             <h2 className="text-2xl font-bold mb-4">Relatório de Manutenção - OS #{record.id.substring(0, 8)}</h2>
             <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><strong>Equipamento:</strong> {record.equipment?.nome}</div>
                <div><strong>Ativo Fixo:</strong> {record.equipment?.ativo_fixo || 'N/A'}</div>
                <div><strong>Técnico:</strong> {record.tecnico || 'N/A'}</div>
                <div><strong>Tipo:</strong> {record.tipo || 'N/A'}</div>
                <div><strong>Data Início:</strong> {format(parseISO(record.data_inicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
                <div><strong>Data Fim:</strong> {record.data_fim ? format(parseISO(record.data_fim), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Não finalizado'}</div>
             </div>

             <div className="mb-6">
                <h3 className="font-bold text-lg border-b pb-1 mb-2">Observações Gerais</h3>
                <p className="text-sm">{record.observacoes || 'Nenhuma.'}</p>
             </div>

            <div className="mb-6">
                <h3 className="font-bold text-lg border-b pb-1 mb-2">Checklist Básico</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li><strong>Lavado:</strong> {record.washed ? 'Sim' : 'Não'}</li>
                    <li><strong>Refrigeração OK:</strong> {record.cooling_ok ? 'Sim' : 'Não'}</li>
                    <li><strong>Ferrugem Aparente:</strong> {record.has_rust ? 'Sim' : 'Não'}</li>
                    <li><strong>Avarias Aparentes:</strong> {record.has_apparent_damages ? 'Sim' : 'Não'}</li>
                    {record.has_apparent_damages && <li><strong>Descrição Avarias:</strong> {record.damage_description || 'N/A'}</li>}
                </ul>
            </div>

            {record.replaced_parts && record.replaced_parts.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold text-lg border-b pb-1 mb-2">Peças Substituídas</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">{record.replaced_parts.map(p => <li key={p.id}>{p.quantidade}x {p.nome_peca}</li>)}</ul>
                </div>
            )}
            
            {record.maintenance_answers && record.maintenance_answers.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold text-lg border-b pb-1 mb-2">Respostas Adicionais</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">{record.maintenance_answers.map(a => <li key={a.id}><strong>{a.maintenance_question_templates?.pergunta}:</strong> {a.valor}</li>)}</ul>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
                 <div>
                    <h4 className="font-semibold mb-2">Fotos Antes</h4>
                    <div className="flex flex-wrap gap-2">
                        {record.maintenance_photos?.filter(p => p.tipo === 'antes').map(photo => (
                            <img key={photo.id} src={photo.url} alt="Foto Antes" crossOrigin="anonymous" className="w-40 h-40 object-cover rounded-md border" />
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Fotos Depois</h4>
                    <div className="flex flex-wrap gap-2">
                        {record.maintenance_photos?.filter(p => p.tipo === 'depois').map(photo => (
                            <img key={photo.id} src={photo.url} alt="Foto Depois" crossOrigin="anonymous" className="w-40 h-40 object-cover rounded-md border" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

const MaintenanceRecord = ({ record, onGeneratePDF }) => {
    const getStatusBadge = (status) => {
        const mapping = statusMapping[status] || { label: status, variant: 'default' };
        return <Badge variant={mapping.variant}>{mapping.label}</Badge>;
    };

    return (
        <AccordionItem value={record.id}>
            <AccordionTrigger>
                <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex items-center gap-4">
                        <div className="text-left">
                            <p className="font-semibold">{record.equipment?.nome}</p>
                            <p className="text-sm text-muted-foreground">{format(parseISO(record.data_inicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {getStatusBadge(record.status)}
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onGeneratePDF(record); }}>
                            <FileDown className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <h4>Detalhes da Manutenção</h4>
                        <ul>
                            <li><strong>Técnico:</strong> {record.tecnico || 'N/A'}</li>
                            <li><strong>Data Fim:</strong> {record.data_fim ? format(parseISO(record.data_fim), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Não finalizado'}</li>
                            <li><strong>Observações:</strong> {record.observacoes || 'Nenhuma.'}</li>
                        </ul>

                        <h4>Checklist</h4>
                        <ul>
                            <li><strong>Lavado:</strong> {record.washed ? 'Sim' : 'Não'}</li>
                            <li><strong>Refrigeração OK:</strong> {record.cooling_ok ? 'Sim' : 'Não'}</li>
                            <li><strong>Ferrugem Aparente:</strong> {record.has_rust ? 'Sim' : 'Não'}</li>
                            <li><strong>Avarias Aparentes:</strong> {record.has_apparent_damages ? 'Sim' : 'Não'}</li>
                            {record.has_apparent_damages && <li><strong>Descrição Avarias:</strong> {record.damage_description || 'N/A'}</li>}
                        </ul>

                        {record.replaced_parts && record.replaced_parts.length > 0 && (
                            <>
                                <h4>Peças Substituídas</h4>
                                <ul>{record.replaced_parts.map(p => <li key={p.id}>{p.quantidade}x {p.nome_peca}</li>)}</ul>
                            </>
                        )}
                        
                        {record.maintenance_answers && record.maintenance_answers.length > 0 && (
                             <>
                                <h4>Respostas Adicionais</h4>
                                <ul>{record.maintenance_answers.map(a => <li key={a.id}><strong>{a.maintenance_question_templates?.pergunta}:</strong> {a.valor}</li>)}</ul>
                            </>
                        )}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

const EquipmentHistory = () => {
    const { toast } = useToast();
    const pdfRef = useRef();
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [equipmentList, setEquipmentList] = useState([]);

    const [filters, setFilters] = useState({
        equipmentId: 'all',
        status: 'all',
        dateRange: { from: null, to: null },
    });
    
    const [pdfRecord, setPdfRecord] = useState(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleGeneratePDF = async (record) => {
        setIsGeneratingPdf(true);
        toast({title: 'Gerando PDF...', description: 'Aguarde enquanto preparamos seu relatório.'});
        setPdfRecord(record);
        
        setTimeout(async () => {
            if (pdfRef.current) {
                try {
                    const canvas = await html2canvas(pdfRef.current, { useCORS: true, scale: 2 });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const ratio = canvasWidth / canvasHeight;
                    const width = pdfWidth;
                    const height = width / ratio;
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, width, height > pdfHeight ? pdfHeight : height);
                    pdf.save(`relatorio-manutencao-${record.id.substring(0,8)}.pdf`);
                    toast({title: 'PDF Gerado!', description: 'O download do seu relatório foi iniciado.'});
                } catch (e) {
                    toast({ variant: 'destructive', title: 'Erro ao gerar PDF', description: e.message });
                }
            }
             setIsGeneratingPdf(false);
             setPdfRecord(null);
        }, 500); // Small delay to ensure the component renders with the correct data
    };

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('maintenance')
                .select(`
                    *,
                    equipment:equipment_id (id, nome, modelo, serial, local, ativo_fixo),
                    maintenance_photos (id, tipo, url),
                    replaced_parts (id, nome_peca, quantidade),
                    maintenance_answers (id, valor, maintenance_question_templates (pergunta))
                `)
                .order('data_inicio', { ascending: false })
                .limit(100); // Limit to prevent large payload issues

            if (error) throw error;
            setRecords(data);
        } catch (e) {
            setError(e.message);
            toast({ variant: 'destructive', title: 'Erro ao carregar histórico', description: e.message });
        } finally {
            setLoading(false);
        }
    }, [toast]);

     const fetchEquipmentList = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('equipment').select('id, nome').order('nome').limit(500);
            if (error) throw error;
            setEquipmentList(data);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erro ao carregar lista de equipamentos.' });
        }
    }, [toast]);

    useEffect(() => {
        fetchHistory();
        fetchEquipmentList();
    }, [fetchHistory, fetchEquipmentList]);

    useEffect(() => {
        let results = [...records];
        if (filters.equipmentId !== 'all') {
            results = results.filter(r => r.equipment_id === filters.equipmentId);
        }
        if (filters.status !== 'all') {
            results = results.filter(r => r.status === filters.status);
        }
        if (filters.dateRange.from) {
            results = results.filter(r => new Date(r.data_inicio) >= filters.dateRange.from);
        }
        if (filters.dateRange.to) {
            const toDate = new Date(filters.dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            results = results.filter(r => new Date(r.data_inicio) <= toDate);
        }
        setFilteredRecords(results);
    }, [filters, records]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Manutenções</CardTitle>
                <CardDescription>Consulte, filtre e exporte os registros de manutenção.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select value={filters.equipmentId} onValueChange={(v) => handleFilterChange('equipmentId', v)}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por equipamento..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Equipamentos</SelectItem>
                            {equipmentList.map(eq => <SelectItem key={eq.id} value={eq.id}>{eq.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por status..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            {Object.entries(statusMapping).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateRange.from ? 
                                    filters.dateRange.to ? 
                                    `${format(filters.dateRange.from, "dd/MM/yy")} - ${format(filters.dateRange.to, "dd/MM/yy")}`
                                    : format(filters.dateRange.from, "dd/MM/yy")
                                : <span>Selecione um período</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="range" selected={filters.dateRange} onSelect={(range) => handleFilterChange('dateRange', range || { from: null, to: null })} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                {error && <div className="text-destructive flex flex-col items-center justify-center h-64"><AlertTriangle className="h-8 w-8 mb-2" /><p>Erro ao carregar dados: {error}</p></div>}
                {!loading && !error && filteredRecords.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground bg-muted/20 rounded-lg">
                        <PackageSearch className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">Nenhum Registro Encontrado</h3>
                        <p className="text-sm">Tente ajustar os filtros ou adicione uma nova manutenção.</p>
                    </div>
                )}
                
                {!loading && !error && filteredRecords.length > 0 && (
                    <Accordion type="single" collapsible className="w-full">
                        {filteredRecords.map(record => (
                            <MaintenanceRecord key={record.id} record={record} onGeneratePDF={handleGeneratePDF} />
                        ))}
                    </Accordion>
                )}
                
                {isGeneratingPdf && <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"><Loader2 className="h-16 w-16 text-white animate-spin" /></div>}

                 <div style={{ position: 'absolute', left: '-9999px', top: 'auto' }}>
                    {pdfRecord && <MaintenanceRecordForPDF ref={pdfRef} record={pdfRecord} />}
                </div>
            </CardContent>
        </Card>
    );
};

export default EquipmentHistory;