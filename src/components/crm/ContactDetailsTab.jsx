import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    MapPin, Briefcase, Mail, Phone, Building, 
    Calendar as CalendarIcon, User, Info, ExternalLink, Copy, 
    Navigation, Hash, Globe, ShieldCheck, Award, Clock, Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/lib/customSupabaseClient';

const DetailItem = ({ icon: Icon, label, value, copyable = false, link = null, fullWidth = false }) => {
    const { toast } = useToast();

    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value);
            toast({ description: "Copiado para a área de transferência", duration: 2000 });
        }
    };

    return (
        <div className={cn("flex items-start space-x-3 group p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", fullWidth ? "col-span-1 sm:col-span-2" : "")}>
            <div className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 shrink-0 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {label}
                </p>
                <div className="flex items-start gap-2">
                    {link ? (
                        <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-primary hover:underline block break-words whitespace-normal"
                        >
                            {value || 'N/A'}
                        </a>
                    ) : (
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed break-words whitespace-normal">
                            {value || 'N/A'}
                        </p>
                    )}
                    
                    {copyable && value && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={handleCopy}
                        >
                            <Copy className="h-3 w-3 text-slate-400" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

const NextActionPicker = ({ date, contactId, onUpdate }) => {
    const [selectedDate, setSelectedDate] = useState(date ? new Date(date) : null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSelect = async (newDate) => {
        setSelectedDate(newDate);
        // Keep popover open to allow confirmation or just close if preferred. 
        // Let's add a "Save" action to confirm.
    };

    const handleSave = async () => {
        if (!contactId) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('crm_contacts')
                .update({ next_action_date: selectedDate ? selectedDate.toISOString() : null })
                .eq('id', contactId);

            if (error) throw error;

            toast({
                title: "Agendamento Atualizado",
                description: selectedDate 
                    ? `Próxima ação agendada para ${format(selectedDate, "dd/MM/yyyy")}.` 
                    : "Agendamento removido.",
                className: "bg-green-50 border-green-200"
            });
            
            setIsOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar a data." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    className={cn(
                        "w-full justify-start text-left font-normal h-auto py-3 px-4 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all group",
                        !selectedDate && "text-muted-foreground"
                    )}
                >
                    <div className="flex items-center gap-3 w-full">
                        <div className={cn("p-2 rounded-full transition-colors", selectedDate ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:text-primary")}>
                            <CalendarIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                                Próxima Ação
                            </p>
                            <span className={cn("text-sm font-bold block", selectedDate ? "text-slate-900" : "text-slate-500")}>
                                {selectedDate ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }) : "Toque para agendar"}
                            </span>
                        </div>
                        {selectedDate && <Bell className="h-4 w-4 text-blue-500 animate-pulse" />}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b bg-slate-50/50">
                    <h4 className="font-medium text-sm text-slate-700">Agendar Próxima Ação</h4>
                    <p className="text-xs text-muted-foreground">Defina uma data para o próximo contato.</p>
                </div>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    initialFocus
                    className="p-3"
                />
                <div className="p-3 border-t flex justify-between items-center bg-slate-50/50">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setSelectedDate(null); handleSave(); }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
                    >
                        Limpar
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={handleSave} 
                        disabled={loading}
                        className="h-8 text-xs"
                    >
                        {loading ? "Salvando..." : "Confirmar Agendamento"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const ContactDetailsTab = ({ details, onUpdateContact }) => {
    const fullAddress = details ? `${details.address_street}, ${details.address_number} - ${details.address_city}, ${details.address_state}, ${details.address_zip_code}` : '';
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

    const statusColors = {
        'novo': 'bg-blue-100 text-blue-700 border-blue-200',
        'em_negociacao': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'ganho': 'bg-green-100 text-green-700 border-green-200',
        'perdido': 'bg-red-100 text-red-700 border-red-200',
        'lead': 'bg-purple-100 text-purple-700 border-purple-200',
    };

    const statusLabel = details?.status ? details.status.replace('_', ' ') : 'Novo';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            
            {/* Top Section: General & Representative */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* General Info Card */}
                <Card className="overflow-hidden border-none shadow-lg ring-1 ring-slate-900/5 bg-white dark:bg-slate-900 h-full">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400">
                                    <Info className="h-4 w-4" />
                                </div>
                                Informações Gerais
                            </CardTitle>
                            <Badge variant="outline" className={cn("uppercase text-xs font-bold px-3 py-1", statusColors[details?.status] || 'bg-slate-100 text-slate-700 border-slate-200')}>
                                {statusLabel}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        {/* Next Action Scheduler - Takes full width on mobile, spans 2 cols if needed */}
                        <div className="col-span-1 sm:col-span-2 mb-2">
                            <NextActionPicker 
                                date={details?.next_action_date} 
                                contactId={details?.id}
                                onUpdate={onUpdateContact}
                            />
                        </div>

                        <DetailItem 
                            icon={Building} 
                            label="Origem do Lead" 
                            value={details?.lead_source} 
                        />
                        <DetailItem 
                            icon={Clock} 
                            label="Última Atividade" 
                            value={details?.last_activity_date ? format(new Date(details.last_activity_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : 'Nenhuma atividade'} 
                        />
                        <DetailItem 
                            icon={Hash} 
                            label="CNPJ" 
                            value={details?.cnpj} 
                            copyable
                        />
                        <DetailItem 
                            icon={Globe} 
                            label="Site" 
                            value={details?.website} 
                            link={details?.website}
                        />
                        <DetailItem 
                            icon={ShieldCheck} 
                            label="Setor" 
                            value={details?.industry_sector} 
                        />
                        <DetailItem 
                            icon={Award} 
                            label="Fundação" 
                            value={details?.foundation_date ? format(new Date(details.foundation_date), "dd/MM/yyyy") : null} 
                        />
                    </CardContent>
                </Card>

                {/* Representative Card */}
                <Card className="overflow-hidden border-none shadow-lg ring-1 ring-slate-900/5 bg-white dark:bg-slate-900 h-full flex flex-col">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/50">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400">
                                <User className="h-4 w-4" />
                            </div>
                            Representante Legal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                                <Avatar className="h-20 w-20 border-4 border-emerald-50 shadow-md shrink-0">
                                    <AvatarFallback className="bg-emerald-600 text-white text-2xl font-bold">
                                        {getInitials(details?.representative_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 w-full">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight break-words">
                                            {details?.representative_name || 'Não Informado'}
                                        </h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                            <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600">
                                                {details?.representative_role || 'Cargo não definido'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 w-full mt-2">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
                                        <Mail className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">E-mail</p>
                                        <span className="text-sm font-medium break-all text-slate-900">{details?.representative_email || '-'}</span>
                                    </div>
                                    {details?.representative_email && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto text-slate-400 hover:text-emerald-600" onClick={() => window.location.href = `mailto:${details.representative_email}`}>
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
                                        <Phone className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Telefone</p>
                                        <span className="text-sm font-medium text-slate-900">{details?.representative_phone || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Address & Map Section */}
            <Card className="overflow-hidden border-none shadow-lg ring-1 ring-slate-900/5 bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                    {/* Address Text Column */}
                    <div className="p-6 lg:col-span-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col justify-center space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 relative">
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 shadow-sm">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Localização</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Logradouro</p>
                                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                                        {details?.address_street}, {details?.address_number}
                                        {details?.address_complement && <span className="text-muted-foreground font-normal">, {details.address_complement}</span>}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Bairro / Cidade</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                        {details?.address_district}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-500">
                                        {details?.address_city} - {details?.address_state}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Badge variant="outline" className="font-mono text-xs tracking-wider bg-white px-3 py-1">
                                        CEP: {details?.address_zip_code}
                                    </Badge>
                                </div>
                            </div>

                            <Button 
                                className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary shadow-sm mt-4" 
                                variant="outline"
                                onClick={() => window.open(mapsLink, '_blank')}
                            >
                                <Navigation className="mr-2 h-4 w-4 text-orange-500" />
                                Abrir no Google Maps
                            </Button>
                        </div>
                        
                        {/* Decorative background element */}
                        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none">
                            <MapPin className="h-48 w-48 text-slate-900" />
                        </div>
                    </div>
                    
                    {/* Map Column */}
                    <div className="lg:col-span-2 h-[350px] lg:h-auto min-h-[350px] bg-slate-100 dark:bg-slate-800 relative">
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0, filter: 'grayscale(0.1)' }}
                            src={mapUrl}
                            allowFullScreen
                            title="Google Maps Location"
                            className="absolute inset-0"
                        />
                        {/* Map overlay gradient for better integration */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ContactDetailsTab;