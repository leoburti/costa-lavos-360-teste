import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useCRMMock } from '@/hooks/useCRMMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, Phone, Building2, MapPin, Calendar, Briefcase, FileText, 
  MessageSquare, Edit, ArrowLeft 
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const CrmContatoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContactById, deals, loading: mockLoading } = useCRMMock();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getContactById(id);
      setContact(data);
      setLoading(false);
    };
    load();
  }, [id, getContactById]);

  // Filter deals for this contact
  const contactDeals = deals.filter(d => d.contactId === id);

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
  if (!contact) return <div className="p-6">Contato não encontrado.</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>{contact.name} | CRM</title></Helmet>

      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crm/contatos')}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
            title={contact.name} 
            description={`${contact.role} na ${contact.company}`}
            className="pb-0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-md">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="text-2xl">{contact.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold text-slate-900">{contact.name}</h2>
                    <p className="text-slate-500 font-medium mb-4">{contact.role}</p>
                    <Badge variant={contact.status === 'ativo' ? 'success' : 'secondary'} className="mb-6 px-4 py-1 capitalize">
                        {contact.status}
                    </Badge>
                    
                    <div className="w-full space-y-4 text-left">
                        <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                            <Mail className="h-4 w-4 text-slate-400" /> {contact.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                            <Phone className="h-4 w-4 text-slate-400" /> {contact.phone}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                            <Building2 className="h-4 w-4 text-slate-400" /> {contact.company}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                            <MapPin className="h-4 w-4 text-slate-400" /> {contact.address}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                            <Calendar className="h-4 w-4 text-slate-400" /> Criado em: {formatDate(contact.createdAt)}
                        </div>
                    </div>

                    <Button className="w-full mt-6" variant="outline">
                        <Edit className="mr-2 h-4 w-4" /> Editar Informações
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2">
            <Tabs defaultValue="deals" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
                    <TabsTrigger value="deals" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2">Negócios</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2">Histórico</TabsTrigger>
                    <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="deals" className="space-y-4">
                    {contactDeals.length === 0 ? (
                        <Card className="border-dashed"><CardContent className="p-8 text-center text-muted-foreground">Nenhum negócio associado.</CardContent></Card>
                    ) : (
                        contactDeals.map(deal => (
                            <Card key={deal.id} className="hover:shadow-md transition-shadow border-slate-200">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase className="h-5 w-5" /></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{deal.title}</h4>
                                            <p className="text-sm text-slate-500">Estágio: <span className="capitalize font-medium text-slate-700">{deal.stage}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900">{formatCurrency(deal.value)}</div>
                                        <div className="text-xs text-slate-400">Fechamento: {formatDate(deal.closingDate)}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <Card><CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <MessageSquare className="h-8 w-8 opacity-20" />
                        <p>Histórico de interações ainda não implementado.</p>
                    </CardContent></Card>
                </TabsContent>

                <TabsContent value="docs">
                    <Card><CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 opacity-20" />
                        <p>Nenhum documento anexado.</p>
                    </CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CrmContatoDetalhes;