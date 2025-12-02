# Documentação: Layout Analítico de Grupos

**Data:** 01/12/2025
**Status:** Restaurado e Padronizado

Este documento descreve a reestruturação da página "Analítico de Grupos" (`src/pages/AnalyticsCustomerGroup.jsx`), alinhada com o novo padrão de **Drill-down Explorer**.

## 1. Visão Geral
A página permite a análise de vendas agrupada por "Redes" ou "Grupos Econômicos" de clientes. Isso é crucial para entender o desempenho de grandes contas que possuem múltiplas filiais ou CNPJs sob o mesmo contrato.

## 2. Estrutura do Componente

### Componente Principal: `AnalyticsCustomerGroup`
*   **Localização:** `src/pages/AnalyticsCustomerGroup.jsx`
*   **Rota:** `/analitico-grupo-clientes`
*   **Responsabilidade:**
    *   Container principal.
    *   Integração com `FilterContext`.
    *   Instanciação do `DrilldownExplorer` com modo `customerGroup`.

### Fluxo de Dados
*   **Componente Core:** `src/components/DrilldownExplorer.jsx`
*   **RPC Utilizada:** `get_drilldown_data` (Polimórfica)
*   **Modo de Análise:** `p_analysis_mode = 'customerGroup'`

## 3. Hierarquia de Drill-down

A navegação configurada para este módulo segue a seguinte profundidade (3 Níveis):

1.  **Nível 1 - Grupos (Redes):** Lista todos os grupos de clientes ativos (campo "Nome Grp Cliente" no banco).
2.  **Nível 2 - Clientes (Lojas):** Ao clicar em um grupo, exibe as lojas/CNPJs individuais que compõem aquele grupo.
3.  **Nível 3 - Produtos:** Ao clicar em uma loja, exibe o mix de produtos comprados.

## 4. Visualizações
*   **Treemap:** Ideal para ver a proporção de vendas entre as grandes redes.
*   **Gráfico de Barras:** Para comparar valores absolutos.
*   **Tabela:** Para detalhamento numérico e exportação.

## 5. Benefícios
*   **Visão Consolidada:** Permite ver o valor real de um contrato de rede, somando todas as filiais.
*   **Padronização:** Mantém a mesma UX das outras páginas analíticas.