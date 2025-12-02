import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/apoio/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, User, Paperclip, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { useApoioMock } from '@/hooks/useApoioMock';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const ChamadoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, loading } = useApoioMock();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (!loading && tickets.length > 0) {
        const found = tickets.find(t => t.id === id) || tickets[0]; // Fallback to first if not found due to mock logic
        setTicket(found);
    }
  }, [id, tickets, loading]);

  if (loading || !ticket) {
      return <div className="p-6"><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>{ticket.ticketNumber} | Chamado</title></Helmet>

      <PageHeader 
        title={`Chamado #${ticket.ticketNumber}`} 
        description={ticket.title}
        breadcrumbs={[
            { label: 'Chamados', path: '/apoio/chamados' }, 
            { label: ticket.ticketNumber }
        ]}
        actions={
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/apoio/chamados')}>Voltar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle className="mr-2 h-4 w-4" /> Resolver Chamado
                </Button>
            </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & History */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-lg text-slate-800">Descrição do Problema</CardTitle>
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Aberto em {formatDate(ticket.createdAt)}
                            </div>
                        </div>
                        <StatusBadge status={ticket.status} />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {ticket.description}
                    </p>
                </CardContent>
            </Card>

            <Tabs defaultValue="comments" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
                    <TabsTrigger value="comments">Comentários ({ticket.comments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                    <TabsTrigger value="attachments">Anexos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="comments" className="space-y-4 mt-4">
                    {ticket.comments?.map((comment, idx) => (
                        <Card key={idx} className="border-slate-200">
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{comment.author.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-slate-900 text-sm">{comment.author}</h4>
                                            <span className="text-xs text-slate-400">{formatDate(comment.date)}</span>
                                        </div>
                                        <p className="text-sm text-slate-600">{comment.text}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    <Card className="border-slate-200 bg-slate-50">
                        <CardContent className="p-4 space-y-4">
                            <Textarea placeholder="Escreva uma resposta..." className="min-h-[100px] bg-white" />
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" size="sm" className="text-slate-500">
                                    <Paperclip className="mr-2 h-4 w-4" /> Anexar arquivo
                                </Button>
                                <Button size="sm">
                                    <Send className="mr-2 h-4 w-4" /> Enviar Resposta
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card><CardContent className="p-8 text-center text-muted-foreground">Histórico de alterações em breve.</CardContent></Card>
                </TabsContent>
                <TabsContent value="attachments">
                    <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum anexo encontrado.</CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>

        {/* Right Column: Meta Info */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="text-base">Informações</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold">Cliente</span>
                            <span className="font-medium text-slate-900">{ticket.client}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold">Prioridade</span>
                            <StatusBadge status={ticket.priority} />
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold">Categoria</span>
                            <span className="font-medium text-slate-900">{ticket.category}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold">Responsável</span>
                            <div className="flex items-center gap-2 mt-1">
                                <User className="h-3 w-3 text-slate-400" />
                                <span className="font-medium text-slate-900">{ticket.assignee}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ChamadoDetalhes;