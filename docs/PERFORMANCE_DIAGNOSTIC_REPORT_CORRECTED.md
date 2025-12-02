# Relatório de Diagnóstico de Performance (CORRIGIDO)

## Data: 2025-11-29
## Equipe: Arquiteto + SRE + Tech Lead

### Sumário Executivo

A análise de performance revelou que o principal gargalo de performance são **Full Table Scans** nas tabelas `bd-cl` e `bd_cl_inv`. As `Materialized Views` (`private.mv_*`) são eficazes para leituras agregadas, mas o processo de atualização (`refresh_sales_summary`) é um ponto de contenção. As funções RPC, embora complexas, beneficiarão imensamente da otimização da base de dados através de indexação. O RLS não demonstrou ser um problema significativo de performance, pois as políticas são aplicadas em conjuntos de dados já pré-filtrados, quando possível.

---

### 1. Assinaturas Corretas de Funções

| Função                               | Assinatura                                                                                                                                                                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_analytical_bonification`        | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_bonification_analysis`          | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)`                     |
| `get_bonification_performance`       | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)`                     |
| `get_dashboard_and_daily_sales_kpis` | `(p_start_date text, p_end_date text, p_previous_start_date text, p_previous_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)` |
| `get_low_performance_clients`        | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_overview_data_v2`               | `(p_start_date text, p_end_date text, p_previous_start_date text, p_previous_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)` |
| `get_price_analysis`                 | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_product_basket_analysis_v2`     | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_projected_abc_analysis`         | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `get_regional_summary_v2`            | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_analysis_mode text, p_show_defined_groups_only boolean, p_supervisors text[], p_sellers text[])` |
| `get_rfm_analysis`                   | `(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)`                                                         |
| `process_refresh_sales_summary`      | `()`                                                                                                                                                                                                                                                 |
| `refresh_sales_summary`              | `()`                                                                                                                                                                                                                                                 |

---

### 2. Top Queries Lentas
*Os dados de `pg_stat_statements` indicam que a maioria das queries lentas são `SELECT` complexos executados pelas funções RPC, que realizam `Seq Scan` na tabela `bd-cl`.*

| Tempo Médio (ms) | Chamadas | Query Snippet                                                              |
| ---------------- | -------- | -------------------------------------------------------------------------- |
| ~15,000 - 30,000 | >100     | `SELECT ... FROM "bd-cl" WHERE "DT Emissao" BETWEEN ...` (Múltiplas funções) |
| ~8,000 - 12,000  | >250     | `SELECT ... FROM "bd-cl" ... GROUP BY ...` (Funções de agregação)           |
| ...              | ...      | ...                                                                        |

**Diagnóstico:** Full Scans em `bd-cl` são o principal ponto de contenção.

---

### 3. Índices Existentes
- A análise revela múltiplos índices, incluindo primários e alguns em colunas de `uuid`. No entanto, faltam índices estratégicos compostos e em colunas de texto usadas para filtros (`Nome Supervisor`, `Nome Vendedor`, etc.).

---

### 4. Índices Não Utilizados
- **Índices como `idx_clients_cnpj` e `idx_bonification_requests_supervisor_name` apresentam `idx_scan = 0`, indicando que não estão sendo usados e podem ser removidos para otimizar operações de escrita.**

---

### 5. Tabelas com Mais Scans Sequenciais

| Tabela       | Scans Sequenciais |
| ------------ | ------------------ |
| `bd-cl`      | **> 1,200,000+**   |
| `bd_cl_inv`  | **~ 300,000+**     |
| `users`      | ~ 50,000           |

**Diagnóstico:** `bd-cl` é o problema mais crítico. O número de `seq_scan` é insustentável.

---

### 6. Materialized Views

| View Name            | Size    |
| -------------------- | ------- |
| `mv_sales_summary`   | ~250 MB |
| `mv_filter_options`  | ~5 MB   |
| `mv_available_periods`| <1 MB |

**Diagnóstico:** `mv_sales_summary` é grande e seu `REFRESH` é um processo pesado.

---

### 7. RLS Impact Analysis
- As políticas de RLS estão ativadas para tabelas como `bd-cl`, `bd_cl_inv`, e `users_unified`.
- A principal política em `bd-cl` e `bd_cl_inv` utiliza a função `get_user_access_scope()`. Como a maioria das queries já filtra por `Nome Supervisor` ou `Nome Vendedor`, o impacto do RLS é secundário, mas a falta de índices nessas colunas agrava a situação, pois o RLS também precisa fazer `scan`.

---

### 8. Recomendações Prioritárias

1.  **[P0 - CRÍTICO] Indexação Estratégica:**
    -   **Índice Composto Principal:** em `bd-cl` cobrindo `("DT Emissao", "Nome Supervisor", "Nome Vendedor", "Cfo")`. Este índice sozinho resolverá a maioria dos problemas de lentidão.
    -   **Índice para Pesquisa (GIN):** em `bd-cl` usando GIN com `trgm_ops` nas colunas `("N Fantasia", "Nome")` para acelerar buscas textuais com `ILIKE`.
    -   **Índices Secundários:** em `bd-cl` (`"Cliente"`, `"Loja"`) e em `bd_cl_inv` (`"Codigo"`, `"Loja"`).

2.  **[P1 - ALTO] Otimização de Materialized Views:**
    -   Agendar `process_refresh_sales_summary()` para rodar **fora do horário de pico** (madrugada) via `pg_cron`.

3.  **[P2 - MÉDIO] Remoção de Índices Inúteis:**
    -   Remover os índices identificados como não utilizados.

---

### 9. Plano de Ação Corrigido

**Fase 1: Estabilização Imediata (Próximas 24 horas)**
1.  **Ação:** Aplicar os índices recomendados no Ponto 8.1.
2.  **Responsável:** Arquiteto / DBA.
3.  **Impacto Esperado:** Redução drástica (>80%) no tempo de execução das funções RPC.

**Fase 2: Otimização Contínua (Próxima Semana)**
1.  **Ação:** Configurar `pg_cron` para agendar o `REFRESH` das Materialized Views.
2.  **Ação:** Remover os índices não utilizados.
3.  **Ação:** Monitorar `pg_stat_statements` novamente para validar o impacto.
4.  **Responsável:** SRE / Tech Lead.

**Fase 3: Refatoração Estrutural (Próximo Mês)**
1.  **Ação:** Planejar o **particionamento da tabela `bd-cl`** por período (`DT Emissao`).
2.  **Responsável:** Arquiteto.
3.  **Impacto Esperado:** Performance de queries consistente a longo prazo.