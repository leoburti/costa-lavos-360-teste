# Mapeamento de Funções por Página (Auditado)

## Resumo de Auditoria Forense (Phase 1)
Este documento foi atualizado para refletir o mapeamento corrigido das páginas analíticas para as funções RPC existentes no banco de dados. O mapeamento visa restaurar a funcionalidade imediatamente utilizando funções robustas como `get_regional_summary_v2` onde aplicável, e funções especializadas (`get_seller_analytical_data`, `get_churn_analysis_data_v3`) onde necessário.

## Analytics Pages Mapping

| Página | RPC Function | Mode / Params | Status |
|--------|-------------|---------------|--------|
| `/analitico-supervisor` | `get_regional_summary_v2` | `mode='supervisor'` | ✅ Corrigido |
| `/analitico-vendedor` | `get_seller_analytical_data` | (Specific Params) | ✅ Corrigido |
| `/analitico-regiao` | `get_regional_summary_v2` | `mode='region'` | ✅ Corrigido |
| `/analitico-grupo-clientes` | `get_regional_summary_v2` | `mode='customerGroup'` | ✅ Corrigido |
| `/analitico-produto` | `get_product_basket_analysis_v2` | - | ✅ Corrigido |
| `/analitico-vendas-diarias` | `get_dashboard_and_daily_sales_kpis` | - | ✅ Corrigido |
| `/curva-abc` | `get_projected_abc_analysis` | - | ✅ Corrigido |
| `/analise-valor-unitario` | `get_price_analysis` | - | ✅ Corrigido |
| `/analise-desempenho-fidelidade` | `get_low_performance_clients` | - | ✅ Corrigido |
| `/analise-clientes` | `get_rfm_analysis` | - | ✅ Corrigido |
| `/analise-produtos` | `get_product_basket_analysis_v2` | - | ✅ Corrigido |
| `/analise-sazonalidade` | `get_seasonality_analysis` | - | ✅ Corrigido |
| `/analise-margem` | `get_margin_analysis` | - | ✅ Corrigido |
| `/analise-preditiva-vendas` | `get_rfm_analysis` | - | ✅ Corrigido |
| `/analise-churn` | `get_churn_analysis_data_v3` | - | ✅ Corrigido |
| `/visao-360-cliente` | `get_dashboard_and_daily_sales_kpis` | - | ✅ Mantido |

## Function Details

### `get_regional_summary_v2`
- **Uso:** Função coringa para sumarizações hierárquicas (Região, Supervisor, Grupo).
- **Retorno:** `{ name, sales, percentage }`
- **Adaptação:** Frontend deve mapear `sales` para `value` ou `size` conforme necessidade do componente gráfico.

### `get_seller_analytical_data`
- **Uso:** Dashboard detalhado do vendedor.
- **Crítico:** NÃO aceita `p_analysis_mode`. Passar apenas filtros padrão (datas, hierarquia).

### `get_churn_analysis_data_v3`
- **Uso:** Análise de Churn.
- **Retorno:** Estrutura JSON complexa com KPIs e listas por fase de risco.

### `useAnalyticalData` Hook
- **Melhoria:** Hook atualizado para sanitizar parâmetros (evitar envio de `undefined`), tratar erros RPC 404/42883 e implementar retry automático.