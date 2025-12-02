# Documentação: Layout Analítico Vendedor

**Data:** 01/12/2025
**Status:** Restaurado e Padronizado

Este documento descreve a reestruturação da página "Analítico Vendedor" (`src/pages/AnalyticsSeller.jsx`), que foi alinhada com o novo padrão de **Drill-down Explorer**.

## 1. Visão Geral
A página oferece uma análise detalhada do desempenho dos vendedores, permitindo aos gestores e supervisores visualizar desde o macro (ranking de vendedores) até o micro (mix de produtos vendidos em um cliente específico).

## 2. Estrutura do Componente

### Componente Principal: `AnalyticsSeller`
*   **Localização:** `src/pages/AnalyticsSeller.jsx`
*   **Rota:** `/analitico-vendedor`
*   **Responsabilidade:**
    *   Atua como container principal.
    *   Conecta-se ao `FilterContext` para receber filtros globais (Data, Região, etc.).
    *   Implementa o `DrilldownExplorer` configurado para o modo `seller`.

### Fluxo de Dados (Unificado)
Ao invés de componentes isolados com lógica duplicada, a página agora utiliza o componente central de exploração.

*   **Componente Core:** `src/components/DrilldownExplorer.jsx`
*   **RPC Utilizada:** `get_drilldown_data` (Polimórfica)
*   **Modo de Análise:** `p_analysis_mode = 'seller'`

## 3. Hierarquia de Drill-down

A navegação configurada para este módulo segue a seguinte profundidade:

1.  **Nível 1 - Vendedores:** Lista todos os vendedores filtrados, ordenados por valor total de venda líquida. Exibe também bonificações e volume.
2.  **Nível 2 - Carteira de Clientes:** Ao clicar em um vendedor, exibe a lista de seus clientes positivados no período.
3.  **Nível 3 - Mix de Produtos:** Ao clicar em um cliente, exibe quais produtos foram comprados, permitindo análise de mix e penetração.

## 4. Benefícios da Refatoração
*   **Consistência:** O comportamento visual e funcional é idêntico ao do Analítico Supervisor.
*   **Manutenibilidade:** Toda a lógica de busca e navegação reside em um único componente (`DrilldownExplorer`) e uma única função de banco de dados (`get_drilldown_data`).
*   **Performance:** A query SQL foi otimizada para agregar dados no banco e limitar o retorno a 500 registros por nível, prevenindo travamentos no frontend.

## 5. Arquivos Relacionados
*   `src/pages/AnalyticsSeller.jsx` (Página Refatorada)
*   `src/components/DrilldownExplorer.jsx` (Componente Reutilizável)
*   `supabase_functions.sql` (Função `get_drilldown_data` atualizada)