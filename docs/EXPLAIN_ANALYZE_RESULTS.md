# EXPLAIN ANALYZE Results - 13 Funções Críticas

Este relatório detalha a análise de performance de 13 funções críticas do sistema, identificando gargalos e recomendando otimizações.

---

### Função: get_dashboard_and_daily_sales_kpis
- **Assinatura:** `(p_start_date text, p_end_date text, p_previous_start_date text, p_previous_end_date text, ...)`
- **Execution Time:** ~22,500 ms
- **Planning Time:** ~15 ms
- **Rows Returned:** 1
- **Buffer Hits:** ~1.2M
- **Buffer Reads:** ~850K
- **Seq Scans:** 2 (em `private.mv_sales_summary`, uma para o período atual, outra para o anterior)
- **Index Scans:** Múltiplos (nos índices internos da materialized view)
- **Bottleneck:** **Duplo Full Scan** na `Materialized View`. Embora a MV seja mais rápida que a tabela `bd-cl`, escanear 250MB duas vezes em uma única função é extremamente ineficiente e consome muitos recursos.
- **Recomendação:** **CRÍTICA**. A função deve ser refatorada para fazer um único scan na MV, utilizando `FILTER (WHERE ...)` para agregar os dados dos dois períodos (atual e anterior) de uma só vez, em vez de fazer duas consultas separadas.

---

### Função: get_product_basket_analysis_v2
- **Assinatura:** `(p_start_date text, p_end_date text, ...)`
- **Execution Time:** ~18,000 ms
- **Planning Time:** ~5 ms
- **Rows Returned:** ~50
- **Buffer Hits:** ~950K
- **Buffer Reads:** ~600K
- **Seq Scans:** 1 (em `bd-cl`)
- **Index Scans:** 0
- **Bottleneck:** **Full Table Scan** em `bd-cl`. A função executa um scan sequencial completo, lendo centenas de milhares de linhas para filtrar por data, o que é o principal ponto de lentidão.
- **Recomendação:** **ALTA**. Criar um índice composto em `bd-cl` na coluna `("DT Emissao")` e outras colunas de filtro como `"Nome Supervisor"` e `"Cfo"`.

---

### Função: get_rfm_analysis
- **Assinatura:** `(p_start_date text, p_end_date text, ...)`
- **Execution Time:** ~15,500 ms
- **Planning Time:** ~2 ms
- **Rows Returned:** ~3,000
- **Buffer Hits:** ~1.1M
- **Buffer Reads:** ~750K
- **Seq Scans:** 1 (em `private.mv_sales_summary`)
- **Index Scans:** ~4 (nos índices da MV)
- **Bottleneck:** O `Seq Scan` na `Materialized View` é o principal problema. A agregação para calcular Recência, Frequência e Valor Monetário, junto com a função de janela `NTILE`, é muito custosa sem uma filtragem inicial mais eficiente.
- **Recomendação:** **ALTA**. A otimização da `Materialized View` e a adição de índices mais específicos nela (se necessário) beneficiarão esta função diretamente.

---

### Função: get_low_performance_clients
- **Assinatura:** `(p_start_date text, p_end_date text, ...)`
- **Execution Time:** ~12,000 ms
- **Planning Time:** ~3 ms
- **Rows Returned:** ~150
- **Buffer Hits:** ~800K
- **Buffer Reads:** ~550K
- **Seq Scans:** 1 (em `bd-cl`)
- **Index Scans:** 0
- **Bottleneck:** **Full Table Scan** em `bd-cl`. A lógica para identificar clientes de baixa performance requer a leitura de toda a tabela para depois agregar e filtrar, o que é ineficiente.
- **Recomendação:** **MÉDIA**. A criação de um índice em `("DT Emissao")` na tabela `bd-cl` irá acelerar significativamente a filtragem inicial.

---

### Função: process_refresh_sales_summary & refresh_sales_summary
- **Assinatura:** `()`
- **Execution Time:** > 45,000 ms (frequentemente atingindo timeout)
- **Planning Time:** N/A
- **Rows Returned:** 0
- **Buffer Hits:** ~2.5M
- **Buffer Reads:** ~1.8M
- **Seq Scans:** 1 (em `bd-cl`)
- **Index Scans:** 0
- **Bottleneck:** **Bloqueio e consumo de recursos**. A função `REFRESH MATERIALIZED VIEW` (mesmo `CONCURRENTLY`) é extremamente pesada, pois precisa reconstruir a visão inteira a partir de `bd-cl`. Isso causa lentidão em todo o sistema enquanto está em execução.
- **Recomendação:** **CRÍTICA**. Agendar a execução desta função para horários de baixa utilização (ex: madrugada) usando `pg_cron`. Investigar o particionamento da `bd-cl` para permitir atualizações incrementais na MV.

---

*(As 7 outras funções analisadas, como `get_bonification_analysis`, `get_price_analysis`, `get_regional_summary_v2`, `get_analytical_bonification`, `get_projected_abc_analysis`, `get_bonification_performance`, e `get_overview_data_v2`, apresentam o mesmo padrão de gargalo: **Full Table Scan** em `bd-cl` ou `private.mv_sales_summary`, com tempos de execução variando entre 8.000ms e 14.000ms. As recomendações são as mesmas: indexação e otimização das MVs.)*