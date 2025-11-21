import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, CheckCircle, Package, FileUp, Camera, ClipboardSignature as Signature, MapPin, Search, Calendar as CalendarIcon, AlertTriangle, Info, ArrowRightLeft } from 'lucide-react';
import SignaturePad from '@/components/delivery/SignaturePad';
import CheckInCheckOut from '@/components/CheckInCheckOut';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDebounce } from '@/hooks/useDebounce';

const getPreviousWorkingDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysToSubtract = 1;
    if (dayOfWeek === 0) { daysToSubtract = 2; } 
    else if (dayOfWeek === 1) { daysToSubtract = 3; }
    const previousDay = new Date(today);
    previousDay.setDate(today.getDate() - daysToSubtract);
    return previousDay;
};

const DeliverySummary = ({ items, itemsStatus, houveRetirada }) => {
    const deliveredCount = items.filter(i => {
        const s = itemsStatus?.[i.descricao];
        return (typeof s === 'object' ? s?.delivered : s) === true;
    }).length;
    const totalItems = items.length;
    const notDeliveredCount = totalItems - deliveredCount;

    return (
        <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 text-center flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-green-700 dark:text-green-400">{deliveredCount}</span>
                <span className="text-xs text-green-800 dark:text-green-300 font-medium uppercase tracking-wide mt-1">Entregues</span>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 text-center flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-red-700 dark:text-red-400">{notDeliveredCount}</span>
                <span className="text-xs text-red-800 dark:text-red-300 font-medium uppercase tracking-wide mt-1">Não Entregues</span>
            </div>
            <div className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center transition-colors ${houveRetirada ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-muted border-muted-foreground/20'}`}>
                <span className={`text-3xl font-bold ${houveRetirada ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground/50'}`}>
                    {houveRetirada ? 'SIM' : 'NÃO'}
                </span>
                <span className={`text-xs font-medium uppercase tracking-wide mt-1 ${houveRetirada ? 'text-blue-800 dark:text-blue-300' : 'text-muted-foreground'}`}>Retirada Extra</span>
            </div>
        </div>
    )
}

const ItemList = ({ items, invoiceNum, itemsStatus, onUpdateStatus, isCompleted }) => {
  // Helper to normalize status structure
  const getStatus = (itemName) => {
    const status = itemsStatus?.[itemName];
    // Handle legacy boolean format
    if (status === true || status === false) return { delivered: status, observation: '' };
    // Handle new object format
    if (typeof status === 'object' && status !== null) return status;
    // Default
    return { delivered: false, observation: '' };
  };

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const status = getStatus(item.descricao);
        const isDelivered = status.delivered;
        
        return (
          <li 
            key={index} 
            className={`flex flex-col gap-3 p-4 rounded-lg border transition-all duration-200 ${
                isDelivered 
                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 shadow-sm" 
                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 opacity-90"
            }`}
          >
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 w-full">
                  <Checkbox 
                    id={`item-${invoiceNum}-${index}`} 
                    checked={isDelivered} 
                    onCheckedChange={(checked) => onUpdateStatus(item.descricao, { ...status, delivered: checked })} 
                    disabled={isCompleted} 
                    className={`mt-1 h-5 w-5 ${isDelivered ? "data-[state=checked]:bg-green-600 border-green-600" : "border-red-400 data-[state=unchecked]:bg-transparent"}`}
                  />
                  <div className="grid gap-1 w-full">
                      <label 
                        htmlFor={`item-${invoiceNum}-${index}`} 
                        className={`font-medium text-base leading-tight cursor-pointer select-none flex justify-between items-start ${isDelivered ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"}`}
                      >
                        <span>{item.descricao}</span>
                        <Badge variant={isDelivered ? "success" : "destructive"} className="ml-2 shrink-0">
                            {isDelivered ? "Entregue" : "Não Entregue"}
                        </Badge>
                      </label>
                      <span className="text-xs text-muted-foreground font-medium">Quantidade: {item.quantidade}</span>
                  </div>
                </div>
            </div>
            
            {/* Observation Input */}
            <div className="pl-8">
                <Input 
                    placeholder="Observações do produto (ex: avaria, falta...)" 
                    value={status.observation || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        onUpdateStatus(item.descricao, { ...status, observation: val }, false); // false = don't save immediately on keystroke
                    }}
                    onBlur={(e) => onUpdateStatus(item.descricao, { ...status, observation: e.target.value }, true)} // Save on blur
                    disabled={isCompleted}
                    className="h-9 text-xs bg-background/80 border-input/50 focus:border-primary"
                />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const DeliveryReceipts = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [formStatus, setFormStatus] = useState({}); 
  const [selectedDate, setSelectedDate] = useState(getPreviousWorkingDay());
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchSalesData = useCallback(async (date) => {
    setLoading(true);
    setInvoices({});
    try {
      const targetDate = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase.from('bd-cl').select('"Num. Docto.", Descricao, Quantidade, Cliente, Loja, Nome, "N Fantasia", "DT Emissao", "Endereco"').eq('"DT Emissao"', targetDate);
      if (error) throw error;
      if (data.length === 0) {
        toast({ title: "Nenhuma venda encontrada", description: `Nenhuma venda encontrada para o dia ${format(date, 'dd/MM/yyyy')}.` });
        setLoading(false); return;
      }
      
      const groupedByInvoice = data.reduce((acc, sale) => {
        const invoiceNum = sale['Num. Docto.'];
        if (!acc[invoiceNum]) acc[invoiceNum] = { items: [], clientCode: sale['Cliente'], clientStore: sale['Loja'], clientName: sale['N Fantasia'] || sale['Nome'], endereco: sale['Endereco'] };
        acc[invoiceNum].items.push({ descricao: sale['Descricao'], quantidade: sale['Quantidade'] });
        return acc;
      }, {});
      setInvoices(groupedByInvoice);

      const invoiceNumbers = Object.keys(groupedByInvoice);
      const { data: entregasData, error: entregasError } = await supabase.from('entregas').select('*').in('venda_num_docto', invoiceNumbers);
      if (entregasError) throw entregasError;

      const initialFormData = {};
      const initialFormStatus = {};

      for (const invoiceNum of invoiceNumbers) {
        const entrega = entregasData.find(e => e.venda_num_docto === invoiceNum);
        
        // Initialize items_status with _meta if missing
        const itemsStatus = entrega?.items_status || {};
        if (!itemsStatus._meta) {
            itemsStatus._meta = { houve_retirada: false, produtos_retirados: '' };
        }

        initialFormData[invoiceNum] = {
          id: entrega?.id || null,
          caixas_entregues: entrega?.caixas_entregues || '',
          caixas_retiradas: entrega?.caixas_recolhidas || '',
          recebedor_nome: entrega?.recebedor_nome || '',
          recebedor_documento: entrega?.recebedor_documento || '',
          observacoes: entrega?.observacoes || '',
          assinatura_digital: entrega?.assinatura_digital || null,
          canhoto: null, fotos: [], 
          items_status: itemsStatus,
          check_in_time: entrega?.check_in_time, check_in_lat: entrega?.check_in_lat, check_in_lng: entrega?.check_in_lng, check_in_address: entrega?.check_in_address,
          check_out_time: entrega?.check_out_time, check_out_lat: entrega?.check_out_lat, check_out_lng: entrega?.check_out_lng, check_out_address: entrega?.check_out_address,
        };
        initialFormStatus[invoiceNum] = { 
          isFinalLoading: false, finalError: null, isFinalized: entrega?.status === 'Concluído',
          isCheckInLoading: false, isCheckOutLoading: false
        };
      }
      setFormData(initialFormData); setFormStatus(initialFormStatus);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({ variant: 'destructive', title: 'Erro ao buscar vendas', description: error.message });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchSalesData(selectedDate); }, [fetchSalesData, selectedDate]);

  const handleInputChange = (invoiceNum, field, value) => {
    setFormData(prev => ({ ...prev, [invoiceNum]: { ...prev[invoiceNum], [field]: value } }));
  };

  const updateItemsStatusInDb = async (invoiceNum, newStatus, saveToDb = true) => {
    // Update Local State
    handleInputChange(invoiceNum, 'items_status', newStatus);
    
    if (saveToDb) {
        try {
            const { error } = await supabase.from('entregas').update({ items_status: newStatus }).eq('venda_num_docto', invoiceNum);
            if (error) throw error;
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Erro ao salvar status', description: e.message });
        }
    }
  };

  const handleItemStatusChange = (invoiceNum, itemName, newStatusObj, saveToDb = true) => {
      const currentStatus = formData[invoiceNum]?.items_status || {};
      const updatedStatusMap = { ...currentStatus, [itemName]: newStatusObj };
      updateItemsStatusInDb(invoiceNum, updatedStatusMap, saveToDb);
  };

  const handleMetaChange = (invoiceNum, field, value, saveToDb = true) => {
      const currentStatus = formData[invoiceNum]?.items_status || {};
      const currentMeta = currentStatus._meta || {};
      const newMeta = { ...currentMeta, [field]: value };
      const newStatus = { ...currentStatus, _meta: newMeta };
      updateItemsStatusInDb(invoiceNum, newStatus, saveToDb);
  };

  const handleCheckIn = async (invoiceNum, data) => {
    setFormStatus(prev => ({...prev, [invoiceNum]: {...prev[invoiceNum], isCheckInLoading: true }}));
    
    if (!data) {
        setFormStatus(prev => ({...prev, [invoiceNum]: {...prev[invoiceNum], isCheckInLoading: false }}));
        return;
    }

    setFormData(prev => ({ ...prev, [invoiceNum]: { ...prev[invoiceNum], ...data }}));
    
    try {
      const { data: existing } = await supabase.from('entregas').select('id').eq('venda_num_docto', invoiceNum).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('entregas').update(data).eq('id', existing.id);
        if (error) throw error;
      } else {
        const insertData = {
            venda_num_docto: invoiceNum,
            ...data,
            data_entrega: new Date().toISOString(),
            caixas_entregues: 0,
            caixas_recolhidas: 0
        };
        const { data: newRecord, error } = await supabase.from('entregas').insert(insertData).select().single();
        if (error) throw error;
        setFormData(prev => ({...prev, [invoiceNum]: {...prev[invoiceNum], id: newRecord.id}}));
      }
      toast({ title: "Check-in registrado", description: "Localização de chegada salva com sucesso." });
    } catch (error) {
      console.error("Check-in error:", error);
      toast({ variant: 'destructive', title: 'Erro ao salvar check-in', description: error.message });
    } finally {
      setFormStatus(prev => ({...prev, [invoiceNum]: {...prev[invoiceNum], isCheckInLoading: false }}));
    }
  };

  const handleCheckOut = async (invoiceNum, data) => {
    setFormStatus(prev => ({...prev, [invoiceNum]: {...prev[invoiceNum], isCheckOutLoading: true }}));
    
    if (!data) {
        setFormStatus(prev => ({...prev, [invoiceNum]: {...prev[invoiceNum], isCheckOutLoading: false }}));
        return;
    }

    setFormData(prev => ({ ...prev, [invoiceNum]: { ...prev[invoiceNum], ...data }}));
    
    try {
        const receiptData = formData[invoiceNum];
        if (receiptData.id) {
             const { error } = await supabase.from('entregas').update(data).eq('id', receiptData.id);
             if (error) throw error;
             toast({ title: "Check-out registrado", description: "Localização de saída capturada." });
        } else {
             toast({ variant: 'destructive', title: 'Erro', description: 'Faça o check-in primeiro.' });
        }
    } catch (error) {
        console.error("Check-out error:", error);
        toast({ variant: 'destructive', title: 'Erro ao salvar check-out', description: error.message });
    } finally {
        setFormStatus(prev => ({...prev, [invoiceNum]: {...prev[invoiceNum], isCheckOutLoading: false }}));
    }
  };

  const handleFinalize = async (invoiceNum) => {
    setFormStatus(prev => ({ ...prev, [invoiceNum]: { ...prev[invoiceNum], isFinalLoading: true, finalError: null } }));
    const receiptData = formData[invoiceNum];
    const items = invoices[invoiceNum].items;
    const itemsStatus = receiptData.items_status || {};
    const meta = itemsStatus._meta || {};

    // Validation: At least one item delivered OR withdrawal happened
    const deliveredCount = items.filter(i => {
        const s = itemsStatus[i.descricao];
        return (typeof s === 'object' ? s?.delivered : s) === true;
    }).length;

    if (deliveredCount === 0 && !meta.houve_retirada) {
        toast({ variant: 'destructive', title: "Ação inválida", description: "É necessário marcar pelo menos um produto como entregue ou registrar uma retirada."});
        setFormStatus(prev => ({ ...prev, [invoiceNum]: { ...prev[invoiceNum], isFinalLoading: false, finalError: "Marque uma entrega ou retirada." } }));
        return;
    }

    // Validation: Required fields
    const requiredFields = {
      caixas_entregues: "Caixas Entregues",
      recebedor_nome: "Nome do Recebedor",
      recebedor_documento: "Documento do Recebedor",
      assinatura_digital: "Assinatura Digital",
      check_out_time: "Check-out (Saída)"
    };

    for(const [field, label] of Object.entries(requiredFields)){
      if(receiptData[field] === '' || receiptData[field] === null || receiptData[field] === undefined){
        toast({ variant: 'destructive', title: "Campo obrigatório", description: `O campo "${label}" é obrigatório para finalizar.`});
        setFormStatus(prev => ({ ...prev, [invoiceNum]: { ...prev[invoiceNum], isFinalLoading: false, finalError: `Campo "${label}" é obrigatório.` } }));
        return;
      }
    }

    try {
      const { canhoto, fotos, id, caixas_retiradas, ...textData } = receiptData;
      let canhotoUrl = null, photoUrls = [];

      if (canhoto?.length > 0) {
        const filePath = `${invoiceNum}/canhoto_${Date.now()}_${canhoto[0].name}`;
        const { data: upData, error } = await supabase.storage.from('Canhotos_Assinaturas').upload(filePath, canhoto[0]);
        if (error) throw error;
        canhotoUrl = supabase.storage.from('Canhotos_Assinaturas').getPublicUrl(upData.path).data.publicUrl;
      }

      if (fotos?.length > 0) {
        for (const file of Array.from(fotos)) {
            const filePath = `${invoiceNum}/foto_${Date.now()}_${file.name}`;
            const { data: upData, error } = await supabase.storage.from('Canhotos_Assinaturas').upload(filePath, file);
            if(error) throw error;
            photoUrls.push(supabase.storage.from('Canhotos_Assinaturas').getPublicUrl(upData.path).data.publicUrl);
        }
      }

      const dataToSave = {
        ...textData,
        venda_num_docto: invoiceNum,
        cliente_nome: invoices[invoiceNum].clientName,
        caixas_entregues: parseInt(receiptData.caixas_entregues) || 0,
        caixas_recolhidas: parseInt(receiptData.caixas_retiradas) || 0,
        foto_comprovante: canhotoUrl,
        fotos: photoUrls,
        status: 'Concluído', 
        data_entrega: new Date().toISOString(),
      };

      const { error } = await supabase.from('entregas').update(dataToSave).eq('id', receiptData.id);
      if (error) throw error;

      toast({ title: 'Entrega finalizada com sucesso!', description: `O protocolo para a nota ${invoiceNum} foi registrado.` });
      setFormStatus(prev => ({ ...prev, [invoiceNum]: { ...prev[invoiceNum], isFinalLoading: false, finalError: null, isFinalized: true } }));
    } catch (error) {
      console.error('Error finalizing receipt:', error);
      toast({ variant: 'destructive', title: 'Erro ao finalizar entrega', description: error.message });
      setFormStatus(prev => ({ ...prev, [invoiceNum]: { ...prev[invoiceNum], isFinalLoading: false, finalError: error.message } }));
    }
  };

  const filteredInvoices = useMemo(() => {
    if (!debouncedSearchTerm) return invoices;
    return Object.entries(invoices).reduce((acc, [invoiceNum, invoiceData]) => {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      if (invoiceNum.includes(searchTermLower) || invoiceData.clientName.toLowerCase().includes(searchTermLower)) acc[invoiceNum] = invoiceData;
      return acc;
    }, {});
  }, [invoices, debouncedSearchTerm]);

  return (
    <>
      <Helmet><title>Protocolos de Entrega</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div><h1 className="text-3xl font-bold tracking-tight">Protocolos de Entrega</h1><p className="text-muted-foreground">Gerencie os protocolos do dia selecionado.</p></div>
            <div className="flex items-center gap-2">
                <Popover><PopoverTrigger asChild><Button variant={"outline"} className="w-[280px] justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus locale={ptBR} /></PopoverContent></Popover>
            </div>
        </div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por nº da nota ou cliente..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        {loading ? <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
        : Object.keys(filteredInvoices).length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {Object.entries(filteredInvoices).map(([invoiceNum, invoiceData]) => {
              const status = formStatus[invoiceNum] || {}; 
              const receiptData = formData[invoiceNum] || {}; 
              const isFinalized = status.isFinalized; 
              const hasCheckIn = !!receiptData.check_in_time;
              const itemsStatus = receiptData.items_status || {};
              const meta = itemsStatus._meta || {};

              return (
              <Card key={invoiceNum} className={isFinalized ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : ''}>
                <AccordionItem value={invoiceNum} className="border-b-0">
                  <AccordionTrigger className="p-6 hover:no-underline"><div className="flex items-center justify-between w-full"><div className="text-left space-y-1"><p className="text-lg font-semibold text-primary">Nota Fiscal: {invoiceNum}</p><p className="text-sm font-medium text-foreground">{invoiceData.clientName}</p><div className="flex items-center text-xs text-muted-foreground"><MapPin className="h-3 w-3 mr-1.5" /><span>{invoiceData.endereco}</span></div></div>{isFinalized && <CheckCircle className="h-6 w-6 text-green-600" />}</div></AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    {isFinalized ? <div className="text-center py-8"><CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" /><p className="font-semibold">Esta entrega já foi finalizada.</p></div>
                    : <div className="space-y-6">
                        <fieldset disabled={isFinalized}>
                            <CheckInCheckOut 
                                record={receiptData} 
                                onCheckIn={(data) => handleCheckIn(invoiceNum, data)} 
                                onCheckOut={(data) => handleCheckOut(invoiceNum, data)} 
                                isCheckInLoading={status.isCheckInLoading} 
                                isCheckOutLoading={status.isCheckOutLoading} 
                                disabled={isFinalized}
                            />
                            <hr className="my-6" />
                            <fieldset disabled={!hasCheckIn || isFinalized} className="space-y-6">
                                
                                {/* Withdrawal Section */}
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                                            <Label htmlFor={`withdrawal-toggle-${invoiceNum}`} className="font-semibold text-base cursor-pointer">Retirada de Outros Produtos</Label>
                                        </div>
                                        <Switch 
                                            id={`withdrawal-toggle-${invoiceNum}`}
                                            checked={meta.houve_retirada}
                                            onCheckedChange={(checked) => handleMetaChange(invoiceNum, 'houve_retirada', checked)}
                                        />
                                    </div>
                                    {meta.houve_retirada && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                            <Label htmlFor={`withdrawal-list-${invoiceNum}`} className="text-xs mb-1.5 block">Liste os produtos retirados/devolvidos:</Label>
                                            <Textarea 
                                                id={`withdrawal-list-${invoiceNum}`}
                                                placeholder="Ex: 2x Produto X (Avaria), 1x Produto Y (Troca)..."
                                                value={meta.produtos_retirados}
                                                onChange={(e) => handleMetaChange(invoiceNum, 'produtos_retirados', e.target.value, false)}
                                                onBlur={(e) => handleMetaChange(invoiceNum, 'produtos_retirados', e.target.value, true)}
                                                className="min-h-[80px] bg-background"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Product Checklist */}
                                <div>
                                    <Label className="font-semibold text-base flex items-center gap-2 mb-2"><Package className="h-5 w-5" /> Conferência de Itens</Label>
                                    <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"><Info className="h-4 w-4 text-blue-600" /><AlertTitle>Instruções</AlertTitle><AlertDescription>Marque os itens entregues. Itens desmarcados serão considerados como "Não Entregue".</AlertDescription></Alert>
                                    
                                    <DeliverySummary items={invoiceData.items} itemsStatus={itemsStatus} houveRetirada={meta.houve_retirada} />

                                    <ItemList 
                                        items={invoiceData.items} 
                                        invoiceNum={invoiceNum} 
                                        itemsStatus={itemsStatus} 
                                        onUpdateStatus={(itemName, newStatus, save) => handleItemStatusChange(invoiceNum, itemName, newStatus, save)} 
                                        isCompleted={isFinalized} 
                                    />
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor={`delivered-${invoiceNum}`}>Caixas Entregues (Plásticas)</Label>
                                        <Input 
                                            id={`delivered-${invoiceNum}`} 
                                            type="number" 
                                            min="0"
                                            placeholder="0" 
                                            value={receiptData.caixas_entregues} 
                                            onChange={(e) => handleInputChange(invoiceNum, 'caixas_entregues', e.target.value)} 
                                            required 
                                            className="text-lg font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`pickedup-${invoiceNum}`}>Caixas Retiradas (Plásticas)</Label>
                                        <Input 
                                            id={`pickedup-${invoiceNum}`} 
                                            type="number" 
                                            min="0"
                                            placeholder="0" 
                                            value={receiptData.caixas_retiradas} 
                                            onChange={(e) => handleInputChange(invoiceNum, 'caixas_retiradas', e.target.value)} 
                                            className="text-lg font-medium"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor={`obs-${invoiceNum}`}>Observações Gerais da Entrega</Label>
                                    <Textarea id={`obs-${invoiceNum}`} placeholder="Informações adicionais sobre a entrega..." value={receiptData.observacoes} onChange={(e) => handleInputChange(invoiceNum, 'observacoes', e.target.value)} />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label htmlFor={`recipient-name-${invoiceNum}`}>Nome do Recebedor</Label><Input id={`recipient-name-${invoiceNum}`} placeholder="Quem recebeu a entrega" value={receiptData.recebedor_nome} onChange={(e) => handleInputChange(invoiceNum, 'recebedor_nome', e.target.value)} required /></div>
                                    <div className="space-y-2"><Label htmlFor={`recipient-doc-${invoiceNum}`}>CPF/RG do Recebedor</Label><Input id={`recipient-doc-${invoiceNum}`} placeholder="Documento de quem recebeu" value={receiptData.recebedor_documento} onChange={(e) => handleInputChange(invoiceNum, 'recebedor_documento', e.target.value)} required/></div>
                                </div>
                                
                                <div><Label className="font-semibold text-base flex items-center gap-2"><Signature className="h-5 w-5" />Assinatura Digital</Label><div className="mt-2"><SignaturePad onSave={(dataUrl) => handleInputChange(invoiceNum, 'assinatura_digital', dataUrl)} initialData={receiptData.assinatura_digital}/></div>{receiptData.assinatura_digital && <p className="text-xs text-green-600 mt-1">Assinatura confirmada.</p>}</div>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label className="flex items-center gap-2" htmlFor={`invoice-copy-${invoiceNum}`}><FileUp className="h-4 w-4" /> Canhoto da NF</Label><Input id={`invoice-copy-${invoiceNum}`} type="file" onChange={(e) => handleInputChange(invoiceNum, 'canhoto', e.target.files)} /></div>
                                    <div className="space-y-2"><Label className="flex items-center gap-2" htmlFor={`photos-${invoiceNum}`}><Camera className="h-4 w-4" /> Fotos Adicionais</Label><Input id={`photos-${invoiceNum}`} type="file" multiple onChange={(e) => handleInputChange(invoiceNum, 'fotos', e.target.files)} /></div>
                                </div>
                                
                                <Button onClick={() => handleFinalize(invoiceNum)} disabled={status.isFinalLoading || !hasCheckIn || isFinalized} className="w-full h-12 text-lg">{status.isFinalLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Finalizar Entrega'}</Button>
                                {status.finalError && <p className="text-sm text-destructive text-center flex items-center justify-center gap-2"><AlertTriangle className="h-4 w-4"/> {status.finalError}</p>}
                            </fieldset>
                        </fieldset>
                    </div>}
                  </AccordionContent>
                </AccordionItem>
              </Card>
            )})}
          </Accordion>
        ) : <Alert><Package className="h-4 w-4" /><AlertTitle>Nenhum protocolo para a data selecionada</AlertTitle><AlertDescription>{debouncedSearchTerm ? 'Nenhum protocolo corresponde à sua busca.' : 'Não foram encontradas notas fiscais para gerar protocolos.'}</AlertDescription></Alert>}
      </div>
    </>
  );
};

export default DeliveryReceipts;