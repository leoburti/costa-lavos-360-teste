# Guia de Migração de Dados e Estrutura - Costa Lavos 360

Este guia detalha o processo técnico para migrar da estrutura legada (tabela única `bd-cl`) para uma arquitetura moderna, normalizada e segura no Supabase, habilitando as funcionalidades avançadas de Analytics.

## Visão Geral
O objetivo é sair de uma tabela "flat" desnormalizada para um modelo Star Schema (Fato/Dimensão) que otimiza queries de analytics e simplifica o RLS.

---

## Passo 1: Exportação e Snapshot (Legado)
1.  **Backup:** Realizar dump completo da tabela `bd-cl` atual.
2.  **Análise:** Verificar consistência dos dados (duplicatas em nomes de clientes, variações de grafia em supervisores).

## Passo 2: Transformação (ETL)
Criar as seguintes tabelas normalizadas a partir de `bd-cl`:

### 2.1. Dimensões (Cadastros)
-   `dim_produtos`:
    -   Extrair `Descricao` (distinct). Gerar UUID.
-   `dim_clientes`:
    -   Extrair `Cliente` (código), `Nome`, `N Fantasia`, `Endereco`, `CNPJ` (se houver).
    -   Normalizar nomes e remover duplicatas.
-   `dim_vendedores`:
    -   Extrair `Nome Vendedor`.
-   `dim_supervisores`:
    -   Extrair `Nome Supervisor`.

### 2.2. Fato (Transações)
-   `fact_vendas`:
    -   Colunas: `id` (UUID), `data_emissao`, `cliente_id` (FK), `produto_id` (FK), `vendedor_id` (FK), `supervisor_id` (FK), `valor_total`, `quantidade`, `cfo`, `numero_pedido`.

## Passo 3: Importação no Supabase
1.  Criar as novas tabelas no Supabase.
2.  Executar scripts SQL de carga (INSERT INTO ... SELECT ... FROM `bd-cl`).
3.  Criar índices em colunas de filtro: `data_emissao`, `vendedor_id`, `supervisor_id`.

## Passo 4: Criação de Funções RPC
As funções RPC devem ser reescritas para consultar as novas tabelas normalizadas (`fact_vendas` join `dim_...`) em vez de `bd-cl`.
*Nota: As RPCs atuais (ex: `get_dashboard_and_daily_sales_kpis`) já estão funcionais sobre `bd-cl`, mas devem ser migradas gradualmente para o novo schema para melhor performance.*

## Passo 5: Validação e Testes
1.  **Comparação de Totais:** Verificar se `SUM(total)` na `bd-cl` é igual a `SUM(valor_total)` na `fact_vendas`.
2.  **Performance:** Executar `EXPLAIN ANALYZE` nas novas queries.
3.  **RLS:** Tentar acessar dados com um usuário "Vendedor" e verificar se ele vê apenas suas vendas.

## Passo 6: Implementação de RLS (Segurança)
Aplicar as políticas definidas em `doc/RLS-POLICY.md` nas novas tabelas: