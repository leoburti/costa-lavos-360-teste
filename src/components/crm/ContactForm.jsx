import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, CheckCircle, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import InputMask from 'react-input-mask';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchCompanyData, mapApiDataToForm } from '@/services/senhorLavosService';
import { fetchCreditDossier } from '@/services/creditService';
import { getCommercialHierarchy } from '@/services/apoioSyncService';
import CreditDossierTemplate from '@/components/crm/CreditDossierTemplate';
import { generatePDF } from '@/utils/pdfGenerator';
import { useFormStatePersistence } from '@/hooks/useFormStatePersistence';
import { PersistenceStatus } from '@/components/PersistenceStatus';

console.log('Parsing ContactForm file...');

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

    // Endereço de Entrega
    same_delivery_address: z.boolean().default(true),
    delivery_address_zip_code: z.string().optional(),
    delivery_address_street: z.string().optional(),
    delivery_address_number: z.string().optional(),
    delivery_address_complement: z.string().optional(),
    delivery_address_district: z.string().optional(),
    delivery_address_city: z.string().optional(),
    delivery_address_state: z.string().optional(),

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

    supervisor_id: z.string().optional().nullable(),
    seller_id: z.string().optional().nullable(),
    // Virtual fields for UI selection
    selected_supervisor_name: z.string().optional(),
    selected_seller_name: z.string().optional(),

    qualification_data: qualificationSchema.optional(),
    raw_integration_data: z.any().optional(),
}).superRefine((data, ctx) => {
    if (!data.same_delivery_address) {
        if (!data.delivery_address_zip_code || data.delivery_address_zip_code.replace(/\D/g, '').length !== 8) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "CEP de entrega obrigatório (8 dígitos)",
                path: ["delivery_address_zip_code"]
            });
        }
        if (!data.delivery_address_street) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Logradouro de entrega obrigatório",
                path: ["delivery_address_street"]
            });
        }
        if (!data.delivery_address_city) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Cidade de entrega obrigatória",
                path: ["delivery_address_city"]
            });
        }
        if (!data.delivery_address_state) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Estado de entrega obrigatório",
                path: ["delivery_address_state"]
            });
        }
        if (!data.delivery_address_district) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Bairro de entrega obrigatório",
                path: ["delivery_address_district"]
            });
        }
    }
});

const FormSection = ({ title, children, gridCols = 2, className = "" }) => {
    const gridClass = gridCols === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2';
    
    return (
        <Card className={`mb-6 border-l-4 border-l-indigo-500 shadow-sm ${className}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
            </CardHeader>
            <CardContent className={`grid grid-cols-1 ${gridClass} gap-4 pt-2`}>
                {children}
            </CardContent>
        </Card>
    );
};

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
    
    const defaultValues = {
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
        same_delivery_address: true,
        delivery_address_zip_code: '',
        delivery_address_street: '',
        delivery_address_number: '',
        delivery_address_complement: '',
        delivery_address_district: '',
        delivery_address_city: '',
        delivery_address_state: '',
        phone: '',
        email: '',
        representative_name: '',
        representative_email: '',
        representative_phone: '',
        representative_role: '',
        selected_supervisor_name: contactData?.custom_fields?.supervisor_name || contactData?.supervisor?.nome || '',
        selected_seller_name: contactData?.custom_fields?.seller_name || contactData?.seller?.nome || '',
        supervisor_id: contactData?.supervisor_id || null,
        seller_id: contactData?.seller_id || null,
        qualification_data: {
            introduction_requested: false,
            ...(contactData?.qualification_data || {})
        },
        ...contactData,
    };

    // Persistence Hook
    const { handleBulkChange, status, lastSaved, clearDraft } = useFormStatePersistence(
        `contact_form_${contactData?.id || 'new'}`, 
        defaultValues,
        (restored) => {
            if (restored) reset(restored);
        }
    );

    // --- Data States ---
    const [hierarchy, setHierarchy] = useState([]); // From BD-CL
    const [internalUsers, setInternalUsers] = useState([]); // From System (Apoio)
    
    // --- UI States ---
    const [integrationLoading, setIntegrationLoading] = useState(false);
    const [integrationSuccess, setIntegrationSuccess] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [hierarchyLoading, setHierarchyLoading] = useState(false);
    
    // Credit Dossier States
    const [dossierLoading, setDossierLoading] = useState(false);
    const [dossierData, setDossierData] = useState(null);
    const dossierRef = useRef(null);

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, getValues, trigger, watch, reset } = useForm({
        resolver: zodResolver(contactSchema),
        defaultValues,
    });

    // Sync changes to persistence hook
    useEffect(() => {
        const subscription = watch((value) => {
            handleBulkChange(value);
        });
        return () => subscription.unsubscribe();
    }, [watch, handleBulkChange]);

    const sameDeliveryAddress = watch('same_delivery_address');
    const currentSupervisor = watch('selected_supervisor_name');

    // --- Effect: Load Hierarchy and Users ---
    useEffect(() => {
        const loadCommercialData = async () => {
            setHierarchyLoading(true);
            try {
                const { data: sysUsers, error: userError } = await supabase.rpc('get_all_users_with_roles');
                if (userError) throw userError;
                setInternalUsers(sysUsers || []);

                const hierarchyData = await getCommercialHierarchy();
                setHierarchy(hierarchyData || []);

            } catch (error) {
                console.error('Erro ao carregar dados comerciais:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erro de Carregamento',
                    description: 'Não foi possível carregar a lista de responsáveis.'
                });
            } finally {
                setHierarchyLoading(false);
            }
        };

        loadCommercialData();
    }, []);

    const supervisorOptions = useMemo(() => {
        if (!hierarchy.length) return [];
        return hierarchy
            .map(h => h.supervisor_nome)
            .filter(Boolean)
            .sort();
    }, [hierarchy]);

    const sellerOptions = useMemo(() => {
        if (!hierarchy.length) return [];
        
        if (currentSupervisor) {
            const supervisorData = hierarchy.find(h => h.supervisor_nome === currentSupervisor);
            return supervisorData?.vendedores ? supervisorData.vendedores.sort() : [];
        } else {
            const allSellers = new Set();
            hierarchy.forEach(h => {
                if (h.vendedores) {
                    h.vendedores.forEach(v => allSellers.add(v));
                }
            });
            return Array.from(allSellers).sort();
        }
    }, [hierarchy, currentSupervisor]);


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

    const handleDeliveryCEPChange = async (e) => {
        const rawCep = e.target.value.replace(/\D/g, '');
        if (rawCep.length === 8) {
            setCepLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
                const data = await response.json();

                if (data.erro) {
                    toast({ variant: "destructive", title: "CEP não encontrado" });
                    return;
                }

                setValue('delivery_address_street', data.logradouro || '');
                setValue('delivery_address_district', data.bairro || '');
                setValue('delivery_address_city', data.localidade || '');
                setValue('delivery_address_state', data.uf || '');
                trigger(['delivery_address_street', 'delivery_address_district', 'delivery_address_city', 'delivery_address_state']);

                toast({ description: "Endereço de entrega carregado.", className: "bg-blue-50 text-blue-900 border-blue-200" });
            } catch (error) {
                toast({ variant: "destructive", title: "Erro na busca de CEP" });
            } finally {
                setCepLoading(false);
            }
        }
    };

    const handleGenerateDossier = async (e) => {
        e.preventDefault();
        const cnpj = getValues('cnpj');
        if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
            toast({ variant: "destructive", title: "CNPJ Inválido", description: "CNPJ obrigatório para gerar dossiê." });
            return;
        }

        setDossierLoading(true);
        try {
            const data = await fetchCreditDossier({ cnpj });
            setDossierData(data);
            setTimeout(async () => {
                if (dossierRef.current) {
                    const corporateName = getValues('corporate_name') || 'Dossie';
                    const filename = `Dossie_Credito_${corporateName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                    await generatePDF(dossierRef.current, filename);
                    toast({ title: "Sucesso", description: "Dossiê de Crédito gerado e baixado." });
                }
                setDossierLoading(false);
                setDossierData(null);
            }, 1500); 
        } catch (error) {
            console.error("Dossier Error:", error);
            toast({ variant: "destructive", title: "Erro", description: error.message });
            setDossierLoading(false);
        }
    };

    const findUserIdByName = (name) => {
        if (!name) return null;
        const normalizedSearch = name.toLowerCase().trim();
        const exact = internalUsers.find(u => u.full_name?.toLowerCase().trim() === normalizedSearch);
        if (exact) return exact.user_id;
        const partial = internalUsers.find(u => u.full_name?.toLowerCase().includes(normalizedSearch));
        return partial ? partial.user_id : null;
    };

    const onSubmit = async (data) => {
        if (!data.selected_supervisor_name || !data.selected_seller_name) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, selecione o Supervisor e o Vendedor (Responsáveis Internos).'
            });
            return;
        }

        try {
            const matchedSupervisorId = findUserIdByName(data.selected_supervisor_name);
            const matchedSellerId = findUserIdByName(data.selected_seller_name);

            let finalData = { ...data };
            
            if (finalData.same_delivery_address) {
                finalData.delivery_address_zip_code = finalData.address_zip_code;
                finalData.delivery_address_street = finalData.address_street;
                finalData.delivery_address_number = finalData.address_number;
                finalData.delivery_address_complement = finalData.address_complement;
                finalData.delivery_address_district = finalData.address_district;
                finalData.delivery_address_city = finalData.address_city;
                finalData.delivery_address_state = finalData.address_state;
            }

            const payload = {
                ...finalData,
                owner_id: user.id,
                supervisor_id: matchedSupervisorId, 
                seller_id: matchedSellerId,
                qualification_data: finalData.qualification_data || {},
                custom_fields: {
                    ...(contactData?.custom_fields || {}),
                    senhor_lavos_data: finalData.raw_integration_data,
                    supervisor_name: data.selected_supervisor_name,
                    seller_name: data.selected_seller_name
                }
            };
            
            delete payload.raw_integration_data;
            delete payload.selected_supervisor_name;
            delete payload.selected_seller_name;
            delete payload._supervisor_name;
            delete payload._seller_name;

            let result;
            if (contactData?.id) {
                result = await supabase.from('crm_contacts').update(payload).eq('id', contactData.id).select().single();
            } else {
                result = await supabase.from('crm_contacts').insert(payload).select().single();
            }

            if (result.error) throw result.error;

            toast({ title: 'Sucesso!', description: `Contato ${contactData?.id ? 'atualizado' : 'criado'} com sucesso.` });
            clearDraft();
            onSaveSuccess(result.data);
        } catch (error) {
            console.error("Submit error:", error);
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1 relative">
            <div className="absolute top-0 right-0">
                <PersistenceStatus status={status} lastSaved={lastSaved} />
            </div>

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

            <FormSection title="Endereço Principal">
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

            <div className="flex items-center space-x-2 mb-4 px-1">
                <Controller
                    name="same_delivery_address"
                    control={control}
                    render={({ field }) => (
                        <Checkbox 
                            id="same_delivery_address" 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
                <Label htmlFor="same_delivery_address" className="cursor-pointer font-medium text-gray-700">
                    Mesmo endereço de entrega
                </Label>
            </div>

            {!sameDeliveryAddress && (
                <FormSection title="Endereço de Entrega" className="animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 border-l-orange-500">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-end gap-4">
                            <FormField label="CEP de Entrega" id="delivery_address_zip_code" error={errors.delivery_address_zip_code} isRequired className="flex-1">
                                <div className="relative">
                                    <Controller
                                        name="delivery_address_zip_code"
                                        control={control}
                                        render={({ field: { onChange, value, ref, onBlur } }) => (
                                            <InputMask 
                                                mask="99999-999" 
                                                value={value || ''} 
                                                onChange={(e) => {
                                                    onChange(e);
                                                    handleDeliveryCEPChange(e);
                                                }}
                                                onBlur={onBlur}
                                            >
                                                {(inputProps) => (
                                                    <Input 
                                                        {...inputProps} 
                                                        ref={ref} 
                                                        placeholder="00000-000" 
                                                        className={cepLoading ? "pr-10" : ""}
                                                    />
                                                )}
                                            </InputMask>
                                        )}
                                    />
                                    {cepLoading && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            </FormField>
                            <div className="mb-2 text-xs text-muted-foreground hidden md:block">
                                Digite o CEP para busca automática
                            </div>
                        </div>
                    </div>

                    <FormField label="Rua de Entrega" id="delivery_address_street" error={errors.delivery_address_street} isRequired>
                        <Input id="delivery_address_street" {...register('delivery_address_street')} />
                    </FormField>
                    <FormField label="Número" id="delivery_address_number" error={errors.delivery_address_number}>
                        <Input id="delivery_address_number" {...register('delivery_address_number')} />
                    </FormField>
                    <FormField label="Complemento" id="delivery_address_complement" error={errors.delivery_address_complement}>
                        <Input id="delivery_address_complement" {...register('delivery_address_complement')} />
                    </FormField>
                    <FormField label="Bairro de Entrega" id="delivery_address_district" error={errors.delivery_address_district} isRequired>
                        <Input id="delivery_address_district" {...register('delivery_address_district')} />
                    </FormField>
                    <FormField label="Cidade de Entrega" id="delivery_address_city" error={errors.delivery_address_city} isRequired>
                        <Input id="delivery_address_city" {...register('delivery_address_city')} />
                    </FormField>
                    <FormField label="Estado" id="delivery_address_state" error={errors.delivery_address_state} isRequired>
                        <Input id="delivery_address_state" {...register('delivery_address_state')} maxLength={2} placeholder="UF" />
                    </FormField>
                </FormSection>
            )}

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

            <FormSection title="Responsáveis Internos (Estrutura Comercial)">
                <FormField label="Supervisor" id="selected_supervisor_name" error={errors.selected_supervisor_name} isRequired>
                    <Controller
                        name="selected_supervisor_name"
                        control={control}
                        render={({ field }) => (
                            <Select 
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    // Reset seller when supervisor changes to avoid inconsistency
                                    setValue('selected_seller_name', '');
                                }} 
                                value={field.value}
                                disabled={hierarchyLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={hierarchyLoading ? "Carregando..." : "Selecione um supervisor"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {supervisorOptions.map((name) => (
                                        <SelectItem key={name} value={name}>{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormField>
                <FormField label="Vendedor" id="selected_seller_name" error={errors.selected_seller_name} isRequired>
                     <Controller
                        name="selected_seller_name"
                        control={control}
                        render={({ field }) => (
                            <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={hierarchyLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={hierarchyLoading ? "Carregando..." : "Selecione um vendedor"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {sellerOptions.map((name) => (
                                        <SelectItem key={name} value={name}>{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormField>
                <div className="col-span-1 md:col-span-2 text-xs text-muted-foreground flex items-center gap-1">
                    <RefreshCw className={`h-3 w-3 ${hierarchyLoading ? 'animate-spin' : ''}`} />
                    Dados sincronizados do banco comercial (BD-CL).
                </div>
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