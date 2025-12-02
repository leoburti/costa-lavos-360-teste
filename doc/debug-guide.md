# Guia de Debug: Analytics

## Ferramentas
- **React Developer Tools:** Para inspecionar props e state.
- **Console do Navegador:** Logs estruturados com prefixo `[Analytics]`.

## Problemas Comuns e Soluções

### 1. Gráfico Vazio ou "No Data"
- **Verifique:** O array de dados está vazio?
- **Ação:** Verifique a aba Network no DevTools. A RPC retornou `[]`? Se sim, verifique os filtros de data.

### 2. Erro "Objects are not valid..."
- **Verifique:** Algum componente está recebendo um objeto onde deveria ser string?
- **Ação:** Use `extractValue(dado)` no componente. Verifique se a prop `value` do KPI não é um objeto complexo.

### 3. Loading Infinito
- **Verifique:** A Promise da RPC está sendo resolvida?
- **Ação:** Verifique se há erros de timeout no console. O `useAnalyticsData` tem timeout padrão de 15s.

### 4. Dados Desatualizados
- **Verifique:** O cache do React Query está muito longo?
- **Ação:** Use o botão "Atualizar" na interface para invalidar o cache e forçar refetch.