# Documentação: Layout Analítico Regional

**Data:** 01/12/2025
**Status:** Restaurado e Padronizado

Este documento descreve a reestruturação da página "Analítico por Região" (`src/pages/AnalyticsRegion.jsx`), que foi alinhada com o novo padrão de **Drill-down Explorer**.

## 1. Visão Geral
A página permite aos gestores analisar o desempenho de vendas segmentado geograficamente. Ela oferece uma visão top-down iniciando pelas grandes regiões e permitindo o aprofundamento até o nível de produto em um cliente específico.

## 2. Estrutura do Componente

### Componente Principal: `AnalyticsRegion`
*   **Localização:** `src/pages/AnalyticsRegion.jsx`
*   **Rota:** `/analitico-regiao`
*   **Responsabilidade:**
    *   Container principal da página.
    *   Integração com `FilterContext` para filtros globais.
    *   Instanciação do `DrilldownExplorer` com modo `region`.

### Fluxo de Dados (Unificado)
*   **Componente Core:** `src/components/DrilldownExplorer.jsx`
*   **RPC Utilizada:** `get_drilldown_data` (Polimórfica)
*   **Modo de Análise:** `p_analysis_mode = 'region'`

## 3. Hierarquia de Drill-down

A navegação configurada para este módulo segue a seguinte profundidade (5 Níveis):

1.  **Nível 1 - Regiões:** Lista todas as regiões geográficas ativas.
2.  **Nível 2 - Supervisores:** Ao clicar em uma região, exibe os supervisores que atuam nela.
3.  **Nível 3 - Vendedores:** Ao clicar em um supervisor, exibe os vendedores daquela equipe naquela região específica.
4.  **Nível 4 - Clientes:** Ao clicar em um vendedor, lista sua carteira de clientes na região.
5.  **Nível 5 - Produtos:** Ao clicar em um cliente, exibe o mix de produtos vendidos.

## 4. Visualizações Disponíveis
O componente `DrilldownExplorer` oferece automaticamente:
*   **Gráfico de Barras:** Para comparação rápida de valores absolutos.
*   **Treemap:** Para visualizar a proporção e representatividade de cada item em relação ao todo.
*   **Tabela Detalhada:** Para análise precisa dos números, participação percentual e quantidades.

## 5. Benefícios da Refatoração
*   **Padronização:** Mesma UX utilizada nas análises de Supervisor e Vendedor.
*   **Profundidade:** Permite chegar à causa raiz de problemas regionais (ex: um produto específico que parou de vender em uma cidade).
*   **Performance:** Queries otimizadas no banco de dados (Supabase RPC) com agregação server-side.