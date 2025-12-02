# Checklist de Testes - Phase 2: Analytics

## Geral (Todas as Páginas)
- [ ] **Filtros Globais:**
    - [ ] Data Inicial/Final respeitada
    - [ ] Filtro de Supervisor funciona
    - [ ] Filtro de Vendedor funciona
    - [ ] **Check:** Filtro "Excluir Funcionários" altera os dados?
- [ ] **Estados de UI:**
    - [ ] Loading State visível durante fetch
    - [ ] Error State amigável em caso de falha
    - [ ] Empty State se não houver dados
- [ ] **Performance:**
    - [ ] Carregamento inicial < 3s
    - [ ] Gráficos responsivos (não travam scroll)

## /analitico-supervisor
- [ ] KPIs principais (Vendas, Pedidos, Ticket Médio) carregam
- [ ] Ranking de vendedores renderiza
- [ ] Drilldown para detalhes do vendedor funciona (se houver)

## /analitico-vendedor
- [ ] Comparativo Vendedor vs Meta (se houver)
- [ ] Histórico de vendas diárias do vendedor

## /curva-abc
- [ ] Classificação A, B, C visível e correta
- [ ] Gráfico limitado aos Top N itens (Performance Check)
- [ ] Tabela mostra listagem completa paginada

## /analise-churn
- [ ] Clientes em risco identificados
- [ ] Tempo de carregamento aceitável (< 5s)
- [ ] Filtros de período afetam cálculo de churn corretamente

## /analise-preditiva-vendas
- [ ] Projeção futura visível
- [ ] Dados históricos batem com vendas reais