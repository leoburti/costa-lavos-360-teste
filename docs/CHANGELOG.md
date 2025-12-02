# Changelog - Costa Lavos 360

Este arquivo mantém um registro cronológico de todas as alterações significativas, correções e otimizações realizadas no projeto.

## [2025-12-01] - Otimização do Dashboard e Correção de Métricas

### 🚀 Novas Funcionalidades
- **Novo Componente de Dashboard (`src/pages/Dashboard.jsx`)**:
  - Restaurada a estrutura solicitada: KPIs no topo, gráfico de vendas no meio, e abas de ranking na parte inferior.
  - Integrado com o novo componente de ranking de performance.
- **Ranking de Performance (`src/components/dashboard/PerformanceRanking.jsx`)**:
  - Implementado sistema de abas para visualização dinâmica por: Supervisor, Vendedor, Região, Grupo de Cliente, Cliente e Produto.
  - Carregamento de dados sob demanda (lazy loading) para cada aba, melhorando drasticamente a velocidade inicial da página.
  - Adicionadas barras de progresso visual para comparação rápida de valores.

### ⚡ Otimizações de Performance (Backend & Frontend)
- **Refatoração do `DataContext.jsx`**:
  - Removido carregamento monolítico de todos os dados de uma vez.
  - Separada a busca de KPIs essenciais da busca de detalhamentos pesados.
- **Nova RPC `get_performance_ranking`**:
  - Criada função específica no banco de dados para agregar vendas por diferentes dimensões.
  - Otimizada para retornar apenas os Top 50 resultados, reduzindo o payload da resposta.
- **Atualização da RPC `get_dashboard_and_daily_sales_kpis`**:
  - **Antes**: Contagem de "Vendas" baseada em linhas da tabela, o que inflava os números se um pedido tivesse múltiplos itens.
  - **Depois**: Alterado para `COUNT(DISTINCT "Pedido")` para garantir contagem exata de vendas únicas.
  - Removida a lógica de geração de rankings desta função para torná-la mais leve e rápida.

### 🛠 Correções de Bugs
- **KPIs de Vendas**: Corrigido bug onde o número de "Vendas Realizadas" exibia a quantidade de itens em vez da quantidade de pedidos.
- **Renderização de Gráficos**: Ajustada a paleta de cores do gráfico de vendas diárias para corresponder à identidade visual (Receita em verde/vermelho, Bonificação em roxo, Equipamentos em azul).

---

## [2025-11-30] - Consolidação de Relatórios e RPCs

### 📦 Refatoração
- **Mapeamento de Funções RPC**: Criado arquivo `docs/FUNCTION_MAPPING_DEFINITIVE.md` para padronizar quais funções backend alimentam quais páginas.
- **Correção de Tabelas Temporárias**: Substituídas `CREATE TEMP TABLE` por `WITH` (CTEs) em diversas funções críticas para evitar erros de concorrência em acessos simultâneos.