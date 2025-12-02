# Diagnóstico de Problemas - Costa Lavos 360

Relatório técnico gerado em 2025-12-01 analisando a consistência entre Frontend (React) e Backend (Supabase RPCs).

## 1. Páginas Analíticas: "Nenhum dado encontrado"

**Sintoma:** Páginas como `AnalyticsSupervisor`, `AnalyticsSeller`, etc., carregam mas exibem o estado de vazio ("Nenhum dado encontrado") mesmo quando deveria haver dados.

| Arquivo Afetado | Linha Aprox. | Causa Provável | Solução Necessária |
|-----------------|--------------|----------------|--------------------|
| `src/hooks/useAnalyticalData.js` | 10-15 | **Formatação de Data (Timezone):** A conversão `toISOString().split('T')[0]` feita nos componentes converte a data para UTC. Se o usuário estiver no Brasil (GMT-3) à noite, a data enviada será a do dia seguinte ("amanhã"), fazendo com que as queries SQL filtrem um futuro sem vendas. | Alterar a formatação de data para usar `date-fns/format` com locale local ou função utilitária que respeite o timezone do browser antes de enviar para a RPC. |
| `src/pages/Analytics*.jsx` | ~25 | **Dependência de Filtros Opcionais:** Os componentes passam `p_search_term` como `null` ou string vazia. Algumas RPCs antigas faziam comparação estrita (`=`) em vez de `ILIKE` flexível quando o termo era vazio, ou a lógica SQL `(p_search_term IS NULL OR ...)` pode estar falhando se o valor for `""` (string vazia) em vez de `NULL`. | Garantir que o frontend envie `null` explicitamente quando o termo de busca for vazio, ou ajustar as RPCs para tratar `''` igual a `NULL`. |
| `src/contexts/FilterContext.jsx` | 15 | **Range de Data Padrão:** O padrão `this_month` pode resultar em zero dados se for o dia 1º do mês e ainda não houver vendas processadas/sincronizadas no dia. | Ajustar o padrão para `last_30_days` ou garantir que o usuário saiba que está vendo o mês atual vazio. |

## 2. Visão 360 Cliente: Redirecionamento para Dashboard

**Sintoma:** Ao acessar `/visao-360-cliente/123`, o usuário vê um loader breve e é jogado de volta para `/dashboard`.

| Arquivo Afetado | Linha Aprox. | Causa Provável | Solução Necessária |
|-----------------|--------------|----------------|--------------------|
| `src/pages/dashboard/Visao360ClientePage.jsx` | 45-60 | **Lógica de Redirecionamento Agressiva:** O `useEffect` executa uma query na tabela `bd-cl`. Se a query falhar ou não retornar nada (ex: cliente sem vendas no período, ou ID composto incorreto), o código executa `navigate('/dashboard')` após 2 segundos. | **Remover o redirecionamento automático.** Substituir por um componente `<EmptyState />` ou `<ErrorState />` que permita ao usuário tentar buscar outro cliente ou ajustar o período, sem expulsá-lo da página. |
| `src/pages/dashboard/Visao360ClientePage.jsx` | 35 | **Busca por ID Estrito:** A query usa `.eq('Cliente', clientId)`. Se o ID na URL for composto (ex: `1812-1` código-loja), a comparação falha pois `Cliente` no banco é numérico/inteiro. | Ajustar a lógica de busca para detectar se o ID possui hífen. Se sim, separar em `Cliente` e `Loja` antes de consultar o Supabase. |

## 3. Análise de RPCs (Remote Procedure Calls)

Verificação das chamadas feitas no código versus definições no banco.

| RPC Chamada (Frontend) | Status no Banco | Uso Principal | Observação de Risco |
|------------------------|-----------------|---------------|---------------------|
| `get_dashboard_and_daily_sales_kpis` | ✅ Existe | Dashboard Principal | Parâmetros parecem corretos. Função crítica. |
| `get_supervisor_summary_v2` | ✅ Existe | `AnalyticsSupervisor` | Requer `p_start_date` (text). Validar formato de data enviado. |
| `get_seller_summary_v2` | ✅ Existe | `AnalyticsSeller` | Mesmo padrão da supervisor. |
| `get_regional_summary_v2` | ✅ Existe | `AnalyticsRegion`, `AnalyticsCustomerGroup` | Função polimórfica (aceita `p_analysis_mode`). Verificar se o modo `customerGroup` está implementado corretamente no SQL. |
| `get_product_basket_analysis_v2` | ✅ Existe | `AnalyticsProduct` | Retorna ranking de produtos. OK. |
| `get_single_client_kpis` | ✅ Existe | `Client360.jsx` (Novo) | Crítica para a nova visão de cliente. Depende de `client_code` e `store` como texto. |
| `get_clientes_visao_360_faturamento` | ✅ Existe | `ClientList.jsx` | Usada na barra lateral de seleção de clientes. Pesada se não tiver limite/paginação. |
| `get_performance_ranking` | ✅ Existe | `PerformanceRanking.jsx` | Usada no Dashboard para o widget de abas. |

**Chamadas Suspeitas/Inexistentes (Potencial Erro):**
*   Não foram encontradas chamadas para funções inexistentes na análise atual, indicando que a limpeza de código anterior foi bem sucedida. O risco reside nos *argumentos* passados.

## 4. Hooks com Falhas Potenciais

| Hook | Problema Identificado | Impacto |
|------|-----------------------|---------|
| `useAnalyticalData` | Em `src/hooks/useAnalyticalData.js`, o tratamento de erro apenas lança a exceção. Se o componente pai não tiver um `ErrorBoundary` ou `catch` local, a tela inteira pode quebrar (Tela Branca). | Adicionar tratamento de erro mais gracioso ou garantir que todos os componentes consumidores usem o estado `isError` para renderizar fallback UI. |
| `useFilters` | O estado global de filtros reseta ao recarregar a página (F5). | Adicionar persistência (localStorage) ou sincronização via URL (query params) para que o usuário não perca o contexto ao atualizar. |

## 5. Rotas Incorretas e Conflitantes

**Sintoma:** Existem duas implementações de "Visão 360", causando confusão de navegação.

| Rota Configurada (`App.jsx`) | Componente Carregado | Problema | Solução |
|------------------------------|----------------------|----------|---------|
| `/cliente/:clientId` | `src/pages/Client360.jsx` | **Nova Implementação (Correta).** Usa a RPC `get_single_client_kpis`. | Manter e promover como padrão. |
| `/visao-360-cliente/:clientId` | `src/pages/dashboard/Visao360ClientePage.jsx` | **Implementação Legada (Problemática).** Contém o bug de redirect e usa lógica de busca frágil. | **Deprecar.** Redirecionar esta rota para `/cliente/:clientId` ou substituir o conteúdo do componente legado pelo novo `Client360`. |
| `Visao360Cliente.jsx` (Raiz) | `src/pages/Visao360Cliente.jsx` | **Arquivo Órfão.** Este arquivo contém uma implementação rica (com lista lateral e dashboard) mas **não parece estar sendo usado em nenhuma rota** no `App.jsx` atual (que aponta para a versão `dashboard/Visao...`). | Avaliar se esta é a versão "Definitiva". Se for, o `App.jsx` deve apontar para este arquivo e não para a versão dentro da pasta `dashboard/`. |

## Recomendações Imediatas

1.  **Unificar Rotas de Cliente:** Decidir entre `Client360.jsx` (focado em um cliente) e `Visao360Cliente.jsx` (layout com lista lateral). Configurar `App.jsx` para usar a melhor versão e remover a rota legada que causa redirects.
2.  **Corrigir Datas:** Implementar formatação de data robusta em `src/lib/utils.js` e usar em todas as chamadas de RPC para evitar problemas de fuso horário (vendas do dia sumindo).
3.  **Remover Redirect:** Editar `src/pages/dashboard/Visao360ClientePage.jsx` para remover o `navigate('/dashboard')` em caso de erro, substituindo por uma mensagem amigável.