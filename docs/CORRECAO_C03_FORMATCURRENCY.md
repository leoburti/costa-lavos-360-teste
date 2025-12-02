# Correção C03: Função `formatCurrency` não definida

**Data:** 01/12/2025
**Status:** Implementado
**Problema:** A função `formatCurrency` estava sendo utilizada em `src/pages/dashboard/DashboardPage.jsx` sem que estivesse corretamente importada ou definida, resultando em um erro "formatCurrency is not defined".

## Solução Implementada

1.  **Verificação da Definição**: A função `formatCurrency` já estava corretamente definida no arquivo `src/lib/utils.js`.
2.  **Importação no `DashboardPage.jsx`**: A importação da função `formatCurrency` foi adicionada ao arquivo `src/pages/dashboard/DashboardPage.jsx`, apontando para `src/lib/utils.js`.

## Detalhes da Implementação

A importação em `src/pages/dashboard/DashboardPage.jsx` foi modificada de: