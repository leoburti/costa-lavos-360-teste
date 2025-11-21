import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Shield, Users } from 'lucide-react';
import { usePersonas } from '@/hooks/usePersonas';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PersonasPage = () => {
  const navigate = useNavigate();
  const { fetchPersonas, deletePersona, loading } = usePersonas();
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    const data = await fetchPersonas();
    setPersonas(data);
  };

  const handleDelete = async (id) => {
    const success = await deletePersona(id);
    if (success) {
      loadPersonas();
    }
  };

  const getTipoUsoBadge = (tipo) => {
    const styles = {
      'Suporte': 'bg-blue-100 text-blue-800',
      'Técnico': 'bg-green-100 text-green-800',
      'Gerente': 'bg-purple-100 text-purple-800',
      'Supervisor': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={styles[tipo] || 'bg-gray-100 text-gray-800'}>{tipo}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Personas</h1>
          <p className="text-muted-foreground">Defina perfis, permissões e atributos para os usuários do Apoio.</p>
        </div>
        <Button onClick={() => navigate('/admin/apoio/personas/nova')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Persona
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Personas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos Definidos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(personas.map(p => p.tipo_uso)).size}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personas Cadastradas</CardTitle>
          <CardDescription>Lista de todas as personas ativas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo de Uso</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma persona encontrada.</TableCell>
                  </TableRow>
                ) : (
                  personas.map((persona) => (
                    <TableRow key={persona.id}>
                      <TableCell className="font-medium">{persona.nome}</TableCell>
                      <TableCell>{getTipoUsoBadge(persona.tipo_uso)}</TableCell>
                      <TableCell className="max-w-md truncate">{persona.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={persona.ativo ? 'success' : 'secondary'}>
                          {persona.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/apoio/personas/${persona.id}/editar`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Persona?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a persona <strong>{persona.nome}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(persona.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonasPage;