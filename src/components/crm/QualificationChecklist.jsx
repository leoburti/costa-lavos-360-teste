
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    CheckCircle2, 
    XCircle, 
    Upload, 
    FileImage, 
    Loader2, 
    RefreshCw, 
    AlertCircle, 
    ArrowDownToLine,
    Cloud,
    CloudLightning,
    Check
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useUploadManager } from '@/hooks/useUploadManager';
import { useFormStatePersistence } from '@/hooks/useFormStatePersistence';
import { cn } from '@/lib/utils';

export const qualificationFieldsConfig = [
    { id: 'has_facade_photo', label: 'Foto da Fachada', type: 'photo', isRequired: true },
    { id: 'has_bakery_photo', label: 'Foto da Padaria', type: 'photo', isRequired: true },
    { id: 'has_equipment_photo', label: 'Foto dos Equipamentos', type: 'photo', isRequired: true },
    { id: 'has_shelf_photo', label: 'Foto das Gôndolas', type: 'photo', isRequired: true },
    { id: 'has_butcher_photo', label: 'Foto do Açougue/Frios', type: 'photo', isRequired: false },
    { id: 'current_bread_volume', label: 'Volume de Pão/dia (atual)', type: 'text', isRequired: true },
    { id: 'competitor_price', label: 'Preço do Concorrente', type: 'text', isRequired: true },
    { id: 'current_supplier', label: 'Fornecedor Atual/Produção Própria', type: 'text', isRequired: true },
    { id: 'main_complaint', label: 'Queixa Principal / Dor', type: 'textarea', isRequired: true },
    { id: 'contract_status', label: 'Status do Contrato com Fornecedor Atual', type: 'text', isRequired: true },
    { id: 'equipment_needed', label: 'Quantidade de Equipamentos Necessária', type: 'text', isRequired: true },
    { id: 'proposed_price', label: 'Preço Proposto (Tabela)', type: 'text', isRequired: true },
    { id: 'proposed_bread_price', label: 'Preço do Pão Proposto', type: 'text', isRequired: true },
    { id: 'proposed_bread_volume', label: 'Volume de Pão Proposto', type: 'text', isRequired: true },
    { id: 'buyer_contact', label: 'Nome/Contato do Comprador', type: 'text', isRequired: true },
    { id: 'introduction_requested', label: 'Apresentação Solicitada?', type: 'boolean', isRequired: true },
    { id: 'negotiated_mix', label: 'Itens e Volume do Mix Negociado', type: 'textarea', isRequired: true },
];

const FormFieldWrapper = ({ children, isFilled, isRequired }) => (
    <div className="relative">
        {children}
        {isRequired && (
            <div className="absolute top-2 right-2 pointer-events-none z-10">
                {isFilled ? <CheckCircle2 className="h-5 w-5 text-green-500 bg-white rounded-full" /> : <XCircle className="h-5 w-5 text-red-500 opacity-50" />}
            </div>
        )}
    </div>
);

const PhotoUploadField = ({ id, label, value, onChange }) => {
    const { status, progress, cachedUrl, uploadPhoto, retry, resetStatus } = useUploadManager(id);
    const [lastFile, setLastFile] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLastFile(file);
        await uploadPhoto(file, (url) => onChange(id, url));
        e.target.value = ''; 
    };

    const handleRetry = () => {
        if (lastFile) {
            retry(lastFile, (url) => onChange(id, url));
        } else {
            document.getElementById(`file-${id}`).click();
        }
    };

    const handleRestore = () => {
        if (cachedUrl) {
            onChange(id, cachedUrl);
        }
    };

    const displayUrl = value || (status === 'success' ? cachedUrl : null);

    return (
        <div className={cn(
            "p-4 rounded-lg border-2 transition-all relative overflow-hidden",
            displayUrl ? 'border-green-500 bg-green-50/50' : 
            status === 'error' ? 'border-red-300 bg-red-50' :
            status === 'uploading' ? 'border-blue-300 bg-blue-50' : 'border-dashed border-gray-300 hover:border-indigo-400'
        )}>
            {status === 'uploading' && (
                <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            )}

            <div className="flex flex-col items-center gap-3 text-center">
                {displayUrl ? (
                    <>
                        <div className="relative h-24 w-full group">
                            <img src={displayUrl} alt={label} className="h-full w-full object-contain rounded-md bg-black/5" />
                            <a href={displayUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors rounded-md">
                                <FileImage className="text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </div>
                        <div className="flex items-center gap-2 w-full justify-center">
                            <Label className="text-sm text-green-700 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> Enviado
                            </Label>
                            <Button variant="ghost" size="xs" className="h-6 text-xs hover:bg-green-100" onClick={() => document.getElementById(`file-${id}`).click()}>
                                Alterar
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {status === 'uploading' ? (
                            <div className="py-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                                <span className="text-xs text-blue-600 font-medium">Enviando... {progress}%</span>
                            </div>
                        ) : status === 'error' || status === 'interrupted' ? (
                            <div className="space-y-2">
                                <div className="p-2 bg-red-100 rounded-full w-fit mx-auto">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-red-600 font-medium">
                                        {status === 'interrupted' ? 'Envio interrompido' : 'Falha no envio'}
                                    </span>
                                    <Button variant="outline" size="sm" onClick={handleRetry} className="mx-auto border-red-200 hover:bg-red-100 text-red-700">
                                        <RefreshCw className="mr-2 h-3 w-3" /> Tentar Novamente
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <Upload className="h-6 w-6 text-gray-500" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`file-${id}`} className="cursor-pointer text-sm font-medium text-gray-700 hover:text-indigo-600 block">
                                        Enviar {label}
                                    </Label>
                                    {!value && cachedUrl && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={handleRestore} 
                                            className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-auto py-1"
                                        >
                                            <ArrowDownToLine className="mr-1 h-3 w-3" /> 
                                            Restaurar foto recente
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
                <input 
                    id={`file-${id}`} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    disabled={status === 'uploading'} 
                />
            </div>
        </div>
    );
};

const QualificationChecklist = ({ qualificationData, onFieldChange, dealId }) => {
    // 1) Initialize persistence hook
    // If parent handler supports generic update, we pass a wrapper. If not, we pass the standard one.
    const handleSync = (id, val) => {
        if (typeof onFieldChange === 'function') {
            onFieldChange(id, val);
        }
    };

    // Use hook to manage 'local' state which is persisted
    // dealId is used as unique key. If not present, we fall back to 'new' (risky but needed)
    const { formData, handleChange, status, lastSaved } = useFormStatePersistence(
        dealId || 'temp_contract', 
        qualificationData, 
        handleSync
    );

    // Use formData (managed by hook) instead of raw qualificationData for inputs
    const dataToUse = formData || qualificationData;

    const totalFields = qualificationFieldsConfig.filter(f => f.isRequired).length;
    const completedFields = qualificationFieldsConfig.filter(f => {
        if (!f.isRequired) return false;
        const val = dataToUse[f.id];
        if (f.type === 'photo') return !!val && typeof val === 'string';
        if (f.type === 'boolean') return val === true;
        return !!val;
    }).length;
    
    const completionPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

    return (
        <div className="space-y-6">
             <div className="space-y-2 sticky top-0 bg-background pt-2 pb-4 z-10 border-b">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <div className="flex justify-between text-sm font-medium mb-1 w-full min-w-[300px]">
                            <span>Progresso da Qualificação</span>
                            <span className={cn("ml-4", completedFields === totalFields ? "text-green-600" : "text-muted-foreground")}>
                                {completedFields} de {totalFields} obrigatórios
                            </span>
                        </div>
                    </div>
                    
                    {/* 5) Visual Indicator for Persistence */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in">
                        {status === 'saving' && (
                            <>
                                <CloudLightning className="h-3 w-3 text-blue-500 animate-pulse" />
                                <span className="text-blue-500">Salvando...</span>
                            </>
                        )}
                        {status === 'saved' && (
                            <>
                                <Cloud className="h-3 w-3 text-green-600" />
                                <span className="text-green-600">Salvo</span>
                                <span className="text-[10px] text-gray-400 hidden sm:inline">
                                    ({lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </span>
                            </>
                        )}
                        {status === 'restored' && (
                            <>
                                <RefreshCw className="h-3 w-3 text-orange-500" />
                                <span className="text-orange-500">Restaurado</span>
                            </>
                        )}
                    </div>
                </div>
                <Progress value={completionPercentage} className="h-2" indicatorClassName={completedFields === totalFields ? 'bg-green-500' : ''} />
            </div>

            <Card>
                <CardHeader><CardTitle className="text-lg">Evidências Fotográficas</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {qualificationFieldsConfig.filter(f => f.type === 'photo').map(field => (
                        <FormFieldWrapper key={field.id} isFilled={!!dataToUse[field.id]} isRequired={field.isRequired}>
                            <PhotoUploadField 
                                id={field.id} 
                                label={field.label} 
                                value={dataToUse[field.id]} 
                                onChange={handleChange} // Use hooked handler
                            />
                        </FormFieldWrapper>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg">Informações Comerciais</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {qualificationFieldsConfig.filter(f => f.type === 'text' && f.id !== 'buyer_contact').map(field => (
                         <FormFieldWrapper key={field.id} isFilled={!!dataToUse[field.id]} isRequired={field.isRequired}>
                            <div className="space-y-1.5">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <Input
                                    id={field.id}
                                    value={dataToUse[field.id] || ''}
                                    onChange={(e) => handleChange(field.id, e.target.value)} // Use hooked handler
                                    className={field.isRequired && !dataToUse[field.id] ? 'border-red-200 focus-visible:ring-red-200' : ''}
                                />
                            </div>
                         </FormFieldWrapper>
                    ))}
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle className="text-lg">Proposta e Negociação</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['proposed_price', 'proposed_bread_price', 'proposed_bread_volume', 'buyer_contact'].map(id => {
                        const field = qualificationFieldsConfig.find(f => f.id === id);
                        return (
                            <FormFieldWrapper key={field.id} isFilled={!!dataToUse[field.id]} isRequired={field.isRequired}>
                                <div className="space-y-1.5">
                                    <Label htmlFor={field.id}>{field.label}</Label>
                                    <Input
                                        id={field.id}
                                        value={dataToUse[field.id] || ''}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        className={field.isRequired && !dataToUse[field.id] ? 'border-red-200 focus-visible:ring-red-200' : ''}
                                    />
                                </div>
                            </FormFieldWrapper>
                        )
                    })}
                    <div className="flex items-center space-x-2 pt-6 col-span-2 p-4 bg-slate-50 rounded-lg border">
                        <Checkbox id="introduction_requested"
                            checked={!!dataToUse.introduction_requested}
                            onCheckedChange={(checked) => handleChange('introduction_requested', checked)}
                        />
                        <Label htmlFor="introduction_requested" className="cursor-pointer font-semibold">Apresentação Institucional Solicitada?</Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg">Detalhes Adicionais</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-6">
                    {qualificationFieldsConfig.filter(f => f.type === 'textarea').map(field => (
                        <FormFieldWrapper key={field.id} isFilled={!!dataToUse[field.id]} isRequired={field.isRequired}>
                            <div className="space-y-1.5">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <Textarea
                                    id={field.id}
                                    value={dataToUse[field.id] || ''}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    className={`min-h-[100px] ${field.isRequired && !dataToUse[field.id] ? 'border-red-200 focus-visible:ring-red-200' : ''}`}
                                />
                            </div>
                        </FormFieldWrapper>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default QualificationChecklist;
