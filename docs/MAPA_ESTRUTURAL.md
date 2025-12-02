# Mapa Estrutural e Auditoria de Layouts Analíticos

**Data:** 01/12/2025
**Status:** Mapeamento Concluído
**Objetivo:** Identificar discrepâncias entre as rotas analíticas atuais e os layouts originais (Treemap/Explorer) esperados.

## 1. Tabela de Estrutura Analítica

A tabela abaixo mapeia as principais páginas de análise comercial/técnica, verificando se o arquivo correto está vinculado e se o layout corresponde ao padrão de "Explorador de Dados" (Drilldown).

| Página (Conceito) | Rota Definida (`App.jsx`) | Arquivo Atual | Layout Atual | Layout Esperado | Status |
|---|---|---|---|---|---|
| **Analítico Supervisor** | `/analitico-supervisor` | `src/pages/AnalyticsSupervisor.jsx` | BarChart Simples | **Treemap + DrilldownExplorer** | ⚠️ Precisa Refatorar |
| **Analítico Vendedor** | `/analitico-vendedor` | `src/pages/AnalyticsSeller.jsx` | Treemap (Local/Isolado) | **Treemap + DrilldownExplorer** | ⚠️ Precisa Refatorar |
| **Analítico Região** | `/analitico-regiao` | `src/pages/AnalyticsRegion.jsx` | Treemap (Local/Isolado) | **Treemap + DrilldownExplorer** | ⚠️ Precisa Refatorar |
| **Analítico Grupos** | `/analitico-grupo-clientes` | `src/pages/AnalyticsCustomerGroup.jsx` | Treemap (Local/Isolado) | **Treemap + DrilldownExplorer** | ⚠️ Precisa Refatorar |
| **Analítico Produtos** | `/analitico-produto` | `src/pages/AnalyticsProduct.jsx` | BarChart (Top 20) | **Product Mix + Explorer** | ⚠️ Precisa Refatorar |
| **Analítico Vendas Diárias** | `/analitico-vendas-diarias` | `src/pages/AnaliticoVendasDiarias.jsx` | Dash Completo | **Tabs + Timeline + KPI** | ✅ OK (Completo) |

## 2. Auditoria de Componentes Críticos

Verificação da existência dos componentes "Core" necessários para restaurar os layouts originais.

| Componente | Arquivo | Status | Observação |
|---|---|---|---|
| **TreemapChart** | `src/components/TreeMapChart.jsx` | ✅ Presente | Componente genérico reutilizável. Deve ser usado ao invés de implementações locais. |
| **DrilldownExplorer** | `src/components/DrilldownExplorer.jsx` | ✅ Presente | **CRÍTICO:** Este é o "motor" dos layouts originais. Ele já contém a lógica de navegação (Região -> Supervisor -> Vendedor -> Cliente). |
| **SalesExplorer** | `src/components/SalesExplorer.jsx` | ✅ Presente | Wrapper antigo para o Drilldown. Pode ser usado ou substituído pelo uso direto do DrilldownExplorer. |
| **ProductMix** | *Inexistente* | ❌ Faltante | Não há um componente dedicado "ProductMix". A lógica está dispersa ou em queries SQL. |

## 3. Análise Detalhada e Ação Necessária

### A. Analítico Supervisor, Vendedor, Região e Grupos
**Problema:** As páginas atuais (`AnaliticoSupervisor.jsx`, etc.) foram simplificadas para usar gráficos de barras ou implementações manuais de Treemap usando `recharts` diretamente na página. Isso removeu a funcionalidade de "Drill-down" (clicar no supervisor para ver os vendedores, clicar no vendedor para ver clientes).

**Solução (O que precisa ser RECRIADO):**
As páginas precisam ser limpas e substituídas por uma implementação que utilize o componente `DrilldownExplorer`.
*   **Ação:** Editar `src/pages/AnalyticsSupervisor.jsx` (e pares).
*   **Código a Inserir:** Utilizar `<DrilldownExplorer analysisMode="supervisor" />` (e os respectivos modos: `region`, `seller`, `customerGroup`).
*   **Benefício:** Restaura a navegação em profundidade automaticamente, pois o `DrilldownExplorer` já possui a lógica de buscar dados via RPC (`get_drilldown_data`) recursivamente.

### B. Analítico de Produto (Mix de Produtos)
**Problema:** A página atual exibe apenas um "Top 20" estático. Falta a análise de correlação (quais produtos saem juntos) e a matriz de participação.

**Solução (O que precisa ser RECRIADO):**
*   **Ação:** Criar componente `src/components/ProductMixAnalysis.jsx` ou refatorar a página `AnalyticsProduct`.
*   **Lógica:** Utilizar a RPC `get_product_mix_analysis` (já existente no banco) para montar uma visualização de quais produtos compõem a maior parte da receita e permitir filtrar por categorias.

## 4. Resumo do Plano de Execução

1.  **Padronizar Páginas Analíticas:** Substituir o conteúdo das 4 páginas principais (`Supervisor`, `Seller`, `Region`, `CustomerGroup`) para usarem o componente mestre `DrilldownExplorer`. Isso eliminará código duplicado e restaurará a navegação.
2.  **Melhorar Filtros:** Garantir que o `FilterContext` esteja passando as datas corretamente para o `DrilldownExplorer`.
3.  **Implementar Mix de Produto:** Criar uma visualização específica para produtos que vá além do ranking simples.

---
**Conclusão:** O sistema possui os "blocos de construção" (`DrilldownExplorer`, `TreeMapChart`), mas as páginas não estão montando esses blocos corretamente. A correção é de **integração**, não de reescrita total de lógica.