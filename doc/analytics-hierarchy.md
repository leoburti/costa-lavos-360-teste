# Estrutura de Páginas e Subpáginas - Analytics

## 1. Visão Geral

O módulo de Analytics na plataforma Costa Lavos 360° foi reestruturado para oferecer uma experiência de navegação e desenvolvimento mais organizada e consistente. A hierarquia de páginas é definida de forma programática, permitindo fácil expansão e manutenção.

A estrutura é composta por **Grupos** principais que contêm **Páginas** diretamente ou **Subgrupos** aninhados, que por sua vez contêm suas próprias **Páginas**. Isso permite uma categorização lógica e um fluxo de navegação intuitivo.

## 2. Estrutura Visual

A navegação do módulo Analytics é dividida em três grupos principais:

a) **Dashboard (Grupo)** - Contém 4 páginas de visão geral e analítica:
   - Dashboard Gerencial
   - Visão 360° Cliente
   - Analítico Supervisor
   - Analítico Vendedor
   - Analítico Região
   - Analítico Grupos
   - Analítico Produtos
   - Vendas Diárias

b) **Análises (Grupo)** - Contém 8 páginas de análises aprofundadas:
   - Análise Churn
   - Análise RFM
   - Análise ABC Produtos
   - Análise ABC Clientes
   - Análise Sazonalidade
   - Análise Margem & Lucro
   - Análise Ticket Médio
   - Análise Preditiva

c) **Relatórios (Grupo)** - Contém 3 subgrupos, cada um com suas páginas de relatório:
   - **Relatório Financeiro (Subgrupo)**:
     - Receita
     - Margem
     - Lucratividade
   - **Relatório Desempenho (Subgrupo)**:
     - Metas
     - Ranking
   - **Relatório Operacional (Subgrupo)**:
     - SLA

## 3. Tabela de Rotas

Abaixo, a lista completa das páginas do módulo Analytics com suas rotas antigas (aliases para compatibilidade), rotas novas e as respectivas RPCs (Remote Procedure Calls) utilizadas para buscar dados.

| Página                      | Rota Antiga                 | Rota Nova                          | RPC                                     | Status |
| :-------------------------- | :-------------------------- | :--------------------------------- | :-------------------------------------- | :----- |
| Dashboard Gerencial         | `/gerencial`                | `/analytics/dashboard-gerencial`   | `get_dashboard_and_daily_sales_kpis`    | ✅     |
| Visão 360° Cliente          | `/visao-360-cliente`        | `/analytics/visao-360-cliente`     | `get_client_360_data`                   | ✅     |
| Analítico Supervisor        | `/analitico-supervisor`     | `/analytics/analitico-supervisor`  | `get_supervisor_analytical_data_v2`     | ✅     |
| Analítico Vendedor          | `/analitico-vendedor`       | `/analytics/analitico-vendedor`    | `get_seller_analysis_data`              | ✅     |
| Analítico Região            | `/analitico-regiao`         | `/analytics/analitico-regiao`      | `get_region_analysis_data`              | ✅     |
| Analítico Grupos            | `/analitico-grupo-clientes` | `/analytics/analitico-grupo-clientes` | `get_group_analysis_data`               | ✅     |
| Analítico Produtos          | `/analitico-produto`        | `/analytics/analitico-produto`     | `get_product_analysis_data`             | ✅     |
| Vendas Diárias              | `/analitico-vendas-diarias` | `/analytics/analitico-vendas-diarias` | `get_daily_sales_data_v2`               | ✅     |
| Análise Churn               | `/analise-churn`            | `/analytics/analise-churn`         | `get_churn_analysis_data_v3_optimized`  | ✅     |
| Análise RFM                 | `/calculo-rfm`              | `/analytics/analise-rfm`           | `get_rfm_analysis_v2`                   | ✅     |
| Análise ABC Produtos        | `/analise-abc-produtos`     | `/analytics/analise-abc-produtos`  | `get_abc_curve_data`                    | ✅     |
| Análise ABC Clientes        | `/analise-abc-clientes`     | `/analytics/analise-abc-clientes`  | `get_abc_analysis`                      | ✅     |
| Análise Sazonalidade        | `/analise-sazonalidade`     | `/analytics/analise-sazonalidade`  | `get_seasonality_analysis`              | ✅     |
| Análise Margem & Lucro      | `/analise-margem-lucro`     | `/analytics/analise-margem-lucro`  | `get_margin_analysis`                   | ✅     |
| Análise Ticket Médio        | `/analise-ticket-medio`     | `/analytics/analise-ticket-medio`  | `get_unit_value_analysis_data`          | ✅     |
| Análise Preditiva           | `/analise-preditiva`        | `/analytics/analise-preditiva`     | `get_sales_forecast_data`               | ✅     |
| Relatório Financeiro: Receita | `/relatorio-financeiro-receita` | `/analytics/relatorio-financeiro-receita` | `get_relatorio_financeiro_receita`        | ✅     |
| Relatório Financeiro: Margem | `/relatorio-financeiro-margem` | `/analytics/relatorio-financeiro-margem` | `get_relatorio_financeiro_margem`         | ✅     |
| Relatório Financeiro: Lucratividade | `/relatorio-financeiro-lucratividade` | `/analytics/relatorio-financeiro-lucratividade` | `get_relatorio_financeiro_lucratividade`  | ✅     |
| Relatório Desempenho: Metas | `/relatorio-desempenho-meta` | `/analytics/relatorio-desempenho-meta` | `get_relatorio_desempenho_meta`           | ✅     |
| Relatório Desempenho: Ranking | `/relatorio-desempenho-ranking` | `/analytics/relatorio-desempenho-ranking` | `get_relatorio_desempenho_ranking`        | ✅     |
| Relatório Operacional: SLA  | `/relatorio-operacional-sla` | `/analytics/relatorio-operacional-sla` | `get_relatorio_operacional_sla`           | ✅     |

## 4. Guia de Navegação

O menu lateral (`SidebarMenu.jsx`) é dinamicamente gerado com base no arquivo `src/config/analyticsMenuStructure.js` e em `src/config/menuStructure.json`.

a) **Menu Lateral:** O menu lateral exibe os grupos principais ("Dashboard", "Análises", "Relatórios") como itens colapsáveis.
b) **Expansão de Grupos:** Clicar em um grupo (ou subgrupo) o expande, revelando as páginas contidas.
c) **Navegação para Páginas:** Clicar em uma página no menu navega o usuário para a rota `/analytics/nome-da-pagina`, onde `nome-da-pagina` é o `path` definido em `analyticsMenuStructure.js`.
d) **Destaque da Página Ativa:** A página atualmente visualizada é destacada no menu lateral, facilitando a orientação do usuário.
e) **Breadcrumb:** Cada página dentro do módulo Analytics utiliza um `AnalyticsTemplate` que gera automaticamente um breadcrumb, mostrando a hierarquia de navegação (ex: `Analytics > Dashboard > Dashboard Gerencial`).

## 5. Guia de Desenvolvimento

### a) Para Adicionar uma Nova Página no Módulo Analytics:
1.  **Adicionar Entrada em `src/config/analyticsMenuStructure.js`:**
    -   Determine se a página pertence a um grupo existente (Dashboard, Análises, Relatórios) ou a um novo subgrupo.
    -   Adicione um novo objeto `item` com `id`, `label`, `path`, `icon`, `component`, `rpc` (o nome da função Supabase RPC que buscará os dados) e `mockData` (dados de fallback, se aplicável).
    -   Exemplo: