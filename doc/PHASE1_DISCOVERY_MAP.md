# RELATÓRIO DE DESCOBERTA - FASE 1: MAPEAMENTO DO SISTEMA

**Data:** 02/12/2025
**Escopo:** Análise completa da estrutura de arquivos, rotas e componentes de página.

## 1. Estatísticas Gerais
*   **Total de Arquivos em `/src/pages`:** +120 arquivos identificados.
*   **Arquivos de Rotas/Páginas Reais:** ~85 componentes atuando como páginas.
*   **Módulos Principais Identificados:** 10 grandes áreas funcionais.
*   **Arquitetura de Rotas:** Híbrida (Hardcoded em `App.jsx` + Dinâmica via `ModuleRouter`).

---

## 2. Arquitetura de Rotas (`src/App.jsx`)

O sistema utiliza **React Router v6** com uma abordagem híbrida:

1.  **Rotas Estáticas (Core):**
    *   `/login` -> `LoginPage`
    *   `/forgot-password` -> `ForgotPasswordPage`
    *   `/reset-password` -> `ResetPasswordPage`
    *   `/unauthorized` -> `UnauthorizedPage`
    *   `/debug` -> `DebugPage` (Apenas dev)

2.  **Rota Dinâmica (Modular):**
    *   `/:module/:page` -> `ModuleRouter` (Lazy Loaded)
    *   *Mecanismo:* O `ModuleRouter` lê `src/config/modulesStructure.js` para renderizar o componente correto baseado nos parâmetros da URL.

3.  **Redirecionamentos Legados:**
    *   `/dashboard` -> `/analytics/dashboard-gerencial`
    *   `/settings` -> `/configuracoes/geral`

---

## 3. Mapeamento Hierárquico de Módulos (Baseado em Pastas)

A estrutura de pastas revela uma tentativa de organização modular, mas com **significativa dívida técnica e duplicação**.

### A. Módulo: Analytics & Dashboard (Alta Fragmentação)
*Status: Crítico - Múltiplas fontes de verdade.*
*   `/src/pages/analytics/`: Contém wrappers (`AnaliticoVendedor.jsx`, `DashboardGerencial.jsx`).
*   `/src/pages/dashboard/`: Contém implementações reais (`DashboardPage.jsx`, `Visao360ClientePage.jsx`).
*   `/src/pages/`: Contém arquivos soltos legados (`AnaliseChurn.jsx`, `CurvaABC.jsx`).

### B. Módulo: Apoio (Suporte & Operações)
*Status: Bem estruturado, mas profundo.*
*   `/src/pages/apoio/agenda/`: Calendários e eventos.
*   `/src/pages/apoio/chamados/`: Gestão de tickets (CRUD completo).
*   `/src/pages/apoio/comodato/`: Fluxos de equipamentos (Entrega, Retirada).
*   `/src/pages/apoio/geolocalizacao/`: Mapas e Rastreamento.
*   `/src/pages/apoio/notificacoes/`: Central de notificações.
*   `/src/pages/apoio/relatorios/`: Relatórios específicos de apoio.

### C. Módulo: Bonificações
*Status: Em migração (V1 vs V2).*
*   `/src/pages/bonificacoes/`: Contém `BonificacoesPage.jsx` (Atual) e `BonificacoesPageV2.jsx` (Possível refatoração).
*   Contém subpastas `components` e `hooks` misturadas com páginas.

### D. Módulo: Configurações (Duplicação Severa)
*Status: Crítico - Duas estruturas paralelas.*
*   `/src/pages/config/`: Parece ser uma estrutura mais nova/limpa (`GeneralSettingsPage.jsx`).
*   `/src/pages/configuracoes/`: Estrutura antiga/atual em uso (`ConfiguracoesLayout.jsx`, `UsuariosPage.jsx`).
*   `/src/pages/admin/configuracoes/`: Terceira camada encontrada (`UserManagementPage.jsx`).

### E. Módulo: CRM
*Status: Consolidado.*
*   `/src/pages/crm/`: Centraliza tudo.
    *   `Pipeline.jsx`: Kanban de vendas.
    *   `Contacts.jsx`: Lista de contatos.
    *   `Automations.jsx`: Fluxos de trabalho.
    *   `Reports.jsx`: Relatórios específicos de CRM.

### F. Módulo: Delivery & Entregas (Duplicação)
*Status: Crítico - Naming convention inconsistente.*
*   `/src/pages/delivery/`: Wrappers simples.
*   `/src/pages/delivery-management/`: Implementações complexas (`Dashboard.jsx`, `RouteOptimization.jsx`).
*   `/src/pages/entregas/`: Outro conjunto de implementações (`EntregasList.jsx`, `RastreamentoPage.jsx`).

### G. Módulo: Equipment (Equipamentos)
*Status: Inconsistência de idioma (Inglês/Português).*
*   `/src/pages/equipment/`: `EquipamentosList.jsx`, `ManutencaoEquipamentosPage.jsx`.
*   `/src/pages/maintenance/`: Apenas um wrapper `MaintenancePage.jsx`.

---

## 4. Análise de Duplicidade e Páginas Órfãs

Detectamos sobreposição funcional significativa que deve ser resolvida na Fase 2 (Refatoração).

| Funcionalidade | Caminho A (Provável Legado) | Caminho B (Provável Novo/Correto) | Ação Recomendada |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `src/pages/Dashboard.jsx` | `src/pages/dashboard/DashboardPage.jsx` | Unificar em `src/pages/dashboard` |
| **Config** | `src/pages/configuracoes/*` | `src/pages/config/*` | Migrar tudo para `config` (padrão inglês) |
| **Entregas** | `src/pages/entregas/*` | `src/pages/delivery-management/*` | Decidir um padrão (delivery-management parece mais completo) |
| **Usuários** | `src/pages/configuracoes/usuarios/*` | `src/pages/admin/configuracoes/*` | Centralizar gestão de usuários em Admin |

---

## 5. Pontos de Atenção (Hooks & Contextos)

1.  **`useAnalyticalData`**: É o hook central para buscar dados. Foi recentemente corrigido para *Named Export*. Todas as páginas de relatório dependem dele.
2.  **`useAuth` / `SupabaseAuthContext`**: Gerencia a sessão. Páginas em `/src/pages/auth` manipulam isso diretamente.
3.  **`ModuleRouter`**: É o "coração" da navegação dinâmica. Se uma página não estiver listada em `modulesStructure.js`, ela se torna órfã/inacessível, a menos que haja um link direto hardcoded.

## 6. Próximos Passos (Roadmap)

1.  **Validação de Rotas:** Verificar `src/config/modulesStructure.js` para confirmar quais dessas páginas duplicadas estão efetivamente ativas no menu lateral.
2.  **Limpeza:** Marcar arquivos em `/src/pages/entregas` e `/src/pages/configuracoes` como *deprecated* se as versões em inglês estiverem completas.
3.  **Padronização:** Mover arquivos soltos na raiz de `src/pages/` para seus respectivos módulos.

Este relatório serve como base para a **Fase 2: Refatoração e Limpeza**.