# ROADMAP EXECUTIVO COMPLETO - FASE 4 (FINAL)

**Data:** 02/12/2025
**Projeto:** Costa Lavos 360 - Sistema de Gestão Integrada
**Status:** Mapeamento e Planejamento Finalizado

---

## 1. Resumo Executivo

### 1.1. Estatísticas Globais
*   **Total de Arquivos de Página (.jsx):** 148
*   **Páginas Ativas (Em Rotas):** 62
*   **Páginas Inativas/Legadas:** 45 (Shadow Pages)
*   **Páginas Órfãs:** 41 (Sem referência)
*   **Módulos Principais:** 6 (Analytics, CRM, Apoio, Delivery, Equipamentos, Configurações)

### 1.2. Distribuição por Módulo
| Módulo | Páginas Totais | Ativas | Legadas/Órfãs | Risco Técnico |
| :--- | :---: | :---: | :---: | :---: |
| **Analytics** | 28 | 12 | 16 | Alto (Duplicação) |
| **CRM** | 22 | 8 | 14 | Médio (Migração Mock) |
| **Apoio** | 35 | 15 | 20 | Baixo (Estável) |
| **Delivery** | 18 | 6 | 12 | Médio (Duplicação de Pasta) |
| **Equipamentos** | 12 | 5 | 7 | Baixo |
| **Configurações** | 33 | 16 | 17 | Médio (Permissões) |

### 1.3. Principais Problemas Críticos
1.  **Duplicação de Código:** Existência de pastas paralelas (`src/pages/entregas` vs `src/pages/delivery-management`) e arquivos raiz (`src/pages/*.jsx`) que sombreiam arquivos modulares.
2.  **Dependência de Mock:** Módulos críticos como CRM e Delivery ainda dependem pesadamente de hooks de Mock (`useCRMMock`, `useDeliveryMock`) ao invés de dados reais do Supabase.
3.  **Performance:** Dashboards analíticos carregam múltiplos gráficos pesados (Recharts) simultaneamente sem lazy loading ou virtualização adequada.
4.  **Segurança (RLS):** Inconsistência na verificação de permissões (algumas páginas checam `role` string no frontend, outras usam RLS no backend).

---

## 2. Índice Hierárquico & Fichas Técnicas

### Módulo 1: Analytics & BI
**Caminho Base:** `/src/pages/dashboard` e `/src/pages/analytics`

#### 1.1. Dashboard Comercial (Principal)
*   **ID:** `dashboard-comercial`
*   **Caminho:** `src/pages/Dashboard.jsx` (Wrapper para `src/pages/dashboard/DashboardPage.jsx`)
*   **Tipo:** Dashboard
*   **Status:** 🔴 **Crítico (Shadow Page)** - Deve ser refatorado para usar apenas o arquivo modular.
*   **Funcionalidades:** KPIs de vendas, Gráfico de evolução diária, Ranking de vendedores.
*   **APIs/RPCs:** `get_dashboard_and_daily_sales_kpis`
*   **Hooks:** `useAnalyticalData`
*   **Problemas:** Duplicação de lógica com `src/pages/dashboard/DashboardPage.jsx`.
*   **Recomendação:** Remover `src/pages/Dashboard.jsx` e atualizar rotas para apontar para o arquivo modular.

#### 1.2. Visão 360 Cliente
*   **ID:** `visao-360`
*   **Caminho:** `src/pages/dashboard/Visao360ClientePage.jsx`
*   **Tipo:** Detalhes / Dashboard
*   **Status:** ✅ **Ativa**
*   **Funcionalidades:** Busca de cliente, exibição de KPIs específicos (RFM, Churn, Histórico).
*   **APIs/RPCs:** `get_client_360_data_v2`
*   **Hooks:** `useAnalyticalData`, `useFilters`
*   **Complexidade:** Alta (Muitos sub-componentes e cálculos no frontend).
*   **Recomendação:** Implementar memoização nos sub-componentes de gráficos.

#### 1.3. Análise de Churn
*   **ID:** `analise-churn`
*   **Caminho:** `src/pages/AnaliseChurn.jsx`
*   **Tipo:** Relatório
*   **Status:** ⚠️ **Legado** (Arquivo na raiz)
*   **Funcionalidades:** Tabela de clientes em risco, gráficos de distribuição de risco.
*   **APIs/RPCs:** `get_churn_analysis_data_v3_optimized`
*   **Recomendação:** Mover para `src/pages/analytics/churn/ChurnPage.jsx`.

---

### Módulo 2: CRM
**Caminho Base:** `/src/pages/crm`

#### 2.1. Pipeline de Vendas
*   **ID:** `crm-pipeline`
*   **Caminho:** `src/pages/crm/Pipeline.jsx`
*   **Tipo:** Kanban Board
*   **Status:** 🔴 **Risco Alto**
*   **Funcionalidades:** Drag & Drop de cards, gestão de estágios, modais de edição.
*   **Componentes:** `KanbanBoard`, `DealCard`, `DndContext` (dnd-kit).
*   **Dados:** Usa `crm_deals`, `crm_stages`.
*   **Problemas:** Arquivo monolítico (>700 linhas). Mistura lógica de drag-and-drop com lógica de negócios e chamadas de API.
*   **Recomendação:** Extrair lógica de DnD para um hook customizado `usePipelineDrag`. Componentizar `PipelineColumn`.

#### 2.2. Contatos
*   **ID:** `crm-contacts`
*   **Caminho:** `src/pages/crm/Contacts.jsx`
*   **Tipo:** Tabela / Lista
*   **Status:** ✅ **Ativa**
*   **Funcionalidades:** Listagem, filtro, criação e edição de contatos.
*   **Dados:** `crm_contacts`.
*   **Recomendação:** Implementar paginação server-side (atualmente busca tudo).

---

### Módulo 3: Apoio (Operacional)
**Caminho Base:** `/src/pages/apoio`

#### 3.1. Gestão de Chamados
*   **ID:** `apoio-chamados`
*   **Caminho:** `src/pages/apoio/chamados/ChamadosTodosPage.jsx`
*   **Tipo:** Tabela de Gestão
*   **Status:** ✅ **Ativa**
*   **Funcionalidades:** Filtros avançados, ações em lote, status badges.
*   **Dados:** `apoio_chamados`, `apoio_clientes_comodato`.
*   **Métricas:** LOC ~350. Complexidade Média.
*   **Recomendação:** Otimizar queries de filtro para usar índices do banco.

#### 3.2. Formulário de Chamado
*   **ID:** `apoio-chamado-form`
*   **Caminho:** `src/pages/apoio/chamados/ChamadoForm.jsx`
*   **Tipo:** Formulário Complexo
*   **Status:** ⚠️ **Risco Médio**
*   **Funcionalidades:** Cadastro de chamado com validação condicional, seleção de equipamentos.
*   **Problemas:** Lógica de validação (Zod) muito extensa dentro do componente.
*   **Recomendação:** Mover schema Zod e lógica de submit para `src/hooks/useChamadoForm.js`.

---

### Módulo 4: Delivery
**Caminho Base:** `/src/pages/delivery-management` (Novo) vs `/src/pages/entregas` (Velho)

#### 4.1. Dashboard Delivery
*   **ID:** `delivery-dashboard`
*   **Caminho:** `src/pages/delivery-management/Dashboard.jsx`
*   **Tipo:** Dashboard Operacional
*   **Status:** ✅ **Ativa (Versão Nova)**
*   **Funcionalidades:** KPIs de entrega, Mapa de calor, Lista recente.
*   **Dados:** `entregas`, `motoristas`.
*   **Recomendação:** Confirmar desativação completa de `src/pages/entregas/DeliveryDashboard.jsx`.

#### 4.2. Rastreamento
*   **ID:** `delivery-tracking`
*   **Caminho:** `src/pages/apoio/geolocalizacao/RastreamentoPage.jsx`
*   **Tipo:** Mapa Interativo
*   **Status:** ⚠️ **Risco de Custo**
*   **Funcionalidades:** Integração Google Maps, Polling de localização.
*   **Problemas:** Polling a cada 30s pode gerar custos altos de API e leituras no Supabase.
*   **Recomendação:** Implementar Supabase Realtime para atualizações push ao invés de pull.

---

### Módulo 5: Configurações
**Caminho Base:** `/src/pages/configuracoes`

#### 5.1. Gestão de Usuários
*   **ID:** `config-users`
*   **Caminho:** `src/pages/admin/configuracoes/UserManagementPage.jsx`
*   **Tipo:** Admin / CRUD
*   **Status:** ✅ **Ativa**
*   **Funcionalidades:** Listagem de usuários, edição de roles, reset de senha.
*   **Dados:** `auth.users` (via RPC `get_all_users_with_roles`), `public.users_unified`.
*   **Segurança:** Requer role `Admin` ou `Nivel 1`.
*   **Recomendação:** Adicionar logs de auditoria para cada ação de alteração de permissão.

---

## 3. Plano de Ação (Roadmap)

### Fase 1: Limpeza e Consolidação (Semana 1)
*   **Objetivo:** Eliminar ruído e código morto.
*   **Ações:**
    1.  [ ] Mover arquivos soltos da raiz `src/pages/*.jsx` para pastas modulares.
    2.  [ ] Excluir pasta `src/pages/entregas` após confirmar migração para `src/pages/delivery-management`.
    3.  [ ] Excluir pasta `src/pages/config` (duplicada de `configuracoes`).
    4.  [ ] Atualizar importações em `App.jsx` para refletir novos caminhos.

### Fase 2: Refatoração Crítica (Semana 2)
*   **Objetivo:** Resolver dívida técnica em componentes gigantes.
*   **Ações:**
    1.  [ ] Refatorar `Pipeline.jsx`: Separar `PipelineColumn` e `DealCard`.
    2.  [ ] Refatorar `ChamadoForm.jsx`: Extrair lógica de negócio para hook.
    3.  [ ] Padronizar chamadas de API: Substituir chamadas diretas `supabase.from` por serviços em `src/services/*`.

### Fase 3: Performance e Segurança (Semana 3)
*   **Objetivo:** Otimizar carregamento e garantir blindagem de dados.
*   **Ações:**
    1.  [ ] Revisar todas as RPCs para garantir que `SECURITY DEFINER` está sendo usado corretamente com validação de usuário.
    2.  [ ] Implementar `React.memo` em componentes de gráficos (Recharts) que não mudam frequentemente.
    3.  [ ] Configurar índices no Supabase para as colunas mais usadas em filtros (`status`, `created_at`, `cliente_id`).

### Fase 4: Testes e Documentação (Semana 4)
*   **Objetivo:** Garantir estabilidade.
*   **Ações:**
    1.  [ ] Criar testes unitários para hooks críticos (`useAnalyticalData`, `useAuth`).
    2.  [ ] Documentar fluxo de dados do CRM (Lead -> Deal -> Contrato).
    3.  [ ] Gerar Storybook ou documentação visual dos componentes base UI.

---

## 4. Diagramas de Arquitetura

### 4.1. Fluxo de Dados Padrão