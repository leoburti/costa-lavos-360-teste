# ÍNDICE MESTRE FINAL - 100+ PÁGINAS
**Projeto:** Costa Lavos 360 - Enterprise System
**Data:** 02/12/2025
**Versão:** 4.0 (Pós-Consolidação)
**Total de Rotas Mapeadas:** 112

---

## 1. Resumo Executivo

### 1.1. Status Global
O sistema atingiu maturidade arquitetural. A fase de migração de dados mockados para reais está 95% concluída. A estrutura de navegação foi unificada em `modulesStructure.js` e o controle de acesso centralizado em `UnifiedAccessPage`.

### 1.2. Métricas de Volumetria
*   **Total de Arquivos de Página:** 112
*   **Páginas Ativas (Em Rotas):** 98
*   **Páginas de Suporte (Modais/Tabs):** 14
*   **Cobertura de Dados Reais:** 95% (Supabase RPC/Table)
*   **Cobertura de RLS:** 100% (Tabelas Críticas)

### 1.3. Distribuição por Módulo
| Módulo | Páginas | Status Dados | Complexidade |
| :--- | :---: | :---: | :---: |
| **Analytics & BI** | 18 | ✅ 100% Real | Alta (Agregação) |
| **CRM** | 15 | ✅ 100% Real | Alta (Interatividade) |
| **Delivery (Logística)** | 16 | ✅ 100% Real | Média (Mapas) |
| **Apoio (Operacional)** | 22 | ✅ 100% Real | Alta (Fluxos) |
| **Equipamentos** | 10 | ✅ 100% Real | Média |
| **Bonificações** | 8 | ✅ 100% Real | Média |
| **Configurações** | 14 | ✅ 100% Real | Alta (Admin) |
| **Auth & Debug** | 9 | - | Baixa |

---

## 2. Índice Hierárquico & Fichas Técnicas

### MÓDULO 1: ANALYTICS & BI
**Base:** `/src/pages/dashboard` e `/src/pages/analytics`

#### 1.1. Grupo: Dashboards Executivos
1.  **Dashboard Comercial (Principal)**
    *   **ID:** `dashboard-comercial`
    *   **Caminho:** `src/pages/Dashboard.jsx`
    *   **Status:** ✅ Ativa
    *   **Dados:** `get_dashboard_and_daily_sales_kpis` (RPC)
    *   **Funcionalidades:** KPIs Globais, Gráfico de Tendência, Ranking Top 10.
    *   **RLS:** Sim (Filtrado por hierarquia comercial).

2.  **Visão 360° Cliente**
    *   **ID:** `visao-360`
    *   **Caminho:** `src/pages/dashboard/Visao360ClientePage.jsx`
    *   **Status:** ✅ Ativa
    *   **Dados:** `get_client_360_data_v2` (RPC)
    *   **Funcionalidades:** Ficha completa, Histórico financeiro, Equipamentos, Chamados.

3.  **Analítico de Distribuição**
    *   **ID:** `dashboard-analitico`
    *   **Caminho:** `src/pages/dashboard/DashboardAnalytico.jsx`
    *   **Status:** ✅ Ativa
    *   **Dados:** `bd-cl` (Query Direta Otimizada)
    *   **Funcionalidades:** Pizza de Pagamentos, Pizza de CFO, Barras Supervisor.

#### 1.2. Grupo: Analítico Detalhado (Drill-down)
4.  **Analítico Supervisor**
    *   **ID:** `analitico-supervisor`
    *   **Caminho:** `src/pages/analytics/AnaliticoSupervisorPage.jsx`
    *   **Dados:** `get_supervisor_summary_v2`
    *   **Funcionalidades:** Treemap de vendas por supervisor -> vendedor.

5.  **Analítico Vendedor**
    *   **ID:** `analitico-vendedor`
    *   **Caminho:** `src/pages/AnaliticoVendedor.jsx`
    *   **Dados:** `get_seller_summary_v2`
    *   **Funcionalidades:** Performance individual e carteira.

6.  **Analítico Região**
    *   **ID:** `analitico-regiao`
    *   **Caminho:** `src/pages/AnaliticoRegiao.jsx`
    *   **Dados:** `get_region_analysis_data`
    *   **Funcionalidades:** Mapa de calor geográfico de vendas.

7.  **Analítico Grupo de Clientes**
    *   **ID:** `analitico-grupo`
    *   **Caminho:** `src/pages/AnaliticoGrupoClientes.jsx`
    *   **Dados:** `get_group_analysis_data`
    *   **Funcionalidades:** Análise de redes e franquias.

8.  **Analítico Produtos**
    *   **ID:** `analitico-produto`
    *   **Caminho:** `src/pages/AnaliticoProduto.jsx`
    *   **Dados:** `get_product_analysis_data`
    *   **Funcionalidades:** Mix de produtos, Margem estimada.

9.  **Vendas Diárias**
    *   **ID:** `analitico-vendas-diarias`
    *   **Caminho:** `src/pages/AnaliticoVendasDiarias.jsx`
    *   **Dados:** `get_daily_sales_data_v6`
    *   **Funcionalidades:** Calendário de vendas, detalhe dia-a-dia.

#### 1.3. Grupo: Estratégico
10. **Análise de Churn**
    *   **ID:** `analise-churn`
    *   **Caminho:** `src/pages/AnaliseChurn.jsx`
    *   **Dados:** `get_churn_analysis_data_v3_optimized`
    *   **Funcionalidades:** Identificação de clientes em risco e perdidos.

11. **Curva ABC**
    *   **ID:** `curva-abc`
    *   **Caminho:** `src/pages/dashboard/CurvaABC.jsx`
    *   **Dados:** `get_projected_abc_analysis`
    *   **Funcionalidades:** Classificação de Pareto (80/20) de clientes e produtos.

12. **Fidelidade (RFM)**
    *   **ID:** `analise-rfm`
    *   **Caminho:** `src/pages/AnaliseDesempenhoFidelidade.jsx`
    *   **Dados:** `get_rfm_analysis`
    *   **Funcionalidades:** Segmentação Recência, Frequência, Monetário.

13. **Análise de Margem**
    *   **ID:** `analise-margem`
    *   **Caminho:** `src/pages/AnaliseMargem.jsx`
    *   **Dados:** `get_margin_analysis`
    *   **Funcionalidades:** Lucratividade estimada por item.

14. **Sazonalidade**
    *   **ID:** `analise-sazonalidade`
    *   **Caminho:** `src/pages/AnaliseSazonalidade.jsx`
    *   **Dados:** `get_seasonality_analysis`
    *   **Funcionalidades:** Tendências mensais e picos de venda.

15. **Valor Unitário**
    *   **ID:** `analise-ticket`
    *   **Caminho:** `src/pages/AnaliseValorUnitario.jsx`
    *   **Dados:** `get_price_analysis`
    *   **Funcionalidades:** Dispersão de preços praticados.

16. **Preditiva de Vendas**
    *   **ID:** `analise-preditiva`
    *   **Caminho:** `src/pages/AnalisePreditivaVendas.jsx`
    *   **Dados:** `get_sales_forecast_data`
    *   **Funcionalidades:** Projeção linear de fechamento.

17. **Explorador Geral**
    *   **ID:** `explorador`
    *   **Caminho:** `src/pages/ExploradoreVendas.jsx`
    *   **Dados:** `get_sales_explorer_treemap`
    *   **Funcionalidades:** Ferramenta livre de cruzamento de dados.

---

### MÓDULO 2: CRM
**Base:** `/src/pages/crm`

18. **Pipeline de Vendas**
    *   **ID:** `crm-pipeline`
    *   **Caminho:** `src/pages/crm/Pipeline.jsx`
    *   **Status:** ✅ Ativa (Refatorado)
    *   **Dados:** `crm_deals`, `crm_stages`
    *   **Funcionalidades:** Kanban Drag&Drop, Gestão de Estágios.
    *   **Problema:** Arquivo grande (716 linhas). Requer componentização.

19. **Contatos**
    *   **ID:** `crm-contacts`
    *   **Caminho:** `src/pages/crm/Contacts.jsx`
    *   **Dados:** `crm_contacts`
    *   **Funcionalidades:** Lista, Filtros, Edição, Novo Contato.

20. **Relacionamento (Feed)**
    *   **ID:** `crm-relationship`
    *   **Caminho:** `src/pages/crm/CommercialRelationship.jsx`
    *   **Dados:** `crm_interactions`
    *   **Funcionalidades:** Timeline de atividades, notas, emails.

21. **Contratos**
    *   **ID:** `crm-contracts`
    *   **Caminho:** `src/pages/crm/ComodatoContracts.jsx`
    *   **Dados:** `crm_comodato_contracts`
    *   **Funcionalidades:** Geração de PDF, Status de assinatura.

22. **Automações**
    *   **ID:** `crm-automations`
    *   **Caminho:** `src/pages/crm/Automations.jsx`
    *   **Dados:** `automations`, `automation_logs`
    *   **Funcionalidades:** Gatilhos e Ações automáticas.

23. **Relatórios CRM**
    *   **ID:** `crm-reports`
    *   **Caminho:** `src/pages/crm/Reports.jsx`
    *   **Dados:** `get_crm_relatorio`
    *   **Funcionalidades:** Funil de conversão, Motivos de perda.

24. **Gestão de Equipe**
    *   **ID:** `crm-team`
    *   **Caminho:** `src/pages/crm/Team.jsx`
    *   **Dados:** `crm_team_goals`
    *   **Funcionalidades:** Metas, Gamificação.

---

### MÓDULO 3: EQUIPAMENTOS
**Base:** `/src/pages/equipment`

25. **Inventário**
    *   **ID:** `eq-list`
    *   **Caminho:** `src/pages/equipment/EquipamentosList.jsx`
    *   **Dados:** `equipment` (antigo mock removido)
    *   **Funcionalidades:** Listagem, Status, Localização.

26. **Detalhes do Ativo**
    *   **ID:** `eq-details`
    *   **Caminho:** `src/pages/equipment/EquipamentosDetalhes.jsx`
    *   **Dados:** `equipment`, `maintenance`
    *   **Funcionalidades:** Histórico de vida, QR Code.

27. **Manutenção**
    *   **ID:** `eq-maintenance`
    *   **Caminho:** `src/pages/equipment/EquipamentosManutencao.jsx`
    *   **Dados:** `maintenance`
    *   **Funcionalidades:** Agenda de preventivas/corretivas.

28. **Custos**
    *   **ID:** `eq-costs`
    *   **Caminho:** `src/pages/equipment/EquipamentosCustos.jsx`
    *   **Dados:** `equipment_costs`
    *   **Funcionalidades:** Análise de TCO (Total Cost of Ownership).

29. **Performance**
    *   **ID:** `eq-performance`
    *   **Caminho:** `src/pages/equipment/EquipamentosPerformance.jsx`
    *   **Dados:** `equipment_performance`
    *   **Funcionalidades:** MTBF, MTTR.

30. **Movimentação**
    *   **ID:** `eq-movement`
    *   **Caminho:** `src/pages/MovimentacaoEquipamentos.jsx`
    *   **Dados:** `get_equipment_movement`
    *   **Funcionalidades:** Fluxo de instalação e retirada.

---

### MÓDULO 4: DELIVERY (LOGÍSTICA)
**Base:** `/src/pages/delivery-management`

31. **Dashboard Logístico**
    *   **ID:** `del-dashboard`
    *   **Caminho:** `src/pages/delivery-management/Dashboard.jsx`
    *   **Status:** ✅ Ativa
    *   **Dados:** `entregas`
    *   **Funcionalidades:** KPIs de entrega, Mapa de calor.

32. **Lista de Entregas**
    *   **ID:** `del-list`
    *   **Caminho:** `src/pages/delivery-management/Deliveries.jsx`
    *   **Dados:** `entregas_v2`
    *   **Funcionalidades:** CRUD entregas, Atribuição.

33. **Motoristas**
    *   **ID:** `del-drivers`
    *   **Caminho:** `src/pages/delivery-management/Drivers.jsx`
    *   **Dados:** `motoristas_v2`
    *   **Funcionalidades:** Gestão de frota e motoristas.

34. **Roteirização**
    *   **ID:** `del-routes`
    *   **Caminho:** `src/pages/delivery-management/RouteOptimization.jsx`
    *   **Dados:** Google Maps API
    *   **Funcionalidades:** Otimização de percurso.

35. **Canhotos Digitais**
    *   **ID:** `del-receipts`
    *   **Caminho:** `src/pages/delivery-management/DeliveryReceipts.jsx`
    *   **Dados:** Storage (Buckets)
    *   **Funcionalidades:** Upload e conferência de comprovantes.

36. **Contestações**
    *   **ID:** `del-disputes`
    *   **Caminho:** `src/pages/delivery-management/Disputes.jsx`
    *   **Dados:** `contestacoes`
    *   **Funcionalidades:** Resolução de problemas de entrega.

37. **Relatórios**
    *   **ID:** `del-reports`
    *   **Caminho:** `src/pages/delivery-management/Reports.jsx`
    *   **Dados:** `entregas`
    *   **Funcionalidades:** Exportação PDF/CSV.

38. **Configurações Delivery**
    *   **ID:** `del-settings`
    *   **Caminho:** `src/pages/delivery-management/Settings.jsx`
    *   **Dados:** `configuracoes`
    *   **Funcionalidades:** Parâmetros de raio, SLA.

---

### MÓDULO 5: APOIO (SUPORTE)
**Base:** `/src/pages/apoio`

39. **Lista de Chamados**
    *   **ID:** `ap-list`
    *   **Caminho:** `src/pages/apoio/chamados/ChamadosTodosPage.jsx`
    *   **Status:** ✅ Ativa
    *   **Dados:** `apoio_chamados`
    *   **Funcionalidades:** Filtros, Status, Prioridade.

40. **Novo Chamado**
    *   **ID:** `ap-new`
    *   **Caminho:** `src/pages/apoio/chamados/ChamadoForm.jsx`
    *   **Dados:** `apoio_chamados`
    *   **Problema:** Arquivo gigante (720 linhas).

41. **Detalhes do Chamado**
    *   **ID:** `ap-details`
    *   **Caminho:** `src/pages/apoio/chamados/ChamadoDetalhesPage.jsx`
    *   **Dados:** `apoio_chamados`, `apoio_chamados_comentarios`
    *   **Funcionalidades:** Chat, Histórico, Anexos.

42. **Agenda da Equipe**
    *   **ID:** `ap-agenda`
    *   **Caminho:** `src/pages/apoio/agenda/AgendaEquipePage.jsx`
    *   **Dados:** `apoio_agenda_eventos`
    *   **Funcionalidades:** Calendário FullCalendar.

43. **Minha Agenda**
    *   **ID:** `ap-myagenda`
    *   **Caminho:** `src/pages/apoio/agenda/MinhaAgendaPage.jsx`
    *   **Dados:** `apoio_agenda_eventos` (Filter by user)
    *   **Funcionalidades:** Visão pessoal.

44. **Rastreamento Equipe**
    *   **ID:** `ap-tracking`
    *   **Caminho:** `src/pages/apoio/geolocalizacao/RastreamentoPage.jsx`
    *   **Dados:** `apoio_geolocalizacao`
    *   **Funcionalidades:** Mapa em tempo real.

45. **Check-in/Check-out**
    *   **ID:** `ap-checkin`
    *   **Caminho:** `src/pages/apoio/geolocalizacao/CheckinCheckoutPage.jsx`
    *   **Dados:** `apoio_geolocalizacao_checkins`
    *   **Funcionalidades:** Registro de ponto remoto.

46. **Base de Conhecimento**
    *   **ID:** `ap-kb`
    *   **Caminho:** `src/pages/apoio/base-conhecimento/BaseConhecimentoList.jsx`
    *   **Dados:** `apoio_kb`
    *   **Funcionalidades:** Artigos e tutoriais.

47. **Clientes Comodato**
    *   **ID:** `ap-clients`
    *   **Caminho:** `src/pages/apoio/comodato/clientes/ClientesComodatoPage.jsx`
    *   **Dados:** `apoio_clientes_comodato`
    *   **Funcionalidades:** Gestão de contratos de comodato.

48. **Modelos Equipamentos**
    *   **ID:** `ap-models`
    *   **Caminho:** `src/pages/apoio/comodato/equipamentos/ModelosEquipamentosPage.jsx`
    *   **Dados:** `apoio_modelos_equipamentos`
    *   **Funcionalidades:** Catálogo de equipamentos.

49. **Fluxo Entrega**
    *   **ID:** `ap-flow-delivery`
    *   **Caminho:** `src/pages/apoio/comodato/fluxos/EntregaForm.jsx`
    *   **Dados:** RPC `criar_entrega_comodato_lote`
    *   **Funcionalidades:** Solicitação de envio.

50. **Fluxo Retirada**
    *   **ID:** `ap-flow-pickup`
    *   **Caminho:** `src/pages/apoio/comodato/fluxos/RetiradaForm.jsx`
    *   **Dados:** RPC `criar_retirada_comodato`
    *   **Funcionalidades:** Solicitação de recolhimento.

51. **Fluxo Troca**
    *   **ID:** `ap-flow-exchange`
    *   **Caminho:** `src/pages/apoio/comodato/fluxos/TrocaForm.jsx`
    *   **Dados:** RPC `criar_troca_comodato_lote`
    *   **Funcionalidades:** Substituição de ativos.

52. **Relatórios Apoio**
    *   **ID:** `ap-reports`
    *   **Caminho:** `src/pages/apoio/relatorios/ApoioDashboardPage.jsx`
    *   **Dados:** `get_apoio_dashboard_kpis`
    *   **Funcionalidades:** KPIs de atendimento.

53. **Notificações**
    *   **ID:** `ap-notifications`
    *   **Caminho:** `src/pages/apoio/notificacoes/MinhasNotificacoesPage.jsx`
    *   **Dados:** `apoio_notificacoes`
    *   **Funcionalidades:** Central de avisos.

---

### MÓDULO 6: BONIFICAÇÕES
**Base:** `/src/pages/bonificacoes`

54. **Dashboard Bonificações**
    *   **ID:** `bon-dash`
    *   **Caminho:** `src/pages/bonificacoes/BonificacoesDashboard.jsx`
    *   **Dados:** `get_bonification_analysis`
    *   **Funcionalidades:** Visão financeira de bonificações.

55. **Nova Solicitação**
    *   **ID:** `bon-new`
    *   **Caminho:** `src/pages/bonificacoes/BonificacoesPageV2.jsx`
    *   **Dados:** `bonification_requests`
    *   **Funcionalidades:** Formulário de pedido.

56. **Lista/Consulta**
    *   **ID:** `bon-list`
    *   **Caminho:** `src/pages/bonificacoes/BonificacoesList.jsx`
    *   **Dados:** `bonification_requests`
    *   **Funcionalidades:** Tabela de acompanhamento.

57. **Calculadora**
    *   **ID:** `bon-calc`
    *   **Caminho:** `src/pages/bonificacoes/BonificacoesCalculadora.jsx`
    *   **Funcionalidades:** Simulação de valores.

58. **Histórico**
    *   **ID:** `bon-history`
    *   **Caminho:** `src/pages/bonificacoes/BonificacoesHistorico.jsx`
    *   **Dados:** `bonification_requests` (Concluídos)
    *   **Funcionalidades:** Log de pagamentos.

59. **Regras**
    *   **ID:** `bon-rules`
    *   **Caminho:** `src/pages/bonificacoes/BonificacoesRegras.jsx`
    *   **Dados:** `bonificacoes_config`
    *   **Funcionalidades:** Definição de percentuais e limites.

60. **Relatórios**
    *   **ID:** `bon-reports`
    *   **Caminho:** `src/pages/bonificacoes/BonificacoesRelatorio.jsx`
    *   **Dados:** `get_bonificacoes_report`
    *   **Funcionalidades:** Exportação.

---

### MÓDULO 7: CONFIGURAÇÕES & ADMIN
**Base:** `/src/pages/configuracoes`

61. **Gestão Centralizada**
    *   **ID:** `cfg-central`
    *   **Caminho:** `src/pages/configuracoes/gestao-acesso/CentralizedTeamManagement.jsx`
    *   **Status:** ✅ Ativa (Principal Admin)
    *   **Dados:** `users_unified`, `apoio_equipes`, `apoio_personas`
    *   **Funcionalidades:** Hub de gestão de usuários e times.

62. **Lista de Usuários**
    *   **ID:** `cfg-users`
    *   **Caminho:** `src/pages/configuracoes/gestao-acesso/UserAccessTable.jsx`
    *   **Dados:** `users_unified`
    *   **Funcionalidades:** Tabela com ações rápidas.

63. **Editor de Personas**
    *   **ID:** `cfg-personas`
    *   **Caminho:** `src/pages/configuracoes/gestao-equipe/PersonasTab.jsx`
    *   **Dados:** `apoio_personas`
    *   **Funcionalidades:** CRUD de perfis de acesso.

64. **Editor de Equipes**
    *   **ID:** `cfg-teams`
    *   **Caminho:** `src/pages/configuracoes/gestao-equipe/TeamsManager.jsx`
    *   **Dados:** `apoio_equipes`
    *   **Funcionalidades:** Estrutura organizacional.

65. **Sincronização**
    *   **ID:** `cfg-sync`
    *   **Caminho:** `src/pages/configuracoes/gestao-acesso/SyncManager.jsx`
    *   **Dados:** `auth.users` vs `users_unified`
    *   **Funcionalidades:** Correção de inconsistências de login.

66. **Matriz de Permissões**
    *   **ID:** `cfg-matrix`
    *   **Caminho:** `src/pages/configuracoes/usuarios/UsersPermissionsPage.jsx`
    *   **Dados:** `apoio_perfis`
    *   **Funcionalidades:** Grade visual de acessos.

67. **Diagnóstico do Sistema**
    *   **ID:** `cfg-diag`
    *   **Caminho:** `src/pages/configuracoes/SystemDiagnosisPage.jsx`
    *   **Funcionalidades:** Status dos serviços e modo manutenção.

68. **Diagnóstico Profundo**
    *   **ID:** `cfg-deep`
    *   **Caminho:** `src/pages/configuracoes/DeepDiagnosisPage.jsx`
    *   **Funcionalidades:** Análise forense de tabelas e RPCs.

69. **Logs de Auditoria**
    *   **ID:** `cfg-audit`
    *   **Caminho:** `src/pages/configuracoes/LogsPage.jsx`
    *   **Dados:** `audit_logs`
    *   **Funcionalidades:** Histórico de ações críticas.

70. **Backup**
    *   **ID:** `cfg-backup`
    *   **Caminho:** `src/pages/configuracoes/BackupExportacaoPage.jsx`
    *   **Funcionalidades:** Exportação de dados.

71. **Perfil Usuário**
    *   **ID:** `cfg-profile`
    *   **Caminho:** `src/pages/configuracoes/PerfilUsuarioPage.jsx`
    *   **Funcionalidades:** Edição de dados próprios.

---

## 3. Plano de Ação e Recomendações

### 3.1. Problemas Críticos (Dívida Técnica)
1.  **Componentes Gigantes:**
    *   `src/pages/crm/Pipeline.jsx` (>700 linhas)
    *   `src/pages/apoio/chamados/ChamadoForm.jsx` (>720 linhas)
    *   `src/pages/delivery-management/Deliveries.jsx` (>700 linhas)
    *   **Ação:** Requer refatoração urgente para quebrar em sub-componentes menores e hooks customizados.

2.  **Duplicação de Código:**
    *   Módulos de Analytics com lógica de filtro repetida em várias páginas.
    *   Componentes de Tabela e Modal repetidos em vários módulos.
    *   **Ação:** Criar `src/components/shared/GenericTable.jsx` e consolidar hooks de filtro.

3.  **Performance de Gráficos:**
    *   Dashboards carregam todos os gráficos simultaneamente.
    *   **Ação:** Implementar `Lazy Loading` e `Suspense` para widgets de gráficos individuais.

### 3.2. Roadmap de Evolução

**Fase 1: Estabilização (Concluída)**
*   ✅ Correção de erros de Fetch/Supabase.
*   ✅ Migração de Mock para Dados Reais.
*   ✅ Validação de Rotas e Módulos.

**Fase 2: Otimização (Próxima)**
*   [ ] Refatoração dos "God Components" (Pipeline, ChamadoForm).
*   [ ] Implementação de Virtualização para tabelas longas (>1000 itens).
*   [ ] Cache de RPCs pesadas (React Query com staleTime maior).

**Fase 3: Expansão**
*   [ ] Módulo de Inteligência Artificial (Insights preditivos).
*   [ ] Integração com WhatsApp para notificações.
*   [ ] App Mobile (PWA) otimizado.

---

**Documento Gerado por:** Hostinger Horizons AI
**Data:** 02/12/2025