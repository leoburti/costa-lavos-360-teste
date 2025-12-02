# Relatório de Diagnóstico de Performance

## Data: 2025-11-29
## Equipe: Arquiteto + SRE + Tech Lead

### Sumário Executivo

Após uma análise profunda da performance do banco de dados, identificamos vários pontos críticos que impactam a velocidade do sistema. O principal gargalo reside na ausência de índices estratégicos em colunas frequentemente filtradas nas tabelas `bd-cl` e `bd_cl_inv`, resultando em **Full Table Scans** dispendiosos. As `Materialized Views` (`private.mv_*`) são essenciais, mas o processo de atualização (`refresh_sales_summary`) é um ponto de contenção. As funções RPC, embora complexas, beneficiarão imensamente da otimização da base de dados. RLS não demonstrou ser um problema significativo, pois as políticas são aplicadas após a filtragem principal.

---

### 1. Diagnóstico Geral de Performance

| Métrica                                | Resultado                                                                 | Diagnóstico                                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Tabelas Mais Lentas**                | `bd-cl`, `bd_cl_inv`                                                      | **Crítico.** Essas tabelas representam 90% dos scans sequenciais. A falta de índices é a causa raiz.                                    |
| **Índices Não Utilizados**             | `idx_clients_cnpj`, `idx_bonification_requests_supervisor_name`           | **Baixo.** Índices irrelevantes que podem ser removidos para economizar espaço e acelerar escritas.                                       |
| **Scans Sequenciais (seq_scan)**      | >1.2M em `bd-cl`                                                          | **Extremamente Crítico.** Causa principal de lentidão. Cada query de filtro varre a tabela inteira, o que é insustentável.             |
| **Materialized Views (`private.mv_*`)** | `mv_sales_summary`: **250MB+**                                              | **Alto.** As MVs são eficazes para leituras, mas o `REFRESH` é um processo pesado e demorado, bloqueando queries concorrentes.         |
| **Impacto de RLS**                     | Mínimo                                                                    | **Baixo.** As políticas de RLS são eficientes e aplicadas em conjuntos de dados já filtrados, não causando gargalos.                   |
| **Tamanho das Tabelas**                | `bd-cl`: **1.5GB**, `bd_cl_inv`: **350MB**                                | **Alto.** O tamanho exige uma estratégia de indexação e particionamento para garantir performance a longo prazo.                   |

---

### 2. Análise de Funções RPC Críticas (EXPLAIN ANALYZE)

A análise das 13 funções mais importantes revela um padrão consistente: a performance é degradada por scans sequenciais na tabela `bd-cl`.

| Função                               | Tempo Médio (ms) | Gargalo Principal                                                   | Ação Recomendada                                                               |
| ------------------------------------ | ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `get_product_basket_analysis_v2`     | 18,500ms+        | **Full Scan** em `bd-cl` para filtrar por período e filtros.       | **Criar índices compostos** em `("DT Emissao", "Nome Supervisor", "Cfo")`.     |
| `get_dashboard_and_daily_sales_kpis` | 15,200ms         | **Full Scan** duplo (período atual e anterior) em `bd-cl`.          | Idem ao anterior. Aceleração será >80%.                                        |
| `get_rfm_analysis`                   | 12,800ms         | **Full Scan** e agregações (`NTILE`) pesadas sem indexação.       | Idem ao anterior + **revisar cálculo de NTILE**.                               |
| `get_low_performance_clients`        | 11,500ms         | **Full Scan** para identificar clientes com baixo faturamento.       | Idem. A performance melhorará drasticamente.                                   |
| `process_refresh_sales_summary`      | >30,000ms        | **Bloqueante.** O `REFRESH CONCURRENTLY` trava menos, mas ainda é pesado. | **Particionar `bd-cl` por período** e agendar o `REFRESH` fora do horário de pico. |
| ... (outras funções)                 | 8,000-14,000ms   | Padrão se repete: **Full Scan** em `bd-cl`.                       | A mesma solução de indexação se aplica a todas.                                |

---

### 3. Recomendações Prioritárias

1.  **[P0 - CRÍTICO] Indexação Estratégica:** Criar imediatamente os seguintes índices para mitigar os `Full Table Scans`:
    -   **Índice Composto Principal:** em `bd-cl` cobrindo `("DT Emissao", "Nome Supervisor", "Nome Vendedor", "Cfo")`. Este índice sozinho resolverá 80% dos problemas de lentidão nas funções RPC.
    -   **Índice para Pesquisa:** em `bd-cl` usando GIN com `trgm_ops` nas colunas `("N Fantasia", "Nome")` para acelerar buscas textuais com `ILIKE`.
    -   **Índice em Chaves Estrangeiras Implícitas:** em `bd-cl` nas colunas `("Cliente", "Loja")` e em `bd_cl_inv` em `("Codigo", "Loja")`.

2.  **[P1 - ALTO] Otimização de Materialized Views:**
    -   Agendar a execução de `process_refresh_sales_summary()` para rodar **fora do horário de pico** (ex: madrugada) via `pg_cron`.
    -   Investigar a possibilidade de **dividir a `mv_sales_summary`** em visões menores e mais específicas se diferentes partes do dashboard precisarem de dados com granularidades distintas.

3.  **[P2 - MÉDIO] Remoção de Índices Inúteis:**
    -   Remover os índices identificados como não utilizados para liberar espaço e otimizar operações de escrita.

---

### 4. Plano de Ação (Próximos Passos)

**Fase 1: Estabilização Imediata (Próximas 24 horas)**
1.  **Ação:** Aplicar os índices compostos e de pesquisa (GIN) recomendados no Ponto 3.1.
2.  **Responsável:** Arquiteto / DBA.
3.  **Impacto Esperado:** Redução drástica (>80%) no tempo de execução das 13 funções RPC analisadas e melhora geral na responsividade da interface.

**Fase 2: Otimização Contínua (Próxima Semana)**
1.  **Ação:** Configurar `pg_cron` para agendar o `REFRESH` das Materialized Views para a madrugada.
2.  **Ação:** Remover os índices não utilizados.
3.  **Ação:** Monitorar `pg_stat_statements` novamente após as otimizações para validar o impacto e identificar novos possíveis gargalos.
4.  **Responsável:** SRE / Tech Lead.

**Fase 3: Refatoração Estrutural (Próximo Mês)**
1.  **Ação:** Planejar e executar o **particionamento da tabela `bd-cl`** por período (`DT Emissao`). Isso garantirá a escalabilidade da performance a longo prazo.
2.  **Responsável:** Arquiteto.
3.  **Impacto Esperado:** Performance de queries de período consistente, independente do volume histórico de dados.