
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, Sparkles, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import InputMask from 'react-input-mask';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchCompanyData, mapApiDataToForm } from '@/services/senhorLavosService';
import { fetchCreditDossier } from '@/services/creditService';
import CreditDossierTemplate from '@/components/crm/CreditDossierTemplate';
import { generatePDF } from '@/utils/pdfGenerator';

const qualificationSchema = z.object({
  has_facade_photo: z.boolean().default(false),
  has_bakery_photo: z.boolean().default(false),
  has_equipment_photo: z.boolean().default(false),
  has_shelf_photo: z.boolean().default(false),
  has_butcher_photo: z.boolean().default(false),
  current_bread_volume: z.string().optional(),
  competitor_price: z.string().optional(),
  current_supplier: z.string().optional(),
  main_complaint: z.string().optional(),
  contract_status: z.string().optional(),
  equipment_needed: z.string().optional(),
  proposed_price: z.string().optional(),
  proposed_bread_price: z.string().optional(),
  proposed_bread_volume: z.string().optional(),
  buyer_contact: z.string().optional(),
  introduction_requested: z.boolean().default(false),
  negotiated_mix: z.string().optional(),
});

const contactSchema = z.object({
    corporate_name: z.string().min(1, 'Razão Social é obrigatória'),
    fantasy_name: z.string().min(1, 'Nome Fantasia é obrigatório'),
    cnpj: z.string().min(1, 'CNPJ é obrigatório').regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
    state_registration: z.string().optional(),
    municipal_registration: z.string().optional(),
    industry_sector: z.string().optional(),
    number_of_employees: z.coerce.number().optional(),
    estimated_revenue: z.coerce.number().optional(),
    foundation_date: z.string().optional(),
    
    address_street: z.string().min(1, 'Rua é obrigatória'),
    address_number: z.string().optional(),
    address_complement: z.string().optional(),
    address_district: z.string().optional(),
    address_city: z.string().min(1, 'Cidade é obrigatória'),
    address_state: z.string().min(1, 'Estado é obrigatório'),
    address_zip_code: z.string().min(1, 'CEP é obrigatório'),

    phone: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    website: z.string().optional(),
    linkedin_profile: z.string().optional(),

    representative_name: z.string().min(1, 'Nome do representante é obrigatório'),
    representative_role: z.string().optional(),
    representative_email: z.string().min(1, 'E-mail do representante é obrigatório').email('E-mail inválido'),
    representative_phone: z.string().optional(),
    representative_cpf: z.string().optional(),
    representative_linkedin: z.string().optional(),

    supervisor_id: z.string().optional(),
    seller_id: z.string().optional(),
    qualification_data: qualificationSchema.optional(),
    raw_integration_data: z.any().optional(),
});

const FormSection = ({ title, children, gridCols = 2 }) => (
    <Card className="mb-6 border-l-4 border-l-indigo-500 shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
        </CardHeader>
        <CardContent className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4 pt-2`}>
            {children}
        </CardContent>
    </Card>
);

const FormField = ({ label, id, error, children, isRequired, className }) => (
    <div className={`space-y-1 ${className}`}>
        <Label htmlFor={id} className={error ? "text-destructive" : "text-gray-700 font-medium"}>{label} {isRequired && <span className="text-destructive">*</span>}</Label>
        {React.cloneElement(children, {
            className: `${children.props.className || ''} ${error ? 'border-destructive ring-destructive' : ''}`
        })}
        {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error.message}</p>}
    </div>
);

const ContactForm = ({ contactData, onSaveSuccess }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [supervisors, setSupervisors] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [integrationLoading, setIntegrationLoading] = useState(false);
    const [integrationSuccess, setIntegrationSuccess] = useState(false);
    
    // Credit Dossier States
    const [dossierLoading, setDossierLoading] = useState(false);
    const [dossierData, setDossierData] = useState(null);
    const dossierRef = useRef(null);

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, getValues, trigger, watch } = useForm({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            corporate_name: '',
            fantasy_name: '',
            cnpj: '',
            state_registration: '',
            industry_sector: '',
            foundation_date: '',
            address_zip_code: '',
            address_street: '',
            address_number: '',
            address_complement: '',
            address_district: '',
            address_city: '',
            address_state: '',
            phone: '',
            email: '',
            representative_name: '',
            representative_email: '',
            representative_phone: '',
            representative_role: '',
            qualification_data: {},
            ...contactData,
            qualification_data: {
                introduction_requested: false,
                ...(contactData?.qualification_data || {})
            },
        },
    });

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.rpc('get_all_users_with_roles');
            if (!error) {
                setSupervisors(data.filter(u => u.role === 'Supervisor'));
                setSellers(data.filter(u => u.role === 'Vendedor'));
            }
        };
        fetchUsers();
    }, []);

    const handleIntegration = async () => {
        const cnpj = getValues('cnpj');
        if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
            toast({
                variant: "destructive",
                title: "CNPJ Inválido",
                description: "Por favor, insira um CNPJ válido (14 dígitos) antes de rodar a integração."
            });
            return;
        }

        setIntegrationLoading(true);
        setIntegrationSuccess(false);
        
        try {
            const apiData = await fetchCompanyData(cnpj);
            const mappedData = mapApiDataToForm(apiData);

            // Fill fields explicitly
            let fieldsUpdated = 0;
            const keys = Object.keys(mappedData);
            for (const key of keys) {
                const value = mappedData[key];
                if (value !== undefined && value !== null && value !== '') {
                    setValue(key, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                    fieldsUpdated++;
                }
            }

            setTimeout(async () => {
                await trigger();
            }, 100);

            setIntegrationSuccess(true);
            toast({
                title: "Integração Concluída",
                description: `${fieldsUpdated} campos foram preenchidos automaticamente.`,
                className: "bg-green-50 border-green-200"
            });
        } catch (error) {
            console.error("Integration Error:", error);
            toast({
                variant: "destructive",
                title: "Falha na Integração",
                description: error.message || "Não foi possível buscar os dados.",
            });
        } finally {
            setIntegrationLoading(false);
        }
    };

    const handleGenerateDossier = async (e) => {
        e.preventDefault(); // Prevent form submission
        const cnpj = getValues('cnpj');
        if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
            toast({ variant: "destructive", title: "CNPJ Inválido", description: "CNPJ obrigatório para gerar dossiê." });
            return;
        }

        setDossierLoading(true);
        try {
            const data = await fetchCreditDossier({ cnpj });
            setDossierData(data);
            
            // Allow state update and render before generating PDF
            setTimeout(async () => {
                if (dossierRef.current) {
                    const corporateName = getValues('corporate_name') || 'Dossie';
                    const filename = `Dossie_Credito_${corporateName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                    await generatePDF(dossierRef.current, filename);
                    toast({ title: "Sucesso", description: "Dossiê de Crédito gerado e baixado." });
                } else {
                    toast({ variant: "destructive", title: "Erro", description: "Erro ao renderizar modelo do dossiê." });
                }
                setDossierLoading(false);
                setDossierData(null); // Clear to unmount if desired, or keep for debug
            }, 1500); // Increased delay slightly to ensure rich visual rendering

        } catch (error) {
            console.error("Dossier Error:", error);
            toast({ variant: "destructive", title: "Erro ao Gerar Dossié", description: error.message });
            setDossierLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                owner_id: user.id,
                supervisor_id: data.supervisor_id || null,
                seller_id: data.seller_id || null,
                qualification_data: data.qualification_data || {},
                custom_fields: {
                    ...(contactData?.custom_fields || {}),
                    senhor_lavos_data: data.raw_integration_data
                }
            };
            
            delete payload.raw_integration_data;

            let result;
            if (contactData?.id) {
                result = await supabase.from('crm_contacts').update(payload).eq('id', contactData.id).select().single();
            } else {
                result = await supabase.from('crm_contacts').insert(payload).select().single();
            }

            if (result.error) throw result.error;

            toast({ title: 'Sucesso!', description: `Contato ${contactData?.id ? 'atualizado' : 'criado'} com sucesso.` });
            onSaveSuccess(result.data);
        } catch (error) {
            console.error("Submit error:", error);
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
            {/* Hidden Container for PDF Generation */}
            <div className="absolute -left-[9999px] top-0">
                {dossierData && (
                    <div className="w-[1000px]">
                        <CreditDossierTemplate ref={dossierRef} data={dossierData} contact={getValues()} />
                    </div>
                )}
            </div>

            <FormSection title="Dados de Identificação">
                <div className="col-span-1 md:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <FormField label="CNPJ para Busca Automática" id="cnpj" error={errors.cnpj} isRequired>
                                <Controller
                                    name="cnpj"
                                    control={control}
                                    render={({ field: { onChange, value, ref, onBlur } }) => (
                                        <InputMask 
                                            mask="99.999.999/9999-99" 
                                            value={value || ''} 
                                            onChange={onChange}
                                            onBlur={onBlur}
                                        >
                                            {(inputProps) => (
                                                <Input 
                                                    {...inputProps} 
                                                    ref={ref}
                                                    placeholder="00.000.000/0000-00" 
                                                    className="font-mono text-lg" 
                                                />
                                            )}
                                        </InputMask>
                                    )}
                                />
                            </FormField>
                        </div>
                        <Button 
                            type="button" 
                            onClick={handleIntegration} 
                            disabled={integrationLoading}
                            className={`mb-1 w-full md:w-auto transition-all duration-300 ${integrationSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                        >
                            {integrationLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</>
                            ) : integrationSuccess ? (
                                <><CheckCircle className="mr-2 h-4 w-4" /> Dados Carregados</>
                            ) : (
                                <><Sparkles className="mr-2 h-4 w-4" /> Rodar Integração Senhor Lavos</>
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground pl-1 mt-2">
                        Preencha automaticamente Razão Social e Endereço.
                    </p>
                </div>

                <FormField label="Razão Social" id="corporate_name" error={errors.corporate_name} isRequired>
                    <Input id="corporate_name" {...register('corporate_name')} />
                </FormField>
                <FormField label="Nome Fantasia" id="fantasy_name" error={errors.fantasy_name} isRequired>
                    <Input id="fantasy_name" {...register('fantasy_name')} />
                </FormField>
                <FormField label="Inscrição Estadual" id="state_registration" error={errors.state_registration}>
                    <Input id="state_registration" {...register('state_registration')} />
                </FormField>
                <FormField label="Setor / CNAE" id="industry_sector" error={errors.industry_sector}>
                    <Input id="industry_sector" {...register('industry_sector')} placeholder="Ex: Panificação, Varejo" />
                </FormField>
                <FormField label="Data Fundação" id="foundation_date" error={errors.foundation_date}>
                    <Input id="foundation_date" type="date" {...register('foundation_date')} />
                </FormField>
            </FormSection>

            <FormSection title="Endereço">
                <FormField label="CEP" id="address_zip_code" error={errors.address_zip_code} isRequired>
                    <Controller
                        name="address_zip_code"
                        control={control}
                        render={({ field: { onChange, value, ref, onBlur } }) => (
                            <InputMask 
                                mask="99999-999" 
                                value={value || ''} 
                                onChange={onChange}
                                onBlur={onBlur}
                            >
                                {(inputProps) => <Input {...inputProps} ref={ref} placeholder="00000-000" />}
                            </InputMask>
                        )}
                    />
                </FormField>
                <FormField label="Rua" id="address_street" error={errors.address_street} isRequired>
                    <Input id="address_street" {...register('address_street')} />
                </FormField>
                <FormField label="Número" id="address_number" error={errors.address_number}>
                    <Input id="address_number" {...register('address_number')} />
                </FormField>
                <FormField label="Complemento" id="address_complement" error={errors.address_complement}>
                    <Input id="address_complement" {...register('address_complement')} />
                </FormField>
                <FormField label="Bairro" id="address_district" error={errors.address_district}>
                    <Input id="address_district" {...register('address_district')} />
                </FormField>
                <FormField label="Cidade" id="address_city" error={errors.address_city} isRequired>
                    <Input id="address_city" {...register('address_city')} />
                </FormField>
                <FormField label="Estado" id="address_state" error={errors.address_state} isRequired>
                    <Input id="address_state" {...register('address_state')} maxLength={2} placeholder="UF" />
                </FormField>
            </FormSection>

            <FormSection title="Informações de Contato">
                <FormField label="Telefone Geral" id="phone" error={errors.phone}>
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field: { onChange, value, ref, onBlur } }) => (
                            <InputMask 
                                mask="(99) 99999-9999" 
                                value={value || ''} 
                                onChange={onChange}
                                onBlur={onBlur}
                            >
                                {(inputProps) => <Input {...inputProps} ref={ref} placeholder="(00) 00000-0000" />}
                            </InputMask>
                        )}
                    />
                </FormField>
                <FormField label="E-mail Geral" id="email" error={errors.email}>
                    <Input id="email" type="email" {...register('email')} />
                </FormField>
            </FormSection>

            <FormSection title="Representante / Decisor">
                <FormField label="Nome Completo" id="representative_name" error={errors.representative_name} isRequired>
                    <Input id="representative_name" {...register('representative_name')} />
                </FormField>
                <FormField label="E-mail Corporativo" id="representative_email" error={errors.representative_email} isRequired>
                    <Input id="representative_email" type="email" {...register('representative_email')} />
                </FormField>
                <FormField label="Telefone Direto" id="representative_phone" error={errors.representative_phone}>
                    <Controller
                        name="representative_phone"
                        control={control}
                        render={({ field: { onChange, value, ref, onBlur } }) => (
                            <InputMask 
                                mask="(99) 99999-9999" 
                                value={value || ''} 
                                onChange={onChange}
                                onBlur={onBlur}
                            >
                                {(inputProps) => <Input {...inputProps} ref={ref} placeholder="(00) 00000-0000" />}
                            </InputMask>
                        )}
                    />
                </FormField>
                <FormField label="Cargo" id="representative_role" error={errors.representative_role}>
                    <Input id="representative_role" {...register('representative_role')} />
                </FormField>
            </FormSection>

            <FormSection title="Qualificação" gridCols={1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Volume de Pão/dia (atual)" id="current_bread_volume" error={errors.qualification_data?.current_bread_volume}>
                        <Input id="current_bread_volume" {...register('qualification_data.current_bread_volume')} />
                    </FormField>
                    <FormField label="Preço do Concorrente" id="competitor_price" error={errors.qualification_data?.competitor_price}>
                        <Input id="competitor_price" {...register('qualification_data.competitor_price')} />
                    </FormField>
                    <FormField label="Fornecedor Atual/Produção Própria" id="current_supplier" error={errors.qualification_data?.current_supplier}>
                        <Input id="current_supplier" {...register('qualification_data.current_supplier')} />
                    </FormField>
                    <FormField label="Status do Contrato" id="contract_status" error={errors.qualification_data?.contract_status}>
                        <Input id="contract_status" {...register('qualification_data.contract_status')} />
                    </FormField>
                    <FormField label="Quantidade de Equipamentos Necessária" id="equipment_needed" error={errors.qualification_data?.equipment_needed}>
                        <Input id="equipment_needed" {...register('qualification_data.equipment_needed')} />
                    </FormField>
                    <FormField label="Preço Proposto" id="proposed_price" error={errors.qualification_data?.proposed_price}>
                        <Input id="proposed_price" {...register('qualification_data.proposed_price')} />
                    </FormField>
                     <FormField label="Preço Pão Proposto" id="proposed_bread_price" error={errors.qualification_data?.proposed_bread_price}>
                        <Input id="proposed_bread_price" {...register('qualification_data.proposed_bread_price')} />
                    </FormField>
                     <FormField label="Volume Pão Proposto" id="proposed_bread_volume" error={errors.qualification_data?.proposed_bread_volume}>
                        <Input id="proposed_bread_volume" {...register('qualification_data.proposed_bread_volume')} />
                    </FormField>
                    <FormField label="Nome/Contato Comprador" id="buyer_contact" error={errors.qualification_data?.buyer_contact}>
                        <Input id="buyer_contact" {...register('qualification_data.buyer_contact')} />
                    </FormField>
                    <div className="flex items-center space-x-2 pt-8">
                        <Controller
                            name="qualification_data.introduction_requested"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        id="introduction_requested" 
                                        checked={field.value} 
                                        onChange={field.onChange} 
                                        className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                                    />
                                    <Label htmlFor="introduction_requested" className="cursor-pointer">Apresentação Solicitada?</Label>
                                </div>
                            )}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4">
                    <FormField label="Queixa Principal / Dor" id="main_complaint" error={errors.qualification_data?.main_complaint}>
                        <Textarea id="main_complaint" {...register('qualification_data.main_complaint')} rows={3} />
                    </FormField>
                    <FormField label="Itens e Volume do Mix Negociado" id="negotiated_mix" error={errors.qualification_data?.negotiated_mix}>
                        <Textarea id="negotiated_mix" {...register('qualification_data.negotiated_mix')} rows={3} />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Responsáveis Internos">
                <FormField label="Supervisor" id="supervisor_id" error={errors.supervisor_id}>
                    <Controller
                        name="supervisor_id"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um supervisor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supervisors.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.full_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormField>
                <FormField label="Vendedor" id="seller_id" error={errors.seller_id}>
                     <Controller
                        name="seller_id"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um vendedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sellers.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.full_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormField>
            </FormSection>

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 flex flex-col sm:flex-row justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateDossier}
                    disabled={dossierLoading || isSubmitting}
                    className="w-full sm:w-auto border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
                >
                    {dossierLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando PDF...</>
                    ) : (
                        <><FileText className="mr-2 h-4 w-4" /> Gerar Dossié de Crédito</>
                    )}
                </Button>
                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {contactData?.id ? 'Atualizar Contato' : 'Criar Contato'}
                </Button>
            </DialogFooter>
        </form>
    );
};

export default ContactForm;
