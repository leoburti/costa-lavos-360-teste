# Documentação: Layout Analítico de Produtos

**Data:** 01/12/2025
**Status:** Restaurado e Padronizado

Este documento descreve a estrutura e funcionamento da página "Analítico de Produtos" (`src/pages/AnalyticsProduct.jsx`), que foi refatorada para utilizar o padrão de **Drill-down Explorer** combinado com uma análise de matriz de produto exclusiva.

## 1. Visão Geral
A página oferece duas perspectivas complementares sobre o portfólio de produtos:
1.  **Exploração Hierárquica (Top-Down):** Permite partir do produto macro e descer até quem comprou e quem vendeu.
2.  **Matriz de Análise (Mix):** Classifica os produtos baseando-se em **Força** (participação na receita) e **Confiabilidade** (frequência de pedidos/penetração).

## 2. Componentes

### `AnalyticsProduct` (Container Principal)
*   **Localização:** `src/pages/AnalyticsProduct.jsx`
*   **Responsabilidade:** Orquestrar o layout, filtros e instanciar os dois componentes principais.

### `DrilldownExplorer` (Gráfico Superior)
*   **Modo:** `product`
*   **Hierarquia:** Produto -> Cliente -> Vendedor
*   **Visualização:** Treemap (padrão) ou Gráfico de Barras. Mostra o volume de vendas.

### `ProductMixAnalysis` (Tabela Inferior)
*   **Localização:** `src/components/ProductMixAnalysis.jsx`
*   **Dados:** Utiliza a RPC dedicada `get_product_mix_analysis`.
*   **Colunas:**
    *   **Produto:** Nome do item.
    *   **Vendas Totais:** Valor monetário no período.
    *   **Força (%):** Porcentagem da receita total da empresa gerada por este produto.
    *   **Confiabilidade (%):** Porcentagem dos pedidos totais que contêm este produto.
    *   **Classificação:** "Estrela", "Gerador de Caixa", "Alto Giro" ou "Produto Padrão".

## 3. Integração de Dados (RPCs)

### `get_drilldown_data` (Modo Product)
*   Adicionado suporte ao modo `product` na função genérica.
*   Permite clicar em um produto e ver a lista de clientes que o compraram.

### `get_product_mix_analysis`
*   Função especializada que calcula os totais globais do período para derivar as porcentagens de Força e Confiabilidade corretamente.
*   **Cálculo de Força:** `(Receita do Produto / Receita Total da Empresa) * 100`
*   **Cálculo de Confiabilidade:** `(Frequência em Pedidos / Total de Pedidos da Empresa) * 100`

## 4. Benefícios
*   **Identificação de Pareto:** Facilita ver quais produtos sustentam o faturamento (Força).
*   **Análise de Penetração:** Identifica produtos que, embora baratos, estão presentes em muitos pedidos (Confiabilidade/Iscas).
*   **Rastreabilidade:** Permite encontrar rapidamente "quem parou de comprar o produto X" através do drill-down.