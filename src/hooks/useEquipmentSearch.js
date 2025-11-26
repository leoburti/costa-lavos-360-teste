
import { useMemo } from 'react';
import { useClientEquipments } from './useClientEquipments';

export const useEquipmentSearch = (clientId, searchTerm) => {
  // Reuse the robust client equipment fetcher to ensure data consistency
  // This prevents multiple conflicting queries for the same data
  const { equipments, isLoading, refetch, isError } = useClientEquipments(clientId);
  
  const filteredEquipments = useMemo(() => {
    if (!equipments) return [];
    if (!searchTerm) return equipments;
    
    const lowerTerm = searchTerm.toLowerCase();
    return equipments.filter(item => {
      const nome = item.nome?.toLowerCase() || '';
      const modelo = item.modelo?.toLowerCase() || '';
      const serie = item.serie?.toLowerCase() || '';
      const local = item.localizacao?.toLowerCase() || '';
      
      return (
        nome.includes(lowerTerm) ||
        modelo.includes(lowerTerm) ||
        serie.includes(lowerTerm) ||
        local.includes(lowerTerm)
      );
    });
  }, [equipments, searchTerm]);

  return {
    equipments: filteredEquipments,
    isLoading,
    isError,
    refetch
  };
};
