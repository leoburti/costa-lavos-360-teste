import { QueryClient } from '@tanstack/react-query';

// Configuração Global do React Query para UX Fluida
// Implementa estratégia "Stale-While-Revalidate" agressiva para evitar loadings desnecessários
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados considerados "frescos" por 5 minutos.
      // Durante este tempo, navegar entre abas NÃO causará refetch.
      staleTime: 1000 * 60 * 5, 
      
      // Manter dados em cache (memória) por 30 minutos antes de garbage collection.
      // Isso permite que dados "velhos" sejam mostrados instantaneamente enquanto revalidam em background.
      gcTime: 1000 * 60 * 30, 
      
      // Não recarregar ao focar na janela (evita piscadas desnecessárias se o usuário só trocou de aba do navegador)
      refetchOnWindowFocus: false, 
      
      // Não recarregar se o componente remontar e os dados ainda estiverem frescos (staleTime)
      refetchOnMount: false,
      
      // Tentar novamente 1 vez em caso de erro de rede
      retry: 1,
      
      // Suporte a modo offline
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});