# Relatório de Dependências e Orfandade

**Data:** 02/12/2025

## 1. Componentes Órfãos (Prováveis)
Com base na varredura, os seguintes arquivos parecem não estar sendo importados pelas rotas principais ou são duplicatas não utilizadas:

*   `src/components/crm/RegistrationReport.jsx` (Pode estar sendo usado apenas na página de relatório específica)
*   `src/pages/crm/Negocios.jsx` (Placeholder vazio)
*   `src/pages/delivery/DeliveryDashboard.jsx` (Versão antiga, substituída por `delivery-management/Dashboard.jsx`)
*   `src/pages/entregas/EntregasList.jsx` (Provável versão antiga)

## 2. Hooks Mais Utilizados (Core)
Estes hooks são fundamentais e qualquer alteração neles impacta todo o sistema:

1.  **`useAnalyticalData`**: Usado por TODOS os dashboards e relatórios.
    *   *Dependências:* `useFilters`, `supabase`.
2.  **`useAuth`**: Usado por `AuthGuard` e componentes de perfil.
3.  **`useFilters`**: Usado por `FilterBar` e páginas de análise.

## 3. Cadeia de Dependência Crítica
`App.jsx` -> `ModuleRouter` -> `modulesStructure.js` -> `Páginas`

Se uma página não estiver listada em `modulesStructure.js` OU hardcoded em `App.jsx`, ela é efetivamente inalcançável (órfã de rota), a menos que seja um modal ou sub-componente.

**Ação Recomendada:** Verificar `src/config/modulesStructure.js` contra a lista de arquivos em `src/pages`. Arquivos em `src/pages` que não estão no config e não são sub-componentes devem ser auditados para exclusão.