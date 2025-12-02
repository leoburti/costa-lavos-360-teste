# Padrões de Código e Melhores Práticas

## 1. Nomenclatura

### 1.1. Arquivos e Pastas
*   **Componentes React:** PascalCase (ex: `MetricCard.jsx`, `UserProfile.jsx`).
*   **Hooks:** camelCase iniciando com `use` (ex: `useAnalyticalData.js`).
*   **Serviços/Utils:** camelCase (ex: `formatters.js`, `authService.js`).
*   **Pastas:** camelCase, exceto se for agrupamento de componentes (PascalCase opcional, mas preferir consistência).

### 1.2. Variáveis e Funções
*   **Booleanos:** Iniciar com `is`, `has`, `should` (ex: `isLoading`, `hasError`).
*   **Event Handlers:** Iniciar com `handle` (ex: `handleClick`, `handleFilterChange`).
*   **Props de Evento:** Iniciar com `on` (ex: `onClick`, `onFilterChange`).

## 2. Estrutura de Componentes