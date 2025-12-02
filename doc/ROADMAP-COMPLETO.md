# Roadmap Técnico e Mapeamento Completo do Sistema Costa Lavos 360

**Data de Geração:** 01/12/2025
**Versão do Codebase:** 2.1.0 "Órion"
**Status:** Análise Estática Profunda

---

## 1. Estrutura Hierárquica de Módulos (`src/config/modulesStructure.js`)

O sistema é governado por uma configuração centralizada que define a navegação e a estrutura lógica.

### 📊 Módulo: Analytics (`id: analytics`)
*   **Cor:** `#DC2626` (Red)
*   **Ícone:** `BarChart3`
*   **Grupos:**
    *   **Dashboards:**
        *   `Visão Gerencial` (`/analytics/dashboard-gerencial`) -> RPC: `get_dashboard_and_daily_sales_kpis`
        *   `Visão 360° Cliente` (`/analytics/visao-360-cliente`) -> RPC: `get_client_360_data`
    *   **Analítico:**
        *   `Supervisor` (`/analytics/analitico-supervisor`) -> RPC: `get_supervisor_analytical_data_v2`
        *   `Vendedor` (`/analytics/analitico-vendedor`) -> RPC: `get_seller_summary_v2`
        *   `Região` (`/analytics/analitico-regiao`) -> RPC: `get_region_analysis_data`
        *   `Produto` (`/analytics/analitico-produto`) -> RPC: `get_product_analysis_data`
    *   **Estratégico:**
        *   `Análise de Churn` (`/analytics/analise-churn`) -> RPC: `get_churn_analysis_data_v3_optimized`
        *   `Preditiva Vendas` (`/analytics/analise-preditiva`) -> RPC: `get_sales_forecast_data`

### 👥 Módulo: CRM (`id: crm`)
*   **Cor:** `#3B82F6` (Blue)
*   **Ícone:** `Users`
*   **Grupos:**
    *   **Vendas:**
        *   `Pipeline` (`/crm/pipeline`) -> RPC: `get_crm_pipeline` (Híbrido com Mock)
        *   `Negócios` (`/crm/negocios`)
    *   **Cadastros:**
        *   `Contatos` (`/crm/contatos`) -> Tabela: `crm_contacts`

### 🔧 Módulo: Equipamentos (`id: equipment`)
*   **Cor:** `#10B981` (Emerald)
*   **Ícone:** `Wrench`
*   **Grupos:**
    *   **Gestão:**
        *   `Inventário` (`/equipment/inventario`) -> RPC: `get_equipment_list` (Híbrido com Mock)
    *   **Serviços:**
        *   `Manutenção` (`/equipment/manutencao`) -> Tabela: `maintenance`

### 🚚 Módulo: Entregas (`id: delivery`)
*   **Cor:** `#F59E0B` (Amber)
*   **Ícone:** `Truck`
*   **Grupos:**
    *   **Logística:**
        *   `Rotas` (`/delivery/rotas`) -> Tabela: `rotas` / Google Maps API
        *   `Entregas` (`/delivery/entregas`) -> Tabela: `entregas`

### 🆘 Módulo: Apoio (`id: apoio`)
*   **Cor:** `#8B5CF6` (Violet)
*   **Ícone:** `LifeBuoy`
*   **Grupos:**
    *   **Atendimento:**
        *   `Chamados` (`/apoio/chamados`) -> Tabela: `apoio_chamados`
    *   **Recursos:**
        *   `Base de Conhecimento` (`/apoio/kb`) -> Mock

---

## 2. Mapeamento Detalhado de Páginas e Fluxo de Dados

### A. Analytics (100% Real Data via RPC)
Este módulo está maduro e utiliza o padrão `useAnalyticalData` para buscar dados do Supabase.

| Página | Componente Principal | Fonte de Dados (Hook/RPC) | Dados Renderizados |
|---|---|---|---|
| `DashboardPage` | `src/pages/dashboard/DashboardPage.jsx` | `get_dashboard_and_daily_sales_kpis` | KPIs, Gráfico de Linha (Vendas), Ranking Vendedores |
| `Visao360ClientePage` | `src/pages/dashboard/Visao360ClientePage.jsx` | `get_client_360_data_v2` | Perfil, Vendas, Churn, RFM, Mix Produtos |
| `AnaliticoSupervisor` | `src/pages/dashboard/AnaliticoSupervisor.jsx` | `get_supervisor_summary_v2` | Treemap, Tabela Hierárquica |
| `AnaliseChurn` | `src/pages/AnaliseChurn.jsx` | `get_churn_analysis_data_v3_optimized` | Lista de Risco, Gráfico de Barras |

**Fluxo de Dados:** `Componente` -> `useAnalyticalData` -> `supabase.rpc()` -> `PostgreSQL Materialized View`

### B. CRM (Híbrido - Migração em Andamento)
Módulo em transição de Mocks para tabelas reais (`crm_*`).

| Página | Componente Principal | Fonte de Dados | Status Migração |
|---|---|---|---|
| `Pipeline` | `src/pages/crm/Pipeline.jsx` | `useCRMMock` (Leitura) + `crm_deals` (Escrita parcial) | ⚠️ **Híbrido (Crítico)** |
| `Contacts` | `src/pages/crm/Contacts.jsx` | Tabela `crm_contacts` (Direto) | ✅ Real Data |
| `CrmRelatorio` | `src/pages/crm/CrmRelatorio.jsx` | `get_crm_relatorio` (RPC) | ✅ Real Data |

**Dívida Técnica:** `Pipeline.jsx` ainda depende fortemente de `useCRMMock` para visualização inicial, embora salve em `crm_deals`.

### C. Equipamentos (Legado/Mock)
Módulo com maior dependência de dados simulados.

| Página | Componente Principal | Fonte de Dados | Status Migração |
|---|---|---|---|
| `EquipamentosList` | `src/pages/equipment/EquipamentosList.jsx` | `useEquipmentMock` | ⚠️ **Mock** |
| `EquipamentosDetalhes`| `src/pages/equipment/EquipamentosDetalhes.jsx`| `useEquipmentMock` | ⚠️ **Mock** |
| `ManutencaoEquipamentosPage` | `src/pages/apoio/manutencao/ManutencaoEquipamentosPage.jsx` | Tabela `maintenance` | ✅ Real Data (Parcial) |

**Ação Necessária:** Substituir `useEquipmentMock` por chamadas às tabelas `equipment` e `equipment_families` já existentes no banco.

### D. Delivery (Real Data + Google Maps)
Módulo operacional robusto.

| Página | Componente Principal | Fonte de Dados | Funcionalidades |
|---|---|---|---|
| `Dashboard` | `src/pages/delivery-management/Dashboard.jsx` | Tabela `entregas` (Supabase) | KPIs, Heatmap, Pizza Status |
| `RotasPage` | `src/pages/apoio/geolocalizacao/RotasPage.jsx` | Google Maps API + `apoio_geolocalizacao` | Roteirização, Mapa |
| `DeliveryReceipts` | `src/pages/delivery-management/DeliveryReceipts.jsx` | `bd-cl` (Vendas) + `entregas` | Baixa de Entrega, Assinatura, Fotos |

---

## 3. Arquitetura de Componentes e Reutilização

### Componentes Core (Alta Reutilização)
1.  **`DrilldownExplorer`** (`src/components/DrilldownExplorer.jsx`):
    *   **Propósito:** Motor de análise hierárquica (Região -> Supervisor -> Vendedor -> Cliente).
    *   **Uso:** Todas as páginas analíticas de detalhe.
    *   **Dependência:** `get_drilldown_data` (RPC).

2.  **`MetricCard`** (`src/components/MetricCard.jsx`):
    *   **Propósito:** Exibição padronizada de KPIs com tendência.
    *   **Uso:** Dashboards (Comercial, CRM, Apoio).

3.  **`FilterBar`** (`src/components/FilterBar.jsx`):
    *   **Propósito:** Barra de filtros global conectada ao `FilterContext`.
    *   **Uso:** Topo de todas as páginas de relatório.

### Padrão de Wrapper
O sistema utiliza o padrão de **Proxy Components** em `src/pages/analytics/` (ex: `AnaliticoSupervisor.jsx`) que apenas envelopam e configuram componentes de visualização mais complexos localizados em `src/components/dashboard/` ou `src/pages/dashboard/`.

---

## 4. Hooks e Camada de Serviço

### 🎣 Hooks Principais
1.  **`useAnalyticalData(rpcName, params, options)`**
    *   **Arquivo:** `src/hooks/useAnalyticalData.js`
    *   **Função:** Abstração do `supabase.rpc`. Gerencia estado de loading, erro e refetch.
    *   **Status:** ✅ Produção (Padronizado).

2.  **`useAuth()`**
    *   **Arquivo:** `src/contexts/SupabaseAuthContext.jsx`
    *   **Função:** Gerencia sessão, usuário, perfil unificado e permissões.
    *   **Status:** ✅ Produção.

3.  **`useFilters()`**
    *   **Arquivo:** `src/contexts/FilterContext.jsx`
    *   **Função:** Estado global de filtros (Datas, Vendedor, Região).
    *   **Status:** ✅ Produção.

4.  **`useCRMMock()` e `useEquipmentMock()`**
    *   **Status:** ⚠️ **Depreciados**. Devem ser removidos na Fase 3 do Roadmap.

### 📡 Serviços
*   **`apoioSyncService.js`**: Centraliza lógica de sincronização entre tabelas do ERP (`bd-cl`, `bd_cl_inv`) e tabelas operacionais do sistema (`apoio_clientes_comodato`).
*   **`geolocalizacaoService.js`**: Abstrai chamadas de GPS e Google Maps.

---

## 5. Banco de Dados e RPCs Críticas

### Tabelas Principais (Source of Truth)
1.  **`bd-cl`**: Vendas (Legado/ERP Sync).
2.  **`users_unified`**: Perfis de usuário com papéis e hierarquia.
3.  **`entregas`**: Operação logística.
4.  **`crm_deals`**: Oportunidades de vendas.

### RPCs Críticas (Performance)
1.  **`get_overview_data_v2`**: Alimenta o Dashboard Principal. Complexidade O(N) sobre vendas.
2.  **`get_client_360_data_v2`**: Agrega dados de múltiplas fontes para visão única do cliente.
3.  **`get_drilldown_data`**: RPC Polimórfica que suporta navegação em profundidade.

---

## 6. Checklist de Ação (Próximos Passos)

### Prioridade Alta (Imediato)
- [ ] **CRM Migration:** Refatorar `CrmPipeline.jsx` para remover `useCRMMock` e ler diretamente de `crm_deals` e `crm_stages`.
- [ ] **Equipment Migration:** Refatorar `EquipamentosList.jsx` para ler da tabela `equipment`.
- [ ] **Rota CRM:** Finalizar as páginas `ClientsPage.jsx` e `OpportunitiesPage.jsx` que estão marcadas como "Em construção".

### Prioridade Média (Otimização)
- [ ] **Cache:** Implementar cache no React Query (`staleTime`) para RPCs pesadas de Analytics.
- [ ] **RLS Audit:** Verificar se todas as novas tabelas do módulo `apoio` possuem políticas RLS ativas para `anon` e `authenticated`.

### Prioridade Baixa (Features)
- [ ] **Dashboard Personalizado:** Finalizar a implementação de `DashboardPersonalizadoPage.jsx` (Drag & Drop).
- [ ] **Exportação:** Padronizar a exportação PDF/Excel em todos os relatórios usando `RelatoriExport.jsx`.