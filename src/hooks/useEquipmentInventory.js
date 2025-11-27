import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useEquipmentInventory = (initialGroupBy = 'Fantasia') => {
    const [rawInventory, setRawInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupBy, setGroupBy] = useState(initialGroupBy);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Buscar Inventário da tabela bd_cl_inv
            const { data: invData, error: invError } = await supabase
                .from('bd_cl_inv')
                .select('*');
            
            if (invError) throw invError;

            // 2. Extrair IDs para buscar status de manutenção
            const inventoryIds = invData.map(item => item.Chave_ID).filter(Boolean);

            // 3. Buscar Registros de Manutenção via Edge Function
            // Isso evita o erro de "URL too large" ao passar muitos IDs na query string
            let maintenanceData = [];
            if (inventoryIds.length > 0) {
                const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('get-maintenance-records', {
                    body: { inventory_item_ids: inventoryIds }
                });

                if (edgeError) {
                    console.error('Erro ao buscar manutenções via Edge Function:', edgeError);
                    // Não lançamos erro fatal aqui para permitir visualizar o inventário mesmo sem status de manutenção
                } else if (edgeResult && edgeResult.data) {
                    maintenanceData = edgeResult.data;
                }
            }

            // 4. Mapear Manutenção para Inventário
            // Criar um mapa para acesso rápido O(1)
            const maintMap = {};
            maintenanceData.forEach(m => {
                // Guardamos o registro mais recente (a Edge Function já ordena por data)
                if (!maintMap[m.inventory_item_id]) {
                    maintMap[m.inventory_item_id] = m;
                }
            });
            
            // 5. Processar Dados Finais
            const processedData = invData.map(item => {
                const maint = maintMap[item.Chave_ID];
                
                // Lógica de Status Derivado
                let derivedStatus = item.AA3_STATUS || 'Ativo';
                
                // Se tiver manutenção aberta (não concluída), status é 'Em Manutenção'
                if (maint) {
                    const statusNormal = maint.status?.toLowerCase();
                    if (statusNormal !== 'concluído' && statusNormal !== 'concluido' && statusNormal !== 'finalizado') {
                        derivedStatus = 'Em Manutenção';
                    }
                }
                
                if (item.AA3_STATUS === 'DEVOLVIDO') {
                    derivedStatus = 'Devolvido';
                }

                return {
                    ...item,
                    maintenance: maint, // Anexa o registro de manutenção completo
                    derivedStatus: derivedStatus,
                    derivedLocation: item.Loja_texto || item.Loja
                };
            });

            setRawInventory(processedData);

        } catch (error) {
            console.error('Erro fatal ao carregar inventário:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar ao montar
    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Lógica de Filtro e Agrupamento
    const groupedInventory = useMemo(() => {
        if (!rawInventory) return {};

        // 1. Filtrar
        const filtered = rawInventory.filter(item => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                (item.Fantasia && item.Fantasia.toLowerCase().includes(term)) ||
                (item.Equipamento && item.Equipamento.toLowerCase().includes(term)) ||
                (item.AA3_CHAPA && item.AA3_CHAPA.toLowerCase().includes(term)) ||
                (item.Codigo && item.Codigo.toLowerCase().includes(term)) ||
                (item.Nome_Vendedor && item.Nome_Vendedor.toLowerCase().includes(term)) ||
                (item.REDE && item.REDE.toLowerCase().includes(term))
            );
        });

        // 2. Agrupar
        const groups = {};
        filtered.forEach(item => {
            const key = item[groupBy] || 'Sem Grupo';
            if (!groups[key]) {
                groups[key] = { active: [], inactive: [] };
            }
            
            // Define o que conta como "Ativo" para contagem visual
            const isActive = item.derivedStatus === 'Ativo' || item.derivedStatus === 'Em Manutenção';
            
            if (isActive) {
                groups[key].active.push(item);
            } else {
                groups[key].inactive.push(item);
            }
        });
        
        return groups;
    }, [rawInventory, searchTerm, groupBy]);

    return {
        rawInventory,
        groupedInventory,
        loading,
        searchTerm,
        setSearchTerm,
        groupBy,
        setGroupBy,
        refresh: fetchInventory,
        totalItems: rawInventory.length
    };
};