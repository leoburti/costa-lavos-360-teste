
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useDataScope } from '@/hooks/useDataScope';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Users, User, Mail, Phone, Building2, Loader2 } from 'lucide-react';
import ContactForm from '@/components/crm/ContactForm';
import { Helmet } from 'react-helmet-async';

const Contacts = () => {
  const { toast } = useToast();
  const dataScope = useDataScope();
  // Ensure safe destructuring in case dataScope is undefined or null
  const { applyScope, isRestricted } = dataScope || { applyScope: (q) => q, isRestricted: false };
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async () => {
    console.log('Fetching contacts started...');
    setLoading(true);
    try {
      let query = supabase
        .from('crm_contacts')
        .select(`
            *,
            supervisor:apoio_usuarios!supervisor_id(nome),
            seller:apoio_usuarios!seller_id(nome)
        `)
        .order('created_at', { ascending: false });

      // Apply Data Isolation Scope
      if (applyScope) {
          query = applyScope(query, 'owner_id');
      }

      if (searchTerm) {
        query = query.or(`corporate_name.ilike.%${searchTerm}%,fantasy_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContacts(data || []);
      console.log(`Fetched ${data?.length || 0} contacts.`);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar contatos',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchTerm]); // Re-fetch on search

  const handleEdit = (contact) => {
    console.log('Editing contact:', contact.id);
    setSelectedContact(contact);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    console.log('Creating new contact');
    setSelectedContact(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = (savedData) => {
    console.log('Contact saved successfully:', savedData);
    setIsDialogOpen(false);
    fetchContacts();
  };

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Contatos - CRM | Costa Lavos 360</title>
        <meta name="description" content="Gerencie sua carteira de clientes, leads e oportunidades comerciais no CRM da Costa Lavos 360." />
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> 
            Contatos
          </h1>
          <p className="text-muted-foreground">
            {isRestricted 
              ? "Gerencie sua carteira de clientes e leads."
              : "Gerencie a base completa de contatos do CRM."
            }
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
            </DialogHeader>
            <ContactForm contactData={selectedContact} onSaveSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, empresa ou email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Representante</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  {!isRestricted && <TableHead>Responsável</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                        </div>
                    </TableCell>
                  </TableRow>
                ) : contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum contato encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow 
                        key={contact.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleEdit(contact)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{contact.fantasy_name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {contact.corporate_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{contact.representative_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {contact.email && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" /> {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" /> {contact.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {contact.status === 'active' ? 'Ativo' : contact.status || 'Lead'}
                        </span>
                      </TableCell>
                      {!isRestricted && (
                          <TableCell>
                              <span className="text-xs text-muted-foreground">
                                  {contact.seller?.nome || 'N/D'}
                              </span>
                          </TableCell>
                      )}
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

export default Contacts;
