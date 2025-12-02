# Mapeamento Completo de Assinaturas de Funções

## Data: 2025-11-29
## Equipe: Tech Lead + Desenvolvedor Backend

### Funções Encontradas

#### Funções Analíticas (get_*)

| Função                               | Parâmetros (Assinatura)                                                                                                                                                                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_analytical_bonification`        | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_bonification_analysis`          | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)`                     |
| `get_bonification_performance`       | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean, p_group_by text)`      |
| `get_dashboard_and_daily_sales_kpis` | `(p_start_date text, p_end_date text, p_previous_start_date text, p_previous_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)` |
| `get_low_performance_clients`        | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_overview_data_v2`               | `(p_start_date text, p_end_date text, p_previous_start_date text, p_previous_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)` |
| `get_price_analysis`                 | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_product_basket_analysis_v2`     | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_projected_abc_analysis`         | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| **`get_regional_summary_v2`**        | **`(p_start_date text, p_end_date text, p_exclude_employees boolean, p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_analysis_mode text, p_show_defined_groups_only boolean, p_supervisors text[], p_sellers text[])`** |
| `get_rfm_analysis`                   | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |

#### Funções de Refresh

| Função                          | Parâmetros (Assinatura) |
| ------------------------------- | ----------------------- |
| `process_refresh_sales_summary` | `()`                    |
| `refresh_sales_summary`         | `()`                    |

---

### Problema Identificado

**Função:** `get_regional_summary_v2`
**Status:** ✅ ENCONTRADA
**Assinatura Correta:** `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_analysis_mode text, p_show_defined_groups_only boolean, p_supervisors text[], p_sellers text[])`
**Alternativa:** Não necessária. A função existe, mas a assinatura usada no frontend estava incorreta.

### Recomendações

1.  **Ajuste no Frontend:** Corrigir a chamada da função `get_regional_summary_v2` no código frontend (`src/pages/AnaliticoRegiao.jsx`) para passar os parâmetros na ordem e tipo corretos, conforme a assinatura encontrada.
2.  **Centralizar Assinaturas:** Criar um arquivo de mapeamento (`src/config/rpc_migration_map.js`) no frontend para documentar as assinaturas corretas de todas as funções RPC. Isso servirá como uma "fonte da verdade" e evitará erros futuros.
3.  **Performance:** As funções ainda dependem de scans na tabela `bd-cl`. A próxima fase de otimização deve focar na criação de índices para acelerar essas consultas.