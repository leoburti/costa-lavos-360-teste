import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const qualificationFieldsConfig = [
    { id: 'has_facade_photo', label: 'Foto da Fachada', type: 'photo' },
    { id: 'has_bakery_photo', label: 'Foto da Padaria', type: 'photo' },
    { id: 'has_equipment_photo', label: 'Foto dos Equipamentos', type: 'photo' },
    { id: 'has_shelf_photo', label: 'Foto das Gôndolas', type: 'photo' },
    { id: 'has_butcher_photo', label: 'Foto do Açougue/Frios', type: 'photo' },
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
            <div className="absolute top-2 right-2">
                {isFilled ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            </div>
        )}
    </div>
);

const QualificationChecklist = ({ qualificationData, onFieldChange }) => {
    const totalFields = qualificationFieldsConfig.filter(f => f.isRequired).length;
    const completedFields = qualificationFieldsConfig.filter(f => f.isRequired && qualificationData[f.id]).length;
    const completionPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

    return (
        <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Progresso da Qualificação</span>
                    <span>{completedFields} de {totalFields}</span>
                </div>
                <Progress value={completionPercentage} />
            </div>

            <Card>
                <CardHeader><CardTitle className="text-lg">Upload de Fotos</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {qualificationFieldsConfig.filter(f => f.type === 'photo').map(field => (
                        <FormFieldWrapper key={field.id} isFilled={!!qualificationData[field.id]} isRequired={field.isRequired}>
                            <div className={`p-4 rounded-lg border-2 ${!!qualificationData[field.id] ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'}`}>
                                <Label htmlFor={field.id} className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                        id={field.id}
                                        checked={!!qualificationData[field.id]}
                                        onCheckedChange={(checked) => onFieldChange(field.id, checked)}
                                    />
                                    <span>{field.label}</span>
                                </Label>
                            </div>
                        </FormFieldWrapper>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg">Informações Comerciais</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {qualificationFieldsConfig.filter(f => f.type === 'text' && f.id !== 'buyer_contact').map(field => (
                         <FormFieldWrapper key={field.id} isFilled={!!qualificationData[field.id]} isRequired={field.isRequired}>
                            <div className="space-y-1">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <Input
                                    id={field.id}
                                    value={qualificationData[field.id] || ''}
                                    onChange={(e) => onFieldChange(field.id, e.target.value)}
                                    className={field.isRequired && !qualificationData[field.id] ? 'border-red-500' : ''}
                                />
                            </div>
                         </FormFieldWrapper>
                    ))}
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle className="text-lg">Proposta e Negociação</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['proposed_price', 'proposed_bread_price', 'proposed_bread_volume', 'buyer_contact'].map(id => {
                        const field = qualificationFieldsConfig.find(f => f.id === id);
                        return (
                            <FormFieldWrapper key={field.id} isFilled={!!qualificationData[field.id]} isRequired={field.isRequired}>
                                <div className="space-y-1">
                                    <Label htmlFor={field.id}>{field.label}</Label>
                                    <Input
                                        id={field.id}
                                        value={qualificationData[field.id] || ''}
                                        onChange={(e) => onFieldChange(field.id, e.target.value)}
                                        className={field.isRequired && !qualificationData[field.id] ? 'border-red-500' : ''}
                                    />
                                </div>
                            </FormFieldWrapper>
                        )
                    })}
                    <div className="flex items-center space-x-2 pt-6 col-span-2">
                        <Checkbox id="introduction_requested"
                            checked={!!qualificationData.introduction_requested}
                            onCheckedChange={(checked) => onFieldChange('introduction_requested', checked)}
                        />
                        <Label htmlFor="introduction_requested">Apresentação Solicitada?</Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg">Detalhes Adicionais</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    {qualificationFieldsConfig.filter(f => f.type === 'textarea').map(field => (
                        <FormFieldWrapper key={field.id} isFilled={!!qualificationData[field.id]} isRequired={field.isRequired}>
                            <div className="space-y-1">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <Textarea
                                    id={field.id}
                                    value={qualificationData[field.id] || ''}
                                    onChange={(e) => onFieldChange(field.id, e.target.value)}
                                    className={field.isRequired && !qualificationData[field.id] ? 'border-red-500' : ''}
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