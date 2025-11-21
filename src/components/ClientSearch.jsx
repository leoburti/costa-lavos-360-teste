import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchClientesComodato } from '@/services/apoioSyncService';
import { useDebounce } from '@/hooks/useDebounce';

export function ClientSearch({ onSelect, selectedValue, placeholder = "Buscar cliente..." }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const data = await searchClientesComodato(debouncedSearch);
        setClients(data || []);
      } catch (error) {
        console.error("Error searching clients:", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [debouncedSearch]);

  const handleSelect = (client) => {
    onSelect(client);
    setOpen(false);
  };

  const selectedClientLabel = selectedValue 
    ? (clients.find(c => c.cliente_id === selectedValue.cliente_id && c.loja === selectedValue.loja)?.nome_fantasia || selectedValue.label)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedClientLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Digite nome, fantasia ou código..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Buscando...
                </div>
            )}
            {!loading && clients.length === 0 && (
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            )}
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={`${client.cliente_id}-${client.loja}`}
                  value={`${client.cliente_id}-${client.loja}`}
                  onSelect={() => handleSelect(client)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue?.cliente_id === client.cliente_id && selectedValue?.loja === client.loja ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{client.nome_fantasia || client.razao_social}</span>
                    <span className="text-xs text-muted-foreground">
                        {client.razao_social} - {client.cliente_id}/{client.loja}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}