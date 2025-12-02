# Relatório do Módulo: CRM

**Data:** 02/12/2025
**Responsável:** Hostinger Horizons
**Status Geral:** ⚠️ Em Migração (Mock -> Real)

---

## 1. Visão Geral
O módulo de CRM gerencia o relacionamento com clientes, pipeline de vendas e contratos. É uma área crítica que está em transição de dados mockados para integração total com o Supabase.

### Estatísticas
*   **Total de Páginas:** ~12 arquivos principais.
*   **Estado:** Híbrido (Algumas páginas usam `useCRMMock`, outras `supabase`).

---

## 2. Inventário de Páginas

### Grupo: Gestão de Vendas
| Página | Caminho | Status | Tipo | Funcionalidades | Risco |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pipeline** | `src/pages/crm/Pipeline.jsx` | 🔴 Crítico | Kanban | Drag&Drop, Gestão de Estágios, Novo Negócio | Alto (Arquivo gigante >700 linhas) |
| **Contatos** | `src/pages/crm/Contacts.jsx` | ✅ Ativa | Lista | CRUD Contatos, Filtros, Busca | Baixo |
| **Negócios** | `src/pages/crm/Negocios.jsx` | ⚠️ Inativo | Placeholder | - | Baixo (Deve ser removido) |

### Grupo: Operacional
| Página | Caminho | Status | Tipo | Funcionalidades | Risco |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Automações** | `src/pages/crm/Automations.jsx` | ⚠️ Beta | Ferramenta | Configuração de gatilhos e ações | Médio (Lógica complexa) |
| **Relatórios** | `src/pages/crm/Reports.jsx` | ✅ Ativa | Dashboard | KPIs de conversão, Funil | Médio |
| **Equipe** | `src/pages/crm/Team.jsx` | ✅ Ativa | Gamificação | Metas, Badges, Leaderboard | Baixo |

---

## 3. Análise Técnica

### Pipeline (`Pipeline.jsx`)
*   **Problema:** O arquivo é monolítico. Contém lógica de UI (Drag and Drop com `dnd-kit`), lógica de dados (Supabase calls), e lógica de negócio (validação de contrato).
*   **Dependências:** `dnd-kit`, `useAuth`, `useDataScope`.
*   **Recomendação:** Extrair componentes `PipelineColumn` e `DealCard`. Criar hook `usePipelineDeals` para gerenciar o estado e as chamadas ao banco.

### Dados & Mock
*   Vários componentes ainda importam `useCRMMock`. É vital verificar se `src/pages/crm/CrmContatosList.jsx` e `src/pages/crm/CrmNegociosList.jsx` estão sendo usados ou se foram substituídos por `Contacts.jsx` e `Pipeline.jsx`.
*   **Tabelas Reais:** `crm_contacts`, `crm_deals`, `crm_stages` já existem e estão sendo usadas nas páginas novas.

### Segurança
*   **RLS:** O hook `useDataScope` é usado em `Contacts.jsx` para filtrar dados baseado no `owner_id`. Isso é uma boa prática de *frontend security*, mas deve ser reforçada por Policies RLS no banco.

---

## 4. Plano de Ação CRM

1.  **Refatorar `Pipeline.jsx`:** Prioridade máxima para melhorar a manutenibilidade.
2.  **Limpeza:** Remover `CrmContatosList.jsx`, `CrmNegociosList.jsx` e `Negocios.jsx` se confirmado que são versões antigas.
3.  **Contratos:** Unificar a lógica de geração de contratos que hoje parece dispersa entre modais no Pipeline e páginas dedicadas.