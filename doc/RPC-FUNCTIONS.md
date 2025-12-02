# Documentação de Funções RPC - Costa Lavos 360

Este documento serve como contrato de API entre o Frontend e o Banco de Dados Supabase. Todas as funções listadas abaixo devem estar implementadas no banco e acessíveis via `rpc()`.

## Padrão de Parâmetros
Para maximizar a reutilização, a maioria das funções analíticas aceita o seguinte conjunto padrão de parâmetros opcionais (filtros):

- `p_start_date` (text, YYYY-MM-DD)
- `p_end_date` (text, YYYY-MM-DD)
- `p_exclude_employees` (boolean) - Se true, remove vendas para funcionários.
- `p_supervisors` (text[]) - Lista de nomes de supervisores.
- `p_sellers` (text[]) - Lista de nomes de vendedores.
- `p_regions` (text[]) - Lista de regiões.
- `p_customer_groups` (text[]) - Lista de grupos de clientes (Redes).
- `p_clients` (text[]) - Lista de nomes/fantasias de clientes.
- `p_products` (text[]) - Lista de nomes de produtos.
- `p_search_term` (text) - Termo para busca textual.

---

## 1. Dashboard Gerencial

### `get_dashboard_and_daily_sales_kpis`
Retorna os principais KPIs do dashboard e o gráfico de evolução diária.
- **Retorno:** JSON