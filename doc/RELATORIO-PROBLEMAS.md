# Relatório de Problemas Técnicos

**Data:** 02/12/2025

## 1. Código Duplicado
A maior dívida técnica do projeto é a duplicação de funcionalidades em pastas diferentes.

*   **Entregas:** `src/pages/entregas` vs `src/pages/delivery-management`. (Recomendado: Usar `delivery-management`).
*   **Configurações:** `src/pages/config` vs `src/pages/configuracoes` vs `src/pages/admin/configuracoes`. (Recomendado: Centralizar em `src/pages/configuracoes`).
*   **Analytics:** Arquivos soltos na raiz `src/pages/*.jsx` que deveriam estar em `src/pages/analytics` ou `src/pages/dashboard`.

## 2. Componentes Gigantes (God Components)
Arquivos com muitas responsabilidades e linhas de código, difíceis de manter.

*   `src/pages/crm/Pipeline.jsx`: ~720 linhas. Mistura UI de Kanban com lógica de negócios complexa.
*   `src/pages/apoio/chamados/ChamadoForm.jsx`: ~750 linhas. Lógica de formulário muito extensa.
*   `src/components/Client360/ClientDashboard.jsx`: ~750 linhas.

## 3. Gestão de Estado
*   Uso inconsistente de cache. Algumas páginas usam `React Query` (via `useAnalyticalData`), outras usam `useEffect` com `fetch` manual.
*   Recomendação: Padronizar tudo para `useAnalyticalData` ou hooks customizados que usem `React Query`.

## 4. Performance
*   Páginas de Dashboard (ex: `DashboardAnalytico.jsx`) carregam todos os gráficos de uma vez.
*   Sugestão: Implementar `Suspense` e `lazy` loading para widgets individuais de gráficos pesados.