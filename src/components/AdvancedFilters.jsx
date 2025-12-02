import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { MultiSelect } from "@/components/ui/multi-select";
import { Filter, X } from 'lucide-react';
import { filterOptions } from '@/config/filterOptions';
import { Badge } from "@/components/ui/badge";

export default function AdvancedFilters({ filters, setFilters, availableFilters = null }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Sincronizar estado local quando o Sheet abre ou filters externos mudam
  useEffect(() => {
    if (isSheetOpen) {
      setLocalFilters(filters);
    }
  }, [isSheetOpen, filters]);

  // Lógica defensiva: Se availableFilters for passado mas incompleto (ex: {}),
  // precisamos garantir que não quebre o map.
  // O fallback || filterOptions só funciona se availableFilters for null/undefined/false.
  // Se availableFilters for {}, ele é usado e causa o erro.
  const rawOptions = availableFilters || filterOptions || {};
  
  // Helper para garantir array
  const getOpts = (key) => Array.isArray(rawOptions[key]) ? rawOptions[key] : (filterOptions[key] || []);

  const handleApply = () => {
    setFilters(localFilters);
    setIsSheetOpen(false);
  };

  const handleClear = () => {
    // Resetar localmente apenas as chaves que existem nos filtros
    const cleared = {};
    if (localFilters) {
        Object.keys(localFilters).forEach(key => {
            cleared[key] = [];
        });
    }
    setLocalFilters(cleared);
  };

  // Contagem segura de filtros ativos
  const activeCount = filters ? Object.values(filters).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0) : 0;

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant={activeCount > 0 ? "default" : "outline"} size="sm" className="h-9 relative">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Globais</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Supervisor */}
          <div className="space-y-2">
            <MultiSelect
              label="Supervisores"
              options={getOpts('supervisor').map(opt => ({ value: opt.label || opt, label: opt.label || opt }))}
              selected={localFilters?.supervisor || []}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, supervisor: val }))}
              placeholder="Selecione supervisores..."
            />
          </div>

          {/* Vendedor */}
          <div className="space-y-2">
            <MultiSelect
              label="Vendedores"
              options={getOpts('vendedor').map(opt => ({ value: opt.label || opt, label: opt.label || opt }))}
              selected={localFilters?.vendedor || []}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, vendedor: val }))}
              placeholder="Selecione vendedores..."
            />
          </div>

          {/* Região */}
          <div className="space-y-2">
            <MultiSelect
              label="Regiões"
              options={getOpts('regiao').map(opt => ({ value: opt.label || opt, label: opt.label || opt }))}
              selected={localFilters?.regiao || []}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, regiao: val }))}
              placeholder="Selecione regiões..."
            />
          </div>

          {/* Grupo de Clientes */}
          <div className="space-y-2">
            <MultiSelect
              label="Grupos de Clientes"
              options={getOpts('grupoCliente').map(opt => ({ value: opt.label || opt, label: opt.label || opt }))}
              selected={localFilters?.grupoCliente || []}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, grupoCliente: val }))}
              placeholder="Selecione grupos..."
            />
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <MultiSelect
              label="Clientes"
              options={getOpts('cliente').map(opt => ({ value: opt.label || opt, label: opt.label || opt }))}
              selected={localFilters?.cliente || []}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, cliente: val }))}
              placeholder="Selecione clientes..."
            />
          </div>

          {/* Produto */}
          <div className="space-y-2">
            <MultiSelect
              label="Produtos"
              options={getOpts('produto').map(opt => ({ value: opt.label || opt, label: opt.label || opt }))}
              selected={localFilters?.produto || []}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, produto: val }))}
              placeholder="Selecione produtos..."
            />
          </div>
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto">
            <X className="mr-2 h-4 w-4" /> Limpar Filtros
          </Button>
          <Button onClick={handleApply} className="w-full sm:w-auto">
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}