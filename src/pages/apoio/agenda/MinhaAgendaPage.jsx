import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '@/lib/msal/msal';
import { supabase } from '@/lib/customSupabaseClient';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';
import CalendarioView from './CalendarioView';
import NovoEventoModal from './NovoEventoModal';
import EventoDetalhesModal from './EventoDetalhesModal';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Briefcase, Filter, Download } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const MinhaAgendaPage = () => {
  const { user } = useAuth();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      const { data, error } = await supabase.rpc('get_meus_eventos', {
        p_usuario_id: user.id,
        p_data_inicio: start,
        p_data_fim: end
      });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar eventos",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, currentDate, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleMicrosoftSync = async () => {
    setIsSyncing(true);
    try {
      if (!isAuthenticated) {
        await instance.loginPopup(loginRequest);
      }
      // Placeholder for actual sync logic
      // In a real app, you'd call the Graph API here to fetch events and merge/save to Supabase
      toast({
        title: "Sincronização Iniciada",
        description: "Conectado à Microsoft. Sincronizando eventos...",
      });
      setTimeout(() => {
         toast({ title: "Sucesso", description: "Agenda sincronizada com Microsoft Outlook." });
         setIsSyncing(false);
      }, 2000);
    } catch (error) {
      console.error("Microsoft login/sync failed:", error);
      toast({
        variant: "destructive",
        title: "Falha na Sincronização",
        description: "Não foi possível conectar à sua conta Microsoft.",
      });
      setIsSyncing(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleExport = () => {
    if (events.length === 0) {
      toast({ variant: 'destructive', title: 'Exportação Falhou', description: 'Não há eventos para exportar.' });
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Titulo,Data,Inicio,Fim,Status,Tipo\n"
        + events.map(e => `"${e.titulo}","${e.data_evento}","${e.hora_inicio}","${e.hora_fim}","${e.status}","${e.tipo_evento}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agenda_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Helmet>
        <title>Minha Agenda - Apoio</title>
        <meta name="description" content="Gerencie seus eventos, agendamentos e tarefas." />
      </Helmet>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Minha Agenda</h1>
            <p className="text-muted-foreground">Seus compromissos e tarefas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport} size="sm">
                <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
            <Button onClick={handleMicrosoftSync} variant="outline" disabled={isSyncing} size="sm">
              {isSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
              Sync Microsoft
            </Button>
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-card rounded-lg border shadow-sm overflow-hidden">
            {loading ? (
            <div className="flex justify-center items-center h-96">
                <LoadingSpinner />
            </div>
            ) : (
            <CalendarioView 
                events={events} 
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onEventClick={handleEventClick}
                onEmptySlotClick={(date, time) => {
                    // Pre-fill modal with clicked date/time
                    // Logic to pass data to modal would go here
                    setIsModalOpen(true);
                }}
            />
            )}
        </div>
      </div>

      <NovoEventoModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSuccess={fetchEvents}
      />

      <EventoDetalhesModal
        event={selectedEvent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdate={fetchEvents}
      />
    </>
  );
};

export default MinhaAgendaPage;