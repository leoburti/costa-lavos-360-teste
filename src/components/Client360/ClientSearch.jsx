import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
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
import { client360Service } from '@/services/client360Service';
import { useDebounce } from '@/hooks/useDebounce';

export default function ClientSearch({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function search() {
      if (debouncedSearch.length < 3) {
        setClients([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await client360Service.searchClients(debouncedSearch);
        setClients(results);
      } catch (error) {
        console.error("Failed to search clients", error);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[400px] justify-between h-12 text-base"
        >
          {value
            ? clients.find((client) => client.id === value)?.nome_fantasia || clients.find((client) => client.id === value)?.nome || "Cliente selecionado"
            : "Buscar cliente (Nome, Fantasia ou Código)..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CommandList>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Buscando...
              </div>
            )}
            {!loading && clients.length === 0 && debouncedSearch.length >= 3 && (
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            )}
            {!loading && clients.length === 0 && debouncedSearch.length < 3 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Digite pelo menos 3 caracteres
              </div>
            )}
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                    onSelect(client);
                  }}
                  className="flex flex-col items-start py-3"
                >
                  <div className="flex w-full justify-between">
                    <span className="font-bold">{client.nome_fantasia || client.nome}</span>
                    <span className="text-xs text-muted-foreground">{client.codigo}-{client.loja}</span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate w-full">{client.nome}</span>
                  {client.endereco && <span className="text-xs text-muted-foreground truncate w-full">{client.endereco}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}