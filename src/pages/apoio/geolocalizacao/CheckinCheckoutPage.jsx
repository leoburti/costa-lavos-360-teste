import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getCheckinCheckouts, createCheckinCheckout } from '@/services/geolocalizacaoService';
import { getChamadosParaSelect, getProfissionaisParaSelect } from '@/services/apoioSyncService'; // Reusing service
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentPosition, getAddressFromCoordinates } from '@/utils/geolocation';
import { useAuth } from '@/contexts/SupabaseAuthContext';


const CheckinCheckoutModal = ({ isOpen, setIsOpen, onSave, chamados, profissionais }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [chamadoId, setChamadoId] = useState('');
  const [profissionalId, setProfissionalId] = useState(user?.id || '');
  const [tipo, setTipo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && !profissionalId) {
      setProfissionalId(user.id);
    }
  }, [user, profissionalId]);

  const handleSave = async () => {
    if (!chamadoId || !profissionalId || !tipo) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha Chamado, Profissional e Tipo.',
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;
      const endereco = await getAddressFromCoordinates(latitude, longitude);

      const payload = {
        chamado_id: chamadoId,
        profissional_id: profissionalId,
        tipo,
        latitude,
        longitude,
        precisao: accuracy,
        endereco,
        observacoes,
      };

      const result = await createCheckinCheckout(payload);
    
      if (result.success) {
        const validationMsg = result.data?.validation?.mensagem || 'Registro criado.';
        toast({
          title: 'Sucesso!',
          description: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrado. ${validationMsg}`,
        });
        onSave(); // Callback to refresh data on the parent page
        setIsOpen(false);
        // Reset form
        setChamadoId('');
        // setProfissionalId(''); // Keep user as default
        setTipo('');
        setObservacoes('');
      } else {
        throw new Error(result.message || 'Não foi possível criar o registro.');
      }

    } catch(error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message,
      });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Registro de Check-in/out</DialogTitle>
          <DialogDescription>
            Crie um novo registro de check-in ou check-out para um chamado. A sua localização atual será capturada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chamado" className="text-right">
              Chamado
            </Label>
            <Select onValueChange={setChamadoId} value={chamadoId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um chamado" />
              </SelectTrigger>
              <SelectContent>
                {chamados.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profissional" className="text-right">
              Profissional
            </Label>
             <Select onValueChange={setProfissionalId} value={profissionalId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                {profissionais.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo" className="text-right">
              Tipo
            </Label>
            <Select onValueChange={setTipo} value={tipo}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkin">Check-in</SelectItem>
                <SelectItem value="checkout">Check-out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="observacoes" className="text-right pt-2">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="col-span-3"
              placeholder="Adicione observações (opcional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const CheckinCheckoutPage = () => {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chamados, setChamados] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCheckinCheckouts();
      setCheckins(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível buscar os registros de check-in/out.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const fetchSelectOptions = useCallback(async () => {
    try {
      const chamadosData = await getChamadosParaSelect();
      const profissionaisData = await getProfissionaisParaSelect();
      setChamados(chamadosData);
      setProfissionais(profissionaisData);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro ao carregar opções',
        description: 'Não foi possível carregar os dados de chamados e profissionais.',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCheckins();
    fetchSelectOptions();
  }, [fetchCheckins, fetchSelectOptions]);
  
  const handleNewRecord = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Apoio - Check-in/Check-out</title>
        <meta name="description" content="Visualize e gerencie os registros de check-in e check-out dos profissionais." />
      </Helmet>
      
      <CheckinCheckoutModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSave={fetchCheckins}
        chamados={chamados}
        profissionais={profissionais}
      />

      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Check-in / Check-out</h1>
          <p className="text-muted-foreground">
            Acompanhe os registros de geolocalização dos profissionais em campo.
          </p>
        </div>
        <Button onClick={handleNewRecord}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Registros</CardTitle>
          <CardDescription>
            Lista de todos os check-ins e check-outs realizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Chamado</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status Raio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkins.length > 0 ? checkins.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.data_hora).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{item.chamado?.motivo || `ID: ${item.chamado_id?.substring(0, 8)}`}</TableCell>
                    <TableCell>{item.profissional?.nome || 'Não identificado'}</TableCell>
                    <TableCell>
                      <Badge variant={item.tipo === 'checkin' ? 'success' : 'secondary'}>{item.tipo}</Badge>
                    </TableCell>
                    <TableCell>{item.endereco || 'N/A'}</TableCell>
                    <TableCell>
                      {item.dentro_raio ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Dentro
                        </Badge>
                      ) : (
                         <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Fora
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan="6" className="h-24 text-center">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default CheckinCheckoutPage;