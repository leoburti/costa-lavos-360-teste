
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

const FormulariosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('apoio_formularios_execucao')
        .select('*')
        .order('nome_formulario');

      if (error) {
        toast({ title: "Erro ao buscar formulários", description: error.message, variant: "destructive" });
      } else {
        setFormularios(data);
      }
      setLoading(false);
    };
    fetchForms();
  }, [toast]);

  const handleAction = (action, id) => {
    if (action === 'Editar') {
      navigate(`/admin/apoio/chamados/formularios/${id}/editar`);
    } else {
      toast({ title: "🚧 Em desenvolvimento", description: "Esta ação será implementada em breve." });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Formulários de Execução</CardTitle>
            <CardDescription>Gerencie os formulários utilizados nos chamados.</CardDescription>
          </div>
          <Button onClick={() => navigate('/admin/apoio/chamados/formularios/novo')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Formulário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <LoadingSpinner /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo de Chamado</TableHead>
                <TableHead>Campos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formularios.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.nome_formulario}</TableCell>
                  <TableCell className="capitalize">{form.tipo_chamado}</TableCell>
                  <TableCell>{JSON.parse(form.campos || '[]').length}</TableCell>
                  <TableCell><Badge variant={form.ativo ? 'success' : 'destructive'}>{form.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('Editar', form.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Ativar/Inativar', form.id)}>Ativar/Inativar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Excluir', form.id)}>Excluir</DropdownMenuItem>
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

export default FormulariosPage;
