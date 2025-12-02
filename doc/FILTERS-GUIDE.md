# Guia de Filtros Globais - Costa Lavos 360

O sistema utiliza um mecanismo de filtragem global unificado, permitindo que o usuário defina um contexto de análise (ex: "Vendas do Supervisor João em Janeiro") que persiste através da navegação entre diferentes páginas e módulos.

## 1. Filtros Disponíveis

O componente `AdvancedFilters.jsx` expõe os seguintes filtros:

| Filtro | Chave do Estado | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| **Período** | `dateRange` | Date Range | Intervalo de datas (Início e Fim). Padrão: Mês atual. |
| **Supervisor** | `supervisors` | MultiSelect | Lista de IDs/Nomes de supervisores. |
| **Vendedor** | `sellers` | MultiSelect | Lista de IDs/Nomes de vendedores. |
| **Região** | `regions` | MultiSelect | Regiões geográficas. |
| **Grupo Cliente** | `customerGroups` | MultiSelect | Redes ou grupos econômicos. |
| **Cliente** | `clients` | MultiSelect | Clientes individuais. |
| **Produto** | `products` | MultiSelect | Produtos específicos. |
| **Busca** | `searchTerm` | Text | Busca textual livre (nome, código). |
| **Excluir Func.** | `excludeEmployees` | Boolean | Se verdadeiro, remove vendas para funcionários. |

## 2. Persistência e Estado

Os filtros são gerenciados pelo hook `useAdvancedFilters` (ou `useFilters` no contexto legado) e persistidos no `localStorage` do navegador.

-   **Chave de Storage:** `analyticsFilters`
-   **Comportamento:** Ao recarregar a página, os filtros selecionados anteriormente são restaurados automaticamente.
-   **Reset:** O botão "Limpar Filtros" restaura o estado para os valores iniciais (apenas `dateRange` definido, demais nulos).

## 3. Integração com RPC (Backend)

O hook `useModuleData` (e `useAnalyticsData`) transforma automaticamente o objeto de filtros do frontend para os parâmetros esperados pelas funções RPC do Supabase (PostgreSQL).

### Mapeamento de Parâmetros

| Frontend Filter | Parâmetro RPC (SQL) | Tipo SQL |
| :--- | :--- | :--- |
| `dateRange.from` | `p_start_date` | `text` (YYYY-MM-DD) |
| `dateRange.to` | `p_end_date` | `text` (YYYY-MM-DD) |
| `supervisors` | `p_supervisors` | `text[]` |
| `sellers` | `p_sellers` | `text[]` |
| `regions` | `p_regions` | `text[]` |
| `clients` | `p_clients` | `text[]` |
| `customerGroups` | `p_customer_groups` | `text[]` |
| `excludeEmployees` | `p_exclude_employees` | `boolean` |
| `searchTerm` | `p_search_term` | `text` |

## 4. Como Usar em Novos Módulos

Para integrar os filtros globais em uma nova página ou módulo:

1.  **Importar o Hook:**