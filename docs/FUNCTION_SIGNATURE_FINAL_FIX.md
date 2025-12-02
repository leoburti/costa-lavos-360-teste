# Resolução Final: Erros PGRST202 (Assinatura) e Timeout 57014

## Data: 29/11/2025
## Status: ✅ CORRIGIDO

### Problemas Identificados e Resolvidos

Nesta intervenção, abordamos inconsistências críticas entre as chamadas do Frontend (React) e as definições de função no Backend (Supabase/PostgreSQL), que resultavam em erros de "Função não encontrada" (PGRST202) e Timeouts.

| Função | Erro | Causa Raiz | Solução Aplicada |
| :--- | :--- | :--- | :--- |
| **get_dashboard_xray_data** | PGRST202 | Frontend enviava parâmetro `p_view_mode` que não existia na assinatura do banco. | Adicionado parâmetro `p_view_mode` (DEFAULT NULL) à função. |
| **get_daily_sales_data_v2** | PGRST202 | Frontend enviava parâmetro `p_view_mode` que não existia na assinatura do banco. | Adicionado parâmetro `p_view_mode` (DEFAULT NULL) à função. |
| **get_operational_analysis** | 57014 | A query de análise operacional excedia o limite padrão de 30s do Postgres. | Timeout da função aumentado para 120s (`statement_timeout`). |
| **get_treemap_data** | PGRST202 | Existência de múltiplas assinaturas (sobrecarga) no banco causava ambiguidade para o PostgREST. | Consolidada em uma única "Assinatura Universal" com parâmetros opcionais. |

### Detalhes Técnicos da Implementação

#### 1. Padronização de Assinaturas (Universal Signature Pattern)
Adotamos o padrão de "Assinatura Universal" para as funções analíticas. Isso significa que as funções agora aceitam um superset de parâmetros (como `p_view_mode`, `p_analysis_type`, `p_drilldown_level`) com valor padrão `NULL`.
Isso permite que o hook `useAnalyticalData` do frontend envie seu objeto de estado completo sem quebrar a chamada RPC, garantindo robustez e facilitando evoluções futuras.

#### 2. Otimização de Timeout
Para a função `get_operational_analysis`, que realiza agregações pesadas em tempo real, aplicamos uma configuração específica de timeout via `ALTER FUNCTION`: