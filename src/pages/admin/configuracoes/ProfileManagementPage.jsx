
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ProfileManagementPage = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[ProfileManagementPage] Component mounted');
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_perfis')
        .select('*')
        .order('nome');

      if (error) throw error;

      setProfiles(data || []);
    } catch (error) {
      console.error('[ProfileManagementPage] Error fetching profiles:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar perfis',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    toast({
      title: "Novo Perfil",
      description: "Criação de perfil em desenvolvimento.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Gerenciamento de Perfis | Admin | Costa Lavos</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gerenciamento de Perfis</h1>
          <p className="text-muted-foreground mt-1">
            Definição de papéis e permissões de acesso.
          </p>
        </div>
        <Button onClick={handleCreateProfile}>
          <Plus className="mr-2 h-4 w-4" /> Novo Perfil
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfis de Acesso</CardTitle>
          <CardDescription>Perfis configurados no sistema e suas permissões associadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Carregando perfis...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum perfil encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          {profile.nome}
                        </div>
                      </TableCell>
                      <TableCell>{profile.descricao || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={profile.ativo ? 'success' : 'secondary'}>
                          {profile.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {profile.permissoes ? Object.keys(profile.permissoes).length : 0} módulos configurados
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagementPage;
