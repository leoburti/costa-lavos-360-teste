# Relatório de Auditoria Forense do Código Fonte

**Data da Auditoria:** 01/12/2025
**Escopo:** Análise de arquivos, rotas, componentes e funcionalidades de visualização de dados (Treemap, Mix de Produtos, Explorador).

---

## 1. Inventário de Páginas (`src/pages`)

Abaixo estão listados todos os arquivos identificados na pasta `src/pages` e subpastas relevantes, indicando possíveis duplicações ou refatorações.

### Raiz (`src/pages/`)
*   `AccessControl.jsx`
*   `AIChat.jsx`
*   `AnaliseChurn.jsx`
*   `AnaliseClientes.jsx` (Criado recentemente)
*   `AnaliseDesempenhoFidelidade.jsx` (Criado recentemente)
*   `AnaliseFidelidade.jsx`
*   `AnaliseMargem.jsx` (Criado recentemente)
*   `AnalisePreditivaVendas.jsx` (Criado recentemente)
*   `AnaliseProdutos.jsx`
*   `AnaliseSazonalidade.jsx`
*   `AnaliseValorUnitario.jsx` (Criado recentemente)
*   `AnaliticoBonificados.jsx`
*   `AnaliticoEquipamento.jsx`
*   `AnaliticoEquipamentosCliente.jsx`
*   `AnaliticoGrupoClientes.jsx` (Refatorado)
*   `AnaliticoProduto.jsx` (Refatorado)
*   `AnaliticoRegiao.jsx` (Refatorado)
*   `AnaliticoSupervisor.jsx` (Refatorado - Conflito potencial com `AnalyticsSupervisor.jsx`)
*   `AnaliticoVendasDiarias.jsx` (Refatorado)
*   `AnaliticoVendedor.jsx` (Refatorado - Conflito potencial com `AnalyticsSeller.jsx`)
*   `AnalyticsCustomerGroup.jsx` (Nova versão de `AnaliticoGrupoClientes`?)
*   `AnalyticsProduct.jsx` (Nova versão de `AnaliticoProduto`?)
*   `AnalyticsRegion.jsx` (Nova versão de `AnaliticoRegiao`?)
*   `AnalyticsSeller.jsx` (Nova versão de `AnaliticoVendedor`?)
*   `AnalyticsSupervisor.jsx` (Nova versão de `AnaliticoSupervisor`?)
*   `BackupRecovery.jsx`
*   `BaixoDesempenho.jsx`
*   `BonificacoesNovo.jsx`
*   `CalculoRFM.jsx`
*   `Client360.jsx` (Nova versão de Visão 360?)
*   `CRM.jsx`
*   `CurvaABC.jsx` (Refatorado)
*   `Dashboard.jsx` (Refatorado)
*   `DashboardAnalytico.jsx` (Duplicado em `src/pages/dashboard/`)
*   `DashboardComercial.jsx` (Refatorado)
*   `DashboardPage.jsx` (Container de abas)
*   `DetalhamentoEquipamentos.jsx`
*   `Documentation.jsx`
*   `EquipamentosEmCampo.jsx`
*   `ErrorTracking.jsx`
*   `ExploradoreVendas.jsx` (Possível "Explorador de Vendas")
*   `Manutencao.jsx`
*   `MovimentacaoEquipamentos.jsx`
*   `NotFoundPage.jsx`
*   `PerformanceBonificados.jsx`
*   `PerformanceMonitor.jsx`
*   `ProdutosBonificados.jsx`
*   `RaioXSupervisor.jsx`
*   `RaioXVendedor.jsx`
*   `RelatoriAgendamento.jsx`
*   `RelatoriHistorico.jsx`
*   `RelatoriNotificacoes.jsx`
*   `RelatorioBuscador.jsx`
*   `RelatorioDashboard.jsx`
*   `SecurityAudit.jsx`
*   `Settings.jsx`
*   `SystemHealth.jsx`
*   `SystemLogs.jsx`
*   `Tarefas.jsx`
*   `TendenciaVendas.jsx`
*   `TestingDashboard.jsx`
*   `UnauthorizedPage.jsx`
*   `Visao360Cliente.jsx` (Conflito com `src/pages/dashboard/Visao360ClientePage.jsx`)

### Subpastas Relevantes
*   `src/pages/analytics/AnaliticoSupervisorPage.jsx` (Terceira versão de Analítico Supervisor?)
*   `src/pages/dashboard/DashboardAnalytico.jsx`
*   `src/pages/dashboard/DashboardPage.jsx` (Versão anterior ou refatorada)
*   `src/pages/dashboard/SellerDashboard.jsx` (Componente ou página?)
*   `src/pages/dashboard/SupervisorDashboard.jsx` (Componente ou página?)
*   `src/pages/dashboard/Visao360ClientePage.jsx` (Versão usada no router atualmente para `/visao-360-cliente/:clientId`)

**Observação:** Há uma clara fragmentação de versões (ex: `AnaliticoSupervisor.jsx` na raiz, `AnalyticsSupervisor.jsx` na raiz e `AnaliticoSupervisorPage.jsx` em analytics/).

---

## 2. Rotas Configuradas (`src/App.jsx`)

Rotas ativas identificadas na configuração do roteador:

| Caminho URL | Componente Carregado | Observação |
|---|---|---|
| `/` | `LayoutOverride` -> `Navigate to /dashboard` | Redirecionamento raiz |
| `/login` | `LoginPage` | Auth |
| `/dashboard` | `DashboardPage` | Principal |
| `/cliente/:clientId` | `Client360` | Nova rota Client 360 |
| `/analitico-supervisor` | `AnalyticsSupervisor` | Rota analítica |
| `/analitico-vendedor` | `AnalyticsSeller` | Rota analítica |
| `/analitico-regiao` | `AnalyticsRegion` | Rota analítica |
| `/analitico-grupo-clientes` | `AnalyticsCustomerGroup` | Rota analítica |
| `/analitico-produto` | `AnalyticsProduct` | Rota analítica |
| `/visao-360-cliente/:clientId` | `Visao360ClientePage` | Rota legada ou alternativa |
| `/equipamentos-*` | Vários (`EquipamentosList`, etc.) | Módulo Equipamentos |
| `/bonificacoes-*` | Vários (`BonificacoesList`, etc.) | Módulo Bonificações |
| `/crm-*` | Vários (`CrmClientes`, etc.) | Módulo CRM |
| `/relatorio-*` | Vários (Vendas, Financeiro, Cliente, Operacional) | Módulo Relatórios (Vasto) |
| `/analise-valor-unitario` | *Não explicitamente no App.jsx listado, mas presente no arquivo de rotas* | |
| `/analise-margem` | *Não explicitamente no App.jsx listado, mas presente no arquivo de rotas* | |

---

## 3. Busca por "Treemap"

A funcionalidade de Treemap foi encontrada nos seguintes locais:

1.  **Componentes UI:**
    *   `src/components/TreeMapChart.jsx`: Componente genérico de gráfico Treemap usando Recharts.

2.  **Páginas que utilizam Treemap:**
    *   `src/pages/AnaliticoRegiao.jsx`: Usa `Treemap` para visualizar vendas por região.
    *   `src/pages/AnaliticoVendedor.jsx`: Usa `Treemap` para visualizar vendas por vendedor (hierarquia Supervisor > Vendedor).
    *   `src/pages/AnaliticoGrupoClientes.jsx`: Usa `Treemap` para visualizar vendas por grupo.

3.  **Funções de Backend (RPC):**
    *   `get_treemap_data`: Função genérica no banco de dados.
    *   `get_regional_sales_treemap`: Wrapper para regiões.
    *   `get_supervisor_sales_treemap`: Wrapper para supervisores.
    *   `get_sales_explorer_treemap`: Provável suporte para o "Explorador de Vendas".

---

## 4. Busca por "Mix de Produto"

Termos relacionados ("Mix de Produto", "Product Mix", "AnaliseProdutos") foram encontrados:

1.  **Páginas:**
    *   `src/pages/AnaliseProdutos.jsx`: Provável página principal para esta análise.
    *   `src/pages/AnaliticoProduto.jsx`: Foca em ranking e desempenho, mas compõe o mix.

2.  **Funções de Backend (RPC):**
    *   `get_product_mix_analysis`: Função RPC dedicada para calcular o mix de produtos, com suporte a drill-down.

---

## 5. Busca por "Explorador de Vendas"

A funcionalidade "Explorador de Vendas" (Sales Explorer) parece estar distribuída:

1.  **Componentes:**
    *   `src/components/SalesExplorer.jsx`: Componente wrapper.
    *   `src/components/DrilldownExplorer.jsx`: Componente core que provavelmente implementa a lógica de exploração (drill-down).
    *   `src/components/CustomerGroupDrilldownExplorer.jsx`: Variação específica para grupos.
    *   `src/components/BonificationDrilldownExplorer.jsx`: Variação para bonificações.

2.  **Páginas:**
    *   `src/pages/ExploradoreVendas.jsx`: Página dedicada a esta funcionalidade.

3.  **Funções de Backend (RPC):**
    *   `get_sales_explorer_treemap`: Suporte de dados para visualização hierárquica no explorador.

---

## 6. Componentes "Analítico" ou "Análise" (`src/components`)

Não foram encontrados componentes na raiz de `src/components` que comecem estritamente com os prefixos em português "Analítico" ou "Análise". A maioria segue a convenção de nomenclatura em inglês ou funcional (ex: `SalesChart`, `MetricCard`).

Exceções/Aproximações encontradas:
*   `src/components/AnalyticalProfilePage.jsx`
*   `src/components/AnalyticsContainer.jsx`
*   `src/components/GroupSalesAnalysis.jsx` (Contém "Analysis")
*   `src/components/Client360/Client360AnalysisTab.jsx` (Contém "Analysis")
*   `src/components/Client360/Group360AnalysisTab.jsx` (Contém "Analysis")
*   `src/components/Client360/EquipmentROIAnalysisTab.jsx` (Contém "Analysis")

---

## 7. Análise de Histórico/Arquivos Deletados

**Limitação:** Como um sistema stateless, não tenho acesso direto ao histórico `.git` ou a backups de arquivos deletados anteriormente. A análise baseia-se inteiramente nos arquivos presentes no sistema de arquivos atual (`<codebase>`).

**Indícios de Refatoração/Legado:**
*   A coexistência de `AnaliticoSupervisor.jsx`, `AnalyticsSupervisor.jsx` e `pages/analytics/AnaliticoSupervisorPage.jsx` sugere um processo de migração incompleto ou múltiplas tentativas de implementação.
*   A presença de `DashboardPage.jsx` (novo container de abas) ao lado de `Dashboard.jsx` (possivelmente o conteúdo antigo ou específico de uma aba) indica uma reestruturação da home.
*   `Visao360Cliente.jsx` vs `Visao360ClientePage.jsx`: A versão "Page" geralmente denota um wrapper de rota, enquanto a outra pode ser o componente de visualização ou uma versão anterior.

**Recomendação:** Consolidar as versões duplicadas (especialmente as analíticas) e remover os arquivos não utilizados após verificar que todas as funcionalidades foram migradas para as novas versões (`Analytics*`).