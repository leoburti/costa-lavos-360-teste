# Plano de Otimização de Performance

## Resumo Executivo
Baseado na análise de `EXPLAIN ANALYZE` das 13 funções mais críticas, identificamos um padrão claro de gargalos que afetam a performance de todo o sistema. A maioria dos problemas de lentidão se origina de **Full Table Scans** na tabela `bd-cl` e no uso ineficiente de `Materialized Views`. Este plano delineia uma estratégia de três fases para resolver esses problemas de forma priorizada.

- **Total de funções analisadas:** 13
- **Funções críticas (>15s):** 3 (`get_dashboard_and_daily_sales_kpis`, `get_product_basket_analysis_v2`, `process_refresh_sales_summary`)
- **Funções altas (8-15s):** 8
- **Funções moderadas (<8s):** 2

## Problemas Identificados

1.  **Full Table Scans em `bd-cl`:** A ausência de índices em colunas de data (`"DT Emissao"`) e filtros comuns (`"Nome Supervisor"`, `"Nome Vendedor"`, `"Cfo"`) força o PostgreSQL a ler a tabela inteira em quase todas as consultas analíticas, resultando em tempos de execução extremamente altos.
2.  **Uso Ineficiente de Materialized Views:** Funções como `get_dashboard_and_daily_sales_kpis` realizam múltiplos scans na `mv_sales_summary` em vez de um único scan otimizado, dobrando o custo da consulta.
3.  **Atualização Bloqueante de Materialized Views:** A função `process_refresh_sales_summary` é executada de forma síncrona, consumindo uma quantidade massiva de recursos e causando lentidão em todo o sistema durante sua execução.

## Soluções Recomendadas

1.  **Criação de Índices Estratégicos:** Implementar índices compostos e de pesquisa na tabela `bd-cl` para eliminar os `Full Table Scans`.
2.  **Refatoração de Funções Críticas:** Otimizar a lógica de funções como `get_dashboard_and_daily_sales_kpis` para realizar um único scan na `Materialized View`.
3.  **Agendamento de Tarefas Pesadas:** Mover a atualização das `Materialized Views` para um horário de baixa utilização (madrugada) utilizando `pg_cron`.

## Plano de Implementação

### Fase 1: Índices (Impacto Estimado: 80%)
- **Ação:** Criar os seguintes índices na tabela `bd-cl`.
    - **Índice Composto Principal (essencial):** `CREATE INDEX idx_bd_cl_data_supervisor_cfo ON "bd-cl" ("DT Emissao", "Nome Supervisor", "Cfo");`
    - **Índice para Pesquisas de Texto:** `CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE INDEX idx_bd_cl_gin_names ON "bd-cl" USING gin (public.f_unaccent("N Fantasia") gin_trgm_ops, public.f_unaccent("Nome") gin_trgm_ops);`
- **Responsável:** Arquiteto / DBA.
- **Prazo:** Imediato (próximas 24 horas).

### Fase 2: Otimização de Função e Materialized View (Impacto Estimado: 15%)
- **Ação:** Refatorar a função `get_dashboard_and_daily_sales_kpis` para utilizar uma única consulta com `FILTER (WHERE ...)` para agregar dados dos dois períodos.
- **Ação:** Adicionar índices na `private.mv_sales_summary` nas colunas de filtro mais comuns (`sale_date`, `supervisor_name`, `seller_name`).
- **Responsável:** Desenvolvedor Backend Sênior.
- **Prazo:** Próximos 3 dias.

### Fase 3: Agendamento de Tarefas com `pg_cron` (Impacto Estimado: 5%)
- **Ação:** Instalar e configurar a extensão `pg_cron` no Supabase.
- **Ação:** Criar um agendamento para executar a função `public.process_refresh_sales_summary()` diariamente às 3:00 AM.
  - `SELECT cron.schedule('refresh-mv-daily', '0 3 * * *', 'SELECT public.process_refresh_sales_summary()');`
- **Responsável:** SRE / DBA.
- **Prazo:** Próximos 5 dias.

## Métricas de Sucesso
Após a implementação, as seguintes melhorias são esperadas:
- **Redução de tempo médio de execução:** > 85% para as funções RPC analisadas.
- **Redução de `buffer reads`:** > 70% nas queries mais lentas.
- **Redução de `seq scans` em `bd-cl`:** Eliminação de 99% dos scans sequenciais, substituindo-os por `Index Scans`.