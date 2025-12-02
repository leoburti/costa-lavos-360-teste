import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'analyticsFilters';

const INITIAL_FILTERS = {
  supervisor: [],
  vendedor: [],
  regiao: [],
  grupoCliente: [],
  cliente: [],
  produto: []
};

export function useAdvancedFilters() {
  // 1. Carregar estado inicial do localStorage ou usar padrão
  const [filters, setFiltersState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_FILTERS;
    } catch (e) {
      console.error("Erro ao carregar filtros do localStorage:", e);
      return INITIAL_FILTERS;
    }
  });

  // 2. Validar e Salvar no localStorage sempre que filters mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (e) {
      console.error("Erro ao salvar filtros no localStorage:", e);
    }
  }, [filters]);

  // 3. Função para atualizar filtros (merge state)
  const setFilters = useCallback((newFilters) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // 4. Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFiltersState(INITIAL_FILTERS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Erro ao limpar filtros do localStorage:", e);
    }
  }, []);

  // 5. Verificar se há filtros ativos
  const isActive = Object.values(filters).some(value => 
    Array.isArray(value) && value.length > 0
  );

  return {
    filters,
    setFilters,
    clearFilters,
    isActive
  };
}