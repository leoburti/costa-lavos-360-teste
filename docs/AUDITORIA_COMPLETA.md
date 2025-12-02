# Relatório de Auditoria Completa do Codebase

**Data:** 01/12/2025
**Status:** Concluído
**Escopo:** Frontend (`src/`), Rotas e Componentes

---

## 1. Arquivos em `src/pages` e Status

Abaixo listamos os principais arquivos encontrados no diretório de páginas. Identificamos potenciais duplicidades marcadas como **[DUPLICADO?]**.

| Arquivo | Status / Observação |
|---|---|
| `src/pages/AIChat.jsx` | Ativo (Rota `/ai-chat`) |
| `src/pages/AccessControl.jsx` | Ativo (Rota `/access-control`) |
| `src/pages/AnaliseChurn.jsx` | Ativo (Rota `/analise-churn`) |
| `src/pages/AnaliseClientes.jsx` | Ativo (Rota `/analise-clientes`) |
| `src/pages/AnaliseFidelidade.jsx` | Ativo (Rota `/analise-desempenho-fidelidade`) |
| `src/pages/AnaliseMargem.jsx` | Ativo (Rota `/analise-margem`) |
| `src/pages/AnalisePreditivaVendas.jsx` | Ativo (Rota `/analise-preditiva-vendas`) |
| `src/pages/AnaliseProdutos.jsx` | Ativo (Rota `/analise-produtos`) |
| `src/pages/AnaliseSazonalidade.jsx` | Ativo (Rota `/analise-sazonalidade`) |
| `src/pages/AnaliseValorUnitario.jsx` | Ativo (Rota `/analise-valor-unitario`) |
| `src/pages/AnaliticoBonificados.jsx` | Ativo (Rota `/analitico-bonificados`) |
| `src/pages/AnaliticoEquipamento.jsx` | Ativo (Rota `/analitico-equipamento`) |
| `src/pages/AnaliticoEquipamentosCliente.jsx` | Ativo (Rota `/analitico-equipamentos-cliente`) |
| `src/pages/AnaliticoGrupoClientes.jsx` | **[DUPLICADO?]** Possível conflito com `AnalyticsCustomerGroup.jsx` |
| `src/pages/AnaliticoProduto.jsx` | **[DUPLICADO?]** Possível conflito com `AnalyticsProduct.jsx` |
| `src/pages/AnaliticoRegiao.jsx` | **[DUPLICADO?]** Possível conflito com `AnalyticsRegion.jsx` |
| `src/pages/AnaliticoSupervisor.jsx` | **[DUPLICADO?]** Possível conflito com `AnalyticsSupervisor.jsx` |
| `src/pages/AnaliticoVendasDiarias.jsx` | Ativo (Rota `/analitico-vendas-diarias`) |
| `src/pages/AnaliticoVendedor.jsx` | **[DUPLICADO?]** Possível conflito com `AnalyticsSeller.jsx` |
| `src/pages/AnalyticsCustomerGroup.jsx` | Ativo no App.jsx (`/analitico-grupo-clientes`) |
| `src/pages/AnalyticsProduct.jsx` | Ativo no App.jsx (`/analitico-produto`) |
| `src/pages/AnalyticsRegion.jsx` | Ativo no App.jsx (`/analitico-regiao`) |
| `src/pages/AnalyticsSeller.jsx` | Ativo no App.jsx (`/analitico-vendedor`) |
| `src/pages/AnalyticsSupervisor.jsx` | Ativo no App.jsx (`/analitico-supervisor`) |
| `src/pages/BackupRecovery.jsx` | Ativo |
| `src/pages/BaixoDesempenho.jsx` | Utilizado dentro de `AnaliseDesempenhoFidelidade` |
| `src/pages/BonificacoesNovo.jsx` | Ativo |
| `src/pages/CalculoRFM.jsx` | Legacy? |
| `src/pages/Client360.jsx` | **Ativo** (Componente Principal da Visão 360) |
| `src/pages/CurvaABC.jsx` | Ativo (Rota `/curva-abc`) |
| `src/pages/Dashboard.jsx` | **Ativo** (Rota Principal `/dashboard`) |
| `src/pages/DashboardAnalytico.jsx` | **[DUPLICADO]** Variante de dashboard |
| `src/pages/DashboardComercial.jsx` | **[DUPLICADO]** Variante de dashboard |
| `src/pages/DashboardPage.jsx` | **[DUPLICADO]** Arquivo órfão na raiz de pages? |
| `src/pages/ExploradoreVendas.jsx` | Ativo |
| `src/pages/Login.jsx` | Legacy (Auth usa `auth/LoginPage`) |
| `src/pages/Visao360Cliente.jsx` | Ativo (Rota de Busca `/visao-360-cliente`) |
| `src/pages/dashboard/DashboardPage.jsx` | **[DUPLICADO]** Outra versão de dashboard |
| `src/pages/dashboard/Visao360ClientePage.jsx`| **Wrapper** (Usado para rota `/visao-360-cliente/:id`) |

**Análise Crítica:** Existe uma duplicidade clara entre arquivos com prefixo `Analitico...` (Português) e `Analytics...` (Inglês). O `App.jsx` atual prioriza os arquivos `Analytics...` para as rotas principais, mas existem rotas legadas ou arquivos não utilizados com o prefixo em português.

---

## 2. Rotas Definidas em `src/App.jsx`

| Caminho (Path) | Componente Importado |
|---|---|
| `/` | `LayoutOverride` (com AuthGuard) |
| `/login` | `auth/LoginPage` |
| `/forgot-password` | `auth/ForgotPasswordPage` |
| `/reset-password` | `auth/ResetPasswordPage` |
| `/unauthorized` | `UnauthorizedPage` |
| `/dashboard` | `Dashboard` |
| `/cliente/:clientId` | `Client360` (Rota Direta) |
| `/visao-360-cliente/:clientId` | `dashboard/Visao360ClientePage` (Wrapper) |
| `/visao-360-cliente` | `Visao360Cliente` (Busca) |
| `/analitico-supervisor` | `AnalyticsSupervisor` |
| `/analitico-vendedor` | `AnalyticsSeller` |
| `/analitico-regiao` | `AnalyticsRegion` |
| `/analitico-grupo-clientes` | `AnalyticsCustomerGroup` |
| `/analitico-produto` | `AnalyticsProduct` |
| `/analitico-vendas-diarias` | `AnaliticoVendasDiarias` |
| `/analise-preditiva-vendas` | `AnalisePreditivaVendas` |
| `/curva-abc` | `CurvaABC` |
| `/analise-valor-unitario` | `AnaliseValorUnitario` |
| `/analise-desempenho-fidelidade` | `AnaliseDesempenhoFidelidade` |
| **Rotas CRM** | (`/crm-clientes`, `/crm-contatos`, etc.) |
| **Rotas Relatórios** | (`/relatorio-vendas-diario`, `/relatorio-financeiro`, etc.) |
| **Rotas Equipamentos** | (`/equipamentos-lista`, `/equipamentos-detalhes`, etc.) |

---

## 3. Ocorrências de "Treemap"

O gráfico Treemap é amplamente utilizado para visualização hierárquica.

**Componentes:**
*   `src/components/TreeMapChart.jsx` (Componente Reutilizável Base)

**Páginas/Arquivos que utilizam Treemap:**
1.  `src/pages/AnaliticoRegiao.jsx` (Usa implementação local com Recharts)
2.  `src/pages/AnaliticoGrupoClientes.jsx` (Usa implementação local com Recharts)
3.  `src/pages/AnaliticoVendedor.jsx` (Usa implementação local com Recharts)
4.  `src/pages/AnalyticsRegion.jsx` (Provável uso via ChartCard ou TreeMapChart)
5.  `src/pages/AnalyticsCustomerGroup.jsx`
6.  `src/pages/AnalyticsSeller.jsx` (Usa Treemap para vendedores)
7.  `src/pages/analytics/AnaliticoSupervisorPage.jsx` (Arquivo duplicado/refatorado)

**Hooks/Serviços:**
*   `src/services/analyticsRpcService.js` (Funções como `getTreemapData`)
*   `supabase/functions/get-treemap-data/index.ts` (Edge Function correspondente)

---

## 4. Ocorrências de "Explorador" ou "Explorer"

Funcionalidades de *Drill-down* e exploração profunda de dados.

**Componentes:**
1.  `src/components/DrilldownExplorer.jsx` (Componente Core de Exploração)
2.  `src/components/SalesExplorer.jsx` (Wrapper para DrilldownExplorer)
3.  `src/components/BonificationDrilldownExplorer.jsx` (Específico para bonificações)
4.  `src/components/bonificacoes/BonificationPerformanceExplorer.jsx`
5.  `src/components/bonificacoes/BonificationDistributionExplorer.jsx`
6.  `src/components/bonificacoes/BonifiedProductsExplorer.jsx`
7.  `src/components/CustomerGroupDrilldownExplorer.jsx`
8.  `src/components/DailySales/DailySalesTabsExplorer.jsx`

**Páginas:**
*   `src/pages/ExploradoreVendas.jsx` (Página dedicada)

---

## 5. Mix de Produto ("Product Mix")

Análise de quais produtos são vendidos juntos ou distribuição de vendas.

**Código Relacionado:**
1.  **RPC:** `get_product_mix_analysis` (Existe no banco de dados e mapeado em services)
2.  **Página:** `src/pages/AnaliseProdutos.jsx` (Principal consumidor desta lógica)
3.  **Componente:** `src/components/Client360/Client360Dashboard.jsx` (Possui aba de vendas que lista produtos, relacionado ao mix do cliente)

---

## 6. Componentes em `src/components` com prefixo Analítico/Análise

Abaixo listamos componentes na pasta `src/components` (e subpastas) que parecem ser páginas ou grandes blocos analíticos mal posicionados ou de nomenclatura similar.

1.  `src/components/Client360/Client360AnalysisTab.jsx` (Aba de Análise do Cliente)
2.  `src/components/Client360/Group360AnalysisTab.jsx` (Aba de Análise de Grupo)
3.  `src/components/Client360/EquipmentROIAnalysisTab.jsx` (Análise de ROI)
4.  `src/components/bonificacoes/AnaliseBonificacaoPage.jsx` (**Alerta:** Parece ser uma página dentro da pasta de componentes)
5.  `src/components/GroupSalesAnalysis.jsx` (Componente de análise de vendas de grupo)

---

## 7. Verificação de Duplicatas e Arquivos Comentados

### Duplicidades Críticas (Páginas)
Detectamos múltiplas versões para as mesmas funcionalidades analíticas. Isso causa confusão sobre qual arquivo editar.

1.  **Supervisores:**
    *   `src/pages/AnaliticoSupervisor.jsx` (Português)
    *   `src/pages/AnalyticsSupervisor.jsx` (Inglês - **Ativo no App.jsx**)
    *   `src/pages/analytics/AnaliticoSupervisorPage.jsx` (Pasta aninhada)

2.  **Dashboards:**
    *   `src/pages/Dashboard.jsx` (**Ativo**)
    *   `src/pages/DashboardPage.jsx`
    *   `src/pages/dashboard/DashboardPage.jsx`
    *   `src/pages/DashboardAnalytico.jsx`
    *   `src/pages/DashboardComercial.jsx`

3.  **Visão 360:**
    *   `src/pages/Client360.jsx` (Componente real)
    *   `src/pages/Visao360Cliente.jsx` (Busca)
    *   `src/pages/dashboard/Visao360ClientePage.jsx` (Wrapper simples)

### Recomendação de Limpeza
Recomenda-se consolidar a lógica nos arquivos nomeados em Inglês (padrão `Analytics...`) que já estão sendo usados no `App.jsx` e mover o código útil dos arquivos em português, eventualmente removendo-os ou marcando-os como `_deprecated`.