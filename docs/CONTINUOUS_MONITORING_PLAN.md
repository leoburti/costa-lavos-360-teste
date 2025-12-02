# Plano de Monitoramento Contínuo

## Métricas a Monitorar

### 1. Performance de Queries
-   **Tempo médio de execução (`mean_exec_time`):** Acompanhar o tempo médio das 20 queries mais lentas em `pg_stat_statements`.
-   **Tempo máximo de execução (`max_exec_time`):** Identificar picos e outliers de lentidão.
-   **Taxa de erro:** Monitorar logs do Supabase para picos de erros 5xx, indicando timeouts ou problemas de banco.

### 2. Uso de Índices
-   **Índices não utilizados (`idx_scan = 0`):** Revisar `pg_stat_user_indexes` mensalmente para identificar índices que podem ser removidos.
-   **Qualidade dos scans:** Acompanhar a proporção `idx_scan` vs `seq_scan` em `pg_stat_user_tables`. O objetivo é maximizar `idx_scan`.

### 3. Saúde do Banco de Dados
-   **Tamanho total:** Monitorar o crescimento do banco de dados e dos índices.
-   **Crescimento diário:** Estimar a taxa de crescimento para planejar upgrades de capacidade.

### 4. Jobs Agendados (`pg_cron`)
-   **Taxa de sucesso:** Verificar `cron.job_run_details` para `status = 'succeeded'`.
-   **Tempo de execução:** Monitorar `end_time - start_time` para garantir que os jobs não extrapolem a janela de manutenção.
-   **Erros:** Filtrar `cron.job_run_details` por `status = 'failed'` e analisar `return_message`.

## Alertas Recomendados (A serem configurados no Supabase)

-   **Alerta Crítico:** Se `mean_exec_time` de uma função crítica exceder **1500ms**.
-   **Alerta de Atenção:** Se `seq_scan` na tabela `bd-cl` for maior que 1,000 em um período de 24h.
-   **Alerta Crítico:** Se um job de `pg_cron` (especialmente `refresh_mv_sales_summary_daily`) falhar.
-   **Alerta Informativo:** Se um índice novo permanecer com `idx_scan = 0` por mais de 30 dias.

## Frequência de Revisão

-   **Diária:** Verificar o painel de alertas do Supabase e o status dos jobs do `pg_cron` da noite anterior.
-   **Semanal:** Revisar o relatório de `pg_stat_statements` e a proporção `idx_scan` vs `seq_scan`.
-   **Mensal:** Análise estratégica do crescimento do banco, tamanho dos índices e identificação de índices candidatos à remoção.