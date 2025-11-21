import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import InputMask from 'react-input-mask';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    address_zip_code: z.string().min(1, 'CEP é obrigatório').regex(/^\d{5}-\d{3}$/, 'CEP inválido'),

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
});

const FormSection = ({ title, children, gridCols = 2 }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4`}>
            {children}
        </CardContent>
    </Card>
);

const FormField = ({ label, id, error, children, isRequired }) => (
    <div className="space-y-1">
        <Label htmlFor={id} className={error ? "text-destructive" : ""}>{label} {isRequired && <span className="text-destructive">*</span>}</Label>
        {React.cloneElement(children, {
            className: `${children.props.className || ''} ${error ? 'border-destructive' : ''}`
        })}
        {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
);

const ContactForm = ({ contactData, onSaveSuccess }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [supervisors, setSupervisors] = useState([]);
    const [sellers, setSellers] = useState([]);

    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            ...contactData,
            qualification_data: contactData?.qualification_data || {},
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

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            owner_id: user.id,
            supervisor_id: data.supervisor_id || null,
            seller_id: data.seller_id || null,
            qualification_data: data.qualification_data || {},
        };

        let result;
        if (contactData?.id) {
            result = await supabase.from('crm_contacts').update(payload).eq('id', contactData.id).select().single();
        } else {
            result = await supabase.from('crm_contacts').insert(payload).select().single();
        }

        if (result.error) {
            toast({ variant: 'destructive', title: 'Erro ao salvar contato', description: result.error.message });
        } else {
            toast({ title: 'Sucesso!', description: `Contato ${contactData?.id ? 'atualizado' : 'criado'} com sucesso.` });
            onSaveSuccess(result.data);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Informações da Empresa">
                <FormField label="Razão Social" id="corporate_name" error={errors.corporate_name} isRequired>
                    <Input id="corporate_name" {...register('corporate_name')} />
                </FormField>
                <FormField label="Nome Fantasia" id="fantasy_name" error={errors.fantasy_name} isRequired>
                    <Input id="fantasy_name" {...register('fantasy_name')} />
                </FormField>
                <FormField label="CNPJ" id="cnpj" error={errors.cnpj} isRequired>
                    <InputMask mask="99.999.999/9999-99" {...register('cnpj')}>
                        {(inputProps) => <Input {...inputProps} />}
                    </InputMask>
                </FormField>
                <FormField label="Inscrição Estadual" id="state_registration" error={errors.state_registration}>
                    <Input id="state_registration" {...register('state_registration')} />
                </FormField>
            </FormSection>

            <FormSection title="Endereço">
                <FormField label="CEP" id="address_zip_code" error={errors.address_zip_code} isRequired>
                     <InputMask mask="99999-999" {...register('address_zip_code')}>
                        {(inputProps) => <Input {...inputProps} />}
                    </InputMask>
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
                    <Input id="address_state" {...register('address_state')} />
                </FormField>
            </FormSection>

            <FormSection title="Informações de Contato">
                <FormField label="Telefone" id="phone" error={errors.phone}>
                    <Input id="phone" {...register('phone')} />
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
                    <Input id="representative_phone" {...register('representative_phone')} />
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
                    <div className="flex items-center space-x-2 pt-4">
                        <Controller
                            name="qualification_data.introduction_requested"
                            control={control}
                            render={({ field }) => <input type="checkbox" id="introduction_requested" checked={field.value} onChange={field.onChange} className="form-checkbox h-5 w-5 text-primary rounded" />}
                        />
                        <Label htmlFor="introduction_requested">Apresentação Solicitada?</Label>
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1 mt-4">
                    <FormField label="Queixa Principal / Dor" id="main_complaint" error={errors.qualification_data?.main_complaint}>
                        <Textarea id="main_complaint" {...register('qualification_data.main_complaint')} />
                    </FormField>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1 mt-4">
                    <FormField label="Itens e Volume do Mix Negociado" id="negotiated_mix" error={errors.qualification_data?.negotiated_mix}>
                        <Textarea id="negotiated_mix" {...register('qualification_data.negotiated_mix')} />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Responsáveis">
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

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Contato
                </Button>
            </DialogFooter>
        </form>
    );
};

export default ContactForm;