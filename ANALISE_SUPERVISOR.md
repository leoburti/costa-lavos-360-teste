
# Análise Profunda: Painel do Supervisor (Visão Diretor Comercial)

Este documento detalha a investigação dos dados disponíveis no Supabase, as RPCs (Remote Procedure Calls) existentes e propõe uma arquitetura de dados para transformar a página `AnaliticoSupervisor.jsx` em uma ferramenta de decisão estratégica de alta performance.

## 1. Inventário de Dados Disponíveis vs. Utilizados

Atualmente, o sistema possui uma riqueza de dados no banco de dados (`bd-cl`, `crm_*`, `bd_cl_inv`) que não está sendo totalmente explorada na visão do supervisor.

| Categoria | Dados Disponíveis (Banco/RPC) | Utilização Atual (AnaliticoSupervisor) | Status |
| :--- | :--- | :--- | :--- |
| **Vendas** | Histórico completo, Margem (implícita), Ticket Médio, Mix de Produtos, Sazonalidade. | Vendas Totais, Média Móvel (Básico). | ⚠️ Subutilizado |
| **Metas** | Coluna `Quant Dia/KG` em `bd-cl`. | Não utilizado. | ❌ Ausente |
| **Bonificação** | Valores de bonificação (`Cfo 5910/6910`), Pedidos de Bonificação (`bonification_requests`). | Apenas valor total somado. Sem análise de eficiência (ROI). | ⚠️ Subutilizado |
| **Equipamentos** | Inventário (`bd_cl_inv`), Movimentações, ROI do Ativo (Venda / Custo Equip). | Não correlacionado com a performance do supervisor. | ❌ Ausente |
| **CRM (Futuro)** | Pipeline de Vendas (`crm_deals`), Atividades (`crm_interactions`), Conversão. | Completamente ignorado na análise do supervisor. | ❌ Crítico |
| **Tendências** | RPC `get_supervisor_one_on_one_data` calcula motivos ("Risco Churn", "Crescimento"). | Não utilizado (usa apenas dados brutos). | ⚠️ Oportunidade |
| **Segmentação** | Coluna `Segmento` em `bd-cl`. | Não há quebra por segmento (ex: Padaria vs Indústria). | ❌ Ausente |

## 2. Potencial das RPC Functions (O "Motor" do Painel)

Identifiquei funções no banco de dados que já realizam cálculos pesados e devem ser os pilares do novo painel para garantir performance e profundidade analítica.

### 💎 A Joia da Coroa: `get_supervisor_one_on_one_data`
Esta função é a mais completa para um Diretor. Ela retorna um JSON complexo contendo:
*   **Comparison:** Período Atual vs. Anterior (Vendas, Clientes Ativos, Bonificação).
*   **Churn Analysis:** Clientes agrupados por risco (Ativo, Risco, Elevado, Crítico).
*   **Trend Analysis:** Classifica clientes por comportamento ("Crescimento", "Queda", "Estabilidade").
*   **Team Analysis:** Performance individual de cada vendedor do time.

### Outras RPCs Essenciais
*   `get_daily_sales_data_v2`: Essencial para o gráfico de tendência e cálculo de volatilidade.
*   `get_crm_pipeline_summary` (Sugerido/Investigar): Necessário cruzar dados do CRM para ver "O que vai entrar" vs "O que entrou".
*   `get_equipment_roi`: Cruzar dados de `bd_cl_inv` com `bd-cl` para saber se o supervisor está alocando máquinas em clientes rentáveis.

## 3. Métricas do Diretor Comercial (KPIs Propostos)

Para um Diretor de Alta Performance, "Vendas Totais" é apenas o começo. O novo layout deve focar em eficiência e qualidade da receita.

### Nível 1: Saúde Financeira (O Resultado)
1.  **Realizado vs Meta:** % de atingimento da meta de volume (`Quant Dia/KG`).
2.  **Crescimento Real:** % crescimento vs período anterior (MoM) e ano anterior (YoY).
3.  **ROI de Bonificação:** Para cada R$ 1,00 bonificado, quantos R$ voltam em venda? (Métrica de eficiência).

### Nível 2: Saúde da Carteira (A Sustentabilidade)
4.  **Taxa de Positivação:** % da carteira de clientes que comprou no período.
5.  **Índice de Churn (Risco):** Valor financeiro em risco (clientes que pararam de comprar recentemente).
6.  **Mix de Produtos (Depth):** Média de produtos diferentes por pedido (indica venda de mix/cross-sell).

### Nível 3: Performance do Time (A Gestão)
7.  **Dispersão de Performance:** A meta está sendo batida por um "super vendedor" mascarando o resto do time ruim? (Desvio padrão).
8.  **Pipeline Velocity:** (Dados CRM) Velocidade com que os liderados do supervisor fecham novos negócios.

## 4. Estrutura Sugerida para o Novo Layout (Executive Dashboard)

O layout deve seguir a lógica de leitura de um executivo: **Macro -> Micro -> Ação**.

### Seção A: O "Head-Up Display" (Topo)
*   **Barra de Filtros Inteligente:** Seletor de Período Global e "Comparar com" (Mês anterior / Ano Anterior).
*   **4 Big Numbers:** 
    1.  Venda Total (+ Indicador de Meta).
    2.  Margem/Bonificação (Indicador de Eficiência).
    3.  Clientes Ativos (Indicador de Base).
    4.  Projeção de Fechamento (Forecast).

### Seção B: Análise de Tendência & Volatilidade
*   **Gráfico Composto:**
    *   Barras: Venda Diária.
    *   Linha 1: Média Móvel 7 dias (Curto prazo).
    *   Linha 2: Média Móvel 30 dias (Tendência estrutural).
    *   *Insight:* Anotações automáticas no gráfico (ex: "Dia de pico").

### Seção C: Matriz de Eficiência da Equipe (Ranking Premium)
Em vez de uma lista simples, uma tabela rica (Data Grid):
*   Colunas: Vendedor | Vendas | Meta % | Ticket Médio | Bonificação % | Mix Produtos | Status (Elite, Bom, Alerta).
*   **Interação:** Clicar no vendedor expande um "mini-dossiê" lateral sem sair da página.

### Seção D: Raio-X da Carteira (Strategic Insights)
*   **Quadro de Movimentação:**
    *   Novos Clientes (Entrada).
    *   Clientes Recuperados.
    *   Clientes em Queda (Atenção!).
    *   Clientes Perdidos (Churn).
*   Esta seção deve usar os dados da RPC `get_supervisor_one_on_one_data` para listar nominalmente os maiores ofensores (ex: "Top 5 Clientes em Queda").

## 5. Próximos Passos (Plano de Implementação)

1.  **Backend (Integração):** Refatorar o hook `useSupervisorCompositeData` para trazer dados combinados de Vendas + CRM + Metas em uma única chamada otimizada.
2.  **Frontend (Componentes):**
    *   Criar componente `EfficiencyMatrix` (Tabela avançada).
    *   Criar componente `TrendChart` com médias móveis calculadas no front.
    *   Criar componente `PortfolioHealth` (Visualização de Churn/Retenção).
3.  **Exportação:** Implementar função de exportação que gere um PDF "Estilo Apresentação de Diretoria", não apenas um dump de CSV.

---
**Conclusão:** A infraestrutura atual suporta um painel de nível executivo muito superior ao atual. A chave está em processar os dados brutos (`bd-cl`) para gerar métricas derivadas (ROI, Eficiência, Tendência) em vez de apenas mostrá-los.
