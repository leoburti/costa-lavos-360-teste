# Relatório de Correção: RPC Desnecessário em Páginas de Auth/Erro

## Problema Identificado
A aplicação estava realizando chamadas RPC pesadas (`get_dashboard_and_daily_sales_kpis`) em páginas onde esses dados não são necessários, especificamente em:
- `/unauthorized`
- `/login`
- Páginas de erro e recuperação de senha

Isso ocorria porque o `DataProvider` (responsável por buscar esses dados) está posicionado no topo da árvore de componentes em `App.jsx`, englobando todas as rotas, e não possuía verificação de contexto de rota antes de executar a busca.

## Solução Implementada

### 1. Verificação de Rota no DataContext (Smart Provider)
Modificamos `src/contexts/DataContext.jsx` para incluir uma verificação robusta da rota atual antes de tentar buscar dados.