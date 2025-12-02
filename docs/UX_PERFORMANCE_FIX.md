# Solução: Refresh ao Alternar Abas + Timeout Supabase

## Data: 2025-11-29
## Status: ✅ IMPLEMENTADO

### Problema 1: Refresh/Reload ao Navegar (UX Ruim)

**Diagnóstico:**
O sistema utilizava `useEffect` local em páginas críticas (ex: `DashboardComercial.jsx`) para buscar dados. Ao navegar entre abas, o componente era desmontado e, ao retornar, o `useEffect` rodava novamente, disparando spinners de carregamento e causando a sensação de "refresh" da página, além de sobrecarregar o banco.

**Solução Aplicada:**
1.  **React Query (TanStack Query):** Implementamos uma camada de cache global robusta.
2.  **Configuração Global (`queryClient.js`):**
    *   `staleTime: 5 minutos`: Dados são considerados frescos por 5 minutos. Navegar entre abas NÃO dispara novas requisições.
    *   `gcTime: 30 minutos`: Dados inativos permanecem na memória por 30 min antes de serem coletados.
    *   `refetchOnWindowFocus: false`: Evita recargas desnecessárias ao trocar de janela.
3.  **Hook Centralizado (`useDashboardData.js`):** Criamos um hook que encapsula a lógica de busca e a chave de cache (`queryKey`) baseada nos filtros.
4.  **Refatoração (`DashboardComercial.jsx`):** Substituímos o `useEffect` manual pelo hook. Agora, ao voltar para a aba, os dados aparecem **instantaneamente** do cache.

### Problema 2: Timeout no Dashboard (Erro 57014)

**Diagnóstico:**
A função `get_dashboard_and_daily_sales_kpis` processa um grande volume de dados para calcular KPIs, rankings e vendas diárias de uma só vez. O timeout padrão do Supabase (aprox. 30s-60s dependendo da carga) estava sendo atingido.

**Solução Aplicada:**
1.  **Aumento de Timeout (Database):** Executamos `ALTER FUNCTION ... SET statement_timeout TO '120s'`. Isso instrui o Postgres a permitir que esta função específica rode por até 2 minutos antes de cancelar.
2.  **Tratamento no Frontend:** O hook `useDashboardData` agora gerencia estados de `isLoading` (primeira carga) vs `isFetching` (atualização em background), melhorando a percepção de performance mesmo se a query demorar.

### Arquivos Modificados

*   `src/lib/queryClient.js` (Novo: Configuração central do cache)
*   `src/main.jsx` (Atualizado: Adicionado `QueryClientProvider`)
*   `src/hooks/useDashboardData.js` (Atualizado: Lógica de cache e fetch)
*   `src/pages/DashboardComercial.jsx` (Refatorado: Removeu `useEffect`, usa hook de cache)
*   `src/contexts/DataContext.jsx` (Mantido como legado/backup, mas o Dashboard agora é independente)

### Como Testar

1.  Abra o **Dashboard**. Aguarde o carregamento inicial.
2.  Navegue para outra aba (ex: **Configurações**).
3.  Volte para o **Dashboard**.
    *   **Resultado Esperado:** Os dados devem aparecer **instantaneamente** sem spinner de carregamento.
4.  Verifique o console do navegador. Não deve haver nova requisição de rede para `get_dashboard_and_daily_sales_kpis` se estiver dentro de 5 minutos.