import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useToast } from "@/components/ui/use-toast";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    kpi: {},
    rankings: {},
    dailySales: [],
    // Adicionado um estado 'clients' padrão para evitar o erro de propriedade indefinida
    clients: [], 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      // A chamada para a função Supabase 'get-overview-data' foi removida ou comentada.
      // Esta função estava causando um erro de CORS e foi desativada conforme solicitado.
      // Caso precise buscar dados novamente, adicione aqui a lógica de chamada de API.
      // Exemplo comentado abaixo:
      /*
      const { data: responseData, error: responseError } = await supabase.functions.invoke('get-overview-data', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (responseError) {
        console.error("CORS ou erro de função:", responseError);
        const userFriendlyError = "Não foi possível carregar os dados do dashboard. Verifique sua conexão ou tente novamente mais tarde.";
        setError(userFriendlyError);
        toast({
          variant: "destructive",
          title: "Erro de Rede",
          description: userFriendlyError,
        });
        setData({ kpi: {}, rankings: {}, dailySales: [] }); // Reset data on error
      } else {
        setData(responseData);
      }
      */
      
      // Definindo dados iniciais ou vazios já que a chamada foi removida
      setData({
        kpi: {
          totalRevenue: 0,
          totalBonification: 0,
          totalEquipment: 0,
          activeClients: 0,
          salesCount: 0,
          averageTicket: 0,
          projectedRevenue: 0,
          lastSaleDate: null,
          totalRevenueMonthToDate: 0,
        },
        rankings: {
          salesBySupervisor: [],
          salesBySeller: [],
          salesByProduct: [],
          salesByCustomerGroup: [],
          salesByClient: [],
          regionalSales: [],
        },
        dailySales: [],
        clients: [], // Certifica que 'clients' está sempre presente e é um array
      });
      setLoading(false);
    };

    fetchData();
  }, [toast]);

  const value = {
    ...data,
    loading,
    error,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};