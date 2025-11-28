# Costa Lavos 360 - Roadmap Técnico & Documentação de Arquitetura

**Data de Atualização:** 27/11/2025
**Versão:** 1.0.0

---

## 1. Visão Geral e Estrutura
O sistema é uma aplicação **SPA (Single Page Application)** construída com **React 18** e **Vite**, utilizando **TailwindCSS** para estilização e **Shadcn/UI** para componentes de interface. O backend é totalmente gerenciado via **Supabase** (PostgreSQL, Auth, Edge Functions, Storage).

### Estrutura de Pastas (`src/`)
- **/pages**: Rotas da aplicação, organizadas por módulos (CRM, Apoio, Analytics).
- **/components**: Componentes React reutilizáveis.
  - **/ui**: Primitivos de interface (Botões, Cards, Modais) baseados em Radix UI.
  - **/DailySales**: Componentes específicos da análise diária.
  - **/Client360**: Componentes da visão 360 do cliente.
  - **/crm**: Componentes específicos do módulo CRM.
  - **/apoio**: Componentes para suporte, agenda e geolocalização.
- **/contexts**: Provedores de estado global (Auth, Filtros, Notificações).
- **/hooks**: Lógica de negócio reutilizável e data-fetching.
- **/services**: Camada de abstração para chamadas de API/RPC.
- **/lib**: Configurações de bibliotecas (Supabase Client, Utils).
- **/utils**: Funções auxiliares puras (formatação, cálculos).

---

## 2. Mapeamento de Páginas e Status

### 🟢 Ativas (Produção)
| Rota | Componente | Descrição | RPC Principal |
|------|------------|-----------|---------------|
| `/dashboard` | `DashboardComercial` | Visão geral de KPIs, vendas e rankings. | `get_overview_data_v2` |
| `/analitico-vendas-diarias` | `AnaliticoVendasDiarias` | **(Refatorada)** Calendário interativo e explorador de vendas dia-a-dia. | `get_daily_sales_data` |
| `/visao-360-cliente` | `Visao360Cliente` | Análise profunda de um cliente (RFM, Churn, Histórico). | `get_client_360_data_v2` |
| `/crm/*` | `CRM` (Layout) | Gestão de relacionamento, pipeline e contratos. | Várias (Tabelas `crm_*`) |
| `/apoio/agenda/*` | `AgendaPage` | Gestão de visitas, conflitos e disponibilidade técnica. | `get_agenda_profissional` |
| `/apoio/geolocalizacao/*` | `GeolocalizacaoPage` | Monitoramento de equipe e check-ins. | `get_latest_locations` |
| `/analise-churn` | `AnaliseChurn` | Monitoramento de clientes em risco de inatividade. | `get_churn_analysis_data_v3` |
| `/curva-abc` | `CurvaABC` | Classificação de clientes por volume de receita (Pareto). | `get_abc_analysis` |

### 🟡 Em Desenvolvimento / Refatoração
| Rota | Componente | Status | Notas |
|------|------------|--------|-------|
| `/ai-chat` | `AIChat` | Beta | Integração com LLM para insights (Senhor Lavos). |
| `/manutencao` | `ManutencaoPage` | Migração | Sendo movido para `/apoio/manutencao`. |
| `/tarefas` | `Tarefas` | Beta | Sistema de tarefas simples. |

---

## 3. Arquitetura de Componentes (Destaque: Vendas Diárias)

A página **Vendas Diárias** foi recentemente reconstruída para alta performance e detalhamento.

**Hierarquia:**
1.  **`AnaliticoVendasDiarias.jsx`** (Page Controller)
    *   Gerencia estado do calendário (`currentMonth`, `selectedDay`).
    *   Invoca hook de dados `useAnalyticalData`.
    *   Contém:
        *   **`DailySalesKPIs`**: Cards de resumo no topo (Vendas, Bonificado, Ativos).
        *   **`DailySalesTimeline`**: Calendário mensal visual com "mapa de calor" de vendas.
        *   **`DailySalesTabsExplorer`**: Painel inferior com abas (Resumo, Produtos, Clientes).

**Dependências:**
- `date-fns`: Manipulação de datas.
- `framer-motion`: Animações de transição.
- `lucide-react`: Ícones.

---

## 4. Hooks Customizados (`/hooks`)

| Hook | Parâmetros | Retorno | Funcionalidade |
|------|------------|---------|----------------|
| **`useAnalyticalData`** | `rpcName`, `params`, `options` | `{ data, loading, error, refetch }` | Abstração central para buscar dados do Supabase RPC com tratamento de erro e loading. |
| **`useFilters`** | N/A | `{ filters, updateFilters }` | Acesso ao contexto global de filtros (Período, Supervisor, Região). |
| **`useAIInsight`** | `analysisType`, `dataContext` | `{ insight, loading, generate }` | (Atualmente Desativado/Mock) Interface para gerar textos via IA. |
| **`useAuth`** | N/A | `{ user, session, role }` | Acesso aos dados do usuário logado. |

---

## 5. Contextos e Estado Global (`/contexts`)

1.  **`FilterContext`**:
    *   **Estado**: `dateRange`, `supervisors`, `sellers`, `regions`, `searchTerm`.
    *   **Propósito**: Sincronizar filtros entre a barra superior (`FilterBar`) e as páginas analíticas.
2.  **`SupabaseAuthContext`**:
    *   **Estado**: Sessão do usuário, Perfil, Permissões.
    *   **Propósito**: Segurança e controle de acesso (RBAC).
3.  **`NotificationContext`**:
    *   **Estado**: Fila de notificações.
    *   **Propósito**: Exibir Toasts e Alertas.

---

## 6. Integrações e Backend (Supabase)

O sistema opera sob um modelo **Backend-as-a-Service**.

### Tabelas Principais
- **`bd-cl`**: Tabela mestre de vendas (importada do ERP). Contém todas as transações.
- **`clientes` / `clientes_comodato`**: Dados cadastrais e contratuais.
- **`apoio_chamados`**: Tickets de suporte técnico/comercial.
- **`apoio_agenda_eventos`**: Eventos de calendário da equipe.

### RPC Functions (Remote Procedure Calls)
Funções PostgreSQL otimizadas para análise de dados pesados:

1.  **`get_daily_sales_data`**:
    *   **Input**: Data Início, Data Fim, Filtros (Supervisor, Região, etc).
    *   **Output**: JSON aninhado agrupado por dia -> itens de venda.
    *   **Uso**: Página Vendas Diárias.

2.  **`get_client_360_data_v2`**:
    *   **Input**: Filtros globais.
    *   **Output**: Lista de clientes com KPIs calculados (RFM, Churn Risk, Tendência).
    *   **Uso**: Visão 360 Cliente.

3.  **`get_overview_data_v2`**:
    *   **Input**: Período.
    *   **Output**: KPIs globais para o Dashboard principal (Faturamento total, Ticket médio).

4.  **`get_drilldown_data`**:
    *   **Input**: Nível de detalhe, chaves pais.
    *   **Output**: Dados para gráficos "drilldown" (Região -> Supervisor -> Vendedor).

---

## 7. Fluxo de Dados (Exemplo: Vendas Diárias)

1.  **Usuário** altera o mês no calendário ou filtro na barra superior.
2.  **`FilterContext`** atualiza o estado global.
3.  **`AnaliticoVendasDiarias`** detecta mudança e recalcula parâmetros.
4.  **`useAnalyticalData`** dispara `get_daily_sales_data` no Supabase.
5.  **Supabase** executa a query SQL agregada e retorna JSON.
6.  **`DailySalesKPIs`** recalcula totais baseados no retorno.
7.  **`DailySalesTimeline`** renderiza as células do calendário com cores baseadas no volume.
8.  **Usuário** clica em um dia específico.
9.  **`DailySalesTabsExplorer`** recebe os dados brutos daquele dia e processa localmente (Client-side aggregation) para exibir tabelas de produtos, clientes, etc.

---

## 8. Próximos Passos (Roadmap Futuro Sugerido)

1.  **Otimização de Performance**: Implementar virtualização nas tabelas do Explorador de Vendas Diárias se o número de itens por dia exceder 5000.
2.  **Cache Avançado**: Utilizar `React Query` de forma mais agressiva para cachear meses já visualizados no calendário.
3.  **Exportação**: Adicionar funcionalidade de exportar o detalhe do dia para Excel/PDF.
4.  **Integração IA**: Reativar `useAIInsight` conectando a uma Edge Function real para análise qualitativa dos dados do dia.