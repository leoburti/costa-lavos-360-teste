
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';

const MotivosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMotivos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('apoio_chamados_motivos')
        .select('*')
        .order('tipo_chamado')
        .order('motivo');

      if (error) {
        toast({ title: "Erro ao buscar motivos", description: error.message, variant: "destructive" });
      } else {
        setMotivos(data);
      }
      setLoading(false);
    };
    fetchMotivos();
  }, [toast]);

  const handleAction = (action, id) => {
    if (action === 'Editar') {
      navigate(`/admin/apoio/chamados/motivos/${id}/editar`);
    } else {
      toast({ title: "🚧 Em desenvolvimento", description: "Esta ação será implementada em breve." });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Motivos de Chamado</CardTitle>
            <CardDescription>Gerencie os motivos pré-definidos para a abertura de chamados.</CardDescription>
          </div>
          <Button onClick={() => navigate('/admin/apoio/chamados/motivos/novo')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Motivo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <LoadingSpinner /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Chamado</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {motivos.map((motivo) => (
                <TableRow key={motivo.id}>
                  <TableCell className="capitalize">{motivo.tipo_chamado}</TableCell>
                  <TableCell className="font-medium">{motivo.motivo}</TableCell>
                  <TableCell className="text-muted-foreground">{motivo.descricao}</TableCell>
                  <TableCell><Badge variant={motivo.ativo ? 'success' : 'destructive'}>{motivo.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('Editar', motivo.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Ativar/Inativar', motivo.id)}>Ativar/Inativar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Excluir', motivo.id)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MotivosPage;
