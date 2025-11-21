import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export const useEquipmentInventory = (initialGroupBy = 'Fantasia') => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState(initialGroupBy);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { toast } = useToast();

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Fetch inventory items with a limit to prevent "Failed to fetch" on large datasets
      let inventoryQuery = supabase.from('bd_cl_inv').select('*').limit(1000);

      if (debouncedSearchTerm) {
        const searchColumns = ['Fantasia', 'Equipamento', 'Codigo', 'Loja_texto', 'Nome_Vendedor', 'Nome_Supervisor', 'REDE'];
        const orFilter = searchColumns.map(col => `${col}.ilike.%${debouncedSearchTerm}%`).join(',');
        inventoryQuery = inventoryQuery.or(orFilter);
      }

      const { data: inventoryData, error: inventoryError } = await inventoryQuery;

      if (inventoryError) {
        throw inventoryError;
      }
      
      if (!inventoryData || inventoryData.length === 0) {
        setInventory([]);
        return;
      }

      // Step 2: Fetch all related maintenance records for the fetched items
      const inventoryItemIds = inventoryData.map(item => item.Chave_ID);
      
      // Avoid query error if list is empty (though check above handles it)
      if (inventoryItemIds.length > 0) {
          const { data: maintenanceData, error: maintenanceError } = await supabase
            .from('maintenance')
            .select('*')
            .in('inventory_item_id', inventoryItemIds);
            
          if (maintenanceError) {
            console.error("Error fetching maintenance records:", maintenanceError.message);
            // Don't block, just log
          }

          // Step 3: Combine data in memory
          const maintenanceMap = new Map();
          if (maintenanceData) {
            for (const record of maintenanceData) {
                if (!maintenanceMap.has(record.inventory_item_id) || new Date(record.created_at) > new Date(maintenanceMap.get(record.inventory_item_id).created_at)) {
                    maintenanceMap.set(record.inventory_item_id, record);
                }
            }
          }

          const processedInventory = inventoryData.map(item => ({
            ...item,
            maintenance: maintenanceMap.get(item.Chave_ID) || null,
          }));
          
          setInventory(processedInventory);
      } else {
          setInventory(inventoryData);
      }

    } catch (error) {
      console.error("Error in useEquipmentInventory:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar inventário',
        description: error.message,
      });
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const getStatusInfo = (item) => {
    if (item.Fantasia === 'Costa Lavos') {
        return {
            status: 'Inativo',
            type: 'Em Estoque',
            location: 'Costa Lavos'
        };
    } else {
        return {
            status: 'Ativo',
            type: 'Em Campo',
            location: item.Loja_texto || item.Loja
        };
    }
  };

  const processedData = useMemo(() => {
    if (!inventory.length) {
      return {};
    }

    const getGroupKey = (item) => {
      const statusInfo = getStatusInfo(item);
      switch (groupBy) {
        case 'Loja': return statusInfo.location || 'Sem Loja';
        case 'Vendedor': return item.Nome_Vendedor || 'Sem Vendedor';
        case 'Status': return statusInfo.status;
        case 'Rede': return item.Nome_Rede || 'Sem Rede';
        case 'Fantasia':
        default:
          return item.Fantasia || 'Sem Fantasia';
      }
    };

    const grouped = inventory.reduce((acc, item) => {
      const key = getGroupKey(item);
      if (!acc[key]) {
        acc[key] = { active: [], inactive: [] };
      }
      const statusInfo = getStatusInfo(item);
      const processedItem = { ...item, derivedStatus: statusInfo.status, derivedLocation: statusInfo.location };

      if (statusInfo.status === 'Ativo') {
        acc[key].active.push(processedItem);
      } else { // Inativo
        acc[key].inactive.push(processedItem);
      }
      return acc;
    }, {});

    return grouped;
  }, [inventory, groupBy]);
  
  const rawInventoryWithStatus = useMemo(() => {
    return inventory.map(item => ({
        ...item,
        derivedStatus: getStatusInfo(item).status,
        derivedLocation: getStatusInfo(item).location
    }));
  }, [inventory]);

  return {
    groupedInventory: processedData,
    rawInventory: rawInventoryWithStatus,
    loading,
    searchTerm,
    setSearchTerm,
    groupBy,
    setGroupBy,
    refresh: fetchInventory,
    totalItems: inventory.length
  };
};