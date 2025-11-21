import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Search, UserPlus, Shield, Filter } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const UsuariosAcessoPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    persona_id: '',
    nivel_acesso: '1',
    departamento: '',
    status: 'ativo'
  });

  const fetchPersonas = async () => {
    const { data, error } = await supabase
      .from('apoio_personas')
      .select('*')
      .eq('ativo', true);
    
    if (error) {
      console.error('Erro ao buscar personas:', error);
    } else {
      setPersonas(data || []);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_usuarios')
        .select(`
          *,
          persona:apoio_personas(id, nome)
        `)
        .order('nome');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar usuários',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPersonas();
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      persona_id: user.persona_id || '',
      nivel_acesso: user.nivel_acesso?.toString() || '1',
      departamento: user.departamento || '',
      status: user.status || 'ativo'
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('apoio_usuarios')
        .update({
          persona_id: formData.persona_id || null,
          nivel_acesso: parseInt(formData.nivel_acesso),
          departamento: formData.departamento,
          status: formData.status
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'Usuário atualizado',
        description: 'As permissões e dados foram salvos com sucesso.'
      });
      
      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message
      });
    }
  };

  const getPersonaBadgeColor = (personaName) => {
    switch (personaName?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'supervisor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'gerente': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'técnico': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => 
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Usuários & Acesso | Gestão de Equipe</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários & Acesso</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe, atribua personas e controle níveis de acesso.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Membros da Equipe</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuário..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Lista completa de usuários com suas respectivas personas e níveis de permissão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Nível Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Nenhum usuário encontrado.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.nome}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.departamento || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPersonaBadgeColor(user.persona?.nome)}>
                          {user.persona?.nome || 'Sem Persona'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3 text-muted-foreground" />
                          <span>Nível {user.nivel_acesso || 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'ativo' ? 'success' : 'secondary'}>
                          {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(user)}>
                              Editar Acesso
                            </DropdownMenuItem>
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Desativar Usuário
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Acesso</DialogTitle>
            <DialogDescription>
              Alterar persona e nível de acesso para {selectedUser?.nome}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departamento" className="text-right">
                Depto.
              </Label>
              <Input
                id="departamento"
                value={formData.departamento}
                onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                className="col-span-3"
                placeholder="Ex: Operações"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="persona" className="text-right">
                Persona
              </Label>
              <Select 
                value={formData.persona_id} 
                onValueChange={(val) => setFormData({...formData, persona_id: val})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma persona" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nivel" className="text-right">
                Nível
              </Label>
              <Select 
                value={formData.nivel_acesso} 
                onValueChange={(val) => setFormData({...formData, nivel_acesso: val})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nível 1 - Suporte</SelectItem>
                  <SelectItem value="2">Nível 2 - Técnico</SelectItem>
                  <SelectItem value="3">Nível 3 - Gerente</SelectItem>
                  <SelectItem value="4">Nível 4 - Supervisor</SelectItem>
                  <SelectItem value="5">Nível 5 - Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsuariosAcessoPage;