# Documentação Técnica: Módulos de Análise Comercial

**Versão:** 1.1
**Data:** 01/12/2025
**Projeto:** Costa Lavos 360

Este documento detalha a arquitetura, funcionamento e manutenção das 10 páginas de análise comercial implementadas no sistema.

---

## 1. Índice de Módulos Analíticos

O sistema comercial é dividido em dois grupos principais de análise:

### Grupo 1: Analítico Geral (Exploração Hierárquica)
Focado em "quebrar" os números gerais em detalhes específicos (Drill-down).

| Página | Rota | Descrição |
| :--- | :--- | :--- |
| **1. Analítico Supervisor** | `/analitico-supervisor` | Performance por equipe e supervisor. |
| **2. Analítico Vendedor** | `/analitico-vendedor` | Ranking e carteira de vendedores. |
| **3. Analítico Região** | `/analitico-regiao` | Visão geográfica de vendas. |
| **4. Analítico Grupos** | `/analitico-grupo-clientes` | Vendas consolidadas por redes/grupos. |
| **5. Analítico Produtos** | `/analitico-produto` | Mix de produtos, força, penetração e análise de cestas. |

### Grupo 2: Análises Estratégicas (KPIs Específicos)
Focado em responder perguntas de negócio específicas (ex: "Quem vai sair?", "O que é mais importante?").

| Página | Rota | Descrição |
| :--- | :--- | :--- |
| **6. Vendas Diárias** | `/analitico-vendas-diarias` | Acompanhamento diário de receita e margem. |
| **7. Previsão de Vendas** | `/analise-preditiva-vendas` | Projeção de fechamento (Regressão Linear). |
| **8. Curva ABC** | `/curva-abc` | Classificação de Pareto (80/15/5). |
| **9. Valor Unitário** | `/analise-valor-unitario` | Volatilidade de preços e descontos. |
| **10. Desempenho & Fidelidade** | `/analise-desempenho-fidelidade` | Matriz de Retenção vs Valor (RFM/LTV). |

---

## 2. Detalhamento Técnico por Página

### 1. Analítico Supervisor
*   **Componente:** `src/pages/dashboard/AnaliticoSupervisor.jsx`
*   **Layout:** `DrilldownExplorer` (Gráfico Topo / Tabela Base)
*   **RPC:** `get_supervisor_analysis_data` (wrapper para `get_drilldown_data`)
*   **Níveis de Drill-down:** Supervisor -> Vendedor -> Cliente -> Produto
*   **Principais KPIs:** Vendas Totais, % Representatividade, Ticket Médio.

### 2. Analítico Vendedor
*   **Componente:** `src/pages/dashboard/AnaliticoVendedor.jsx`
*   **Layout:** `DrilldownExplorer`
*   **RPC:** `get_seller_analysis_data`
*   **Níveis de Drill-down:** Vendedor -> Cliente -> Produto
*   **Destaque:** Coloração condicional de crescimento na tabela (Verde/Vermelho).

### 3. Analítico Região
*   **Componente:** `src/pages/dashboard/AnaliticoRegiao.jsx`
*   **Layout:** `DrilldownExplorer`
*   **RPC:** `get_region_analysis_data`
*   **Níveis de Drill-down:** Região -> Supervisor -> Vendedor -> Cliente
*   **Visualização:** Treemap para comparação de áreas geográficas.

### 4. Analítico Grupos (Redes)
*   **Componente:** `src/pages/dashboard/AnaliticoGrupos.jsx`
*   **Layout:** `DrilldownExplorer`
*   **RPC:** `get_group_analysis_data`
*   **Funcionalidade:** Agrega CNPJs diferentes sob o mesmo "Nome Grp Cliente". Essencial para grandes contas.

### 5. Analítico Produto
*   **Componente:** `src/pages/dashboard/AnaliticoProduto.jsx`
*   **Layout:** Interface com Abas (`Tabs`):
    1.  **Análise de Produtos:** Treemap Chart + Tabela de Matriz (Mix).
    2.  **Cesta de Produtos:** Tabela exploratória de combinações de itens.
*   **RPCs:**
    *   `get_product_analysis_data`: Para o Treemap e Matriz.
    *   `get_product_basket_data`: Para a análise de cestas (Market Basket Analysis).
*   **Métricas Específicas (Aba Análise):**
    *   **Força (%):** Share of Wallet (Participação na receita total).
    *   **Confiabilidade (%):** Penetração (Presença em % dos pedidos).
    *   **Classificação:** Estrela, Gerador de Caixa, Alto Giro, Padrão.
*   **Estrutura de Cesta (Aba Cesta):**
    *   **Definição:** Uma "Cesta" é uma combinação única de produtos presentes em um pedido.
    *   **Lógica:** Pedidos com itens {A, B} são agrupados. Pedidos com {A, B, C} formam outra cesta.
    *   **Colunas:** Produtos na Cesta (lista), Frequência (% de ocorrência), Faturamento Total da cesta, Margem Média.

### 6. Vendas Diárias
*   **Componente:** `src/pages/dashboard/AnaliticoVendasDiarias.jsx`
*   **Layout:** Gráfico de Área (Timeline) + Tabela Detalhada
*   **RPC:** `get_daily_sales_data`
*   **Funcionalidade:** Permite ver o "pulso" da empresa dia a dia. Mostra crescimento D-1.

### 7. Análise Preditiva
*   **Componente:** `src/pages/dashboard/AnalisePreditivaVendas.jsx`
*   **Layout:** Composed Chart (Linha Histórica + Linha Tracejada de Previsão)
*   **RPC:** `get_sales_forecast_data`
*   **Lógica:** Utiliza funções estatísticas do PostgreSQL (`regr_slope`, `regr_intercept`) para calcular a tendência linear e projetar os próximos 30 dias.

### 8. Curva ABC (Pareto)
*   **Componente:** `src/pages/dashboard/CurvaABC.jsx`
*   **Layout:** Gráfico de Pareto (Barras + Linha Acumulada)
*   **RPC:** `get_abc_curve_data`
*   **Lógica:**
    *   **Classe A:** Acumulado até 80% da receita.
    *   **Classe B:** Acumulado de 80% a 95%.
    *   **Classe C:** Restante (5%).

### 9. Análise de Valor Unitário
*   **Componente:** `src/pages/dashboard/AnaliseValorUnitario.jsx`
*   **Layout:** Scatter Chart (Dispersão de Preço) + Tabela
*   **RPC:** `get_unit_value_analysis_data`
*   **Objetivo:** Identificar produtos vendidos abaixo do preço de tabela ou com descontos excessivos que corroem a margem.

### 10. Desempenho & Fidelidade
*   **Componente:** `src/pages/dashboard/AnaliseDesempenhoFidelidade.jsx`
*   **Layout:** Matriz de Dispersão (Eixo X: Vendas, Eixo Y: Retenção)
*   **RPC:** `get_loyalty_performance_data`
*   **KPIs:** LTV (Lifetime Value no período), Churn Rate, Taxa de Retenção.

---

## 3. Arquitetura de Dados e Performance

### Fonte de Dados Principal
*   **Tabela:** `bd-cl` (Banco de Dados de Clientes/Vendas - Bruto).
*   **Materialized View:** `private.mv_sales_summary` (Recomendada para análises pesadas de longo prazo).

### RPCs de Destaque (Analítico de Produto)

#### `get_product_analysis_data`
*   **Objetivo:** Calcular KPIs individuais por produto.
*   **Retorno:** JSON array com `name`, `value` (receita), `quantity` (kg), `strength` (%), `reliability` (%).
*   **Performance:** Agregação simples (`GROUP BY "Descricao"`). Rápida.

#### `get_product_basket_data`
*   **Objetivo:** Análise combinatória de itens (Market Basket).
*   **Processamento:**
    1.  Filtra vendas pelo período.
    2.  Agrupa produtos por `Pedido`.
    3.  Cria um array ordenado de produtos para cada pedido (ex: `['ProdA', 'ProdB']`).
    4.  Agrupa pelo array de produtos para contar frequência.
*   **Paginação:** Implementada via `LIMIT/OFFSET` SQL (parâmetros `p_page`, `p_limit`) para evitar transferir payload gigante.
*   **Filtros:** Suporta todos os filtros globais (Supervisor, Região, etc.).

### Segurança (Row Level Security - RLS)
Todas as RPCs implementam filtros de segurança nativos:
1.  **Supervisores:** Só veem vendas onde `Nome Supervisor` = Seu Nome.
2.  **Vendedores:** Só veem vendas onde `Nome Vendedor` = Seu Nome.
3.  **Admins:** Veem tudo.
4.  **Filtro de Funcionários:** A maioria das queries exclui automaticamente vendas para `Nome Grp Cliente = 'FUNCIONARIOS'` para não distorcer ticket médio.

---

## 4. Guia de Manutenção

### Como adicionar uma nova coluna na tabela de Drill-down?
1.  **Frontend:** Edite `src/components/DrilldownExplorer.jsx`. Adicione o `<th>` no cabeçalho e o `<td>` no corpo da tabela.
2.  **Backend:** Se o dado não vier na RPC, edite a função `get_drilldown_data` no Supabase (`supabase_functions.sql`) para incluir o campo no `SELECT`.

### Como ajustar a lógica da Curva ABC?
1.  Edite a função `get_abc_curve_data` no Supabase.
2.  Altere os percentuais na cláusula `CASE WHEN`.
    *   Atual: A (<=80%), B (<=95%), C (>95%).

### Manutenção da Aba "Cesta de Produtos"
*   O componente responsável é `src/components/CestaDeProdutos.jsx`.
*   Se o carregamento estiver lento, verifique se a RPC `get_product_basket_data` está usando índices na coluna `Pedido` e `DT Emissao`.

---

## 5. Troubleshooting Comum

| Sintoma | Causa Provável | Solução |
| :--- | :--- | :--- |
| **Cesta de Produtos Lenta** | Período de data muito longo (ex: 1 ano) gerando milhões de combinações. | Reduzir o filtro de data para "Este Mês" ou "Últimos 30 dias". |
| **Gráfico Vazio** | Filtros de data muito restritos ou nome de supervisor/vendedor incorreto no filtro. | Limpar filtros e verificar se há vendas no período selecionado. |
| **Erro "Failed to fetch"** | Problema de conexão com Supabase ou Timeout da RPC (>10s). | Verificar internet. Se persistir, otimizar query SQL no Supabase. |
| **Dados não batem com ERP** | Cache do React Query ou atraso na sincronização `bd-cl`. | Clicar em "Atualizar Dados" (se houver) ou aguardar o job de sync noturno. |
| **Permissão Negada** | Usuário logado não tem vínculo comercial (Supervisor/Vendedor) configurado na tabela `users_unified`. | Verificar cadastro do usuário e campos `vinculo_comercial`. |