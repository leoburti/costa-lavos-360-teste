# Relatório de Auditoria do Banco de Dados
**Data:** 01/12/2025
**Status:** Em Análise

Este documento detalha a auditoria realizada nas funções RPC do Supabase para identificar duplicidades e riscos de tipos de dados (INTERVAL vs INTEGER).

---

## 1. Funções RPC Listadas (Escopo Público)

Análise baseada no esquema atual do banco de dados.

### Funções Críticas de Análise
| Função | Status | Observação |
| :--- | :--- | :--- |
| `get_daily_sales_data_v2` | **OK** | Corrigida na etapa anterior (Unificada). |
| `get_sales_forecast_data` | **OK** | Corrigida (Erro de operador `interval + numeric`). |
| `get_loyalty_performance_data` | **OK** | Corrigida (Erro de operador `interval <= integer`). |
| `get_churn_analysis_data` | **RISCO** | Possui múltiplas assinaturas (Overload). |
| `get_product_analysis_data` | **OK** | Utilizada no novo layout de Produtos. |
| `get_product_basket_data` | **OK** | Nova função para análise de cestas. |

---

## 2. Problemas Identificados

### 2.1. Funções Sobrecarregadas (Overloaded Functions)
O Supabase pode ter dificuldade em distinguir qual função chamar quando existem múltiplos nomes iguais com argumentos diferentes.

**Detectadas:**
1.  **`get_churn_analysis_data`** (3 versões detectadas)
    *   Assinatura A: Sem paginação.
    *   Assinatura B: Com `p_limit` e `p_offset`.
    *   Assinatura C: `_v3` (Variante explícita).
    *   **Recomendação:** Unificar em uma única função com parâmetros `DEFAULT NULL`.

2.  **`get_active_entities_for_360`** (2 versões)
    *   Assinatura A: Filtros básicos.
    *   Assinatura B: Filtros expandidos (+ `p_products`).
    *   **Recomendação:** Manter a versão mais completa e adicionar defaults nos novos parâmetros.

3.  **`get_bonification_performance`** (2 versões)
    *   Assinatura A: Padrão.
    *   Assinatura B: Com `p_group_by`.
    *   **Recomendação:** Unificar.

4.  **`get_detailed_equipment_analysis`** (2 versões)
    *   Diferença nos tipos de data (`text` vs `date`).
    *   **Recomendação:** Padronizar para `text` (ISO format) e fazer cast interno `safe_parse_date`.

### 2.2. Riscos de Aritmética de Intervalo (Interval Arithmetic)
Funções que subtraem datas (`timestamp - timestamp` ou `date - timestamp`) resultam em `INTERVAL`. Se o código tentar comparar isso diretamente com um número (ex: `<= 30`), ocorrerá erro.

**Pontos de Atenção:**
*   **`get_new_client_trends`**: Utiliza `max_sale_date_from_db - interval '29 days'`.
    *   *Risco:* Baixo (Atribuição implícita para variável DATE funciona no Postgres), mas recomenda-se cast explícito `::date`.
*   **`get_churn_analysis_data` (Versão legada)**:
    *   Cálculo: `(max_sale_date_from_db - last_purchase_date)`.
    *   Se `last_purchase_date` vier de um `MAX(timestamp)`, o resultado é intervalo.
    *   *Ação:* Certificar que `last_purchase_date` tem cast `::date`.

---

## 3. Plano de Ação Recomendado

1.  **Executar Ferramenta de Diagnóstico:**
    Rodar a nova RPC `get_database_health_report()` no console SQL do Supabase para obter um JSON atualizado dos problemas.

2.  **Unificação de Assinaturas:**
    Criar scripts de migração para `DROP` nas versões antigas e `CREATE OR REPLACE` nas versões unificadas com parâmetros opcionais.

3.  **Hardening de Datas:**
    Revisar todas as RPCs que aceitam datas e garantir o uso de `public.safe_parse_date()` no início da função.

---

## 4. Ferramentas Disponíveis

Foi criada uma nova função no banco de dados para auxiliar na monitoria contínua: