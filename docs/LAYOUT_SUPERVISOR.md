# Documentação: Layout Analítico Supervisor

**Data:** 01/12/2025
**Status:** Restaurado e Otimizado

Este documento descreve a estrutura, componentes e fluxo de dados da página "Analítico Supervisor" (`src/pages/AnalyticsSupervisor.jsx`), que foi restaurada para utilizar o padrão de Drill-down Explorer.

## 1. Visão Geral
A página fornece uma análise hierárquica de vendas começando pelos Supervisores. O objetivo é permitir que gestores identifiquem rapidamente as equipes com melhor e pior desempenho e "perfuram" (drill-down) nos dados para entender a causa raiz (vendedor, cliente, produto).

## 2. Estrutura do Componente

### Componente Principal: `AnalyticsSupervisor`
*   **Localização:** `src/pages/AnalyticsSupervisor.jsx`
*   **Responsabilidade:**
    *   Gerenciar o layout da página.
    *   Integrar com o `FilterContext` para obter filtros globais (Data, Supervisor, Região).
    *   Instanciar o `DrilldownExplorer` com o modo `supervisor`.

### Componente Core: `DrilldownExplorer`
*   **Localização:** `src/components/DrilldownExplorer.jsx`
*   **Funcionalidade:**
    *   Gerencia o estado de navegação (`drillPath`).
    *   Alterna entre visualizações (Gráfico de Barras, Treemap, Tabela).
    *   Chama a RPC `get_drilldown_data` dinamicamente baseada no nível atual.

## 3. Fluxo de Navegação (Drill-down)

A navegação segue a seguinte hierarquia quando `analysisMode="supervisor"`:

1.  **Nível 1:** Supervisores (Lista todos os supervisores e suas vendas totais).
2.  **Nível 2:** Vendedores (Ao clicar em um supervisor, mostra seus vendedores).
3.  **Nível 3:** Clientes (Ao clicar em um vendedor, mostra seus clientes).
4.  **Nível 4:** Produtos (Ao clicar em um cliente, mostra o mix de produtos comprados).

## 4. Integração de Dados (RPC)

*   **Função RPC:** `get_drilldown_data` (Função polimórfica/genérica no Supabase).
*   **Parâmetros Chave:**
    *   `p_analysis_mode`: 'supervisor'
    *   `p_drilldown_level`: 1, 2, 3 ou 4
    *   `p_parent_keys`: Array acumulativo de chaves selecionadas (ex: `['Nome Supervisor', 'Nome Vendedor']`).
    *   `p_start_date`, `p_end_date`: Filtros de data globais.

## 5. Melhorias Implementadas
*   **Visualização Dupla:** O usuário pode alternar instantaneamente entre Gráfico (para tendências) e Tabela (para precisão).
*   **Treemap:** Adicionada opção de visualização Treemap para comparar proporções de vendas visualmente.
*   **Breadcrumbs:** Navegação facilitada para voltar níveis superiores.
*   **Modo Expandido:** Botão para expandir a análise para tela cheia.

## 6. Próximos Passos Recomendados
*   Implementar exportação de dados da tabela (CSV/Excel).
*   Adicionar metas comparativas nos gráficos.