
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, XCircle, Upload, FileImage, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { uploadQualificationPhoto } from '@/services/crmService';
import { useToast } from '@/components/ui/use-toast';

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
            <div className="absolute top-2 right-2 pointer-events-none">
                {isFilled ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500 opacity-50" />}
            </div>
        )}
    </div>
);

const PhotoUploadField = ({ id, label, value, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // Upload returns the public URL
            const publicUrl = await uploadQualificationPhoto(file, id);
            onChange(id, publicUrl);
            toast({ title: "Sucesso", description: "Foto enviada com sucesso." });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Falha no envio da foto." });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`p-4 rounded-lg border-2 transition-colors ${value ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300 hover:border-indigo-400'}`}>
            <div className="flex flex-col items-center gap-3 text-center">
                {value ? (
                    <>
                        <div className="relative h-20 w-full">
                            <img src={value} alt={label} className="h-full w-full object-cover rounded-md" />
                            <a href={value} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors rounded-md">
                                <FileImage className="text-white h-6 w-6" />
                            </a>
                        </div>
                        <Label className="text-sm text-green-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Enviado
                        </Label>
                        <Button variant="ghost" size="xs" className="h-6 text-xs" onClick={() => document.getElementById(`file-${id}`).click()}>Alterar</Button>
                    </>
                ) : (
                    <>
                        <div className="p-2 bg-gray-100 rounded-full">
                            {uploading ? <Loader2 className="h-6 w-6 animate-spin text-indigo-600" /> : <Upload className="h-6 w-6 text-gray-500" />}
                        </div>
                        <Label htmlFor={`file-${id}`} className="cursor-pointer text-sm font-medium text-gray-700 hover:text-indigo-600">
                            {uploading ? 'Enviando...' : `Enviar ${label}`}
                        </Label>
                    </>
                )}
                <input 
                    id={`file-${id}`} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    disabled={uploading} 
                />
            </div>
        </div>
    );
};

const QualificationChecklist = ({ qualificationData, onFieldChange }) => {
    const totalFields = qualificationFieldsConfig.filter(f => f.isRequired).length;
    // For photos, value should be a URL string (truthy). For bools, strict true. For strings, non-empty.
    const completedFields = qualificationFieldsConfig.filter(f => {
        if (!f.isRequired) return false;
        const val = qualificationData[f.id];
        if (f.type === 'photo') return !!val && typeof val === 'string';
        if (f.type === 'boolean') return val === true;
        return !!val;
    }).length;
    
    const completionPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

    return (
        <div className="space-y-6">
             <div className="space-y-2 sticky top-0 bg-background pt-2 pb-4 z-10 border-b">
                <div className="flex justify-between text-sm font-medium">
                    <span>Progresso da Qualificação</span>
                    <span>{completedFields} de {totalFields} obrigatórios</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
            </div>

            <Card>
                <CardHeader><CardTitle className="text-lg">Evidências Fotográficas</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {qualificationFieldsConfig.filter(f => f.type === 'photo').map(field => (
                        <FormFieldWrapper key={field.id} isFilled={!!qualificationData[field.id]} isRequired={field.isRequired}>
                            <PhotoUploadField 
                                id={field.id} 
                                label={field.label} 
                                value={qualificationData[field.id]} 
                                onChange={onFieldChange} 
                            />
                        </FormFieldWrapper>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg">Informações Comerciais</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {qualificationFieldsConfig.filter(f => f.type === 'text' && f.id !== 'buyer_contact').map(field => (
                         <FormFieldWrapper key={field.id} isFilled={!!qualificationData[field.id]} isRequired={field.isRequired}>
                            <div className="space-y-1.5">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <Input
                                    id={field.id}
                                    value={qualificationData[field.id] || ''}
                                    onChange={(e) => onFieldChange(field.id, e.target.value)}
                                    className={field.isRequired && !qualificationData[field.id] ? 'border-red-200 focus-visible:ring-red-200' : ''}
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
                            <FormFieldWrapper key={field.id} isFilled={!!qualificationData[field.id]} isRequired={field.isRequired}>
                                <div className="space-y-1.5">
                                    <Label htmlFor={field.id}>{field.label}</Label>
                                    <Input
                                        id={field.id}
                                        value={qualificationData[field.id] || ''}
                                        onChange={(e) => onFieldChange(field.id, e.target.value)}
                                        className={field.isRequired && !qualificationData[field.id] ? 'border-red-200 focus-visible:ring-red-200' : ''}
                                    />
                                </div>
                            </FormFieldWrapper>
                        )
                    })}
                    <div className="flex items-center space-x-2 pt-6 col-span-2 p-4 bg-slate-50 rounded-lg border">
                        <Checkbox id="introduction_requested"
                            checked={!!qualificationData.introduction_requested}
                            onCheckedChange={(checked) => onFieldChange('introduction_requested', checked)}
                        />
                        <Label htmlFor="introduction_requested" className="cursor-pointer font-semibold">Apresentação Institucional Solicitada?</Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg">Detalhes Adicionais</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-6">
                    {qualificationFieldsConfig.filter(f => f.type === 'textarea').map(field => (
                        <FormFieldWrapper key={field.id} isFilled={!!qualificationData[field.id]} isRequired={field.isRequired}>
                            <div className="space-y-1.5">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <Textarea
                                    id={field.id}
                                    value={qualificationData[field.id] || ''}
                                    onChange={(e) => onFieldChange(field.id, e.target.value)}
                                    className={`min-h-[100px] ${field.isRequired && !qualificationData[field.id] ? 'border-red-200 focus-visible:ring-red-200' : ''}`}
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
