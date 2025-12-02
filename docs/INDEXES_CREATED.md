# Índices Criados para Otimização

## Tabela: public.bd-cl

### Índice 1: idx_bd_cl_date_client_supervisor
- **Colunas:** "DT Emissao" DESC, "Cliente", "Nome Supervisor"
- **Tipo:** B-tree
- **Tamanho:** *A ser medido após criação*
- **Uso esperado:** Essencial para a maioria das funções RPC que filtram por período, supervisor e cliente. Acelera a busca de dados para dashboards e relatórios analíticos.
- **Impacto:** **Crítico**. Resolve o principal gargalo de performance.

### Índice 2: idx_bd_cl_date_region
- **Colunas:** "DT Emissao" DESC, "Desc.Regiao"
- **Tipo:** B-tree
- **Tamanho:** *A ser medido após criação*
- **Uso esperado:** Otimiza consultas que agrupam ou filtram vendas por região dentro de um período específico.
- **Impacto:** Alto

### Índice 3: idx_bd_cl_client_date
- **Colunas:** "Cliente", "DT Emissao" DESC
- **Tipo:** B-tree
- **Tamanho:** *A ser medido após criação*
- **Uso esperado:** Acelera análises focadas em um único cliente ao longo do tempo, como histórico de compras ou análises de 360°.
- **Impacto:** Médio

### Índice 4: idx_bd_cl_supervisor_date
- **Colunas:** "Nome Supervisor", "DT Emissao" DESC
- **Tipo:** B-tree
- **Tamanho:** *A ser medido após criação*
- **Uso esperado:** Beneficia relatórios e análises específicas de um supervisor, melhorando a performance de dashboards de gestores.
- **Impacto:** Médio

### Índice 5: idx_bd_cl_cfo_date
- **Colunas:** "Cfo", "DT Emissao" DESC
- **Tipo:** B-tree
- **Tamanho:** *A ser medido após criação*
- **Uso esperado:** Otimiza a separação rápida entre Vendas, Bonificações e Equipamentos (comodato) dentro de um período.
- **Impacto:** Médio

### Índice 6: idx_bd_cl_text_search
- **Colunas:** "N Fantasia", "Nome"
- **Tipo:** GIN (com pg_trgm)
- **Tamanho:** *A ser medido após criação*
- **Uso esperado:** Acelera drasticamente buscas textuais (`ILIKE`) nos campos de nome do cliente, muito comuns nos filtros da aplicação.
- **Impacto:** Alto

---

## Tabela: private.mv_sales_summary (Tentativa de Criação)

**Nota:** A criação de índices no schema `private` não é permitida pelo meu escopo de acesso atual. As definições abaixo são as recomendadas.

### Índice: idx_mv_sales_summary_date
- **Colunas:** sale_date DESC
- **Uso esperado:** Filtros de data na Materialized View.

### Índice: idx_mv_sales_summary_client
- **Colunas:** client_code
- **Uso esperado:** Buscas por cliente na Materialized View.

### Índice: idx_mv_sales_summary_supervisor
- **Colunas:** supervisor_name
- **Uso esperado:** Filtros por supervisor na Materialized View.

---

## Resumo e Próximas Fases

- **Total de índices criados em `public.bd-cl`:** 6
- **Tamanho total:** *A ser verificado com os comandos `pg_stat_user_indexes` após o uso.*
- **Impacto esperado:** Redução de >80% no tempo de execução das queries lentas, eliminando a maioria dos `Seq Scan` na tabela `bd-cl`.

### Recomendações para Próximas Fases

1.  **Monitoramento (P0 - Imediato):** Após a aplicação dos índices, monitorar `pg_stat_statements` e os `EXPLAIN` das funções críticas novamente para confirmar que os novos índices estão sendo utilizados (`Index Scan` ou `Bitmap Heap Scan`) e que os `Seq Scan` foram eliminados.
2.  **Agendamento do REFRESH (P1 - Curto Prazo):** Implementar o agendamento da função `process_refresh_sales_summary()` para ser executada durante a madrugada via `pg_cron`. Isso moverá a carga pesada de atualização das Materialized Views para fora do horário de pico.
3.  **Particionamento de `bd-cl` (P2 - Médio Prazo):** Iniciar o planejamento para particionar a tabela `bd-cl` pela coluna `"DT Emissao"` (ex: mensalmente). Isso garantirá a performance sustentável a longo prazo, à medida que o volume de dados cresce, e facilitará a manutenção de dados antigos.