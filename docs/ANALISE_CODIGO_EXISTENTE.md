# Análise do Código Existente - Costa Lavos 360

Relatório gerado automaticamente em 2025-12-01.

## 1. Estrutura de Páginas (`src/pages`)

Listagem de todos os arquivos de página identificados no diretório `src/pages`.

### Raiz
- `AIChat.jsx`
- `AccessControl.jsx`
- `AnaliseChurn.jsx`
- `AnaliseClientes.jsx`
- `AnaliseDesempenhoFidelidade.jsx`
- `AnaliseFidelidade.jsx`
- `AnaliseMargem.jsx`
- `AnalisePreditivaVendas.jsx`
- `AnaliseProdutos.jsx`
- `AnaliseSazonalidade.jsx`
- `AnaliseValorUnitario.jsx`
- `AnaliticoBonificados.jsx`
- `AnaliticoEquipamento.jsx`
- `AnaliticoEquipamentosCliente.jsx`
- `AnaliticoVendasDiarias.jsx`
- `AnalyticsCustomerGroup.jsx`
- `AnalyticsProduct.jsx`
- `AnalyticsRegion.jsx`
- `AnalyticsSeller.jsx`
- `AnalyticsSupervisor.jsx`
- `BackupRecovery.jsx`
- `BaixoDesempenho.jsx`
- `BonificacoesNovo.jsx`
- `CRM.jsx`
- `CalculoRFM.jsx`
- `Client360.jsx`
- `CurvaABC.jsx`
- `Dashboard.jsx`
- `DashboardAnalytico.jsx`
- `DashboardComercial.jsx`
- `DashboardPage.jsx`
- `DetalhamentoEquipamentos.jsx`
- `Documentation.jsx`
- `EquipamentosEmCampo.jsx`
- `ErrorTracking.jsx`
- `ExploradoreVendas.jsx`
- `Manutencao.jsx`
- `MovimentacaoEquipamentos.jsx`
- `NotFoundPage.jsx`
- `PerformanceBonificados.jsx`
- `PerformanceMonitor.jsx`
- `ProdutosBonificados.jsx`
- `RaioXSupervisor.jsx`
- `RaioXVendedor.jsx`
- `RelatoriAgendamento.jsx`
- `RelatoriHistorico.jsx`
- `RelatoriNotificacoes.jsx`
- `RelatorioBuscador.jsx`
- `RelatorioDashboard.jsx`
- `SecurityAudit.jsx`
- `Settings.jsx`
- `SystemHealth.jsx`
- `SystemLogs.jsx`
- `Tarefas.jsx`
- `TendenciaVendas.jsx`
- `TestingDashboard.jsx`
- `UnauthorizedPage.jsx`

### Subdiretórios
- **admin/configuracoes**: `ProfileManagementPage.jsx`, `SystemSettingsPage.jsx`, `UserManagementPage.jsx`
- **analytics**: `AnaliticoSupervisorPage.jsx`
- **apoio**: Vários layouts e páginas (`ApoioLayout.jsx`, etc.)
  - **agenda**: `AgendaPage.jsx`, `EventosPage.jsx`, etc.
  - **chamados**: `ChamadosPage.jsx`, `ChamadoForm.jsx`, etc.
  - **comodato**: `ClientesComodatoPage.jsx`, `EstoqueClientePage.jsx`, etc.
  - **geolocalizacao**: `GeolocalizacaoPage.jsx`, `RotasPage.jsx`, etc.
  - **notificacoes**: `NotificacoesPage.jsx`, etc.
  - **personas**: `PersonasPage.jsx`, etc.
  - **relatorios**: `RelatoriosPage.jsx`, etc.
- **auth**: `LoginPage.jsx`, `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, etc.
- **bonificacoes**: `BonificacoesList.jsx`, `BonificacoesDetalhes.jsx`, `BonificacoesPageV2.jsx`, etc.
- **configuracoes**: `PerfilUsuarioPage.jsx`, `LogsPage.jsx`, etc.
- **crm**: `CrmDashboard.jsx`, `CrmClientes.jsx`, `Pipeline.jsx`, etc.
- **debug**: `AnaliseProfundaPage.jsx`, `RPCTestPage.jsx`, etc.
- **delivery**: `DeliveryDashboard.jsx`
- **delivery-management**: `Dashboard.jsx`, `Deliveries.jsx`, etc.
- **equipment**: `EquipamentosList.jsx`, `EquipamentosDetalhes.jsx`, etc.
- **gestao-equipe**: `UsuariosAcessoPage.jsx`
- **maintenance**: `MaintenancePage.jsx`
- **relatorios**:
  - **cliente**: `RelatoriClienteCarteira.jsx`, `RelatoriClienteChurn.jsx`, etc.
  - **desempenho**: `RelatoriDesempenhoVendedor.jsx`, `RelatoriDesempenhoSupervisor.jsx`, etc.
  - **financeiro**: `RelatoriFinanceiroReceita.jsx`, etc.
  - **operacional**: `RelatoriOperacionalEstoque.jsx`, etc.
  - **vendas**: `RelatoriVendasDiario.jsx`, `RelatoriVendasPorVendedor.jsx`, etc.

## 2. Componentes Principais (`src/components`)

Listagem dos principais componentes reutilizáveis.

- **Core**: `AuthGuard`, `FilterPanel`, `LoadingSpinner`, `MaintenanceBanner`, `MetricCard`, `SalesChart`, `RankingTable`.
- **Analytics**: `PerformanceRanking`, `AnalyticsContainer`, `Client360/*` (Vários componentes da visão 360).
- **UI (shadcn/ui)**: `Button`, `Card`, `Input`, `Select`, `Tabs`, `Table`, `Dialog`, `Toast`, `ScrollArea`.
- **Bonificações**: `BonificationTrendChart`, `RequestTable`, `NewRequestView`.
- **CRM**: `ContactForm`, `CrmKanban`, `CrmPipelineChart`.
- **Dashboard**: `SellerDashboard`, `SupervisorDashboard`, `PerformanceRanking`.
- **Equipment**: `EquipamentosTable`, `EquipamentosForm`.

## 3. Hooks Customizados (`src/hooks`)

Hooks identificados para lógica de negócios e acesso a dados.

- **Analytics**: `useAnalyticalData`, `useDashboardData`, `useRelatorios`, `useDashboardPersonalizado`.
- **Auth**: `useUserAccess`, `usePasswordReset`, `usePermissions`.
- **Data Fetching**: `useEdgeFunctionQuery`, `useDataScope`, `useFilters`.
- **Domínios Específicos**:
  - `useBonificationPerformance`, `useRequestActions` (Bonificações)
  - `useClient360`, `useClient360Data` (Cliente)
  - `useCrm` (CRM)
  - `useChamados` (Apoio)
  - `useEquipamentosComodato`, `useMaintenance` (Equipamentos)
- **Utils**: `useDebounce`, `useLocalStorage`, `useOnClickOutside`.

## 4. Rotas Configuradas (`src/App.jsx`)

Mapeamento das rotas principais identificadas no roteador.

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/login` | `LoginPage` | Autenticação |
| `/dashboard` | `DashboardPage` | Dashboard Principal |
| `/cliente/:clientId` | `Client360` | Visão 360 do Cliente (Nova) |
| `/visao-360-cliente/:clientId` | `Visao360ClientePage` | Visão 360 (Legado/Alternativo) |
| `/analitico-supervisor` | `AnalyticsSupervisor` | Análise de Supervisores |
| `/analitico-vendedor` | `AnalyticsSeller` | Análise de Vendedores |
| `/analitico-regiao` | `AnalyticsRegion` | Análise Regional |
| `/analitico-grupo-clientes` | `AnalyticsCustomerGroup` | Análise de Grupos |
| `/analitico-produto` | `AnalyticsProduct` | Análise de Produtos |
| `/equipamentos-lista` | `EquipamentosList` | Listagem de Equipamentos |
| `/bonificacoes-lista` | `BonificacoesList` | Listagem de Bonificações |
| `/crm-clientes` | `CrmClientes` | Gestão de Clientes CRM |
| `/relatorio-vendas-*` | Vários | Relatórios de Vendas |
| `/relatorio-desempenho-*` | Vários | Relatórios de Desempenho |
| `/relatorio-financeiro-*` | Vários | Relatórios Financeiros |
| `/relatorio-operacional-*` | Vários | Relatórios Operacionais |

## 5. Chamadas RPC Identificadas

Funções do banco de dados (Supabase RPC) chamadas pelo frontend.

### Analytics & Dashboard
- `get_dashboard_and_daily_sales_kpis`: Usado em `DashboardPage.jsx` e `DataContext.jsx` para KPIs principais.
- `get_dashboard_aggregated_data`: Usado em `DashboardAnalytico.jsx` para tabelas agregadas.
- `get_performance_ranking`: Usado em `PerformanceRanking.jsx` para rankings dinâmicos.
- `get_regional_summary_v2`: Usado extensivamente em `AnaliticoRegiao`, `AnaliticoGrupoClientes`, `AnaliticoVendedor` (via `get_seller_summary_v2`), `AnaliticoSupervisor` (via `get_supervisor_summary_v2`).
- `get_product_basket_analysis_v2`: Usado em `AnaliticoProduto.jsx`.

### Client 360
- `get_client_360_data_v2`: Usado em `Visao360ClientePage.jsx` para dados detalhados.
- `get_client_analytics`: Usado em `Visao360ClientePage.jsx` para métricas rápidas.
- `get_clientes_visao_360_faturamento`: Usado em `ClientList.jsx` para busca de clientes.
- `get_grupos_visao_360_faturamento`: Usado em `ClientList.jsx` para busca de grupos.
- `get_group_360_analysis`: Usado em `ClientGroupDashboard.jsx`.
- `get_clients_by_group_name`: Usado em `Visao360Cliente.jsx`.

### Outros (Inferidos pelos arquivos de Hooks)
- `get_chamados_*`: Provável uso em `useChamados.js`.
- `get_bonificacoes_*`: Provável uso em `useBonificationPerformance.js`.
- `get_crm_*`: Provável uso em `useCrm.js`.

## Observações Gerais
- O projeto está migrando de uma estrutura monolítica de dados para chamadas RPC específicas e otimizadas.
- A estrutura de diretórios está bem organizada por domínio (`apoio`, `crm`, `bonificacoes`).
- Existem múltiplas versões de componentes de Dashboard e Client360, indicando uma refatoração em andamento ou testes A/B.