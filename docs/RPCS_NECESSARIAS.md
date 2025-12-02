# Auditoria de Funções RPC (Remote Procedure Calls)

Este documento lista todas as chamadas `supabase.rpc()` identificadas no código-fonte, comparando-as com as funções existentes no banco de dados para garantir integridade do sistema.

**Data da Análise:** 01/12/2025
**Status Geral:** O sistema está majoritariamente coberto, com algumas funções críticas operando em modo "Stub" (Mock) e uma divergência de nomenclatura em funções de drilldown.

---

## 1. Core & Dashboard (Prioridade Alta)

Estas funções alimentam a página inicial e os contextos globais de dados.

| Nome da RPC | Chamada em | Parâmetros Esperados | Retorno Esperado | Status |
| :--- | :--- | :--- | :--- | :--- |
| `get_dashboard_and_daily_sales_kpis` | `src/contexts/DataContext.jsx`<br>`src/pages/DashboardPage.jsx` | `p_start_date`, `p_end_date`, `p_previous_...`, `p_filters...` | JSON com `kpi` (objeto) e `dailySales` (array) | ✅ **EXISTE** (Atualizada) |
| `get_performance_ranking` | `src/components/dashboard/PerformanceRanking.jsx` | `p_dimension`, `p_start_date`, `p_end_date`, `p_limit`, `p_filters...` | Array JSON com ranking `{name, total_revenue, trend}` | ✅ **EXISTE** (Nova) |
| `get_dashboard_aggregated_data` | `src/pages/dashboard/DashboardAnalytico.jsx` | `p_page`, `p_page_size`, `p_filters...` | Tabela paginada de vendas agregadas | ✅ **EXISTE** |
| `get_all_filter_options` | `src/contexts/FilterContext.jsx` (implícito) | Nenhum | JSON com listas para selects (supervisores, regiões, etc) | ✅ **EXISTE** |
| `get_user_access_scope` | `src/contexts/UserAccessContext.jsx` | Nenhum | JSON com role e arrays de restrição (RLS) | ✅ **EXISTE** |

## 2. Visão 360 & Clientes

Funções focadas na análise individual de clientes.

| Nome da RPC | Chamada em | Parâmetros Esperados | Retorno Esperado | Status |
| :--- | :--- | :--- | :--- | :--- |
| `get_client_360_data_v2` | `src/pages/Visao360Cliente.jsx` | `p_target_client_code`, `p_target_store`, `p_dates...` | JSON complexo com perfil, KPIs e histórico | ✅ **EXISTE** |
| `get_client_analytics` | `src/pages/dashboard/Visao360ClientePage.jsx` | `p_client_id`, `p_start_date`, `p_end_date` | Tabela `{name, value}` com indicadores-chave | ✅ **EXISTE** |
| `get_cliente_detalhes_by_uuid` | `src/services/apoioSyncService.js` | `p_uuid` | JSON detalhado do cliente (comodato + ERP) | ✅ **EXISTE** |
| `get_client_equipments` | `src/pages/EquipamentosEmCampo.jsx` | `p_cliente_id` | Lista de equipamentos em posse do cliente | ✅ **EXISTE** |

## 3. Analytics Avançado & Relatórios

Funções pesadas de agregação para páginas específicas de análise.

| Nome da RPC | Chamada em | Parâmetros Esperados | Retorno Esperado | Status |
| :--- | :--- | :--- | :--- | :--- |
| `get_churn_analysis_data_v3_optimized` | `src/pages/AnalisePreditivaVendas.jsx` | `p_start_date`, `p_end_date`, `p_limit`, `p_offset` | Lista de clientes em risco de churn | ✅ **EXISTE** |
| `get_rfm_analysis` | `src/pages/AnalisePreditivaVendas.jsx` | `p_dates...`, `p_filters...` | Segmentação RFM (Recência, Frequência, Monetário) | ✅ **EXISTE** |
| `get_projected_abc_analysis` | `src/pages/CurvaABC.jsx` | `p_dates...`, `p_filters...` | Classificação A/B/C/D/E dos clientes | ✅ **EXISTE** |
| `get_bonification_performance` | `src/components/bonificacoes/...` | `p_dates...`, `p_filters...` | Performance de bonificação por supervisor | ✅ **EXISTE** |
| `get_regional_summary_v2` | `src/pages/AnaliticoRegiao.jsx` | `p_analysis_mode`, `p_dates...` | Resumo de vendas por região hierárquica | ✅ **EXISTE** |
| `get_product_basket_analysis_v2` | `src/pages/AnaliseProdutos.jsx` | `p_dates...`, `p_filters...` | Análise de cesta de produtos (Market Basket) | ✅ **EXISTE** |

## 4. Operacional & Apoio

Funções de suporte ao fluxo de trabalho.

| Nome da RPC | Chamada em | Parâmetros Esperados | Retorno Esperado | Status |
| :--- | :--- | :--- | :--- | :--- |
| `sync_clientes_comodato` | `src/services/apoioSyncService.js` | Nenhum | Sync entre tabelas de ERP e Apoio | ✅ **EXISTE** |
| `auto_update_apto_comodato` | `src/services/apoioSyncService.js` | Nenhum | Atualização em lote de flags de comodato | ✅ **EXISTE** |
| `get_commercial_hierarchy` | `src/services/apoioSyncService.js` | Nenhum | Árvore Supervisor -> Vendedores | ✅ **EXISTE** |
| `is_admin` | `src/hooks/usePermissions.js` | Nenhum | Boolean | ✅ **EXISTE** |

## 5. Funcionalidades "Stub" (Em Desenvolvimento)

Funções que existem no banco mas retornam dados mockados ou mensagens de "Em construção". Devem ser priorizadas na próxima sprint.

| Nome da RPC | Status | Observação |
| :--- | :--- | :--- |
| `get_dashboard_gestor` | ⚠️ **STUB** | Retorna objeto simples com mensagem. Lógica real pendente. |
| `get_relatorio_operacional` | ⚠️ **STUB** | Necessário para módulo de relatórios operacionais. |
| `get_relatorio_comodato` | ⚠️ **STUB** | Necessário para relatórios de comodato. |
| `get_metricas_profissional` | ⚠️ **STUB** | Análise de técnicos. |
| `get_metricas_cliente` | ⚠️ **STUB** | Métricas específicas de apoio ao cliente. |

## 6. Análise de Divergências e Deletados

Problemas encontrados durante a auditoria que podem causar erros em tempo de execução.

### 🚨 Atenção: `get_drilldown_data`
*   **Situação:** O arquivo `src/config/rpc_migration_map.js` e componentes antigos referenciam `get_drilldown_data`.
*   **Banco de Dados:** A função no banco chama-se `get_drilldown_data_old`. Existe também uma **Edge Function** chamada `get-drilldown-data`.
*   **Ação Necessária:** Verificar se o frontend está chamando via `supabase.functions.invoke` (Edge Function) ou `supabase.rpc` (Postgres Function). Se for via RPC, a chamada falhará se não houver um alias ou se a função `get_drilldown_data` (sem _old) não existir no schema `public`.

### Funções Detectadas como Removidas ou Renomeadas
As seguintes funções aparecem em arquivos de código antigos/legados mas não constam no dump atual do banco de dados:
1.  `get_seller_analytical_data` (Mencionada em componentes, mas o corpo retorna apenas mensagem de erro ou redirecionamento para `get_regional_summary_v2`).
2.  `callRpcFunction` (Wrapper antigo em `src/services/supabaseRpcService.js` - arquivo marcado como deprecated).

---

**Recomendação Imediata:**
1. Manter o uso de `get_dashboard_and_daily_sales_kpis` e `get_performance_ranking` no Dashboard principal (já implementado).
2. Implementar a lógica real para os STUBs listados na seção 5.
3. Refatorar chamadas de `get_drilldown_data` para garantir que apontam para a função correta (Postgres ou Edge Function).