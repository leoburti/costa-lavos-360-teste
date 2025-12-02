# Configuração de Jobs Agendados (pg_cron)

## Jobs Agendados

### 1. refresh_mv_sales_summary_daily
- **Horário:** 2:00 AM (UTC)
- **Frequência:** Diariamente
- **Função:** refresh_mv_sales_summary_concurrent()
- **Duração esperada:** ~15-20 minutos
- **Impacto:** Médio (CONCURRENT)

### 2. refresh_mv_filter_options_daily
- **Horário:** 2:30 AM (UTC)
- **Frequência:** Diariamente
- **Função:** refresh_mv_filter_options_concurrent()
- **Duração esperada:** ~5-10 minutos
- **Impacto:** Baixo

### 3. refresh_mv_available_periods_daily
- **Horário:** 3:00 AM (UTC)
- **Frequência:** Diariamente
- **Função:** refresh_mv_available_periods_concurrent()
- **Duração esperada:** ~5-10 minutos
- **Impacto:** Baixo

### 4. refresh_all_materialized_views_weekly
- **Horário:** 4:00 AM (UTC) - Domingos
- **Frequência:** Semanalmente
- **Função:** refresh_all_materialized_views()
- **Duração esperada:** ~30-40 minutos
- **Impacto:** Médio (backup completo)

### 5. reset_pg_stat_statements_weekly
- **Horário:** 5:00 AM (UTC) - Domingos
- **Frequência:** Semanalmente
- **Função:** pg_stat_statements_reset()
- **Duração esperada:** <1 minuto
- **Impacto:** Nenhum

## Monitoramento

Use a função `get_cron_job_status()` para monitorar: