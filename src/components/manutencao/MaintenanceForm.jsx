
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2, User, MapPin, Save } from 'lucide-react';
import { useClientSearch } from '@/hooks/useClientSearch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const MaintenanceForm = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  
  // Use the new Edge Function hook
  const { clients, isLoading: isLoadingClients } = useClientSearch(searchTerm);

  // Handle manual search trigger (optional, since hook debounces)
  const handleSearch = (e) => {
    e.preventDefault();
    // The hook reacts to state change automatically
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setValue('client_id', client.id);
    setValue('client_loja', client.loja);
    setValue('client_name', client.nome_fantasia);
    setValue('client_address', client.endereco);
    setSearchTerm(''); // Clear search to hide list
    setIsSearching(false);
  };

  const onSubmit = async (data) => {
    console.log("Submitting maintenance data:", data);
    toast({
      title: "Solicitação Enviada",
      description: "A solicitação de manutenção foi registrada com sucesso.",
      variant: "success"
    });
    reset();
    setSelectedClient(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Solicitação de Manutenção</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Client Search Section */}
            <div className="space-y-2 relative">
              <Label>Buscar Cliente</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Digite nome, fantasia ou código do cliente..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSearching(true);
                    }}
                  />
                </div>
              </div>

              {/* Search Results Dropdown */}
              {isSearching && searchTerm.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
                  {isLoadingClients ? (
                    <div className="p-4 flex justify-center items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando clientes via Edge...
                    </div>
                  ) : clients.length > 0 ? (
                    <ScrollArea className="h-[200px]">
                      <div className="p-1">
                        {clients.map((client) => (
                          <div 
                            key={client.full_id}
                            onClick={() => selectClient(client)}
                            className="flex flex-col p-2 hover:bg-accent cursor-pointer rounded-sm transition-colors border-b last:border-0 border-border/50"
                          >
                            <div className="font-medium flex justify-between">
                              <span>{client.nome_fantasia || client.razao_social}</span>
                              <Badge variant="outline" className="text-xs">{client.id}-{client.loja}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground truncate">{client.endereco}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhum cliente encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Client Display */}
            {selectedClient && (
              <div className="bg-muted/30 p-4 rounded-lg border border-primary/20 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <User size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold">{selectedClient.nome_fantasia}</h4>
                    <p className="text-sm text-muted-foreground">{selectedClient.razao_social}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin size={12} />
                      {selectedClient.endereco}
                    </div>
                  </div>
                </div>
                <input type="hidden" {...register('client_id', { required: true })} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipamento (Opcional)</Label>
                <Input id="equipment" placeholder="Número de série ou modelo" {...register('equipment')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register('priority')}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Problema</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descreva o problema detalhadamente..."
                {...register('description', { required: true })}
              />
              {errors.description && <span className="text-xs text-destructive">Campo obrigatório</span>}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!selectedClient}>
                <Save className="mr-2 h-4 w-4" />
                Registrar Solicitação
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceForm;
