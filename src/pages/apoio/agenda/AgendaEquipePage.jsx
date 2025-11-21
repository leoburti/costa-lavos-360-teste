import React, { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import CalendarioView from './CalendarioView';
import AtribuirChamadoModal from './AtribuirChamadoModal';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format } from 'date-fns';

const AgendaEquipePage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profissionais, setProfissionais] = useState([]);
  const [selectedProfissional, setSelectedProfissional] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchProfissionais = async () => {
    try {
      const { data, error } = await supabase.from('apoio_usuarios').select('id, nome');
      if (error) throw error;
      setProfissionais(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar profissionais', description: error.message });
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fixed ambiguous embedding by specifying the foreign key constraint
      let query = supabase.from('apoio_agenda_eventos')
        .select(`
          *,
          profissional:apoio_usuarios!apoio_agenda_eventos_profissional_id_fkey(nome),
          chamado:apoio_chamados(cliente:apoio_clientes_comodato(nome_fantasia))
        `);
      
      if (selectedProfissional !== 'all') {
        query = query.eq('profissional_id', selectedProfissional);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const formattedEvents = data.map(e => ({
        ...e,
        titulo: e.titulo,
        profissional_nome: e.profissional?.nome || 'N/A',
        cliente_nome: e.chamado?.cliente?.nome_fantasia || 'N/A'
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro ao buscar eventos da equipe', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfissionais();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedProfissional]);

  const handleDateChange = (e) => {
    if (e.target.value) {
        const [year, month, day] = e.target.value.split('-').map(Number);
        setCurrentDate(new Date(year, month - 1, day));
    }
  };

  return (
    <>
      <Helmet>
        <title>Agenda da Equipe - Costa Lavos</title>
        <meta name="description" content="Visualização e gerenciamento da agenda de todos os profissionais." />
      </Helmet>
      <div className="space-y-6">
          <CardHeader className="p-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-3xl font-bold">Agenda da Equipe</CardTitle>
                <CardDescription>Visualize e gerencie os eventos de todos os profissionais.</CardDescription>
              </div>
              <AtribuirChamadoModal onSuccess={fetchEvents} />
            </div>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <Select onValueChange={setSelectedProfissional} value={selectedProfissional}>
                <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Filtrar por Profissional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {profissionais.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Status" /></SelectTrigger><SelectContent><SelectItem value="agendado">Agendado</SelectItem></SelectContent></Select>
              <Input 
                type="date" 
                className="w-full md:w-[180px]" 
                value={format(currentDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
              />
            </div>
          </CardHeader>
          
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner />
          </div>
        ) : (
          <CalendarioView 
            events={events}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventClick={(event) => console.log('Event clicked:', event)} 
          />
        )}
      </div>
    </>
  );
};

export default AgendaEquipePage;